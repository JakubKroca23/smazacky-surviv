import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Loot, LootType } from '../objects/Loot';

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
        // SEAMLESS FLOOR (One giant TileSprite)
        const totalWidth = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
        const totalHeight = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
        const floor = scene.add.tileSprite(totalWidth / 2, totalHeight / 2, totalWidth, totalHeight, 'floor-industrial');
        floor.setDepth(-1); // Background
        floor.setPipeline('Light2D');

        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const worldX = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const worldY = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const type = grid[y][x];

                if (type === 'water') {
                    // Water Logic: Water is now a zone, not a solid wall
                    const tile = scene.add.image(worldX, worldY, 'water');
                    tile.setDepth(0);
                    tile.setTint(0x003344); // Dark cyan/blue tint for cyberpunk feel
                    tile.setPipeline('Light2D');

                    const waterBody = waterColliders.create(worldX, worldY, 'water');
                    waterBody.setVisible(false);
                    // Important: Reset body size or check? Static bodies are fine.

                    // Autotiling: Add shores if neighbor is NOT water
                    if (y > 0 && grid[y - 1][x] !== 'water') scene.add.image(worldX, worldY, 'water-edge-top').setDepth(1);
                    if (y < CONFIG.MAP_HEIGHT - 1 && grid[y + 1][x] !== 'water') scene.add.image(worldX, worldY, 'water-edge-bottom').setDepth(1);
                    if (x > 0 && grid[y][x - 1] !== 'water') scene.add.image(worldX, worldY, 'water-edge-left').setDepth(1);
                    if (x < CONFIG.MAP_WIDTH - 1 && grid[y][x + 1] !== 'water') scene.add.image(worldX, worldY, 'water-edge-right').setDepth(1);

                } else {
                    // Floor Renders via TileSprite now
                    // Just spawn objects

                    // Vegetation (only on grass)
                    // Lower spawn rate slightly as objects are larger?
                    // Decoration (Rocks/Crates) - 1% chance
                    // Prevent spawning in the Safe Zone (Center +/- 3 tiles)
                    const distToCenter = Phaser.Math.Distance.Between(x, y, CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2);

                    if (distToCenter > 3 && Math.random() < 0.01) {
                        const objType = Math.random();

                        // Rocks (3 Sizes)
                        if (objType < 0.7) {
                            const rockType = Phaser.Math.RND.pick(['env-rock-small', 'env-rock-med', 'env-rock-large']);
                            const rock = scene.physics.add.staticImage(worldX, worldY, rockType);
                            rock.setDepth(5);
                            rock.setPipeline('Light2D'); // Enable Light

                            if (rockType === 'env-rock-small') {
                                rock.setBodySize(40, 40);
                            } else if (rockType === 'env-rock-med') {
                                rock.setBodySize(80, 80); // Reduced collider size
                                rock.setOffset(24, 24);
                            } else { // Large
                                rock.setBodySize(120, 120); // Reduced collider size
                                rock.setOffset(36, 36);
                            }
                        }
                        // Crate
                        else {
                            const crate = scene.physics.add.staticImage(worldX, worldY, 'env-crate');
                            crate.setDepth(5);
                            crate.setBodySize(50, 50);
                            crate.setPipeline('Light2D');
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
            buildings.create(bx, by - h / 2, 'wall-urban').setDisplaySize(w, 20).setDepth(15).setPipeline('Light2D').refreshBody();
            // Bottom Wall (with gap for door?)
            buildings.create(bx - w / 4 - 20, by + h / 2, 'wall-urban').setDisplaySize(w / 2 - 40, 20).setDepth(15).setPipeline('Light2D').refreshBody();
            buildings.create(bx + w / 4 + 20, by + h / 2, 'wall-urban').setDisplaySize(w / 2 - 40, 20).setDepth(15).setPipeline('Light2D').refreshBody();
            // Left Wall
            buildings.create(bx - w / 2, by, 'wall-urban').setDisplaySize(20, h).setDepth(15).setPipeline('Light2D').refreshBody();
            // Right Wall
            buildings.create(bx + w / 2, by, 'wall-urban').setDisplaySize(20, h).setDepth(15).setPipeline('Light2D').refreshBody();

            // Floor (Inside) - Technical dark floor
            scene.add.rectangle(bx, by, w, h, CONFIG.COLORS.BACKGROUND).setDepth(1).setPipeline('Light2D');

            // Roof (Visual)
            const roofColors = [0x111111, 0x1a1a1a, 0x0a0a0a];
            const roofColor = Phaser.Math.RND.pick(roofColors);
            const roof = scene.add.rectangle(bx, by, w + 20, h + 20, roofColor);
            roof.setDepth(30);
            roofs.add(roof);

            // Add a Neon Light in the center of the building
            const neonColors = [0x00fbff, 0xff00ff, 0x00ff00];
            const neonColor = Phaser.Math.RND.pick(neonColors);
            scene.lights.addLight(bx, by, 300, neonColor, CONFIG.LIGHTING.NEON_INTENSITY);

            // Add Flare visual
            const flareKey = neonColor === 0x00fbff ? 'light-flare-cyan' : 'light-flare-purple';
            const flare = scene.add.image(bx, by, flareKey).setDepth(2).setAlpha(0.6).setScale(2.0);
            flare.setBlendMode(Phaser.BlendModes.ADD);

            // Roof Zone (Sensor)
            const zone = roofZones.create(bx, by, 'grass'); // generic texture
            zone.setDisplaySize(w, h);
            zone.setVisible(false);
            (zone.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject(); // Ensure body matches size

            // Store reference to roof on the zone object for easy access
            // scene.physics.add.overlap(player, zone, () => roof.setAlpha(0.1))
            zone.setData('roof', roof);
        }

        // 5. Loot Generation
        // Spawn loot in buildings and random spots
        const lootGroup = scene.physics.add.group({
            classType: Loot,
            runChildUpdate: true
        });

        // Loot in Buildings
        // We spawne 3 buildings. Let's spawn loot inside them.
        // We know building centers? We didn't store them nicely.
        // Let's iterate buildings group? No, it's static walls.
        // Let's just spawn random loot near the generated building coords?
        // We re-calculated random coords for buildings. 
        // Ideally we should have stored them. 
        // Refactor: We can spawn loot *during* building generation loop.

        // BETTER: Move building loop to return loot too? 
        // Or just spawn random loot in the world for now (simple).
        // Let's spawn 20 random loot items everywhere (except water).

        for (let i = 0; i < 30; i++) {
            let lx = Phaser.Math.Between(5, CONFIG.MAP_WIDTH - 10) * CONFIG.TILE_SIZE;
            let ly = Phaser.Math.Between(5, CONFIG.MAP_HEIGHT - 10) * CONFIG.TILE_SIZE;

            // Simple Water check (if needed, skipping for now as map is mostly grass)

            // Random Type
            const types: LootType[] = ['ammo_9mm', 'ammo_762', 'medkit', 'weapon_glock', 'weapon_ak47', 'weapon_shotgun'];
            const type = Phaser.Math.RND.pick(types);

            const item = new Loot(scene, lx, ly, type, type.includes('ammo') ? 30 : 1);
            lootGroup.add(item);
        }

        // Set World Bounds
        scene.physics.world.setBounds(0, 0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE);

        return { waterColliders, buildings, roofs, roofZones, lootGroup };
    }
}
