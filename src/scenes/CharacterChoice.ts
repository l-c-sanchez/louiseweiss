import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { CharacterSheet } from "../utils/CharacterSheet";

export class CharacterChoice extends Phaser.Scene {
	textData	: any;
	title		: GameText;

	constructor() {
        super({ key: 'CharacterChoice', active: false });
	}

	init() {

	}

	preload() {

	}

	create() {

		this.textData = this.cache.json.get('CharacterSheets');
		this.title = new GameText(this, Config.Game.centerX, 10, this.textData.title);
		this.title.setOrigin(0.5, 0);
		this.title.setSize(30);

		this.createSheets();

		this.input.on('pointerup', this.startGame, this);
		this.input.keyboard.on('keyup', this.onKeyReleased, this);
	}

	update() {

	}

	private startGame() {
		// if (this.StartDialog === null) {
		// let text = this.cache.json.get('StartText');
		// 	this.StartDialog = new DialogBox(this, text, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
		// 	this.add.existing(this.StartDialog);
		this.scene.start('HudScene');
		this.scene.start('CarGame');  // CarGame Pacman
	}

	private createSheets() {
		let y = this.title.PhaserText.displayHeight + Config.CharacterChoice.padding;
		let x = 0;
		let offset = y + Config.CharacterChoice.padding * (this.textData.characters.length + 1);
		let height = (Config.Game.height - offset) / this.textData.characters.length;

		for (let i = 0; i < this.textData.characters.length; ++i) {
			let sheet = new CharacterSheet(this, x, y, this.textData.characters[i], { windowHeight: height, fontSize: 22 });
			this.add.existing(sheet);
			y += height + Config.CharacterChoice.padding;
		}
	}

	onKeyReleased(key: KeyboardEvent) {
		// console.log(key);
		// switch (key.code) {
		// 	case 'Enter':
		// 	case 'Space':
		// 		this.startGame();
		// 		break;
		// 	default:
		// 		break;
		// }
	}
}
