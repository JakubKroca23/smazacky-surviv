import Phaser from 'phaser';
import { MainScene } from './MainScene';

export class UIScene extends Phaser.Scene {
    private healthText!: Phaser.GameObjects.Text;
    private ammoText!: Phaser.GameObjects.Text;
    private weaponText!: Phaser.GameObjects.Text;
    private zoneText!: Phaser.GameObjects.Text;
    private mainScene!: MainScene;

    constructor() {
        super('UIScene');
    }

    create() {
        this.mainScene = this.scene.get('MainScene') as MainScene;

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
        const zone = this.mainScene.zoneSystem;
        if (zone) {
            const timeLeft = Math.ceil(zone.getPhaseTimeLeft() / 1000);
            this.zoneText.setText(`Zone: ${timeLeft}s`);
        }
    }
}
