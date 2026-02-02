import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private speed = 200;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd: any;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics setup
        this.setCollideWorldBounds(true);
        this.setCircle(16); // radius 16 for 32x32 sprite

        // Input setup
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.wasd = scene.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    update() {
        this.handleMovement();
        this.handleRotation();
    }

    private handleMovement() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);

        // Check WASD or Arrow Keys
        const up = this.wasd.up.isDown || this.cursors.up.isDown;
        const down = this.wasd.down.isDown || this.cursors.down.isDown;
        const left = this.wasd.left.isDown || this.cursors.left.isDown;
        const right = this.wasd.right.isDown || this.cursors.right.isDown;

        if (left) body.setVelocityX(-this.speed);
        else if (right) body.setVelocityX(this.speed);

        if (up) body.setVelocityY(-this.speed);
        else if (down) body.setVelocityY(this.speed);

        // Normalize diagonal speed
        if (body.velocity.x !== 0 && body.velocity.y !== 0) {
            body.velocity.normalize().scale(this.speed);
        }
    }

    private handleRotation() {
        // Rotate player towards mouse
        const pointer = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        this.setRotation(angle);
    }
}
