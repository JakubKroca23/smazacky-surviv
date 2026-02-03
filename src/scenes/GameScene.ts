import Phaser from 'phaser';
import { CONFIG } from '../config';
import { MapGenerator } from '../core/MapGenerator';
import { Player } from '../objects/Player';
import { ZoneSystem } from '../systems/ZoneSystem';
import { Enemy } from '../objects/enemies/Enemy';
import { Junkie, Police } from '../objects/enemies/ConcreteEnemies';
import { Car } from '../objects/vehicles/Car';
import { Projectile } from '../objects/Projectile';
import { WeaponFactory } from '../objects/weapons/WeaponFactory';
import { Loot } from '../objects/Loot';

export class GameScene extends Phaser.Scene {
    public player!: Player;
    public zoneSystem!: ZoneSystem;
    private waterColliders!: Phaser.Physics.Arcade.StaticGroup;
    private roofs!: Phaser.GameObjects.Group; // Store roofs for update loop
    public enemies!: Phaser.Physics.Arcade.Group;
    public projectiles!: Phaser.Physics.Arcade.Group; // Group for player projectiles
    public vehicles!: Phaser.Physics.Arcade.Group; // Vehicles Group
    private nickname: string = 'Survivor';

    constructor() {
        super('GameScene');
    }

    init(data: { nickname: string }) {
        if (data && data.nickname) {
            this.nickname = data.nickname;
        }
    }

    create() {
        // Enable Lights
        this.lights.enable().setAmbientColor(0x101010);

        // Generate World
        const mapData = MapGenerator.generateMap(this);
        this.waterColliders = mapData.waterColliders;
        this.roofs = mapData.roofs; // Store it
        // Setup Loot interactions
        if (mapData.lootGroup) {
            this.setupLootInteractions(mapData.lootGroup);

            // Set pipeline for loot too?
            mapData.lootGroup.getChildren().forEach((child: any) => {
                // child is a Sprite likely (Loot extends Sprite?)
                if (child.setPipeline) child.setPipeline('Light2D');
            });
        }

        // Projectile Group
        this.projectiles = this.physics.add.group({
            classType: Projectile,
            runChildUpdate: true
        });

        // Vehicles Group
        this.vehicles = this.physics.add.group({
            classType: Car,
            runChildUpdate: true,
            collideWorldBounds: true
        });

        // Create Player at center of map
        const centerX = (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) / 2;
        const centerY = (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) / 2;
        this.player = new Player(this, centerX, centerY, this.nickname);

        // Spawn Test Car nearby
        // Spawn Vehicles (Police & SWAT)
        // Spawn 1 Police Car near player
        const policeCar = new Car(this, centerX + 150, centerY, 'vehicle-police');
        policeCar.setDisplaySize(70, 140); // Scale down PNG
        policeCar.body!.setSize(60, 120); // Adjust physics body
        this.vehicles.add(policeCar);

        // Spawn 1 SWAT Van
        const swatVan = new Car(this, centerX - 150, centerY + 100, 'vehicle-swat');
        swatVan.setDisplaySize(80, 160); // Slightly larger
        swatVan.body!.setSize(70, 140);
        this.vehicles.add(swatVan);

        // Enemy Group
        this.enemies = this.physics.add.group({
            runChildUpdate: true
        });

        this.spawnEnemies();

        // Colliders
        // Water is now Overlap (Slow)
        this.physics.add.overlap(this.player, this.waterColliders, (player: any, _water: any) => {
            // Apply slow to player
            player.isInWater = true;
        });

        this.physics.add.overlap(this.enemies, this.waterColliders, (enemy: any, _water: any) => {
            // Apply slow to enemy
            enemy.isInWater = true;
        });

        this.physics.add.collider(this.enemies, this.enemies); // Enemies don't stack
        this.physics.add.collider(this.player, this.enemies); // Push each other
        this.physics.add.collider(this.enemies, this.enemies);

        // Building / Roof Logic
        // We need to handle the roof zones returned by MapGenerator
        if (mapData.roofZones) {
            this.physics.add.overlap(this.player, mapData.roofZones, (_player: any, zone: any) => {
                const roof = zone.getData('roof') as Phaser.GameObjects.Shape;
                if (roof) {
                    roof.setData('fadeOut', true);
                }
            });

            // We need a way to reset alpha when NOT overlapping.
            // Arcade Physics doesn't have "exit" event natively for Overlap.
            // We can check it manually in update() or use a 'touching' flag?
            // Simplest: Reset all roofs to 1.0 each frame, then apply overlap?
            // Or use a persistent state.

            // Let's use the 'processCallback' or manual check.
            // For static groups, we can iterate.
        }

        // Projectile Collisions
        this.physics.add.overlap(this.projectiles, this.enemies, this.handleProjectileEnemyHit, undefined, this);
        // Projectiles fly over water? Yes.
        // this.physics.add.collider(this.projectiles, this.waterColliders, (projectile) => projectile.destroy());

        // Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE);

        // Add Bloom for Cyberpunk Vibe
        if (this.cameras.main.postFX) {
            this.cameras.main.postFX.addBloom(0xffffff, 1, 1, 1.2, 1.0);
        }

        // Input Listener for F (Interaction)
        // Just a debug log for now
        this.physics.add.collider(this.vehicles, this.vehicles);
        this.physics.add.collider(this.player, this.vehicles); // Player collides with car (if not driving)
        this.physics.add.collider(this.vehicles, this.enemies); // Car pushes enemies

        // Launch UI
        this.scene.launch('UIScene');

        // Init Zone
        this.zoneSystem = new ZoneSystem(this);

        this.setupInput();
    }

