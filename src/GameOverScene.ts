import { Config } from "./Config";
import { GameText } from "./GameText";

export class GameOverScene extends Phaser.Scene {

	constructor() {
        super({ key: 'GameOverScene', active:false });
	}

	init() {}

	preload() {}

	create() {
		if (Config.Game.debugMode) {
			console.log(this);
		}

		let title = new GameText(this, Config.Game.centerX, Config.Game.centerY * 0.30, "Élections Européennes");
		title.setOrigin(0.5, 0.5);
        title.setSize(40);
        
		this.input.on('pointerup', this.startGame, this);
		this.input.keyboard.on('keyup', this.onKeyReleased, this);
	}

	update() {}

	startGame() {
        this.scene.start('Menu');  // Pacman CarGame
	}

	onKeyReleased(key: KeyboardEvent) {
		console.log(key);
		switch (key.code) {
			case 'Enter':
			case 'Space':
				this.startGame();
				break;
			default:
				break;
		}
	}
}
