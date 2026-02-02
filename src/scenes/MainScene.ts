import Phaser from 'phaser';
import { ObjectFactory } from '../objects/ObjectFactory';
import { Player } from '../objects/Player';
import { Toilet } from '../objects/Toilet';
import { TrashCan } from '../objects/TrashCan';

export class MainScene extends Phaser.Scene {
    private objectFactory!: ObjectFactory;
    private mapWidth = 2000;
    private mapHeight = 2000;
    private player!: Player;
    private interactKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Generate simple textures for prototyping
        this.make.graphics({ x: 0, y: 0 });
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // Player texture (Circle)
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('player', 32, 32);
        graphics.clear();

        // Car texture (Blue Rect with highlight)
        graphics.fillStyle(0x0000ff);
        graphics.fillRect(0, 0, 64, 32);
        graphics.fillStyle(0x0000aa);
        graphics.fillRect(4, 4, 56, 24);
        graphics.generateTexture('car', 64, 32);
        graphics.clear();

        // Trash Can (Green Rect)
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 24, 24);
        graphics.generateTexture('trash', 24, 24);
        graphics.clear();

        // Toilet (Brown Rect)
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('toilet', 32, 32);
    }

    create() {
        // World Bounds
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        // Grid (ground)
        this.add.grid(this.mapWidth / 2, this.mapHeight / 2, this.mapWidth, this.mapHeight, 32, 32, 0x000000, 1, 0x222222, 1).setDepth(-100);

        // Factory
        this.objectFactory = new ObjectFactory(this);

        // Create Objects
        const b1 = this.objectFactory.createBuilding(400, 400, 200, 200);
        this.objectFactory.createCar(600, 300);
        this.objectFactory.createTrashCan(300, 300);
        this.objectFactory.createToilet(700, 500);

        // Player
        this.player = new Player(this, this.mapWidth / 2, this.mapHeight / 2);

        // Collisions
        this.physics.add.collider(this.player, this.objectFactory.getBuildingsGroup());
        this.physics.add.collider(this.player, this.objectFactory.getCarsGroup());
        this.physics.add.collider(this.player, this.objectFactory.getTrashCansGroup());
        this.physics.add.collider(this.player, this.objectFactory.getToiletsGroup());

        // Building Roof Interaction
        b1.setupInteraction(this.player);

        // Camera
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Input
        this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update(_time: number, _delta: number) {
        this.player.update();

        // Interaction check
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.handleInteraction();
        }
    }

    private handleInteraction() {
        const interactionRadius = 50;

        // Check Trash Cans
        const trashCans = this.objectFactory.getTrashCansGroup().getChildren() as TrashCan[];
        const nearestTrash = this.findNearest(trashCans, interactionRadius);
        if (nearestTrash) {
            nearestTrash.interact();
            return;
        }

        // Check Toilets
        const toilets = this.objectFactory.getToiletsGroup().getChildren() as Toilet[];
        const nearestToilet = this.findNearest(toilets, interactionRadius);
        if (nearestToilet) {
            nearestToilet.interact(this.player);
            return;
        }
    }

    private findNearest<T extends Phaser.Physics.Arcade.Sprite>(objects: T[], radius: number): T | null {
        let nearest: T | null = null;
        let minDist = radius;

        for (const obj of objects) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = obj;
            }
        }
        return nearest;
    }
}
