import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { CharacterSheet } from "../utils/CharacterSheet";

export class CharacterChoice extends Phaser.Scene {
	TextData	: any;
	Title		: GameText;

	constructor() {
        super({ key: 'CharacterChoice', active: false });
	}

	init() {

	}

	preload() {

	}

	create() {

		this.TextData = this.cache.json.get('CharacterSheets');
		this.Title = new GameText(this, Config.Game.centerX, 10, this.TextData.title);
		this.Title.setOrigin(0.5, 0);
		this.Title.setSize(30);

		this.createSheets();

		// this.input.on('pointerup', this.startGame, this);
		// this.input.keyboard.on('keyup', this.onKeyReleased, this);
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
		// this.scene.start('Facebook');  // fb
	}

	private createSheets() {
		let y = this.Title.PhaserText.displayHeight + Config.CharacterChoice.padding;
		let x = 0;
		let offset = y + Config.CharacterChoice.padding * (this.TextData.characters.length + 1);
		let height = (Config.Game.height - offset) / this.TextData.characters.length;

		for (let i = 0; i < this.TextData.characters.length; ++i) {
			let sheet = new CharacterSheet(this, x, y, this.TextData.characters[i], { windowHeight: height, fontSize: 22 });
			this.add.existing(sheet);

			let sceneToLaunch = this.TextData.characters[i].sceneToLaunch;
			sheet.addButton(() => {
				this.scene.start('HudScene');
				this.scene.start(sceneToLaunch);
			});

			y += height + Config.CharacterChoice.padding;
		}
	}

	public onButtonPressed(hitArea: any, x: number, y: number, gameObject: Phaser.GameObjects.GameObject) {
		console.log(gameObject);
		let pointer = this.input.activePointer;
		if (pointer.justUp) {
			console.log(gameObject);
		// 	this.scene.start('HudScene');
		// 	this.scene.start(this.TextData.characters[i].sceneToLaunch);	
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
