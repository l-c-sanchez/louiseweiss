import { Config } from "../Config";
import { GameText } from "../utils/GameText";
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
	}

	update() {

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
			let nameCharacter: string = this.TextData.characters[i].name;
			sheet.addButton(() => {
				this.scene.launch('HudScene');
				this.scene.start(sceneToLaunch);
				this.registry.set('character', nameCharacter.toLowerCase());
				// this.game.sound.destroy();
				console.log(this);
			});

			y += height + Config.CharacterChoice.padding;
		}
	}

	// public onButtonPressed(hitArea: any, x: number, y: number, gameObject: Phaser.GameObjects.GameObject) {
	// 	console.log(gameObject);
	// 	let pointer = this.input.activePointer;
	// 	if (pointer.justUp) {
	// 		console.log(gameObject);
	// 		// this.scene.start('HudScene');
	// 	// 	this.scene.start(this.TextData.characters[i].sceneToLaunch);	
	// 	}
	// }

	// onKeyReleased(key: KeyboardEvent) {	}
}
