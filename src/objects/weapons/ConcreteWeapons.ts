import Phaser from 'phaser';
import { Weapon, WeaponStats } from '../Weapon';
import { Projectile } from '../Projectile';

export class RangedWeapon extends Weapon {
    constructor(scene: Phaser.Scene, stats: WeaponStats) {
        super(scene, stats);
    }

    shoot(shooter: Phaser.GameObjects.Sprite, targetX: number, targetY: number) {
        if (!this.canFire(this.scene.time.now)) return;

        this.currentAmmo--;
        this.lastFiredTime = this.scene.time.now;

        // Calculate angle
        const angle = Phaser.Math.Angle.Between(shooter.x, shooter.y, targetX, targetY);

        // Add random spread
        const spreadRad = Phaser.Math.DegToRad(this.stats.spread);
        const finalAngle = angle + (Math.random() * spreadRad - spreadRad / 2);

        // Spawn Projectile
        // Offset starting position to be at the "barrel"
        const offset = 30;
        const spawnX = shooter.x + Math.cos(finalAngle) * offset;
        const spawnY = shooter.y + Math.sin(finalAngle) * offset;

        new Projectile(
            this.scene,
            spawnX,
            spawnY,
            finalAngle,
            this.stats.damage,
            1000, // Projectile Speed (maybe should be in stats too?)
            this.stats.range
        );

        // TODO: Play Sound
        // TODO: Camera Shake
    }
}

export class MeleeWeapon extends Weapon {
    constructor(scene: Phaser.Scene, stats: WeaponStats) {
        super(scene, stats);
    }

    shoot(_shooter: Phaser.GameObjects.Sprite, _targetX: number, _targetY: number) {
        if (!this.canFire(this.scene.time.now)) return;

        this.lastFiredTime = this.scene.time.now;

        // Melee Logic: Create a temporary hitbox in front of player
        console.log('Stab/Slash!');
        // TODO: Physics overlap check in a cone/box in front of player
    }
}
