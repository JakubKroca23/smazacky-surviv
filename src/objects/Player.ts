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
    private weaponVisual: Phaser.GameObjects.Rectangle;
    public inventory: InventoryManager;
    public health: number = 100;
    public maxHealth: number = 100;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(10); // Player above floor

        // Physics Body Config
        this.setCircle(16); // Derived from 32x32 texture
        this.setDrag(CONFIG.PLAYER_DRAG);
        this.setDamping(true); // Drag is ratio 0-1 if true, absolute if false? 
        // Phaser Arcade Damping: if true, drag is 0-1 factor per update. If false, it's deceleration in px/s^2.
        // CONFIG.PLAYER_DRAG = 800 (high number) -> implies we want deceleration. So setDamping(false).
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

        // Weapon Visual
        this.weaponVisual = scene.add.rectangle(0, 0, 24, 8, 0x000000);
        this.weaponVisual.setDepth(11);

        // Keys for Weapon Switching
        scene.input.keyboard!.on('keydown-ONE', () => this.inventory.switchSlot('primary'));
        scene.input.keyboard!.on('keydown-TWO', () => this.inventory.switchSlot('secondary'));
        scene.input.keyboard!.on('keydown-R', () => this.inventory.getActiveWeapon()?.reload());

        // Inventory Init
        this.inventory = new InventoryManager();
        this.inventory.equipWeapon(WeaponFactory.createKnife(scene));
    }

    update() {
        this.handleMovement();
        this.handleRotation();
        this.handleShooting();
    }

    private handleMovement() {
        const { up, down, left, right } = this.keys;
        const acceleration = 1000; // Acceleration force

        // Reset acceleration
        this.setAcceleration(0);

        if (up.isDown) {
            this.setAccelerationY(-acceleration);
        } else if (down.isDown) {
            this.setAccelerationY(acceleration);
        }

        if (left.isDown) {
            this.setAccelerationX(-acceleration);
        } else if (right.isDown) {
            this.setAccelerationX(acceleration);
        }
    }

    private handleRotation() {
        // Rotate player towards mouse
        const pointer = this.scene.input.activePointer;
        // Adjust for camera scroll
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            pointer.worldX,
            pointer.worldY
        );

        this.setRotation(angle);

        // Position weapon relative to player (offset to right side)
        // Simple orbital rotation
        const weaponOffset = 25; // Distance from center
        this.weaponVisual.x = this.x + Math.cos(angle) * weaponOffset;
        this.weaponVisual.y = this.y + Math.sin(angle) * weaponOffset;
        this.weaponVisual.setRotation(angle);
    }

    private handleShooting() {
        const pointer = this.scene.input.activePointer;
        if (pointer.isDown) {
            const weapon = this.inventory.getActiveWeapon();
            if (weapon) {
                weapon.shoot(this, pointer.worldX, pointer.worldY);
            }
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
}
