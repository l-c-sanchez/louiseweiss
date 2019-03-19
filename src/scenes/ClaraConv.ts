import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";
import { Anchor } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

export class ClaraConv extends Phaser.Scene {
	private Hud		: HudScene;
	private Dialogs	: DialogPhone;
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'ClaraConv', active: false });
    }
     
    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
        // this.Hud.setRemainingTime(Config.Facebook.time);
        // this.Hud.pauseTimer(true);
        // this.Cursors = this.input.keyboard.createCursorKeys();
	}

	preload() {

	}

	create() {
		let dialogContent = this.cache.json.get('ClaraConv');
		
		// this.Dialogs = new DialogTree(this, dialogContent, false, Anchor.Down, { fitContent: true, windowHeight: 300, fontSize: 22 });
		this.Dialogs = new DialogPhone(this, dialogContent, false, {
			fitContent: true,
			windowHeight: 120,
			fontSize: 22
		});

		this.add.existing(this.Dialogs);
		this.Dialogs.on('destroy', () => {
			this.scene.start('Pacman');
		});
    }

    update() {

    }
}
