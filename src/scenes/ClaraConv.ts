import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

export class ClaraConv extends Phaser.Scene {
	private Hud			 : HudScene;
	private StartDialog	 : DialogBox = null;
	private Dialogs		 : DialogPhone;
	private Config       : any;
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
		
		let dialogContent = this.cache.json.get('ClaraConv');
        this.cameras.main.setBackgroundColor("#ffffff"); 
        this.StartDialog = new DialogBox(this, this.Config.instruction, false, Anchor.Center, { windowHeight: 410, fontSize: 22 });
        
		let messageOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xedecec,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 22
		};

		let answerOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0x1083ff,
			borderThickness: 0,
			fontSize: 22
		};

		let inputFieldOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xffffff,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 22
		}

		let buttonOptions: ButtonOptions = {
			borderColor: 0x1083ff
		}

		this.Dialogs = new DialogPhone(this, dialogContent, false, messageOptions, answerOptions,
			inputFieldOptions, buttonOptions);

		

		this.add.existing(this.Dialogs);
		this.Dialogs.on('destroy', () => {
			this.scene.start('Pacman');
		});
    }

    update() {

    }
}
