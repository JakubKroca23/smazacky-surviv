import Phaser from 'phaser';

export class Car extends Phaser.Physics.Arcade.Sprite {
    private health = 100;
    private isDestroyed = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'car');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        // Body is a static obstacle for movement
        // But we use a dynamic body with immovable=true so it can register hits?
        // Actually static body is better for performance if it never moves.
        // But if we want to destroy it, dynamic body is fine too.
        // Let's stick to Arcade Physics Group settings in ObjectFactory usually, but here we set individual props.
        this.setPushable(false);
    }

    takeDamage(amount: number) {
        if (this.isDestroyed) return;

        this.health -= amount;
        this.setTint(0xff0000); // Visual feedback
        this.scene.time.delayedCall(100, () => this.clearTint());

        if (this.health <= 0) {
            this.destroyCar();
        }
    }

    private destroyCar() {
        this.isDestroyed = true;
        this.disableBody(true, true); // Disable physics and hide
        // Spawn loot?
        const loot = this.scene.add.circle(this.x, this.y, 10, 0xffff00); // Gold coin
        this.scene.tweens.add({
            targets: loot,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
}
