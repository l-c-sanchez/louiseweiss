import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";
import { Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

export class ValentinConv extends Phaser.Scene {
	private Hud		: HudScene;
	private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'ValentinConv', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
		let dialogContent = this.cache.json.get('ValentinConv');

		this.Dialogs = new DialogTree(this, dialogContent, true, Anchor.Down, { windowHeight: 500 });

		this.add.existing(this.Dialogs);
		this.Dialogs.on('destroy', () => {
			this.scene.start('Pacman');
		});
    }

    update() {

    }
}
