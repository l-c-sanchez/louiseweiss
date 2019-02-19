/// <reference path ='phaser/dist/phaser.d.ts'>

module LouiseWeiss {
	export class InitPhaser {

		gameRef:Phaser.Game;

		constructor() {
			let config = {
				type: Phaser.AUTO,
				width: 360,
				height: 640, 
				parent: 'phaser-app',
				physics: {
					default: "arcade",
					arcade:{
						gravity: { y:0 },
						debug: true
					}
				},
				scene: {
					preload:this.preload,
					create:this.create,
					update:this.update
				},
				// scene: [ ChooseCharacter ],
				banner: true,
				title: 'Louise Weiss',
				url: 'http://localhost:8080',
				version: '1.0.0',

			}

			this.gameRef = new Phaser.Game(config);
		}

		preload(this: Phaser.Scene) {
			this.load.image("MartaSmiley", "assets/smiley.png");
		}

		getCenterX(this: Phaser.Scene){
			return this.sys.canvas.width / 2
		}
		
		private create(this: Phaser.Scene) {
			console.log(this);
			var text = this.add.text(0, 0, "Hello world", { fontSize:"20px", align:'center', fill:"#FFFFFF"});
			Phaser.Display.Align.In.Center(text, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 4, this.sys.canvas.width, this.sys.canvas.height));
			var picture = this.add.image(0,0,"MartaSmiley");
			picture.setInteractive().on('pointerup', () => {
				picture.setVisible(false);
				text.setVisible(false);
				// this.scene.add('ChooseCharacter', new ChooseCharacter(), true)
				this.scene.add('Pacman', new Pacman(), true)
				// this.scene.start(new ChooseCharacter())
			});
			Phaser.Display.Align.In.Center(picture, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 1.8, this.sys.canvas.width, this.sys.canvas.height));
		}
		
		private update() {
			// console.log("in update")
		}
	}
}

function resizeApp()
{
	// Width-height-ratio of game resolution
	let game_ratio = 360 / 640;
	
	// Make div full height of browser and keep the ratio of game resolution
	let div = document.getElementById('phaser-app');
	div.style.width = (window.innerHeight * game_ratio) + 'px';
	div.style.height = window.innerHeight + 'px';
	
	// Check if device DPI messes up the width-height-ratio
	let canvas = document.getElementsByTagName('canvas')[0];
	
	let dpi_w = (parseInt(div.style.width) / canvas.width);
	let dpi_h = (parseInt(div.style.height) / canvas.height);		
	
	let height = window.innerHeight * (dpi_w / dpi_h);
	let width = height * 0.6;
	
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
}

window.onload = () => {
	let game = new LouiseWeiss.InitPhaser();
	resizeApp();
// LouiseWeiss.InitPhaser.initGame();
};



// Add to resize event
window.addEventListener('resize', resizeApp);

// Set correct size when page loads the first time
