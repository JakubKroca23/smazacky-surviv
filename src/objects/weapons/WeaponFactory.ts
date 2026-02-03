import Phaser from 'phaser';
import { Weapon } from '../Weapon';
import { RangedWeapon, MeleeWeapon } from './ConcreteWeapons';

export class WeaponFactory {
    static createGlock(scene: Phaser.Scene): Weapon {
        return new RangedWeapon(scene, {
            name: 'Glock',
            damage: 15,
            range: 600,
            fireRate: 300,
            ammoType: '9mm',
            magazineSize: 12,
            maxAmmo: 60,
            reloadTime: 1500,
            spread: 5,
            isAutomatic: false
        });
    }

    static createAK47(scene: Phaser.Scene): Weapon {
        return new RangedWeapon(scene, {
            name: 'AK-47',
            damage: 25,
            range: 800,
            fireRate: 100, // 600 RPM
            ammoType: '7.62mm',
            magazineSize: 30,
            maxAmmo: 90,
            reloadTime: 2500,
            spread: 8,
            isAutomatic: true
        });
    }

    static createShotgun(scene: Phaser.Scene): Weapon {
        return new RangedWeapon(scene, {
            name: 'Shotgun',
            damage: 20, // Per pellet
            range: 300,
            fireRate: 1000,
            ammoType: 'shell',
            magazineSize: 6,
            maxAmmo: 24,
            reloadTime: 3000,
            spread: 15,
            isAutomatic: false
        });
    }

    static createKnife(scene: Phaser.Scene): Weapon {
        return new MeleeWeapon(scene, {
            name: 'Knife',
            damage: 30,
            range: 50,
            fireRate: 500,
            ammoType: 'none',
            magazineSize: 0,
            maxAmmo: 0,
            reloadTime: 0,
            spread: 0,
            isAutomatic: false
        });
    }

    static createNeedle(scene: Phaser.Scene): Weapon {
        // Needle is now a Ranged Weapon (Throwable)
        return new RangedWeapon(scene, {
            name: 'Needle',
            damage: 5,
            range: 1000, // 10 Tiles * 100
            fireRate: 2000, // Slow throw
            ammoType: 'none', // Infinite for Junkies? Or uses stack? 
            magazineSize: 1, // Single throw
            maxAmmo: 100, // Infinite for now
            reloadTime: 500,
            spread: 5,
            isAutomatic: false,
            projectileProps: {
                poison: {
                    duration: 5000,
                    damage: 2, // 2 damage per second? Or total? "2HP/S"
                    interval: 1000
                },
                dropOnMiss: 'weapon-needle',
                speed: 400 // Slow throw
            }
        });
    }
}
