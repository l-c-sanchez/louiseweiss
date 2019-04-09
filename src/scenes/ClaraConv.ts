import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

export class ClaraConv extends Phaser.Scene {
	private Hud			 : HudScene;
	private StartDialog	 : DialogBox = null;
	private Dialogs		 : DialogPhone;
	private Config       : any;
	private Button 		 : Phaser.GameObjects.Sprite
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'ClaraConv', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
		var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');

		this.Config = games.Conv[character];
        this.StartDialog = new DialogBox(this, this.Config.instruction, false, Anchor.Center, { windowHeight: 410, fontSize: 22 });
		this.Button = this.StartDialog.addArrowButton();
		this.Button.on('pointerup', this.startConv, this);
	}

	startConv() {
		let dialogContent = this.cache.json.get('ClaraConv');
		this.cameras.main.setBackgroundColor("#ffffff"); 
		this.Button.off("pointerup");
		this.StartDialog.destroy();

		// TODO: We should define some global default settings for all conversations.
		let messageOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xedecec,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 20,
			padding: 10
		};
		let answerOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0x1083ff,
			borderThickness: 0,
			fontSize: 20,
			padding: 10
		};
		let inputFieldOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xffffff,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 20,
			padding: 0,
		}
		let buttonOptions: ButtonOptions = {
			borderColor: 0x1083ff
		}

		this.StartDialog.destroy();
		this.cameras.main.setBackgroundColor("#ffffff"); 
		this.Dialogs = new DialogPhone(this, dialogContent, false, messageOptions, answerOptions,
			inputFieldOptions, buttonOptions);
		this.add.existing(this.Dialogs);
		this.Dialogs.on('destroy', () => {
			console.log('destroyed, let s start pacman');
			this.scene.start('Pacman');
		});
    }

    update() {

    }
}
