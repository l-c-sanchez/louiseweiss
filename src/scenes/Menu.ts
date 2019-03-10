import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";

export class Menu extends Phaser.Scene {
	startText	: GameText;
	startDialog	: DialogBox = null;
	music		: Phaser.Sound.BaseSound;

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

		this.startText = new GameText(this, Config.Game.centerX, Config.Game.centerY, "START");
		this.startText.setSize(40);
		this.startText.setOrigin(0.5, 0);

		this.music = this.sound.add('OdeToJoy', {
			mute: false,
			volume: 1,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: true,
			delay: 0
		});
		this.music.play();

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
		if (this.startText.getAlpha() == 1.0) {
			this.startText.setAlpha(0);
		} else {
			this.startText.setAlpha(1);
		}
	}

	startGame() {
		if (this.startDialog === null) {
			let text = this.cache.json.get('StartText');
			this.startDialog = new DialogBox(this, text, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
			this.add.existing(this.startDialog);
		} else if (this.startDialog.isAnimationEnded()) {
			this.scene.start('CharacterChoice');
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
				this.music.isPaused ? this.music.resume() : this.music.pause();
				break;
			default:
				break;
		}
	}

}
