import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";

export class CharacterChoice extends Phaser.Scene {

	constructor() {
        super({ key: 'CharacterChoice', active: false });
	}

	init() {

	}

	preload() {

	}

	create() {

		let title = new GameText(this, Config.Game.centerX, Config.Game.centerY * 0.30, "Élections Européennes");
		title.setOrigin(0.5, 0.5);
		title.setSize(40);

		this.input.on('pointerup', this.startGame, this);
		this.input.keyboard.on('keyup', this.onKeyReleased, this);
	}

	update() {

	}

	startGame() {
		// if (this.StartDialog === null) {
		// 	let text = this.cache.json.get('StartText');
		// 	this.StartDialog = new DialogBox(this, text, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
		// 	this.add.existing(this.StartDialog);
		this.scene.start('HudScene');
		this.scene.start('CarGame');  // CarGame Pacman
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
