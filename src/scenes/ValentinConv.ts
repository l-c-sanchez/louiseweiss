import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";
import { Anchor, DialogOptions, ButtonOptions, DialogBox } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

export class ValentinConv extends Phaser.Scene {
	private Hud			: HudScene;
	private Quizz		: DialogTree;
	private Conv		: DialogTree;
    private Config		: any;
    private StartDialog	: DialogBox = null;

    constructor() {
        super({ key: 'ValentinConv', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
        let character: string = this.registry.get('character');
        let games = this.cache.json.get('Games');
		this.Config = games.Conv[character];
		console.log(character, games, this.Config);
        if (!this.Config){
            throw new TypeError("Invalid config");
        }

		let quizzContent = this.cache.json.get('ValentinQuizz');

		this.Quizz = new DialogTree(this, quizzContent, false, Anchor.Down, { windowHeight: 500 });

		this.add.existing(this.Quizz);
		this.Quizz.on('destroy', this.showConvInstructions, this);
	}
	
	private showConvInstructions() {
		this.StartDialog = new DialogBox(this, this.Config.instruction, false, Anchor.Center, { windowHeight: 410, fontSize: 22 });

		this.add.existing(this.StartDialog);
		let button = this.StartDialog.addArrowButton();
		button.on('pointerup', this.startConv, this);
	}

	private startConv() {
		this.StartDialog.destroy();
		let convContent = this.cache.json.get('ValentinConv');
		this.Conv = new DialogTree(this, convContent, false, Anchor.Down, { windowHeight: 500 });
		this.add.existing(this.Conv);
		this.Conv.on('destroy', () => {
			this.scene.start('Pacman');
		});
	}

    update() {

    }
}
