import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    private damage: number;
    private maxDistance: number;
    private startX: number;
    private startY: number;

    // New Props
    public poisonEffect?: { duration: number, damage: number, interval: number };
    public dropOnMiss?: string; // Item key

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, damage: number, speed: number, maxDistance: number) {
        super(scene, x, y, 'projectile'); // Default texture, override later if needed?
        // Or we can pass texture to constructor. 
        // For Needle, we probably want 'weapon-needle' texture rotating.

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
        // Destroy if travel max distance
        const distanceTravelled = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);

        if (distanceTravelled > this.maxDistance) {
            this.handleMiss();
        }
    }

    private handleMiss() {
        if (this.dropOnMiss) {
            // Spawn item
            // For now, let's just create a sprite that acts as "dropped item"
            // In future, use Loot system.
            // Using a simple sprite for now as requested "zustane jako zbran co jde vzit"
            console.log(`Projectile missed, dropping ${this.dropOnMiss}`);

            // TODO: Integrate with Loot System. 
            // For now just logging or maybe spawning a static image to prove point?
            // Let's spawn a static image called 'Loot'
            const loot = this.scene.physics.add.sprite(this.x, this.y, this.dropOnMiss);
            loot.setDepth(5);
            // We need a Loot group to be pickupable.
        }
        this.destroy();
    }

    public getDamage(): number {
        return this.damage;
    }
}
