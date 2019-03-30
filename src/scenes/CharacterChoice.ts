import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { CharacterSheet } from "../utils/CharacterSheet";
import { DialogBox, Anchor } from "../utils/DialogBox";

export class CharacterChoice extends Phaser.Scene {
	TextData	: any;
	Title		: GameText;
	Music		: Phaser.Sound.BaseSound;

	constructor() {
        super({ key: 'CharacterChoice', active: false });
	}

	init(data: any) {
		this.Music = data.music;
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
			let nameCharacter: string = this.TextData.characters[i].name.toLowerCase();
			sheet.addButton(() => {
				this.registry.set('character', nameCharacter);
				this.showConfirmBox(nameCharacter, sceneToLaunch);
			});

			y += height + Config.CharacterChoice.padding;
		}
	}

	showConfirmBox(characterName: string, sceneToLaunch: string) {
		let config = this.cache.json.get('Games');
		let graphics = this.add.graphics();
		graphics.fillStyle(0x000000, 0.8);
		graphics.fillRect(0, 0, Config.Game.width, Config.Game.height);
		let confirm = new DialogBox(this, config.start[characterName].instruction, true, Anchor.Center, {
			fitContent: true,
			offsetY: 40,
			fontSize: 26
		});
		let button = confirm.addArrowButton();
		button.on('pointerup', () => {
			if (confirm.isAnimationEnded()) {
				this.Music.stop();
				this.scene.launch('HudScene');
				this.scene.start(sceneToLaunch);
			} else {
				confirm.endAnimation();
			}
		});
		this.add.existing(confirm);
	}
}
