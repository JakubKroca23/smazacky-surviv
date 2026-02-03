import Phaser from 'phaser';
import { CONFIG } from '../config';
import { InventoryManager } from '../managers/InventoryManager';
import { WeaponFactory } from './weapons/WeaponFactory';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private keys: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        interact: Phaser.Input.Keyboard.Key;
    };
    private weaponVisual: Phaser.GameObjects.Sprite;
    public inventory: InventoryManager;
    public health: number = 100;
    public maxHealth: number = 100;
    private nameText: Phaser.GameObjects.Text;

    // Status Effects
    private poisonTimer: number = 0;
    private poisonInterval: number = 0;
    private poisonDamage: number = 0;
    private isPoisoned: boolean = false;

    public isInWater: boolean = false;
    private leftHand: Phaser.GameObjects.Sprite;
    private rightHand: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, nickname: string = 'Survivor') {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Create Nameplate
        this.nameText = scene.add.text(x, y - 40, nickname, {
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(12);

        // Physics Body Config
        this.setCircle(16); // Derived from 32x32 texture
        this.setDrag(CONFIG.PLAYER_DRAG);
        this.setDamping(true);
        this.setDamping(false);
        this.setMaxVelocity(CONFIG.PLAYER_SPEED);
        this.setCollideWorldBounds(true);

        // Input Keys
        this.keys = scene.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            interact: Phaser.Input.Keyboard.KeyCodes.F
        }) as any;

        // Weapon Visual (Sprite)
        this.weaponVisual = scene.add.sprite(0, 0, 'weapon-knife');
        this.weaponVisual.setDepth(11);
        this.weaponVisual.setOrigin(0, 0.5); // Pivot at handle (left-center)

        // Keys for Weapon Switching
        scene.input.keyboard!.on('keydown-ONE', () => this.inventory.switchSlot('primary'));
        scene.input.keyboard!.on('keydown-TWO', () => this.inventory.switchSlot('secondary'));
        scene.input.keyboard!.on('keydown-R', () => this.inventory.getActiveWeapon()?.reload());

        // Inventory Init
        this.inventory = new InventoryManager();
        this.inventory.equipWeapon(WeaponFactory.createKnife(scene));

        // Hands Visuals (Simple Circles for now, using a 'hand' texture if exists, or just player color)
        // Let's make small circles. We don't have hand texture yet? 
        // We can use a small circle primitive or just a Tinted sprite?
        // Let's create a 'hand' graphics texture on boot or just use a small circle texture.
        // For now, let's assume we can use a small colored circle. 
        // Or generate one on fly?
        // Let's use the 'player' texture but scaled down very small?
        this.leftHand = scene.add.sprite(0, 0, 'player').setScale(0.3).setTint(0xd2b48c); // Skin tone?
        this.leftHand.setDepth(12);
        this.rightHand = scene.add.sprite(0, 0, 'player').setScale(0.3).setTint(0xd2b48c);
        this.rightHand.setDepth(12);

        // ... keys ...
    }

    update(_time: number, delta: number) {
        // Reset water flag each frame (it will be set to true by Overlap if still colliding)
        // But Overlap runs during Physics update, which is before this Update? 
        // Actually, Physics Step happens, overlaps trigger callbacks.
        // So we should reset it AT THE START of update, and if overlap happens, it sets it true? 
        // Wait, update is usually called BEFORE physics step in Phaser? No, Scene.update is before.
        // So: Reset -> Physics Step (Overlap Callback sets True) -> Render?
        // Better: Reset it here, but apply speed modifier based on PREVIOUS frame's state?
        // Or just reset it at end? 
        // Let's try: Reset at start. If overlap happens, it sets it.
        // BUT physics runs after update?
        // If physics runs after, then we reset, and next frame we use the value set by physics?
        // Correct approach: Reset valid flag.

        // Actually, better to reset in preUpdate? 
        // Simplified: Set a temporary speed variable.

        this.handleMovement();
        this.handleRotation();
        this.handleShooting();
        this.updateWeaponVisual();
        this.updateStatusEffects(delta);

        // Reset flag for next frame
        this.isInWater = false;
    }

    private handleMovement() {
        const { up, down, left, right } = this.keys;
        const acceleration = 1500;

        // Water Slow Logic
        const speedModifier = this.isInWater ? 0.1 : 1.0;
        const currentMaxSpeed = CONFIG.PLAYER_SPEED * speedModifier;
        this.setMaxVelocity(currentMaxSpeed);

        this.setAcceleration(0);

        if (up.isDown) this.setAccelerationY(-acceleration);
        else if (down.isDown) this.setAccelerationY(acceleration);

        if (left.isDown) this.setAccelerationX(-acceleration);
        else if (right.isDown) this.setAccelerationX(acceleration);
    }

    private handleRotation() {
        // ... existing rotation ...
        const pointer = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        this.setRotation(angle);

        // Hand & Weapon Positioning
        const weaponOffset = 20;
        // const width = 15; // Shoulder width approx

        // Right Hand (Trigger)
        // const rAngle = angle + 0.5; // Offset angle
        // const rDist = 20;
        this.rightHand.x = this.x + Math.cos(angle + 0.4) * 20; // 0.4 rad offset
        this.rightHand.y = this.y + Math.sin(angle + 0.4) * 20;

        // Left Hand (Barrel/Support)
        this.leftHand.x = this.x + Math.cos(angle - 0.4) * 20;
        this.leftHand.y = this.y + Math.sin(angle - 0.4) * 20;

        // Adjust for specific weapon grip? (Pistol vs Rifle)
        const weapon = this.inventory.getActiveWeapon();
        if (weapon) {
            const name = weapon.stats.name.toLowerCase();

            if (name.includes('pistol') || name.includes('glock')) {
                // Hands closer together
                this.leftHand.setPosition(this.x + Math.cos(angle) * 20, this.y + Math.sin(angle) * 20); // Both on gun
            }
        }

        // Weapon
        const weaponVecX = Math.cos(angle) * weaponOffset;
        const weaponVecY = Math.sin(angle) * weaponOffset;
        this.weaponVisual.setPosition(this.x + weaponVecX, this.y + weaponVecY);
        this.weaponVisual.setRotation(angle);

        if (Math.abs(angle) > Math.PI / 2) {
            this.weaponVisual.setFlipY(true);
        } else {
            this.weaponVisual.setFlipY(false);
        }
    }



    private handleShooting() {
        const pointer = this.scene.input.activePointer;
        if (pointer.isDown) {
            const weapon = this.inventory.getActiveWeapon();
            if (weapon) {
                // Check if weapon is ready to fire before animating
                if (weapon.canFire(this.scene.time.now)) {
                    weapon.shoot(this, pointer.worldX, pointer.worldY);
                    this.playAttackAnimation(weapon.stats.name);
                }
            }
        }
    }

    private playAttackAnimation(weaponName: string) {
        // Simple tween animation based on weapon type
        const name = weaponName.toLowerCase();

        if (name.includes('knife')) {
            // Stab animation
            this.scene.tweens.add({
                targets: this.weaponVisual,
                x: this.weaponVisual.x + Math.cos(this.rotation) * 20,
                y: this.weaponVisual.y + Math.sin(this.rotation) * 20,
                duration: 100,
                yoyo: true,
                ease: 'Power1'
            });
        } else {
            // Recoil animation for guns
            this.scene.tweens.add({
                targets: this.weaponVisual,
                x: this.weaponVisual.x - Math.cos(this.rotation) * 5,
                y: this.weaponVisual.y - Math.sin(this.rotation) * 5,
                duration: 50,
                yoyo: true,
                ease: 'Quad.out'
            });
        }
    }

    private updateWeaponVisual() {
        const weapon = this.inventory.getActiveWeapon();
        if (weapon) {
            this.weaponVisual.setVisible(true);
            // Map weapon name to texture
            let texture = 'weapon-knife';
            const name = weapon.stats.name.toLowerCase();
            if (name.includes('ak')) texture = 'weapon-ak47';
            else if (name.includes('glock')) texture = 'weapon-glock';
            else if (name.includes('shotgun')) texture = 'weapon-shotgun';
            else if (name.includes('knife')) texture = 'weapon-knife';

            if (this.weaponVisual.texture.key !== texture) {
                this.weaponVisual.setTexture(texture);
            }
        } else {
            this.weaponVisual.setVisible(false);
        }
    }

    public takeDamage(amount: number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            console.log('Player Died');
            // TODO: Game Over Logic
            this.setTint(0xff0000);
        } else {
            // Flash red
            this.clearTint();
            this.setTint(0xffaaaa);
            this.scene.time.delayedCall(100, () => this.clearTint());
        }
    }

    public applyPoison(duration: number, damage: number, interval: number) {
        this.isPoisoned = true;
        this.poisonTimer = duration;
        this.poisonDamage = damage;
        this.poisonInterval = interval;
        // Stack? "stackuje se" implies adding damage or refreshing duration?
        // Let's refresh duration and add damage for now to simulate stacking intensity
        // Or simply add damage per tick? 
        // User said: "-2HP/S ... stackuje se" -> If hit twice, maybe -4HP/S?

        // Simple stacking impl:
        // If already poisoned, add damage to current damage. Reset timer.
        // Actually, if I just set this.poisonDamage = damage, it overwrites.
        // Let's implement additive stacking.
        if (this.poisonTimer > 0) {
            this.poisonDamage += damage;
        } else {
            this.poisonDamage = damage;
        }
        this.poisonTimer = duration; // Refresh duration
    }

    private updateStatusEffects(delta: number) {
        if (this.isPoisoned) {
            this.poisonTimer -= delta;
            this.poisonInterval -= delta;

            if (this.poisonInterval <= 0) {
                this.takeDamage(this.poisonDamage);
                this.poisonInterval = 1000; // Reset interval (hardcoded 1s for now, or use stored)
                console.log(`Player Poisoned: -${this.poisonDamage} HP`);
            }

            if (this.poisonTimer <= 0) {
                this.isPoisoned = false;
                this.poisonDamage = 0;
                console.log('Poison wore off');
            }
        }
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        if (this.nameText) {
            this.nameText.setPosition(this.x, this.y - 40);
        }
    }
}
