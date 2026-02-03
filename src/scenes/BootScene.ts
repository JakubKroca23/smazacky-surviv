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
        this.load.svg('water', 'assets/images/env/water_tile.svg');
        this.load.svg('water-edge-top', 'assets/images/env/water_edge_top.svg');
        this.load.svg('water-edge-bottom', 'assets/images/env/water_edge_bottom.svg');
        this.load.svg('water-edge-left', 'assets/images/env/water_edge_left.svg');
        this.load.svg('water-edge-right', 'assets/images/env/water_edge_right.svg');
        this.load.svg('env-tree', 'assets/images/env/tree.svg');
        this.load.svg('env-rock', 'assets/images/env/rock.svg');
        this.load.svg('env-crate', 'assets/images/env/crate.svg');
        // Wait, previous loads were 'assets/images/env/...'.
        // My write_to_file was 'public/assets/...'.
        // Vite accesses public root as /. 
        // If previous code used 'assets/images/env/', it implies public/assets/images/env/.
        // I saved to 'public/assets/'.  I should probably move them or adjust the load path.
        // Let's adjust load path to match where I saved them: 'assets/' relative to public.

        // New Assets (Root Assets Folder)
        this.load.svg('env-rock-small', 'assets/env-rock-small.svg');
        this.load.svg('env-rock-med', 'assets/env-rock-med.svg');
        this.load.svg('env-rock-large', 'assets/env-rock-large.svg');
        // Trees (PNG - Photorealistic)
        this.load.image('env-tree-a', 'assets/env-tree-a.png');
        this.load.image('env-tree-b', 'assets/env-tree-b.png');
        this.load.image('env-tree-c', 'assets/env-tree-c.png');

        // Enemies
        this.load.svg('enemy-police-cyber', 'assets/enemy_police_cyber.svg');
        this.load.svg('enemy-junky', 'assets/enemy_junky.svg');
        this.load.svg('enemy-swat-cyber', 'assets/enemy_police_cyber.svg'); // Reuse or specific?

        // Special Weapons

        // Vehicles
        this.load.svg('vehicle-sedan', 'assets/vehicle-sedan.svg'); // Keep old one
        this.load.image('vehicle-police', 'assets/vehicle-police.png');
        this.load.image('vehicle-swat', 'assets/vehicle-swat.png');

        // NEW ASSETS (Visual Overhaul)
        this.load.image('floor-industrial', 'assets/floor_industrial.png');
        this.load.image('wall-urban', 'assets/wall_urban.png');
        this.load.svg('player-cyber', 'assets/player_cyber.svg');
        this.load.image('ui-frame', 'assets/ui_frame.png');
        this.load.image('light-flare-cyan', 'assets/light_flare_cyan.png');
        this.load.image('light-flare-purple', 'assets/light_flare_purple.png');
    }

    create() {
        this.generateTextures();
        this.scene.start('LobbyScene');
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

        // WALL (Procedural for Map bounds and Buildings)
        const wall = this.make.graphics({ x: 0, y: 0 });
        wall.fillStyle(0x000000); // Black walls
        wall.fillRect(0, 0, 64, 64);
        wall.generateTexture('wall', 64, 64);

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

        // FALLBACKS for Missing Assets
        if (!this.textures.exists('player-survivor')) {
            const p = this.make.graphics({ x: 0, y: 0 });
            p.fillStyle(CONFIG.COLORS.PLAYER);
            p.fillCircle(24, 24, 24);
            p.lineStyle(2, 0x000000);
            p.strokeCircle(24, 24, 24);
            p.generateTexture('player-survivor', 48, 48);
        }

        if (!this.textures.exists('wall-urban')) {
            const w = this.make.graphics({ x: 0, y: 0 });
            w.fillStyle(CONFIG.COLORS.WALL);
            w.fillRect(0, 0, 64, 64);
            w.lineStyle(2, 0x555555);
            w.strokeRect(0, 0, 64, 64);
            w.generateTexture('wall-urban', 64, 64);
        }

        if (!this.textures.exists('floor-industrial')) {
            const f = this.make.graphics({ x: 0, y: 0 });
            f.fillStyle(0x222222);
            f.fillRect(0, 0, 256, 256);

            // Grid pattern
            f.lineStyle(2, 0x333333);
            f.strokeRect(0, 0, 256, 256);
            f.beginPath();
            f.moveTo(128, 0); f.lineTo(128, 256);
            f.moveTo(0, 128); f.lineTo(256, 128);
            f.strokePath();

            f.generateTexture('floor-industrial', 256, 256);
        }
    }
}
