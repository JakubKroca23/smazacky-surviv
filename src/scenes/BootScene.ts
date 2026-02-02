import Phaser from 'phaser';
import { CONFIG } from '../config';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Here we can load external assets if needed
    }

    create() {
        this.generateTextures();
        this.scene.start('MainScene');
    }

    private generateTextures() {
        // GRASS TILE
        const grass = this.make.graphics({ x: 0, y: 0 });
        grass.fillStyle(CONFIG.COLORS.GRASS);
        grass.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        // Add random noise
        grass.fillStyle(0x1a451e);
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * CONFIG.TILE_SIZE;
            const y = Math.random() * CONFIG.TILE_SIZE;
            const size = Math.random() * 5 + 2;
            grass.fillCircle(x, y, size);
        }
        grass.generateTexture('grass', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // WATER TILE
        const water = this.make.graphics({ x: 0, y: 0 });
        water.fillStyle(CONFIG.COLORS.WATER);
        water.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        water.fillStyle(0xffffff, 0.2); // Reflections
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * CONFIG.TILE_SIZE;
            const y = Math.random() * CONFIG.TILE_SIZE;
            water.fillRect(x, y, 20, 4);
        }
        water.generateTexture('water', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // ROAD TILE
        const road = this.make.graphics({ x: 0, y: 0 });
        road.fillStyle(CONFIG.COLORS.ROAD);
        road.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        road.generateTexture('road', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // PLAYER
        const player = this.make.graphics({ x: 0, y: 0 });
        player.fillStyle(CONFIG.COLORS.PLAYER);
        player.fillCircle(16, 16, 16);
        player.lineStyle(2, 0x000000);
        player.strokeCircle(16, 16, 16);
        player.generateTexture('player', 32, 32);

        // WEAPON (Generic Rectangle)
        const weapon = this.make.graphics({ x: 0, y: 0 });
        weapon.fillStyle(0x000000);
        weapon.fillRect(0, 0, 24, 8);
        weapon.generateTexture('weapon_texture', 24, 8);

        // PROJECTILE
        const packet = this.make.graphics({ x: 0, y: 0 });
        packet.fillStyle(0xffff00);
        packet.fillCircle(4, 4, 4);
        packet.generateTexture('projectile', 8, 8);

        // WALL
        const wall = this.make.graphics({ x: 0, y: 0 });
        wall.fillStyle(CONFIG.COLORS.WALL);
        wall.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        wall.lineStyle(4, 0x000000);
        wall.strokeRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        wall.generateTexture('wall', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    }
}
