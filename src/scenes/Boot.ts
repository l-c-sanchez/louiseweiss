import { Config } from "../Config";

export class Boot extends Phaser.Scene {
	FontProgress	: number;
	FontLoaded		: boolean;

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
