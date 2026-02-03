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

        const speed = this.stats.projectileProps?.speed || 1000;

        const proj = new Projectile(
            this.scene,
            spawnX,
            spawnY,
            finalAngle,
            this.stats.damage,
            speed,
            this.stats.range
        );

        if (this.stats.projectileProps) {
            proj.poisonEffect = this.stats.projectileProps.poison;
            proj.dropOnMiss = this.stats.projectileProps.dropOnMiss;

            // Texture override for needle?
            if (this.stats.name === 'Needle') {
                proj.setTexture('weapon-needle');
                proj.setFlipX(false); // Adjust logic if needed
            }
        }

        // Add to projectiles group if it exists (Generic check to avoid circular dep)
        if ((this.scene as any).projectiles) {
            (this.scene as any).projectiles.add(proj);
        }

        // TODO: Play Sound
        // TODO: Camera Shake
    }
}

export class MeleeWeapon extends Weapon {
    constructor(scene: Phaser.Scene, stats: WeaponStats) {
        super(scene, stats);
    }

    shoot(shooter: Phaser.GameObjects.Sprite, _targetX: number, _targetY: number) {
        if (!this.canFire(this.scene.time.now)) return;

        this.lastFiredTime = this.scene.time.now;

        // Melee Logic: Create a temporary hitbox in front of player
        const offset = 40;
        const angle = shooter.rotation;
        const hitX = shooter.x + Math.cos(angle) * offset;
        const hitY = shooter.y + Math.sin(angle) * offset;

        const hitbox = this.scene.add.circle(hitX, hitY, 20, 0xff0000, 0); // Invisible or debug
        this.scene.physics.add.existing(hitbox);

        // Check overlap with enemies 
        // We need access to the enemy group. Assuming GameScene structure.
        const enemies = (this.scene as any).enemies;
        if (enemies) {
            this.scene.physics.overlap(hitbox, enemies, (_box, enemy: any) => {
                if (enemy.takeDamage) {
                    enemy.takeDamage(this.stats.damage);
                    console.log(`Melee hit on ${enemy.texture.key}`);

                    // Knockback?
                    const knockbackForce = 200;
                    enemy.body.velocity.x += Math.cos(angle) * knockbackForce;
                    enemy.body.velocity.y += Math.sin(angle) * knockbackForce;
                }
            });
        }

        // Destroy hitbox quickly
        this.scene.time.delayedCall(100, () => {
            hitbox.destroy();
        });
    }
}
