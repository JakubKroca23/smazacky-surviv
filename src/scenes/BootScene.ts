import Phaser from 'phaser';
import { CONFIG } from '../config';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Weapons
        this.load.svg('weapon-glock', 'assets/images/weapons/glock.svg');
        this.load.svg('weapon-ak47', 'assets/images/weapons/ak47.svg');
        this.load.svg('weapon-shotgun', 'assets/images/weapons/shotgun.svg');
        this.load.svg('weapon-knife', 'assets/images/weapons/knife.svg');

        // Loot
        this.load.svg('loot-ammo-9mm', 'assets/images/loot/ammo_9mm.svg');
        this.load.svg('loot-ammo-762', 'assets/images/loot/ammo_762.svg');
        this.load.svg('loot-ammo-shell', 'assets/images/loot/ammo_shell.svg');
        this.load.svg('loot-medkit', 'assets/images/loot/medkit.svg');

        // Environment
        this.load.svg('grass', 'assets/images/env/grass_tile.svg');
        this.load.svg('env-tree', 'assets/images/env/tree.svg');
        this.load.svg('env-rock', 'assets/images/env/rock.svg');
        this.load.svg('env-crate', 'assets/images/env/crate.svg');
    }

    create() {
        this.generateTextures();
        this.scene.start('MainScene');
    }

    private generateTextures() {
        // PLAYER (Procedural for now)
        const player = this.make.graphics({ x: 0, y: 0 });
        player.fillStyle(CONFIG.COLORS.PLAYER);
        player.fillCircle(24, 24, 24);
        player.lineStyle(2, 0x000000);
        player.strokeCircle(24, 24, 24);
        player.generateTexture('player', 48, 48);

        // PROJECTILE (Procedural)
        const packet = this.make.graphics({ x: 0, y: 0 });
        packet.fillStyle(0xffff00);
        packet.fillCircle(4, 4, 4);
        packet.generateTexture('projectile', 8, 8);

        // WALL (Procedural for Map bounds)
        const wall = this.make.graphics({ x: 0, y: 0 });
        wall.fillStyle(CONFIG.COLORS.WALL);
        wall.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        wall.generateTexture('wall', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // Note: 'grass', 'water', 'road' are now loaded assets or mapped to grass
        // We might need to handle water/road keys if MapGenerator uses them
        // MapGenerator uses 'grass', 'water', 'road'. 
        // We loaded 'grass'. We need 'water' and 'road' to avoid crash.
        // Let's alias them to grass for now to keep the "Dark Green" aesthetic simplified.
        if (!this.textures.exists('water')) {
            // Create invisible or duplicate texture for logic compatibility
            const water = this.make.graphics({ x: 0, y: 0 });
            water.fillStyle(CONFIG.COLORS.WATER);
            water.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            water.generateTexture('water', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        }

        if (!this.textures.exists('road')) {
            const road = this.make.graphics({ x: 0, y: 0 });
            road.fillStyle(CONFIG.COLORS.ROAD);
            road.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            road.generateTexture('road', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        }
    }
}
