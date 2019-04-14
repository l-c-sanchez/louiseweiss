import { DialogOptions } from "./utils/DialogBox";

export class Config {
	public static Phaser = {
		type: Phaser.AUTO,
		parent: 'phaser-app',
		title: 'Louise Weiss',
		width: 360,
		height: 640,
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH
		},
		physics: {
			default: "arcade",
			arcade:{
				gravity: { y:0 },
				debug: false
			}
		},
		scene: [],
		pixelArt: true,
		// backgroundColor: '0xFFFFFF',
		backgroundColor: '0x020050',
		banner: true,
		url: 'http://95.85.42.242/louiseweiss/',
		version: '1.0.0',
	};

	public static Game = {
		debugMode: true,
		width: Config.Phaser.width,
		height: Config.Phaser.height,
		centerX: Math.round(0.5 * Config.Phaser.width),
		centerY: Math.round(0.5 * Config.Phaser.height),
		tile: 32,
		fps: 60,
		fontName: 'unscii'
	};

	public static GameText = {
		defaultStyle: {
			fontFamily: Config.Game.fontName,
			fontSize: 20,
			color: '#FFFFFF',
			align: 'center',
			wordWrap: { width: Config.Game.width, useAdvancedWrap: false }
		}
	};

	public static Hud = {
		height: 40
	};

	public static DialogBox = {
		defaultOptions: {
			fitContent: false,
			offsetX: 0,
			offsetY: 0,
			cropRight: 0,
			cropLeft: 0,
			textColor: '#ffffff',
			borderThickness: 3,
			borderColor: 0xfeb809,
			borderAlpha: 1,
			windowAlpha: 1,
			windowColor: 0x303030,
			windowHeight: 150,
			padding: 10,
			dialogSpeed: 3.5,
			arrowPadding: 20,
			arrowScale: 1,
			fontSize: Config.GameText.defaultStyle.fontSize,
			innerPadding: 10,
			top: Config.Hud.height
		},
		defaultButtonOptions: {
			borderThickness: 2,
			borderColor: 0xfeb809,
			borderAlpha: 0.8,
			fontSize: Config.GameText.defaultStyle.fontSize,
		},
		arrow : {
			offset: 2,
			speed: 5
		}
	};

	public static CharacterSheet = {
		defaultOptions: {
			borderThickness: 3,
			borderColor: 0xfeb809,
			borderAlpha: 1,
			windowAlpha: 1,
			windowColor: 0x303030,
			windowHeight: 50,
			padding: 10,
			dialogSpeed: 3,
			arrowPadding: 20,
			arrowScale: 1,
			fontSize: Config.GameText.defaultStyle.fontSize,
			innerPadding: 10
		},
		imageSize: 96
	};

	public static CharacterChoice = {
		padding: 20
	};

	public static CarGame = {
		rows: 20,
		columns: 12,
		starProbability: 0.05,
		rockProbability: 0.4,
		corridorSize: 64,
		tileSize: 32,
		time_Valentin: 30, // in seconds
		time_Lucie: 20,
		playerSpeed: 200,
		camSpeed: -150,
		obstacles: {
			valentin: ['Cow'], //, 'EnemyCar1', 'EnemyCar2', 'EnemyCar3'],
			lucie: ['burger', 'beer']
		}
	};

	public static Facebook = {
		time: 45, // in seconds
		padding: 10,
		topPadding: 20,
		// We put 2.5 news per page. That way, the user will see that he needs to scroll
		postPerPage: 2.2
	};

	public static QuizzClara = {
		time: 170, // in seconds
	};

	public static FacebookSheet = {
		defaultOptions: {
			borderThickness: 1,
			borderColor: 0xb1b1b1,
			borderAlpha: 1,
			windowAlpha: 1,
			windowColor: 0xf7f7f7,
			windowHeight: 50,
			padding: 10,
			dialogSpeed: 3,
			arrowPadding: 20,
			arrowScale: 1,
			fontSize: Config.GameText.defaultStyle.fontSize,
			innerPadding: 10,
		},
		backgroundColor: '0xd4d4d4',
		imageSize: 96
	};

	public static Pacman = {
		time: 30
	};

	public static Breakout = {
		ballSize: 16,
		paddle: {
			width: 70,
			height: 16
		},
		brick: {
			width: 32,
			height: 16
		},
		layout: {
			rows: 7,
			cols: 7,
			top: 150 // Distance to top in px
		},
		text: "A beautiful and interesting text hidden behind the bricks ...."
	};
}
