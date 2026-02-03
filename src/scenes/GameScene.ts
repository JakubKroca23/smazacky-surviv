import Phaser from 'phaser';
import { CONFIG } from '../config';
import { MapGenerator } from '../core/MapGenerator';
import { Player } from '../objects/Player';
import { ZoneSystem } from '../systems/ZoneSystem';
import { Enemy } from '../objects/enemies/Enemy';
import { Junkie, Police } from '../objects/enemies/ConcreteEnemies';
import { Car } from '../objects/vehicles/Car';
import { Projectile } from '../objects/Projectile';

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
        // Generate World
        const mapData = MapGenerator.generateMap(this);
        this.waterColliders = mapData.waterColliders;
        this.roofs = mapData.roofs; // Store it

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
        const car = new Car(this, centerX + 150, centerY);
        this.vehicles.add(car);

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

        // Input Listener for F (Interaction)
        // Just a debug log for now
        this.physics.add.collider(this.vehicles, this.vehicles);
        this.physics.add.collider(this.player, this.vehicles); // Player collides with car (if not driving)
        this.physics.add.collider(this.vehicles, this.enemies); // Car pushes enemies

        // Input Listener for F (Interaction)
        this.input.keyboard!.on('keydown-F', () => {
            // Check for interactions
            if (this.player && this.player.active) { // Only if player is active (not already driving?)
                // Actually, if driving, the CAR handles the 'F' input in update() or we handle it here?
                // If player is disabled (in car), this listener might still fire if we don't check.
                // Better: If player is visible/enabled, try to enter.

                if (this.player.body?.enable) {
                    const cars = this.vehicles.getChildren() as Car[];
                    for (const c of cars) {
                        // Interactive distance
                        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y) < 100) {
                            c.enterCar(this.player);
                            break; // Enter first valid car
                        }
                    }
                }
            }
        });

        // Launch UI
        this.scene.launch('UIScene');

        // Init Zone
        this.zoneSystem = new ZoneSystem(this);
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
