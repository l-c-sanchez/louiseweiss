export class Config {
	static Phaser = {
		type: Phaser.AUTO,
		parent: 'phaser-app',
		title: 'Louise Weiss',
		width: 360,
		height: 640,
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

	static Game = {
		debugMode: true,
		width: Config.Phaser.width,
		height: Config.Phaser.height,
		centerX: Math.round(0.5 * Config.Phaser.width),
		centerY: Math.round(0.5 * Config.Phaser.height),
		tile: 32,
		fps: 60,
		fontName: 'unscii'
	}

	static CarGame = {
		rows: 20,
		columns: 12,
		starProbability: 0.2,
		rockProbability: 0.1,
		corridorSize: 64,
		tileSize: 32,
		time: 20 // in seconds
	}
}
