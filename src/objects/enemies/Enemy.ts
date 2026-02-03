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

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, hp: number, speed: number) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;

        this.setCollideWorldBounds(true);
        this.setBounce(0.2); // Small bounce
    }

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
        if (this.hp <= 0) return;

        // Basic AI Loop
        this.updateState(time, delta);
        this.weapon?.update(time, delta);
        this.updateStatusEffects(delta);
    }

    private updateStatusEffects(delta: number) {
        if (this.isPoisoned) {
            this.poisonTimer -= delta;
            this.poisonInterval -= delta;

            if (this.poisonInterval <= 0) {
                this.hp -= this.poisonDamage;
                this.setTint(0x00ff00); // Green
                this.scene.time.delayedCall(100, () => this.clearTint());

                if (this.hp <= 0) this.die();
                this.poisonInterval = 1000;
            }

            if (this.poisonTimer <= 0) {
                this.isPoisoned = false;
                this.poisonDamage = 0;
            }
        }
    }

    protected abstract updateState(time: number, delta: number): void;

    public takeDamage(amount: number) {
        // Armor mitigation: 50 armor = 50% reduction? Or flat?
        // Let's do a simple % reduction based on armor/100, max 80%
        const mitigation = Math.min(this.armor / 200, 0.8); // 100 armor = 50% mitigation
        const damage = amount * (1 - mitigation);

        this.hp -= damage;

        // Visual feedback
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => this.clearTint());

        if (this.hp <= 0) {
            this.die();
        }
    }

    protected die() {
        this.hp = 0;
        this.setVelocity(0, 0);
        this.disableBody(true, true);

        // TODO: Drop Loot
        console.log(`${this.texture.key} died.`);
        this.destroy(); // Simple destroy for now
    }

    public setTarget(player: Player) {
        this.target = player;
    }
}
