import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    private damage: number;

    private maxDistance: number;
    private startX: number;
    private startY: number;

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, damage: number, speed: number, maxDistance: number) {
        super(scene, x, y, 'projectile');

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.damage = damage;

        this.maxDistance = maxDistance;
        this.startX = x;
        this.startY = y;

        // Physics setup
        this.setRotation(angle);
        this.scene.physics.velocityFromRotation(angle, speed, this.body!.velocity);
    }

    update() {
        // Destroy if out of bounds or travelled max distance
        const distanceTravelled = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);

        if (distanceTravelled > this.maxDistance) {
            this.destroy();
        }
    }

    public getDamage(): number {
        return this.damage;
    }
}
