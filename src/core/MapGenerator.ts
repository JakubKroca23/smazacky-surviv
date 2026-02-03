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

        const waterColliders = scene.physics.add.staticGroup();

        // 1. Initialize Grid with Grass
        const grid: string[][] = [];
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            grid[y] = [];
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                grid[y][x] = 'grass';
            }
        }

        // 2. Generate Specific Ponds (at least 3, size 10-20)
        const numPonds = 3;
        for (let i = 0; i < numPonds; i++) {
            // Pick random start point (excluding borders)
            let startX = Phaser.Math.Between(5, CONFIG.MAP_WIDTH - 5);
            let startY = Phaser.Math.Between(5, CONFIG.MAP_HEIGHT - 5);

            let pondSize = Phaser.Math.Between(15, 25); // Target size
            let currentSize = 0;
            const openList: { x: number, y: number }[] = [{ x: startX, y: startY }];

            while (currentSize < pondSize && openList.length > 0) {
                // Pick random tile from open list
                const index = Phaser.Math.Between(0, openList.length - 1);
                const tile = openList.splice(index, 1)[0];

                if (grid[tile.y][tile.x] !== 'water') {
                    grid[tile.y][tile.x] = 'water';
                    currentSize++;

                    // Add neighbors to open list if valid
                    const dirs = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
                    for (const dir of dirs) {
                        const nx = tile.x + dir.x;
                        const ny = tile.y + dir.y;
                        if (nx > 0 && nx < CONFIG.MAP_WIDTH - 1 && ny > 0 && ny < CONFIG.MAP_HEIGHT - 1) {
                            if (grid[ny][nx] !== 'water') {
                                openList.push({ x: nx, y: ny });
                            }
                        }
                    }
                }
            }
        }

        // Ensure map borders are water (per requirement/convention)
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                if (x === 0 || x === CONFIG.MAP_WIDTH - 1 || y === 0 || y === CONFIG.MAP_HEIGHT - 1) {
                    grid[y][x] = 'water';
                }
            }
        }

        // 3. Render Map
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const worldX = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const worldY = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const type = grid[y][x];

                if (type === 'water') {
                    // Water Logic: Water is now a zone, not a solid wall
                    const tile = scene.add.image(worldX, worldY, 'water');
                    tile.setDepth(0);

                    const waterBody = waterColliders.create(worldX, worldY, 'water');
                    waterBody.setVisible(false);
                    // Important: Reset body size or check? Static bodies are fine.

                    // Autotiling: Add shores if neighbor is NOT water
                    if (y > 0 && grid[y - 1][x] !== 'water') scene.add.image(worldX, worldY, 'water-edge-top').setDepth(1);
                    if (y < CONFIG.MAP_HEIGHT - 1 && grid[y + 1][x] !== 'water') scene.add.image(worldX, worldY, 'water-edge-bottom').setDepth(1);
                    if (x > 0 && grid[y][x - 1] !== 'water') scene.add.image(worldX, worldY, 'water-edge-left').setDepth(1);
                    if (x < CONFIG.MAP_WIDTH - 1 && grid[y][x + 1] !== 'water') scene.add.image(worldX, worldY, 'water-edge-right').setDepth(1);

                } else {
                    // Grass
                    scene.add.image(worldX, worldY, 'grass').setDepth(0);

                    // Vegetation (only on grass)
                    // Lower spawn rate slightly as objects are larger?
                    if (Math.random() < 0.05) { // 5% chance per tile
                        const objType = Math.random();

                        // Trees (3 Types)
                        if (objType < 0.5) {
                            const treeType = Phaser.Math.RND.pick(['env-tree-a', 'env-tree-b', 'env-tree-c']);
                            const tree = scene.physics.add.staticImage(worldX, worldY, treeType);
                            tree.setDepth(20);

                            // 3x3 Tree: Visual is ~192x192. Trunk is small in center.
                            // Set body to trunk only (approx 40x40 in center).
                            tree.setBodySize(40, 40);
                            tree.setOffset(76, 76); // (192-40)/2 = 76
                        }
                        // Rocks (3 Sizes)
                        else if (objType < 0.8) {
                            const rockType = Phaser.Math.RND.pick(['env-rock-small', 'env-rock-med', 'env-rock-large']);
                            const rock = scene.physics.add.staticImage(worldX, worldY, rockType);
                            rock.setDepth(5);

                            if (rockType === 'env-rock-small') {
                                rock.setBodySize(40, 40); // Almost full size (64)
                                // rock.setOffset(12, 12);
                            } else if (rockType === 'env-rock-med') {
                                rock.setBodySize(100, 100); // 128 visual
                                rock.setOffset(14, 14);
                            } else { // Large
                                rock.setBodySize(150, 150); // 192 visual
                                rock.setOffset(21, 21);
                            }
                        }
                        // Crate
                        else if (objType < 0.85) {
                            const crate = scene.physics.add.staticImage(worldX, worldY, 'env-crate');
                            crate.setDepth(5);
                            crate.setBodySize(50, 50); // Standard crate collision
                        }
                    }
                }
            }
        }

        // 4. Buildings (After Map Render?)
        // Let's create a few specific buildings.
        const buildings = scene.physics.add.staticGroup(); // Walls
        const roofs = scene.add.group(); // Visual Roofs (no physics, just fade)
        const roofZones = scene.physics.add.staticGroup(); // Sensors for roof fading

        // Spawn 2-3 Buildings
        for (let i = 0; i < 3; i++) {
            // Random pos
            let bx = Phaser.Math.Between(5, CONFIG.MAP_WIDTH - 10) * CONFIG.TILE_SIZE;
            let by = Phaser.Math.Between(5, CONFIG.MAP_HEIGHT - 10) * CONFIG.TILE_SIZE;

            // Check overlap with water? (Simplified: Just spawn, if water, tough luck or check grid)
            // Grid check is better, but for now random.

            // Building Size: 4x4 tiles (256x256)
            // Wall rect
            const w = 256;
            const h = 256;

            // Create Wall (Physics) - hollow box?
            // Actually, simplest is 4 walls. Or one solid box if we assume "Interior" is just a visual trick.
            // If we want to walk INSIDE, we need walls around, not solid.
            // Let's make 4 walls using individual wall segments or just 4 static bodies.

            // Top Wall
            buildings.create(bx, by - h / 2, 'wall').setDisplaySize(w, 20).setDepth(15).refreshBody();
            // Bottom Wall (with gap for door?)
            buildings.create(bx - w / 4 - 20, by + h / 2, 'wall').setDisplaySize(w / 2 - 40, 20).setDepth(15).refreshBody();
            buildings.create(bx + w / 4 + 20, by + h / 2, 'wall').setDisplaySize(w / 2 - 40, 20).setDepth(15).refreshBody();
            // Left Wall
            buildings.create(bx - w / 2, by, 'wall').setDisplaySize(20, h).setDepth(15).refreshBody();
            // Right Wall
            buildings.create(bx + w / 2, by, 'wall').setDisplaySize(20, h).setDepth(15).refreshBody();

            // Floor (Inside)
            scene.add.rectangle(bx, by, w, h, 0x5d4037).setDepth(1); // Wood floor

            // Roof (Visual)
            const roof = scene.add.rectangle(bx, by, w + 20, h + 20, 0x3e2723); // Dark brown roof
            roof.setDepth(30); // High depth (above trees?)
            roofs.add(roof);

            // Roof Zone (Sensor)
            const zone = roofZones.create(bx, by, 'grass'); // generic texture
            zone.setDisplaySize(w, h);
            zone.setVisible(false);
            (zone.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject(); // Ensure body matches size

            // Store reference to roof on the zone object for easy access
            // scene.physics.add.overlap(player, zone, () => roof.setAlpha(0.1))
            zone.setData('roof', roof);
        }

        // Set World Bounds
        scene.physics.world.setBounds(0, 0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE);

        return { waterColliders, buildings, roofs, roofZones };
    }
}