    private lootGroup!: Phaser.Physics.Arcade.Group; // Store loot group

    private setupLootInteractions(lootGroup: Phaser.Physics.Arcade.Group) {
        this.lootGroup = lootGroup;

        // Auto-pickup for Ammo/Medkits (Overlap)
        this.physics.add.overlap(this.player, this.lootGroup, (_player: any, loot: any) => {
            const l = loot as Loot; // Cast to Loot
            const type = l.lootType;

            if (type.includes('ammo') || type === 'medkit') {
                // Auto Pickup
                if (type.includes('ammo')) {
                    this.player.inventory.addAmmo(type, l.amount);
                } else {
                    this.player.inventory.addItem(type, l.amount);
                }
                l.destroy();
            }
        });
    }



    // Modified Create with Loot Setup call
    // ...
    // Note: I can't just inject code in middle easily.
    // I will replace the end of create() and add the F-key logic block there.
    // Actually, I should update the 'F' key block to iterate loot too.

    private setupInput() {
        this.input.keyboard!.on('keydown-F', () => {
            // Check for interactions
            if (this.player && this.player.active) {
                if (this.player.body?.enable) {
                    // 1. Enter Car
                    const cars = this.vehicles.getChildren() as Car[];
                    let enteredCar = false;
                    for (const c of cars) {
                        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y) < 100) {
                            c.enterCar(this.player);
                            enteredCar = true;
                            break;
                        }
                    }
                    if (enteredCar) return;

                    // 2. Pick up Weapon (Loot)
                    if (this.lootGroup) {
                        const items = this.lootGroup.getChildren() as any[];
                        for (const item of items) {
                            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y) < 60) {
                                // Pick up weapon
                                if (item.lootType.includes('weapon')) {
                                    let weapon;
                                    if (item.lootType === 'weapon_ak47') weapon = WeaponFactory.createAK47(this);
                                    else if (item.lootType === 'weapon_glock') weapon = WeaponFactory.createGlock(this);
                                    else if (item.lootType === 'weapon_shotgun') weapon = WeaponFactory.createShotgun(this);

                                    if (weapon) {
                                        this.player.inventory.equipWeapon(weapon);
                                        item.destroy();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    update(time: number, delta: number) {
        if (this.player) {
            this.player.update(time, delta);
            this.zoneSystem.update(time, delta, this.player);

            // Update enemy targets to player
            this.enemies.getChildren().forEach((enemy: any) => {
                enemy.setTarget(this.player);
            });

            // Roof Fading Logic
            if (this.roofs) {
                this.roofs.getChildren().forEach((r: any) => {
                    if (r.getData('fadeOut')) {
                        r.setAlpha(0.1);
                        r.setData('fadeOut', false); // Reset for next frame
                    } else {
                        // Smoothly fade back in? Or instant?
                        // Instant for now to avoid flickering if 1 frame missed
                        r.setAlpha(1);
                    }
                });
            }
        }
    }

    private spawnEnemies() {
        // Spawn 5 Junkies and 3 Police for now
        for (let i = 0; i < 5; i++) {
            const pos = this.getRandomSafePosition();
            const junkie = new Junkie(this, pos.x, pos.y);
            this.enemies.add(junkie);
        }

        for (let i = 0; i < 3; i++) {
            const pos = this.getRandomSafePosition();
            const police = new Police(this, pos.x, pos.y);
            this.enemies.add(police);
        }
    }

    private getRandomSafePosition(): { x: number, y: number } {
        // Simple random position, ignoring water for now (should improve later)
        const x = Phaser.Math.Between(100, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE - 100);
        const y = Phaser.Math.Between(100, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE - 100);
        return { x, y };
    }

    private handleProjectileEnemyHit(projectile: any, enemy: any) {
        const p = projectile as Projectile;
        const e = enemy as Enemy;

        if (p.poisonEffect) {
            e.applyPoison(p.poisonEffect.duration, p.poisonEffect.damage, p.poisonEffect.interval);
        }

        e.takeDamage(p.getDamage());
        p.destroy();
    }
}
