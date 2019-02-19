class Boot extends Phaser.Scene {
	constructor() {
		super({ key: 'Boot', active: true });
	}

	init() {

	}

	preload() {

	}

	create() {
		console.log("Coucou");
		this.scene.start('Preload');
	}

	update() {

	}
}
