import Phaser from 'phaser';

export type AmmoType = '9mm' | '7.62mm' | 'shell' | 'none';

export interface WeaponStats {
    name: string;
    damage: number;
    range: number;
    fireRate: number; // Time between shots in ms
    ammoType: AmmoType;
    magazineSize: number;
    maxAmmo: number;
    reloadTime: number;
    spread: number; // Angle variance in degrees
    isAutomatic: boolean;
    projectileProps?: {
        poison?: { duration: number, damage: number, interval: number };
        dropOnMiss?: string;
        speed?: number; // Override default speed
    };
}

export abstract class Weapon {
    public stats: WeaponStats;
    public currentAmmo: number;
    public totalAmmo: number;
    protected lastFiredTime: number = 0;
    protected isReloading: boolean = false;
    protected scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, stats: WeaponStats) {
        this.scene = scene;
        this.stats = stats;
        this.currentAmmo = stats.magazineSize;
        this.totalAmmo = stats.maxAmmo;
    }

    canFire(time: number): boolean {
        return (
            !this.isReloading &&
            this.currentAmmo > 0 &&
            time > this.lastFiredTime + this.stats.fireRate
        );
    }

    update(_time: number, _delta: number) { }

    abstract shoot(shooter: Phaser.GameObjects.Sprite, targetX: number, targetY: number): void;

    reload() {
        if (this.isReloading || this.currentAmmo === this.stats.magazineSize || this.totalAmmo === 0) return;

        console.log(`Reloading ${this.stats.name}...`);
        this.isReloading = true;

        this.scene.time.delayedCall(this.stats.reloadTime, () => {
            const needed = this.stats.magazineSize - this.currentAmmo;
            const available = Math.min(needed, this.totalAmmo);

            this.currentAmmo += available;
            this.totalAmmo -= available;
            this.isReloading = false;
            console.log(`Reloaded. Ammo: ${this.currentAmmo}/${this.totalAmmo}`);
        });
    }
}
