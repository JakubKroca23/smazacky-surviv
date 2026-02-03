import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Player } from '../objects/Player';

enum ZoneState {
    WAITING,
    SHRINKING
}

interface Circle {
    x: number;
    y: number;
    radius: number;
}

export class ZoneSystem {
    private scene: Phaser.Scene;
    private zoneGraphics: Phaser.GameObjects.Graphics;
    private nextZoneGraphics: Phaser.GameObjects.Graphics;

    private currentCircle: Circle;
    private targetCircle: Circle;

    private state: ZoneState = ZoneState.WAITING;
    private stateTimer: number = 0;
    private damageTimer: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Initial Zone: Full Map
        const mapSize = Math.max(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT) * CONFIG.TILE_SIZE;
        this.currentCircle = {
            x: (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) / 2,
            y: (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) / 2,
            radius: mapSize // Covers full map initially
        };

        this.targetCircle = { ...this.currentCircle }; // Initially same

        // Graphics Layer (High depth to be over map but under UI)
        this.nextZoneGraphics = this.scene.add.graphics();
        this.nextZoneGraphics.setDepth(99);

        this.zoneGraphics = this.scene.add.graphics();
        this.zoneGraphics.setDepth(100);

        this.startNextPhase();
    }

    update(time: number, delta: number, player: Player) {
        // State Machine
        this.stateTimer -= delta;

        if (this.state === ZoneState.WAITING) {
            if (this.stateTimer <= 0) {
                // Start Shrinking
                this.state = ZoneState.SHRINKING;
                this.stateTimer = CONFIG.ZONE_SHRINK_DURATION;
            }
        } else if (this.state === ZoneState.SHRINKING) {
            // Lerp towards target


            // Linear Interpolation
            this.currentCircle.x = Phaser.Math.Linear(this.currentCircle.x, this.targetCircle.x, 0.05); // Smooth ease
            this.currentCircle.y = Phaser.Math.Linear(this.currentCircle.y, this.targetCircle.y, 0.05);
            this.currentCircle.radius = Phaser.Math.Linear(this.currentCircle.radius, this.targetCircle.radius, 0.05);

            if (this.stateTimer <= 0) {
                // Finished Shrinking
                this.startNextPhase();
            }
        }

        this.drawZone();
        this.checkDamage(time, player);
    }

    private startNextPhase() {
        this.state = ZoneState.WAITING;
        this.stateTimer = CONFIG.ZONE_WAIT_DURATION;

        // Calculate Next Target Circle
        // Must be fully inside current circle
        // New radius e.g. 70% of current
        const nextRadius = this.currentCircle.radius * 0.7;

        // Random point inside current, but ensuring new circle fits in old circle
        // Max offset = currentRadius - nextRadius
        const maxOffset = this.currentCircle.radius - nextRadius;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * maxOffset;

        this.targetCircle = {
            x: this.currentCircle.x + Math.cos(angle) * dist,
            y: this.currentCircle.y + Math.sin(angle) * dist,
            radius: nextRadius
        };

        // Don't shrink below a certain size (e.g. 1 tile)
        if (this.targetCircle.radius < CONFIG.TILE_SIZE) {
            this.targetCircle.radius = 0; // Final showdown point
        }
    }

    private drawZone() {
        this.zoneGraphics.clear();
        this.nextZoneGraphics.clear();

        // Draw Next Safe Zone Indicator (White Ring)
        if (this.state === ZoneState.WAITING) {
            this.nextZoneGraphics.lineStyle(2, CONFIG.COLORS.ZONE_SAFE, 0.5);
            this.nextZoneGraphics.strokeCircle(this.targetCircle.x, this.targetCircle.y, this.targetCircle.radius);
        }

        // Draw Poison Fog (Inverted Mask effect via Geometry)
        // Simplest way: Draw huge green rectangle, subtract circle?
        // Phaser Graphics doesn't support subtraction easily without mask source.
        // Alternative: Draw 4 rectangles around the safe zone? Hard with circle.
        // Option 3: Draw a very thick stroke? yes, thick enough to cover map.

        const mapMaxDim = 10000; // Big enough

        this.zoneGraphics.fillStyle(CONFIG.COLORS.ZONE_DANGER, 0.3);

        // USING MASKING: 
        // We draw full screen poison, and mask out the safe zone.
        // To do this efficiently every frame:

        // Simulating hollow circle with huge line thickness
        this.zoneGraphics.lineStyle(mapMaxDim, CONFIG.COLORS.ZONE_DANGER, 0.3);
        this.zoneGraphics.strokeCircle(this.currentCircle.x, this.currentCircle.y, this.currentCircle.radius + (mapMaxDim / 2));

        // Red border of the fog
        this.zoneGraphics.lineStyle(5, 0xff0000, 0.8);
        this.zoneGraphics.strokeCircle(this.currentCircle.x, this.currentCircle.y, this.currentCircle.radius);
    }

    private checkDamage(time: number, player: Player) {
        if (time > this.damageTimer) {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, this.currentCircle.x, this.currentCircle.y);

            // Check if player is OUTSIDE the radius
            if (dist > this.currentCircle.radius) {
                // Apply Damage
                player.takeDamage(CONFIG.ZONE_DAMAGE_PER_SECOND);
                this.damageTimer = time + 1000; // 1 second interval
            }
        }
    }

    public getPhaseTimeLeft(): number {
        return Math.max(0, this.stateTimer);
    }
}
