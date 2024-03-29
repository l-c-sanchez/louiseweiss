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
		let title = new GameText(this, Config.Game.centerX, Config.Game.centerY * 0.30, "Moi, citoyen européen");
		title.setOrigin(0.5, 0.5);
		title.setSize(40);

		this.createLoadingBar();

		this.load.setPath(/*Config.Phaser.url + */'assets/');

		//General
		this.load.image('Transparent', 'sprites/transparent.png');
		this.load.audio('ringtone', 'sounds/ringtone.mp3')

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
		this.load.json('directions', 'data/directions.json');

		this.load.image('LeftArrow', 'sprites/arrow_left.png');
		this.load.image('RightArrow', 'sprites/arrow_right.png');
		this.load.image('UpArrow', 'sprites/arrow_up.png');
		this.load.image('DownArrow', 'sprites/arrow_down.png');

		// Car game
		this.load.image('voiture', 'sprites/voiture.png');
		this.load.image('EnemyCar1', 'sprites/EnemyCar1.png');
		this.load.image('EnemyCar2', 'sprites/EnemyCar2.png');
		this.load.image('EnemyCar3', 'sprites/EnemyCar3.png');
		this.load.image('road', 'sprites/road.png');
		this.load.image('road_line', 'sprites/road_line.png');
		this.load.image('burger', 'sprites/burger.png');
		this.load.image('beer', 'sprites/beer.png');
		this.load.image('Cow', 'sprites/cow.png');
		this.load.audio('ValentinFlash', 'sounds/ValentinFlash.mp3');


		// Valentin Conv
		this.load.json('ValentinQuizz', 'texts/ValentinQuizz.json');
		this.load.json('ValentinConv', 'texts/ValentinConv.json');
		this.load.json('ValentinEndConvSuccess', 'texts/ValentinEndConvSuccess.json');
		this.load.json('ValentinEndConvFailure', 'texts/ValentinEndConvFailure.json');

		// Lucie Conv
		this.load.json('LucieConv', 'texts/LucieConv.json');
		this.load.tilemapTiledJSON('LivingRoom', 'tilesets/LivingRoom.json');
		this.load.image('BlackTile', 'tilesets/BlackTile.png');
		this.load.image('OfficeTilesetBis', 'tilesets/OfficeTilesetBis.png');
		this.load.spritesheet('lucie', 'sprites/Lucie32.png', { frameWidth:32, frameHeight:32});

		// Lucie Bus
		this.load.tilemapTiledJSON('WaitingBus', 'tilesets/WaitingBus.json');
		this.load.tilemapTiledJSON('LeavingBus', 'tilesets/LucieOut.json');
		this.load.image('RailwayStation', 'tilesets/RailwayStation.png');
		this.load.image('RoadTile', 'tilesets/RoadTile.png');
		this.load.image('Bus', 'sprites/Bus.png');
		this.load.json('LucieBusLeaveConv', 'texts/LucieBusLeaveConv.json');

		// Valentin Car
		this.load.tilemapTiledJSON('CountryRoad', 'tilesets/CountryRoad.json');
		this.load.image('CountryTiles', 'tilesets/CountryTiles.png');
		this.load.image('voiture64', 'sprites/voiture64.png');
		this.load.image('house', 'tilesets/house.png');
		this.load.tilemapTiledJSON('PatientStreet', 'tilesets/PatientStreet.json')
		this.load.tilemapTiledJSON('PatientHouse1', 'tilesets/PatientHouse1.json')
		this.load.tilemapTiledJSON('PatientHouse2', 'tilesets/PatientHouse2.json')
		this.load.tilemapTiledJSON('ValentinHouse', 'tilesets/ValentinHouse.json')
		this.load.image('Interiors', 'tilesets/Interiors.png');
		this.load.image('Mamie', 'sprites/mamie32.png');
		this.load.image('Papi', 'sprites/papi32.png');
		this.load.json('ValentinWhoSaid', 'texts/ValentinWhoSaid.json');
		this.load.json('ValentinWhoSaidFailure', 'texts/ValentinWhoSaidFailure.json');
		this.load.json('ValentinWhoSaidSuccess', 'texts/ValentinWhoSaidSuccess.json');
		this.load.spritesheet('valentin', 'sprites/valentin32.png', { frameWidth:32, frameHeight:32});

		// Facebook
		this.load.json('FacebookText', 'texts/FacebookText.json');
		this.load.image('heart', 'sprites/heart.png');
		this.load.image('heart_empty', 'sprites/heart_empty.png');
		this.load.image('fb_reactions', 'sprites/fb_reactions.png');

		// Breakout
		this.load.image('ball', 'sprites/ball.png');
		this.load.image('paddle', 'sprites/paddle.png');
		this.load.image('brick', 'sprites/brick.png');

		// Clara Town
		this.load.tilemapTiledJSON('claratown', 'tilesets/claratown.json');
		this.load.image('galletcity', 'tilesets/galletcity.png');
		// this.load.spritesheet('radio', 'sprites/radio.png', { frameWidth:32, frameHeight:32});
		this.load.spritesheet('radio', 'sprites/radio64.png', { frameWidth:64, frameHeight:64});
		this.load.image('uber', 'sprites/uber.png');

		// Autres
		this.load.on('progress', this.onProgress, this);
		this.load.on('complete', this.onComplete, this);

		this.load.json('ResultText', 'texts/ResultText.json');
		this.load.json('Games', 'texts/Games.json');

		// Sounds for stars
		this.load.audio('WinStarSound', 'sounds/mario_coin.mp3')
		this.load.audio('LoseStarSound', 'sounds/mario_dies_cut.mp3')

		// QuizzClara
		this.load.json('QuizzClara', 'texts/QuizzClara.json');
		this.load.json('QuizzClaraResults', 'texts/QuizzClaraResults.json');
		this.load.audio('ClaraFlash', 'sounds/ClaraFlash.mp3');

		// Joystick
		this.load.spritesheet('gamepad', 'gamepad/gamepad_spritesheet.png', { frameWidth: 100, frameHeight: 100});
		
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
