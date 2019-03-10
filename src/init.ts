import { Config } from "./Config";
import { Preload } from "./scenes/Preload";
import { Boot } from "./scenes/Boot";
import { Menu } from "./scenes/Menu";
import { Pacman } from "./scenes/PacmanScene";
import { CarGame } from "./scenes/CarScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { HudScene } from "./scenes/HudScene";
import { CharacterChoice } from "./scenes/CharacterChoice";

export class App {

	gameRef: Phaser.Game;
	scenes: Array<Phaser.Scene>;

	constructor() {
		this.scenes = new Array<Phaser.Scene>();
		this.scenes.push(new Boot());
		this.scenes.push(new Preload);
		this.scenes.push(new Menu());
		this.scenes.push(new Pacman());
		this.scenes.push(new CarGame());
		this.scenes.push(new GameOverScene());
		this.scenes.push(new HudScene());
		this.scenes.push(new CharacterChoice());

		Config.Phaser.scene = this.scenes;

		if (Config.Game.debugMode) {
			Config.Phaser.url = 'http://localhost:8080/';
		}

		this.gameRef = new Phaser.Game(Config.Phaser);
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
	resizeApp();
	// window.onload = () => {
	// 	console.log("here2")
	// 	let game = new LouiseWeiss.App();
	// 	resizeApp();

	// // LouiseWeiss.InitPhaser.initGame();
	// };
	window.addEventListener('resize', resizeApp);
}
