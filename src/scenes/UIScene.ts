import Phaser from 'phaser';
import { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
    private healthText!: Phaser.GameObjects.Text;
    private ammoText!: Phaser.GameObjects.Text;
    private weaponText!: Phaser.GameObjects.Text;
    private zoneText!: Phaser.GameObjects.Text;
    private backpackText!: Phaser.GameObjects.Text;
    private mainScene!: GameScene;

    constructor() {
        super('UIScene');
    }

    create() {
        this.mainScene = this.scene.get('GameScene') as GameScene;

        // Background for HUD
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(10, 10, 200, 100);

        // Health
        this.healthText = this.add.text(20, 20, 'Health: 100', { fontSize: '18px', color: '#ffffff' });

        // Weapon Info
        this.weaponText = this.add.text(20, 50, 'Weapon: Knife', { fontSize: '18px', color: '#ffffff' });

        // Ammo
        this.ammoText = this.add.text(20, 80, 'Ammo: -/-', { fontSize: '18px', color: '#ffffff' });

        // Zone Status
        this.zoneText = this.add.text(window.innerWidth / 2, 50, 'Zone Waiting', {
            fontSize: '24px',
            color: '#ff0000',
            align: 'center'
        });
        this.zoneText.setOrigin(0.5);
    }

    update() {
        if (!this.mainScene || !this.mainScene.player) return;

        const player = this.mainScene.player;
        const weapon = player.inventory.getActiveWeapon();

        // Update Health
        this.healthText.setText(`Health: ${Math.ceil(player.health)}`);

        if (weapon) {
            this.weaponText.setText(`Weapon: ${weapon.stats.name}`);

            if (weapon.stats.ammoType === 'none') {
                this.ammoText.setText('Ammo: ∞');
            } else {
                this.ammoText.setText(`Ammo: ${weapon.currentAmmo} / ${weapon.totalAmmo}`);
            }
        } else {
            this.weaponText.setText('Weapon: None');
            this.ammoText.setText('');
        }

        // Zone Info
        const zoneSystem = this.mainScene.zoneSystem;
        if (zoneSystem) {
            const timeLeft = Math.ceil(zoneSystem.getPhaseTimeLeft() / 1000);
            this.zoneText.setText(`Zone: ${timeLeft}s`);
        }

        // Inventory Slots (Simple Text for now)
        let slotText = "Backpack: ";
        if (player.inventory.backpack) {
            player.inventory.backpack.forEach((item: any) => {
                slotText += `[${item.type} x${item.amount}] `;
            });
        }

        // We need a text object for this.
        if (!this.backpackText) {
            this.backpackText = this.add.text(window.innerWidth / 2, window.innerHeight - 40, '', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
        }
        this.backpackText.setText(slotText);
    }
}
