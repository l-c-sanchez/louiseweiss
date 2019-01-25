/// <reference path ='phaser/dist/phaser.d.ts'>

module LouiseWeiss {
	export class InitPhaser {

		private static gameRef:Phaser.Game;

		public static initGame() {
			let config = {
				type: Phaser.AUTO,
				width: 480,
				height: 320,
				scene: [],
				banner: true,
				title: 'Louise Weiss',
				url: 'http://localhost:8080',
				version: '1.0.0'
			}

			this.gameRef = new Phaser.Game(config);
		}
	}
}

window.onload = () => {
	LouiseWeiss.InitPhaser.initGame();
};