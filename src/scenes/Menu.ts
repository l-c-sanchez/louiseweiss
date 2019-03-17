import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor, Orientation } from "../utils/DialogBox";
import { Scene } from "phaser";
import { DialogTree } from "../utils/DialogTree";

export class Menu extends Phaser.Scene {
	StartText	: GameText;
	StartDialog	: DialogBox = null;
	public Music		: Phaser.Sound.BaseSound;

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

		this.Music = this.sound.add('OdeToJoy', {
			mute: false,
			volume: 1,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: true,
			delay: 0
		});
		this.Music.play();

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
		if (!this.sys.game.device.os.desktop && !this.scale.isFullscreen) {
			// this.scale.toggleFullscreen();
		}
		if (this.StartDialog === null) {
			// let text = this.cache.json.get('StartText');
			let text = this.cache.json.get('DialogExample');
			let tree = new DialogTree(this, text, false, Anchor.Down, { windowHeight: 300 });
			tree.on
			this.add.existing(tree);
			tree.on('destroy', () => {
				this.scene.start('CharacterChoice');
			});
			
			this.StartDialog = tree.Box;
			// this.StartDialog = new DialogBox(this, text, false, Anchor.Center, { windowHeight: 500, fontSize: 22 });
			// let button = this.StartDialog.addArrowButton();

			// button.on('pointerup', () => {
			// 	if (this.StartDialog.isAnimationEnded()) {
			// 		this.scene.start('CharacterChoice');
			// 	}
			// });
			// this.add.existing(this.StartDialog);
		}
	}

	onKeyReleased(key: KeyboardEvent) {
		// console.log(key);
		switch (key.code) {
			case 'Enter':
			case 'Space':
				this.startGame();
				break;
			case 'KeyM':
				this.Music.isPaused ? this.Music.resume() : this.Music.pause();
				break;
			default:
				break;
		}
	}

}
