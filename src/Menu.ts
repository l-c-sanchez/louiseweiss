class Menu extends Phaser.Scene {
	constructor() {
        super({ key: 'Menu', active: false });
	}

	init() {

	}

	preload() {
		this.load.image("MartaSmiley", "assets/smiley.png");
	}

	create() {
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

	update() {
		
	}
}
