import { Config } from "../Config";

export class Boot extends Phaser.Scene {
	fontProgress	: number;
	fontLoaded		: boolean;

	constructor() {
		super({ key: 'Boot', active: true });
	}

	init() {

	}

	preload() {
		
	}

	create() {
		this.scene.start('Preload');		
	}

	update() {

	}
}
