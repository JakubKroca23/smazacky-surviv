import Phaser from 'phaser';
import { Player } from '../Player';
import { Weapon } from '../Weapon';

export enum EnemyState {
    IDLE,
    WANDER,
    CHASE,
    ATTACK
}

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
    public hp: number;
    public maxHp: number;
    public armor: number = 0;
    public speed: number;
    public weapon: Weapon | null = null;

    protected aiState: EnemyState = EnemyState.IDLE;
    protected target: Player | null = null;
    protected stateTimer: number = 0;

    // Status Effects
    private poisonTimer: number = 0;
    private poisonInterval: number = 0;
    private poisonDamage: number = 0;
    public isPoisoned: boolean = false;

    protected abstract attack(target: Player): void;

    // HP Bar
    protected hpBar!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, hp: number, speed: number) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;

        this.setCollideWorldBounds(true);
        this.setBounce(0.2); // Small bounce

        // Init HP Bar
        this.hpBar = scene.add.graphics();
        this.hpBar.setDepth(100);

        // Enable Lighting
        this.setPipeline('Light2D');
    }

    // ... poison methods ... (keep them)
    // I will replace full file content or target specific blocks if possible.
    // replacing constructor and adding properties.

    public applyPoison(duration: number, damage: number, interval: number) {
        this.isPoisoned = true;
        this.poisonTimer = duration;
        this.poisonInterval = interval;
        // Stack damage
        if (this.poisonTimer > 0) {
            this.poisonDamage += damage;
        } else {
            this.poisonDamage = damage;
        }
        this.poisonTimer = duration; // Refresh
    }

    update(time: number, delta: number) {
        if (this.hp <= 0) {
            this.hpBar.clear();
            return;
        }

        // Basic AI Loop
        this.updateState(time, delta);
        this.weapon?.update(time, delta);
        this.updateStatusEffects(delta);

        // Update HP Bar
        this.updateHealthBar();
    }

    protected updateHealthBar() {
        this.hpBar.clear();
        const x = this.x - 20;
        const y = this.y - 40;
        const w = 40;
        const h = 5;

        // Background
        this.hpBar.fillStyle(0x000000);
        this.hpBar.fillRect(x, y, w, h);

        // Health
        const pct = Math.max(0, this.hp / this.maxHp);
        this.hpBar.fillStyle(0xff0000);
        this.hpBar.fillRect(x, y, w * pct, h);
    }

    // ... existing status effects ... (need to keep them or I break the file)
    // I am replacing a huge chunk, careful.

    private updateStatusEffects(delta: number) {
        if (this.isPoisoned) {
            this.poisonTimer -= delta;
            this.poisonInterval -= delta;

            if (this.poisonInterval <= 0) {
                this.hp -= this.poisonDamage;
                this.setTint(0x00ff00); // Green
                this.scene.time.delayedCall(100, () => this.clearTint());

                if (this.takeDamage(this.poisonDamage, true)) return; // Use takeDamage logic
                this.poisonInterval = 1000;
            }

            if (this.poisonTimer <= 0) {
                this.isPoisoned = false;
                this.poisonDamage = 0;
            }
        }
    }

    protected abstract updateState(time: number, delta: number): void;

    public takeDamage(amount: number, fromPoison: boolean = false): boolean {
        // Armor mitigation
        const mitigation = Math.min(this.armor / 200, 0.8);
        const damage = amount * (1 - mitigation);

        this.hp -= damage;

        // Visual feedback
        if (!fromPoison) {
            this.setTint(0xff0000);
            this.scene.time.delayedCall(100, () => this.clearTint());
        }

        if (this.hp <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    protected die() {
        this.hp = 0;
        this.setVelocity(0, 0);
        this.disableBody(true, true);
        this.hpBar.clear();

        // TODO: Drop Loot
        console.log(`${this.texture.key} died.`);
        this.destroy(); // Simple destroy for now
    }

    public setTarget(player: Player) {
        this.target = player;
    }
}
