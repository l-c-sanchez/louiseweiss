import { Config } from "./Config";
import { CarGame } from "./CarScene";
import { GameText } from "./GameText";
import { Dialog, Anchor } from "./Dialog";

export class Menu extends Phaser.Scene {
	StartText	: GameText;
	StartDialog	: Dialog = null;

	constructor() {
        super({ key: 'Menu', active: false });
	}

	init() {

	}

	preload() {

	}

	create() {
		if (Config.Game.debugMode) {
			console.log(this);
		}

		let picture = this.add.image(Config.Game.centerX, Config.Game.centerY * 1.1, "EuropeanFlag");
		picture.setOrigin(0.5, 0.5);

		let title = new GameText(this, Config.Game.centerX, Config.Game.centerY * 0.30, "Élections Européennes");
		title.setOrigin(0.5, 0.5);
		title.setSize(40);

		this.StartText = new GameText(this, Config.Game.centerX, Config.Game.centerY, "START");
		this.StartText.setSize(40);
		this.StartText.setOrigin(0.5, 0);

		this.time.addEvent({
			delay: 1000,
			callback: this.textBlink,
			callbackScope: this,
			loop: true
		});

		this.input.on('pointerup', this.startGame, this);
		this.input.keyboard.on('keyup', this.onKeyReleased, this);
	}

	update() {

	}

	textBlink() {
		if (this.StartText.getAlpha() == 1.0) {
			this.StartText.setAlpha(0);
		} else {
			this.StartText.setAlpha(1);
		}
	}

	startGame() {
		console.log("startGame1");
		if (this.StartDialog === null) {
			let text = this.cache.json.get('StartText');
			this.StartDialog = new Dialog(this, text, false, Anchor.Center, 250);
		} else if (this.StartDialog.Ended) {
			console.log("start pacman");
			this.scene.start('CarGame');
		}
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
