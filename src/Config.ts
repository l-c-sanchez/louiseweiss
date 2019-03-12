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

	public static DialogBox = {
		defaultOptions: {
			borderThickness: 3,
			borderColor: 0xfeb809,
			borderAlpha: 1,
			windowAlpha: 1,
			windowColor: 0x303030,
			windowHeight: 150,
			padding: 32,
			dialogSpeed: 3,
			arrowPadding: 20,
			arrowScale: 1,
			fontSize: Config.GameText.defaultStyle.fontSize,
			innerPadding: 10
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
		padding: 10
	}

	public static CarGame = {
		rows: 20,
		columns: 12,
		starProbability: 0.2,
		rockProbability: 0.1,
		corridorSize: 64,
		tileSize: 32,
		time: 25, // in seconds
		playerSpeed: 200,
		camSpeed: -120
	}

	public static Facebook = {
		rows: 20,
		columns: 12,
		starProbability: 0.2,
		rockProbability: 0.1,
		corridorSize: 64,
		tileSize: 32,
		time: 25, // in seconds
		playerSpeed: 200,
		camSpeed: -120,
		padding: 10
	}

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
	}
}
