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
}
