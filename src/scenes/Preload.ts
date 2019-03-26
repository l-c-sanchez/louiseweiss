import { Config } from "../Config";
import { GameText } from "../utils/GameText";

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

		this.load.setPath(/*Config.Phaser.url + */'assets/');

		//General
		// this.load.image('Transparent', 'sprites/ButtonDebug.png');
		this.load.image('Transparent', 'sprites/transparent.png');

		//Dialogs
		this.load.image('Arrow', 'sprites/Arrow.png');
		this.load.json('ClaraConv', 'texts/ClaraConv.json');

		// Main Menu
		this.load.image('EuropeanFlag', 'sprites/EuropeanFlag.png');
		this.load.json('StartText', 'texts/StartText.json');
		this.load.audio('OdeToJoy', 'sounds/ode-to-joy.mp3');

		// Character Selection
		this.load.json('CharacterSheets', 'texts/CharacterSheets.json');
		this.load.image('ClaraPortrait', 'sprites/clara_portrait.png');
		this.load.image('ValentinPortrait', 'sprites/valentin_portrait.png');
		this.load.image('LuciePortrait', 'sprites/lucie_portrait.png');

		// Pacman
		this.load.image('OfficeTileset', 'tilesets/OfficeTileset.png');
		this.load.tilemapTiledJSON('ClaraPacmanMap', 'tilesets/ClaraPacman.json');
		this.load.image('mapTiles', 'tilesets/PacmanMap.png');
		this.load.spritesheet('boss', 'sprites/Boss32.png', { frameWidth:32, frameHeight:32});
		this.load.spritesheet('clara', 'sprites/Clara32.png', { frameWidth:32, frameHeight:32});
		this.load.image('star', 'sprites/star.png');
		this.load.json('ClaraBoss', 'texts/ClaraBoss.json');

		// Car game
		this.load.image('voiture', 'sprites/voiture.png');
		this.load.image('road', 'sprites/road.png');
		this.load.image('road_line', 'sprites/road_line.png');
		this.load.image('burger', 'sprites/burger.png');
		this.load.image('rock', 'sprites/cow.png');
		this.load.audio('ValentinFlash', 'sounds/ValentinFlash.wav');

		// Valentin Conv
		this.load.json('ValentinQuizz', 'texts/ValentinQuizz.json');
		this.load.json('ValentinConv', 'texts/ValentinConv.json');
		this.load.json('ValentinEndConvSuccess', 'texts/ValentinEndConvSuccess.json');
		this.load.json('ValentinEndConvFailure', 'texts/ValentinEndConvFailure.json');

		// Lucie Conv
		this.load.json('LucieConv', 'texts/LucieConv.json');

		// Facebook
		this.load.json('FacebookText', 'texts/FacebookText.json');
		this.load.image('heart', 'sprites/heart.png');
		this.load.image('heart_empty', 'sprites/heart_empty.png');
		this.load.image('fb_reactions', 'sprites/fb_reactions.png');

		// Breakout
		this.load.image('ball', 'sprites/ball.png');
		this.load.image('paddle', 'sprites/paddle.png');
		this.load.image('brick', 'sprites/brick.png');

		// Autres
	
		this.load.on('progress', this.onProgress, this);
		this.load.on('complete', this.onComplete, this);

		this.load.json('ResultText', 'texts/ResultText.json');
		this.load.json('Games', 'texts/Games.json');

		// QuizzClara
		this.load.json('QuizzClara', 'texts/QuizzClara.json');
		this.load.audio('ClaraFlash', 'sounds/ClaraFlash.mp3');
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
			delay: 1000,
			callback: () => { this.scene.start('Menu') },
			callbackScope: this
		});
	}
}
