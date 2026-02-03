import { Enemy, EnemyState } from './Enemy';
import { WeaponFactory } from '../weapons/WeaponFactory';
import { Player } from '../Player';

export class Police extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-police-cyber', 100, 400); // 100 HP, 400 Speed
        this.armor = 50;
        this.weapon = WeaponFactory.createGlock(scene);
    }

    protected attack(target: Player): void {
        if (this.weapon && this.weapon.canFire(this.scene.time.now)) {
            this.weapon.shoot(this, target.x, target.y);
        }
    }

    protected updateState(_time: number, delta: number) {
        if (!this.target) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        if (dist < 700) {
            this.aiState = EnemyState.ATTACK;
        } else {
            this.aiState = EnemyState.WANDER;
        }

        switch (this.aiState) {
            case EnemyState.ATTACK:
                if (dist > 300) {
                    this.scene.physics.moveToObject(this, this.target, this.speed * 0.5);
                } else {
                    this.setVelocity(0, 0); // Stand ground
                }

                this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y));
                this.attack(this.target);
                break;

            case EnemyState.WANDER:
                this.stateTimer -= delta;
                if (this.stateTimer <= 0) {
                    this.stateTimer = 2000;
                    const angle = Math.random() * Math.PI * 2;
                    this.setVelocity(Math.cos(angle) * (this.speed * 0.5), Math.sin(angle) * (this.speed * 0.5));
                    this.setRotation(angle);
                }
                break;
        }
    }
}

export class SWAT extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-swat-cyber', 100, 250); // 100 HP, 250 Speed
        this.armor = 100;
        if (Math.random() > 0.5) {
            this.weapon = WeaponFactory.createAK47(scene);
        } else {
            this.weapon = WeaponFactory.createShotgun(scene);
        }
    }

    protected attack(target: Player): void {
        if (this.weapon && this.weapon.canFire(this.scene.time.now)) {
            this.weapon.shoot(this, target.x, target.y);
        }
    }

    protected updateState(_time: number, _delta: number) {
        if (!this.target) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        if (dist < 800) {
            this.aiState = EnemyState.ATTACK;
        } else {
            this.aiState = EnemyState.IDLE;
        }

        switch (this.aiState) {
            case EnemyState.ATTACK:
                this.setVelocity(0, 0);
                this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y));
                this.attack(this.target);
                break;
            case EnemyState.IDLE:
                this.setVelocity(0, 0);
                break;
        }
    }
}

export class Junkie extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-junky', 60, 350); // Fast but fragile, slowed to 350
    }

    protected attack(target: Player): void {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        if (dist < 40) {
            target.takeDamage(10);
        }
    }

    protected updateState(_time: number, delta: number) {
        if (!this.target) return;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        if (dist < 500) {
            this.scene.physics.moveToObject(this, this.target, this.speed);
            this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y));
            this.attack(this.target);
        } else {
            this.stateTimer -= delta;
            if (this.stateTimer <= 0) {
                this.stateTimer = 2000;
                const angle = Math.random() * Math.PI * 2;
                this.setVelocity(Math.cos(angle) * (this.speed * 0.4), Math.sin(angle) * (this.speed * 0.4));
                this.setRotation(angle);
            }
        }
    }
}
