import Phaser from 'phaser';
import { Enemy, EnemyState } from './Enemy';
import { WeaponFactory } from '../weapons/WeaponFactory';

export class Junkie extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-junkie', 50, 500); // 50 HP, 500 Speed

        // Equip Needle
        this.weapon = WeaponFactory.createNeedle(scene);
    }

    protected updateState(time: number, delta: number) {
        if (!this.target) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        // Junkie Logic: Always Chase if close, Wander erratically if far? 
        // User said: "beha rychle nahodne po mape" (runs fast randomly)
        // If they see player (let's say 400px), they chase fast.

        if (dist < 500) {
            this.state = EnemyState.CHASE;
        } else {
            this.state = EnemyState.WANDER;
        }

        switch (this.state) {
            case EnemyState.CHASE:
                this.scene.physics.moveToObject(this, this.target, this.speed);
                this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y));

                // Attack if close
                if (dist < 60) {
                    if (this.weapon?.canFire(time)) {
                        this.weapon.shoot(this, this.target.x, this.target.y);
                    }
                }
                break;

            case EnemyState.WANDER:
                // Random movement logic
                this.stateTimer -= delta;
                if (this.stateTimer <= 0) {
                    this.stateTimer = 1000;
                    const angle = Math.random() * Math.PI * 2;
                    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
                    this.setRotation(angle);
                }
                break;
        }
    }
}

export class Police extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-police', 100, 400); // 100 HP, 400 Speed
        this.armor = 50;

        // Equip Glock
        this.weapon = WeaponFactory.createGlock(scene);
    }

    protected updateState(time: number, delta: number) {
        if (!this.target) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        // Police: Patrols. If sees player, shoots.
        if (dist < 700) {
            this.state = EnemyState.ATTACK;
        } else {
            this.state = EnemyState.WANDER; // Patrol
        }

        switch (this.state) {
            case EnemyState.ATTACK:
                // Keep distance (kite?) or just stop and shoot?
                // User said "Patrol". When engaging, they likely stop or move slowly to aim.
                // Let's stop to shoot for accuracy, or move slowly towards.

                if (dist > 300) {
                    this.scene.physics.moveToObject(this, this.target, this.speed * 0.5); // Slow approach
                } else {
                    this.setVelocity(0, 0); // Stand ground
                }

                this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y));

                if (this.weapon?.canFire(time)) {
                    // Accuracy check?
                    this.weapon.shoot(this, this.target.x, this.target.y);
                }
                break;

            case EnemyState.WANDER:
                this.stateTimer -= delta;
                if (this.stateTimer <= 0) {
                    this.stateTimer = 2000;
                    const angle = Math.random() * Math.PI * 2;
                    this.setVelocity(Math.cos(angle) * (this.speed * 0.5), Math.sin(angle) * (this.speed * 0.5)); // Slower patrol
                    this.setRotation(angle);
                }
                break;
        }
    }
}

export class SWAT extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-swat', 100, 250); // 100 HP, 250 Speed
        this.armor = 100;

        // Equip AK47 or Shotgun Randomly
        if (Math.random() > 0.5) {
            this.weapon = WeaponFactory.createAK47(scene);
        } else {
            this.weapon = WeaponFactory.createShotgun(scene);
        }
    }

    protected updateState(time: number, _delta: number) {
        if (!this.target) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        // SWAT: "Stoji a ceka" (Stands and waits)
        // Only attacks if range is close, or maybe always watches?
        if (dist < 800) {
            this.state = EnemyState.ATTACK;
        } else {
            this.state = EnemyState.IDLE;
        }

        switch (this.state) {
            case EnemyState.ATTACK:
                this.setVelocity(0, 0);
                this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y));

                if (this.weapon?.canFire(time)) {
                    this.weapon.shoot(this, this.target.x, this.target.y);
                }
                break;
            case EnemyState.IDLE:
                this.setVelocity(0, 0);
                break;
        }
    }
}
