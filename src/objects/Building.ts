import Phaser from 'phaser';

export class Building {
    private scene: Phaser.Scene;
    private wall: Phaser.GameObjects.Rectangle;
    private roof: Phaser.GameObjects.Rectangle;
    private width: number;
    private height: number;
    private x: number;
    private y: number;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, group: Phaser.Physics.Arcade.StaticGroup) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Create Wall (Physics body)
        this.wall = scene.add.rectangle(x, y, width, height, 0x555555);
        scene.physics.add.existing(this.wall, true);
        group.add(this.wall);

        // Create Roof (Visual only, on top)
        this.roof = scene.add.rectangle(x, y, width + 4, height + 4, 0x333333); // Slightly larger for eaves
        this.roof.setDepth(100); // Always on top of normal gameplay layer

        // Create Sensor for roof fading
        const zone = scene.add.zone(x, y, width, height);
        scene.physics.add.existing(zone, true); // Static body

        (zone.body as Phaser.Physics.Arcade.StaticBody).debugBodyColor = 0xffff00;

        // Store reference for external logic
        this.scene.physics.add.overlap(zone, (this.scene as any).player, () => {
            this.onEnter();
        }, undefined, this);
    }

    // Bind player to this building for roof fading
    setupInteraction(player: Phaser.GameObjects.GameObject) {
        const zone = this.scene.add.zone(this.x, this.y, this.width, this.height);
        this.scene.physics.add.existing(zone, true);

        this.scene.physics.add.overlap(player, zone, () => {
            this.roof.setAlpha(0.2); // Fade out
        });
    }

    update() {
        this.roof.setAlpha(1);
    }

    onEnter() {
        this.roof.setAlpha(0.2);
    }

    public getDisplay() {
        return this.roof;
    }
}
