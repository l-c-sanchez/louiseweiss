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
		padding: 10
	}

	public static CarGame = {
		clara: {
			instruction: "évitez tous les trucs divertissants qui pourraient vous dévier du vote (à changer)",
			sprite_char: "lucie",
		},
		valentin: {
			instruction: "Vous prenez votre voiture pour rendre visite à l’une de vos patientes dans un petit village rural. La route est difficile: Evitez les vaches et collectez le plus d’étoiles européennes.\n\nBonus : Ecoutez avec attention la radio, une question vous sera posée à l’issue du jeu",
			sprite_char: "valentin",
		},
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
		time: 10, // in seconds
		padding: 10,
		topPadding: 20,
		// We put 2.5 news per page. That way, the user will see that he needs to scroll
		postPerPage: 2.5,
		lucie: {
			instruction:  "Dans les transports pour aller au boulot, Lucie consulte son fil d’actualité Facebook. Elle a cependant du mal à trouver des informations sur les élections européennes.\n\nAide-la à mieux repérer les informations. Sur chacune des pages, sélectionner les publications concernant le scrutin."
		},
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
		time: 30,
		clara: {
			instruction:  "Vous souhaitez aller voter pour les élections européennes. Mais votre patron souhaite que vous vous déplaciez à l’étranger dans le cadre d’une réunion professionnelle.\n\nEt récoltez le plus d’étoiles possibles",
			sprite_char: "clara",
			sprite_follower: "boss"
		},
		valentin: {
			instruction: "Evitez les gilets jaunes (à changer)",
			sprite_char: "clara",
			sprite_follower: "boss"
		}
	}
}
