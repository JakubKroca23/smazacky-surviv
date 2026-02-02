import Phaser from 'phaser';
import { Player } from './Player';

export class Toilet extends Phaser.Physics.Arcade.Sprite {
    private occupied = false;
    private currentUser: Player | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'toilet');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setImmovable(true);
    }

    interact(player: Player) {
        if (this.occupied) {
            if (this.currentUser === player) {
                this.exit(player);
            }
        } else {
            this.enter(player);
        }
    }

    private enter(player: Player) {
        this.occupied = true;
        this.currentUser = player;

        // Hide player
        player.setVisible(false);
        player.setActive(false); // Disable updates? Maybe just movement.
        player.body!.enable = false; // Disable physics
        player.setPosition(this.x, this.y);

        // Visual feedback on toilet
        this.setTint(0xaaaaaa);
    }

    private exit(player: Player) {
        this.occupied = false;
        this.currentUser = null;

        // Show player
        player.setVisible(true);
        player.setActive(true);
        player.body!.enable = true;

        // Move player slightly out
        player.setPosition(this.x, this.y + 30);

        this.clearTint();
    }
}
