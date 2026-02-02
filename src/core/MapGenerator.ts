import Phaser from 'phaser';
import { CONFIG } from '../config';

export class MapGenerator {
    static generateMap(scene: Phaser.Scene) {
        // Create a blank map
        scene.make.tilemap({
            tileWidth: CONFIG.TILE_SIZE,
            tileHeight: CONFIG.TILE_SIZE,
            width: CONFIG.MAP_WIDTH,
            height: CONFIG.MAP_HEIGHT
        });

        // Add tilesets (using the keys we generated in BootScene)
        // Since we are using generated textures and raw sprites for ground usually in Phaser implementation without Tiled,
        // we might simulate a grid using a Container or Blitter, OR use Tilemap with a single tileset image if we merged them.
        // However, for procedural generic generation without a spritesheet, it is easier to just create a Logic Grid 
        // and place Images/Sprites for floor.

        // Let's go with the efficient approach: one RENDER TEXTURE for the ground? 
        // Or just individual TileSprites for flexibility (Water animation etc). 
        // Given 50x50 is 2500 sprites, it's fine for desktop/modern mobile.

        const waterColliders = scene.physics.add.staticGroup();

        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const worldX = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const worldY = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

                // Simple generation logic (Noise-ish)
                const rand = Math.random();
                let type = 'grass';

                // Borders are water
                if (x === 0 || x === CONFIG.MAP_WIDTH - 1 || y === 0 || y === CONFIG.MAP_HEIGHT - 1) {
                    type = 'water';
                } else if (rand > 0.90) {
                    type = 'water';
                } else if (rand > 0.85) {
                    type = 'road'; // Random spots of road
                }

                // Create tile
                if (type === 'water') {
                    const tile = scene.add.image(worldX, worldY, 'water');
                    // Physics body needed for water? Yes, collision.
                    // But staticGroup needs gameObjects.
                    waterColliders.create(worldX, worldY, 'water').setVisible(false); // Invisible collider, visual is image
                    tile.setDepth(0);
                } else if (type === 'road') {
                    scene.add.image(worldX, worldY, 'road').setDepth(0);
                } else {
                    scene.add.image(worldX, worldY, 'grass').setDepth(0);
                }
            }
        }

        // Set World Bounds
        scene.physics.world.setBounds(0, 0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE);

        return { waterColliders };
    }
}
