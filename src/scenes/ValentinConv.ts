import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";
import { Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

export class ValentinConv extends Phaser.Scene {
	private Hud		: HudScene;
	private Quizz	: DialogTree;
	private Conv	: DialogTree;

    constructor() {
        super({ key: 'ValentinConv', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
		let quizzContent = this.cache.json.get('ValentinQuizz');
		let convContent = this.cache.json.get('ValentinConv');

		this.Quizz = new DialogTree(this, quizzContent, false, Anchor.Down, { windowHeight: 500 });

		this.add.existing(this.Quizz);
		this.Quizz.on('destroy', () => {
			this.Conv = new DialogTree(this, convContent, false, Anchor.Down, { windowHeight: 500 });

			this.add.existing(this.Conv);
			this.Conv.on('destroy', () => {
				this.scene.start('Pacman');
			});
		});
    }

    update() {

    }
}
