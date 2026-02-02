import Phaser from 'phaser';

export class TrashCan extends Phaser.Physics.Arcade.Sprite {
    public searched = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'trash');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setImmovable(true);
    }

    interact() {
        if (this.searched) return;

        this.searched = true;
        this.setAlpha(0.5); // Visual feedback
        console.log('Trash can searched!');

        // Spawn item logic here
        const item = this.scene.add.text(this.x, this.y - 20, 'ITEM', { fontSize: '10px', color: '#fff' });
        this.scene.tweens.add({
            targets: item,
            y: this.y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => item.destroy()
        });
    }
}
