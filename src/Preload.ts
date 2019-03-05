import { Config } from "./Config";
import { GameText } from "./GameText";

export class Preload extends Phaser.Scene {
	ProgressText	: GameText;
	ProgressBar		: Phaser.GameObjects.Graphics;
	BarWidth		: number;
	BarHeight		: number;

	constructor() {
        super({ key: 'Preload', active: false });
	}

	init() {
		
	}

	preload() {
		let title = new GameText(this, Config.Game.centerX, Config.Game.centerY * 0.30, "Élections Européennes");
		title.setOrigin(0.5, 0.5);
		title.setSize(40);

		this.createLoadingBar();

		// this.load.setPath(Config.Phaser.url + 'assets/');
		this.load.setPath('assets/');

		// Main Menu
		this.load.image('EuropeanFlag', 'sprites/EuropeanFlag.png');

		// Pacman
		this.load.image('mapTiles', 'tilesets/PacmanMap.png');
		this.load.spritesheet('boss', 'sprites/Boss32.png', { frameWidth:32, frameHeight:32});
		this.load.spritesheet('clara', 'sprites/Clara32.png', { frameWidth:32, frameHeight:32});
        this.load.image('star', 'sprites/star.png');
		
		this.load.on('progress', this.onProgress, this);
		this.load.on('complete', this.onComplete, this);
	}

	create() {

	}

	update() {
		
	}

	createLoadingBar() {
		let x = 30;
		let y = Config.Game.centerY;
		this.BarWidth = 360.0 - 2.0 * x;
		this.BarHeight = 30;
		this.ProgressBar = this.add.graphics({ x: x, y: y });

		this.ProgressText = new GameText(this, Config.Game.centerX, Config.Game.centerY, "0%");
		this.ProgressText.setOrigin(0.5, 0);
		this.ProgressText.setSize(30);
		this.ProgressText.setColor('#000000');

	}

	onProgress(progress: number) {
		this.ProgressBar.clear();
		this.ProgressBar.fillStyle(0xFFFFFF, 1);
		this.ProgressBar.fillRect(0, 0, this.BarWidth * progress, this.BarHeight);

		this.ProgressText.setText(Math.round(progress * 100) + '%');
	}

	onComplete() {
		this.time.addEvent({
			delay: 500,
			callback: () => { this.scene.start('Menu') },
			callbackScope: this
		});
	}
}
