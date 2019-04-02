import { Config } from "./Config";
import { Preload } from "./scenes/Preload";
import { Boot } from "./scenes/Boot";
import { Menu } from "./scenes/Menu";
import { Pacman } from "./scenes/PacmanScene";
import { CarGame } from "./scenes/CarScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { HudScene } from "./scenes/HudScene";
import { CharacterChoice } from "./scenes/CharacterChoice";
import { Facebook } from "./scenes/FacebookScene";
import { Result } from "./scenes/ResultScene";
import { Tilemaps } from "phaser";
import { ClaraConv } from "./scenes/ClaraConv";
import { QuizzClara } from "./scenes/QuizzClara";
import { ValentinConv } from "./scenes/ValentinConv";
import { LucieConv } from "./scenes/LucieConv";
import { BreakoutScene } from "./scenes/BreakoutScene";
import { LucieBus } from "./scenes/LucieBus";

export class App {

	GameRef: Phaser.Game;
	Scenes: Array<Phaser.Scene>;

	constructor() {
		this.Scenes = new Array<Phaser.Scene>();
		this.Scenes.push(new Boot());
		this.Scenes.push(new Preload);
		this.Scenes.push(new Menu());
		this.Scenes.push(new Pacman());
		this.Scenes.push(new CarGame());
		this.Scenes.push(new GameOverScene());
		this.Scenes.push(new HudScene());
		this.Scenes.push(new CharacterChoice());
		this.Scenes.push(new Facebook());
		this.Scenes.push(new Result());
		this.Scenes.push(new QuizzClara());
		this.Scenes.push(new ClaraConv());
		this.Scenes.push(new ValentinConv());
		this.Scenes.push(new BreakoutScene());
		this.Scenes.push(new LucieConv());
		this.Scenes.push(new LucieBus());
		
		Config.Phaser.scene = this.Scenes;

		if (Config.Game.debugMode) {
			Config.Phaser.url = 'http://localhost:8080/';
		}

		this.GameRef = new Phaser.Game(Config.Phaser);
	}
}

export function MS2S(value: number) {
	return value * 10e-4;
}

function resizeApp()
{
	// Width-height-ratio of game resolution
	let game_ratio = 360.0 / 640.0;
	
	// Make div full height of browser and keep the ratio of game resolution
	let div = document.getElementById('phaser-app');
	div.style.width = (window.innerHeight * game_ratio) + 'px';
	div.style.height = window.innerHeight + 'px';
	
	// Check if device DPI messes up the width-height-ratio
	let canvas = document.getElementsByTagName('canvas')[0];
	
	let dpi_w = (parseInt(div.style.width) / canvas.width);
	let dpi_h = (parseInt(div.style.height) / canvas.height);		

	let height = window.innerHeight * (dpi_w / dpi_h);
	let width = height * game_ratio;
	
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
}

export function start() {
	console.log("here")
	let game = new App();
	// resizeApp();
	// window.onload = () => {
	// 	console.log("here2")
	// 	let game = new LouiseWeiss.App();
	// 	resizeApp();

	// // LouiseWeiss.InitPhaser.initGame();
	// };
	// window.addEventListener('resize', resizeApp);
}
