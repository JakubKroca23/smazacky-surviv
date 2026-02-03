import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { LobbyScene } from './scenes/LobbyScene';

const gameConfig: Phaser.Types.Core.GameConfig | any = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    parent: 'app',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    lights: {
        enable: true,
        ambientColor: 0x101010 // Very dark ambient light
    },
    dom: {
        createContainer: true
    },
    scene: [BootScene, LobbyScene, GameScene, UIScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(gameConfig);
