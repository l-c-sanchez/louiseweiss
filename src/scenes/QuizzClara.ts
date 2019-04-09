import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { GameText } from "../utils/GameText";
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
    GameEnded    : boolean = false;
    GameState    : State;
    Config       : any;
    TextDuringFlash : GameText
    Button : Phaser.GameObjects.Sprite

    constructor() {
        super({ key: 'QuizzClara', active: false });
    }

    init() {
        this.Hud = <HudScene>this.scene.get("HudScene");
        // this.Hud.setRemainingTime(Config.QuizzClara.time, false);
        this.Hud.setRemainingTime(0.5, false);
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
        this.Button = this.StartDialog.addArrowButton();
        this.Button.on('pointerup', this.startQuizz, this);

    }
    startQuizz() {
        if (this.GameState != State.Paused){
            return;
        }

        this.GameState = State.Started;
        this.Button.off("pointerup");
        this.StartDialog.destroy();
        this.Hud.startTimer();
        let flash = this.sound.add('ClaraFlash', {
			mute: false,
			volume: 1,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: false,
			delay: 0
		});
        flash.play();
        this.GameState = State.Started;
        this.TextDuringFlash = new GameText(this, Config.Game.centerX, Config.Game.centerY, this.TextData.Quizz.clara.duringFlash);
		this.TextDuringFlash.setOrigin(0.5, 0.5);
        this.TextDuringFlash.setSize(40);
        
     

}
    update() {
        if (this.Hud.getRemainingTime() <= 0 && this.GameEnded == false){
            console.log("here")
            this.TextDuringFlash.destroy();
            
            this.GameEnded = true;       
            let dialogContent = this.cache.json.get('QuizzClara');
            this.cameras.main.setBackgroundColor("#ffffff");
            
    
            this.Dialogs = new DialogTree(this, dialogContent, false, Anchor.Bottom, {windowHeight: 500});
    
            this.add.existing(this.Dialogs);
            this.Dialogs.on('destroy', () => {
                this.scene.start('ClaraConv');
            });     
        }

    }
}
