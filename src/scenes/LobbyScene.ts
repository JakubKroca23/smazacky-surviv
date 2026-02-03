import Phaser from 'phaser';

export class LobbyScene extends Phaser.Scene {
    private nameInput!: HTMLInputElement;

    constructor() {
        super({ key: 'LobbyScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background (Dark overlay)
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e).setOrigin(0.5);

        // Title
        this.add.text(width / 2, height / 3, 'SURVIV.IO CLONE', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // HTML Input Form manually created
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '10px';
        div.style.alignItems = 'center';
        div.innerHTML = `
            <input type="text" id="nickname" placeholder="Enter Nickname" style="padding: 10px; font-size: 20px; border-radius: 5px; border: none; text-align: center; width: 250px;">
            <button id="playBtn" style="padding: 10px 20px; font-size: 24px; cursor: pointer; background-color: #2ecc71; color: white; border: none; border-radius: 5px; width: 200px;">PLAY</button>
        `;

        const element = this.add.dom(width / 2, height / 2, div);

        // Event Listener for Button
        const playBtn = element.getChildByID('playBtn');
        const nameInput = element.getChildByID('nickname') as HTMLInputElement;

        // Auto-focus input
        if (nameInput) {
            this.nameInput = nameInput;
            // Generate random name
            nameInput.value = 'Survivor_' + Phaser.Math.Between(100, 999);
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Enter key support
        this.input.keyboard!.on('keydown-ENTER', () => {
            this.startGame();
        });
    }

    private startGame() {
        const nickname = this.nameInput?.value || 'Unknown';
        if (nickname.trim().length > 0) {
            this.scene.start('GameScene', { nickname: nickname });
        }
    }
}
