/// <reference path ='phaser/dist/phaser.d.ts'>

module LouiseWeiss {
	export class InitPhaser {

		private static gameRef:Phaser.Game;

		public static initGame() {
			let config = {
				type: Phaser.AUTO,
				width: 480,
				height: 320,
				scene: {
					preload:this.preload,
					create:this.create,
					update:this.update
				},
				banner: true,
				title: 'Louise Weiss',
				url: 'http://localhost:8080',
				version: '1.0.0'
			}

			this.gameRef = new Phaser.Game(config);
		}

		static preload() {
			// this.gameRef.load.start();
			let character = new CharacterSheet({
				name:"Marta",
				age:45,
				job:"nurse",
				town:"Tourville-La-Campagne",
				picture:  this.gameRef.load.image('')
			});

		}
		static create() {}
		static update() {}
	}
}

window.onload = () => {
	LouiseWeiss.InitPhaser.initGame();
};

