import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";
import { DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

enum State {
    Paused,
    Started,
    Ended
}

export class QuizzClara extends Phaser.Scene {
	private Hud		: HudScene;
    private Dialogs	: DialogTree;
    TextData	 : any;
    StartDialog	 : DialogBox = null;
    GameEnded    : boolean;
    GameState    : State;
    Config       : any;
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'QuizzClara', active: false });
    }

    init() {
        this.Hud = <HudScene>this.scene.get("HudScene");
        this.Hud.setRemainingTime(Config.QuizzClara.time, false);
	}

	preload() {
        //  StartDialog	 : DialogBox = null;

	}

	create() {
        console.log("here")
        this.GameState = State.Paused;
        this.TextData = this.cache.json.get('Games'); 
        this.StartDialog = new DialogBox(this, this.TextData.Quizz.clara.instruction, false, Anchor.Center, { windowHeight: 410, fontSize: 22 });
        
        this.add.existing(this.StartDialog);
        let button = this.StartDialog.addArrowButton();
        button.on('pointerup', this.startQuizz, this);

    }
    startQuizz() {
        if (this.GameState != State.Paused){
            return;
        }
        this.GameState = State.Started;

        this.StartDialog.destroy();
        this.Hud.startTimer();
        console.log("faire démarrer le son")
        let dialogContent = this.cache.json.get('QuizzClara');
        this.cameras.main.setBackgroundColor("#ffffff");
        

        this.Dialogs = new DialogTree(this, dialogContent, false, Anchor.Down, {windowHeight: 500});

        this.add.existing(this.Dialogs);
        this.Dialogs.on('destroy', () => {
            this.scene.start('ClaraConv');
        });


}
    update() {

    }
}
