import Phaser from 'phaser';

export class Car extends Phaser.Physics.Arcade.Sprite {
    // private speed: number = 0;
    private maxSpeed: number = 800;
    private accelerationRate: number = 400;
    // private brakingRate: number = 400; // Drifting/slowing down
    // private turnSpeed: number = 3; // Radians per second approx? No, rotation speed.
    // private friction: number = 0.98; // Air resistance / Rolling resistance

    // Controls
    private keys: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        interact: Phaser.Input.Keyboard.Key;
    };

    // State
    public driver: Phaser.GameObjects.GameObject | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'vehicle-sedan') {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDepth(15); // Above ground, below trees? Trees top is 20, Player is 10. Car should be 15? 
        // Actually player should be ABOVE car roof if not in it, or hidden if inside.
        // For now, Car 15.

        // Physics Body
        // Adjust for vertical car sprite
        this.setBodySize(60, 120);
        this.setOffset(34, 68); // Center the body? Need to check visual center.

        // Initialize Input
        this.keys = scene.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            interact: Phaser.Input.Keyboard.KeyCodes.F
        }) as any;
    }

    update(_time: number, _delta: number) {
        if (this.driver) {
            this.handleDriving();
        } else {
            // Apply friction when no driver
            // Arcade physics drag handles this if we set it
        }
    }

    private handleDriving() {
        // Simple Physics-like Car Movement
        // Rotation
        if (this.keys.left.isDown) {
            // Only turn if moving (simple mechanic) or turn slower
            if (this.body!.velocity.length() > 10) {
                this.setAngularVelocity(-150);
            }
        } else if (this.keys.right.isDown) {
            if (this.body!.velocity.length() > 10) {
                this.setAngularVelocity(150);
            }
        } else {
            this.setAngularVelocity(0);
        }

        // Acceleration
        // We use physics velocityFromRotation to move forward in the direction of angle

        // Note: Phaser sprite 0 degrees is usually RIGHT. Car sprite is likely UP or DOWN.
        // My SVG 'vehicle-sedan' is vertical (height > width).
        // So 0 Rotation = Pointing RIGHT? 
        // Need to check sprite orientation. Usually need to rotate sprite -90 deg to align with Phaser 0 (Right).
        // Or just adjust logic. 
        // Let's assume Sprite UP = -90 degrees in Phaser.

        // Let's just use physics acceleration

        if (this.keys.up.isDown) {
            this.scene.physics.velocityFromRotation(this.rotation - Math.PI / 2, this.maxSpeed, this.body!.velocity);
            // Wait, this sets velocity instantly to maxSpeed. 
            // We want acceleration.

            // Vector math
            const vec = new Phaser.Math.Vector2();
            vec.setToPolar(this.rotation - Math.PI / 2, this.accelerationRate);
            this.setAcceleration(vec.x, vec.y);

        } else if (this.keys.down.isDown) {
            // Reverse / Brake
            const vec = new Phaser.Math.Vector2();
            vec.setToPolar(this.rotation - Math.PI / 2, -this.accelerationRate / 2);
            this.setAcceleration(vec.x, vec.y);
        } else {
            this.setAcceleration(0, 0);
            // Apply drag/friction manually or via setDrag
            this.setDrag(400); // High drag to stop when no gas
        }

        // Max Speed limit
        this.setMaxVelocity(this.maxSpeed);

        // Exit Car Check (Interact Key usually 'F')
        // We need a cooldown or check trigger to avoid instant re-entry
        if (this.scene.input.keyboard!.checkDown(this.keys.interact, 1000)) {
            this.exitCar();
        }
    }

    public enterCar(player: Phaser.GameObjects.GameObject) {
        if (this.driver) return; // Already occupied
        this.driver = player;

        // Visuals
        const p = player as any; // Cast to access common props
        p.setVisible(false);
        p.body.enable = false; // Disable player physics to avoid duplicate collisions

        // Camera follow this car
        this.scene.cameras.main.startFollow(this, true, 0.1, 0.1);

        // Optional: Zoom out slightly for driving
        this.scene.cameras.main.setZoom(1.5); // Example zoom out (default 2.5?)
    }

    public exitCar() {
        if (!this.driver) return;

        const p = this.driver as any;
        this.driver = null;

        // restore player
        p.setVisible(true);
        p.body.enable = true;
        p.setPosition(this.x + 50, this.y); // Exit slightly to the right

        // Camera follow player
        this.scene.cameras.main.startFollow(p, true, 0.1, 0.1);
        this.scene.cameras.main.setZoom(2.5); // Restore zoom (assuming 2.5 is default)

        return p;
    }
}
