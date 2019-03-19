import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";

export class Result extends Phaser.Scene {
    Hud          : HudScene;
    StarCount    : Number;
    Character    : String;
    Success      : Boolean;
    Result       : GameText;
    Config      : any;
    Context      : DialogBox;

	constructor() {
        super({ key: 'Result', active:false });
	}

	init() {
        console.log("in init - result scene");
    }

	preload() {
        console.log("in preload - result scene");
    }

	create() {
        this.Character = this.registry.get('character')
        this.StarCount  = this.registry.get('starCount');

        var resultText = this.cache.json.get('ResultText');
        var character = String(this.Character);
        this.Config = resultText[character];

        let fem = "e";
        let textToDisplay;
        let nameCapitalized = this.Character.charAt(0).toUpperCase() + this.Character.slice(1);

        // if the character isn't female, don't add one more e
        if (this.Character == "valentin")
            fem = "";

        if (this.StarCount >= 12) {
            this.Success = true;
            textToDisplay = "Bravo, vous avez réussi à réunir " + this.StarCount + "étoiles et votre personnage " + nameCapitalized + "est allé" + fem + " voter."
        }
        else {
            this.Success = false;
            textToDisplay = "Malheureusement, vous n'avez pas réussi à réunir les 12 étoiles nécessaires pour que votre personnage " + nameCapitalized + " aille voter."
        }
        this.Result = new GameText(this, Config.Game.centerX, Config.Game.centerY * 0.3, textToDisplay);
        this.Result.setOrigin(0.5, 0);
        this.Result.setSize(30);
        this.Result.setWordWrap(Config.Game.width - 10);
        this.input.on('pointerup', this.startExplanation, this);
	}

	update() {

        console.log("in update - result scene");
    }

    startExplanation() {
        console.log("in start explanation");
        this.input.off("pointerup");
        this.Result.destroy()

        if (this.Success == false) 
            this.Context = new DialogBox(this, this.Config.contextIfFail, false, Anchor.Center, { windowHeight: 410, fontSize: 22 });
        else
            this.Context = new DialogBox(this, this.Config.contextIfSuccess, false, Anchor.Center, { windowHeight: 410, fontSize: 22 });
        this.add.existing(this.Context);
        var button = this.Context.addArrowButton();
        button.on('pointerup', this.startResearcher, this);
    }

    startResearcher() {
        this.Context.destroy();
        var explanations = new DialogTree(this, this.Config.dialog, false, Anchor.Center, {fitContent:true});
    }


}
