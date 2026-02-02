import Phaser from 'phaser';
import { CONFIG } from '../config';
import { MapGenerator } from '../core/MapGenerator';
import { Player } from '../objects/Player';

export class MainScene extends Phaser.Scene {
    private player!: Player;
    private waterColliders!: Phaser.Physics.Arcade.StaticGroup;

    constructor() {
        super('MainScene');
    }

    create() {
        // Generate World
        const mapData = MapGenerator.generateMap(this);
        this.waterColliders = mapData.waterColliders;

        // Create Player at center of map
        const centerX = (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) / 2;
        const centerY = (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) / 2;
        this.player = new Player(this, centerX, centerY);

        // Colliders
        this.physics.add.collider(this.player, this.waterColliders);

        // Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE);

        // Input Listener for F (Interaction)
        // Just a debug log for now
        this.input.keyboard!.on('keydown-F', () => {
            console.log('F key pressed - Interact attempt');
        });
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
