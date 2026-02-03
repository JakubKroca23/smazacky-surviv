import Phaser from 'phaser';

export type LootType = 'ammo_9mm' | 'ammo_762' | 'ammo_shell' | 'medkit' | 'weapon_glock' | 'weapon_ak47' | 'weapon_shotgun';

export class Loot extends Phaser.Physics.Arcade.Sprite {
    public lootType: LootType;
    public amount: number; // Ammo count or Weapon ammo

    constructor(scene: Phaser.Scene, x: number, y: number, type: LootType, amount: number = 1) {
        // Map type to texture key
        let texture = '';
        switch (type) {
            case 'ammo_9mm': texture = 'loot-ammo-9mm'; break;
            case 'ammo_762': texture = 'loot-ammo-762'; break;
            case 'ammo_shell': texture = 'loot-ammo-shell'; break;
            case 'medkit': texture = 'loot-medkit'; break;
            case 'weapon_glock': texture = 'weapon-glock'; break;
            case 'weapon_ak47': texture = 'weapon-ak47'; break;
            case 'weapon_shotgun': texture = 'weapon-shotgun'; break;
        }

        super(scene, x, y, texture);
        this.lootType = type;
        this.amount = amount;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setPipeline('Light2D');

        this.setDepth(5); // Below player
        this.setScale(0.8);

        // Hover animation
        scene.tweens.add({
            targets: this,
            y: y - 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
