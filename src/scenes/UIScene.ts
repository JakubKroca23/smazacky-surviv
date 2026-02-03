import Phaser from 'phaser';
import { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
    private healthText!: Phaser.GameObjects.Text;
    private ammoText!: Phaser.GameObjects.Text;
    private weaponText!: Phaser.GameObjects.Text;
    private zoneText!: Phaser.GameObjects.Text;

    private mainScene!: GameScene;

    constructor() {
        super('UIScene');
    }

    private backpackContainer!: Phaser.GameObjects.Container;
    private slots: { bg: Phaser.GameObjects.Rectangle, icon: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text }[] = [];

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

        // Initializing Backpack Slots
        this.createInventorySlots();
    }

    private createInventorySlots() {
        this.backpackContainer = this.add.container(window.innerWidth / 2, window.innerHeight - 50);
        const slotSize = 50;
        const padding = 10;
        const totalWidth = (slotSize * 5) + (padding * 4);
        const startX = -(totalWidth / 2) + (slotSize / 2);

        for (let i = 0; i < 5; i++) {
            const x = startX + i * (slotSize + padding);

            // Slot Background
            const bg = this.add.rectangle(x, 0, slotSize, slotSize, 0x000000, 0.5);
            bg.setStrokeStyle(2, 0x555555);

            // Icon (Placeholder empty)
            const icon = this.add.image(x, 0, 'loot-medkit').setVisible(false).setDisplaySize(32, 32);

            // Amount Text
            const text = this.add.text(x + 15, 15, '', { fontSize: '12px', color: '#fff' }).setOrigin(1, 1);

            this.backpackContainer.add([bg, icon, text]);
            this.slots.push({ bg, icon, text });
        }
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

        // Update Inventory Slots
        const backpack = player.inventory.backpack;
        for (let i = 0; i < 5; i++) {
            const slot = this.slots[i];

            if (i < backpack.length) {
                const item = backpack[i];
                slot.icon.setVisible(true);
                // Ensure texture exists or fallback?
                // we stored 'loot-medkit' etc. in item.icon
                slot.icon.setTexture(item.icon);
                slot.text.setText(item.amount > 1 ? item.amount.toString() : '');
                slot.bg.setStrokeStyle(2, 0xffff00); // Highlight filled
            } else {
                slot.icon.setVisible(false);
                slot.text.setText('');
                slot.bg.setStrokeStyle(2, 0x555555); // Empty
            }
        }
    }
}
