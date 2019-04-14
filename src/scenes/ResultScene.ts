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
    Result       : DialogBox;
    Config      : any;
    Context      : DialogBox;
    private StartDialog : DialogBox = null;
    private Button 		 : Phaser.GameObjects.Sprite

	constructor() {
        super({ key: 'Result', active:false });
	}

	init() {
        // console.log("in init - result scene");
    }

	preload() {
        // console.log("in preload - result scene");
    }

	create() {
        let picture = this.add.image(Config.Game.centerX, Config.Game.centerY * 1.1, "EuropeanFlag");
		picture.setOrigin(0.5, 0.5);
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
            textToDisplay = "Bravo, vous avez réussi à réunir " + this.StarCount + " étoiles et votre personnage " + nameCapitalized + " est allé" + fem + " voter."
        }
        else {
            this.Success = false;
            textToDisplay = "Malheureusement, vous n'avez pas réussi à réunir les 12 étoiles nécessaires pour que votre personnage " + nameCapitalized + " aille voter."
        }

        var res : boolean = this.registry.get('GameOver'); 
        if (res != true) {
            this.Result = new DialogBox(this, textToDisplay, true, Anchor.Center, { fitContent: true, fontSize: 22 });
            this.Button = this.Result.addArrowButton();
            this.Button.on('pointerup', () => {
                if (this.Result.isAnimationEnded()) {
                    this.Result.destroy();
                    this.Button.destroy();
                    this.startExplanation();
                } else {
                    this.Result.endAnimation();
                }
            }, this);
            this.add.existing(this.Result);
        }
        else
            this.startExplanation();
	}

	update() {

        // console.log("in update - result scene");
    }

    startExplanation() {
        
        console.log("in start explanation");
        // this.input.off("pointerup");
        // if (this.Result)
        //     this.Result.destroy();
        // if (this.Button)
        //     this.Button.destroy();

        if (this.Success == false) 
            this.Context = new DialogBox(this, this.Config.contextIfFail, true, Anchor.Center, { fitContent: true, fontSize: 22 });
        else
            this.Context = new DialogBox(this, this.Config.contextIfSuccess, true, Anchor.Center, { fitContent: true, fontSize: 22 });
        this.add.existing(this.Context);
        var button = this.Context.addArrowButton();
		button.on('pointerup', () => {
			if (this.Context.isAnimationEnded()) {
				this.startResearcher();
			} else {
				this.Context.endAnimation();
			}
		}, this);
    }

    startResearcher() {
        this.Context.destroy();
		var explanations = new DialogTree(this, this.Config.dialog, true, Anchor.Center, {fitContent:true});
        this.add.existing(explanations);
        explanations.on('destroy', this.playWithOtherCharacter, this);
    }
    playWithOtherCharacter() {
        var resultText = this.cache.json.get('ResultText');
        // this.StartDialog = new DialogBox(this, resultText.playAgain, true, Anchor.Center, { fitContent: true, fontSize: 22 });
        var credits = new DialogTree(this, resultText.credits, true, Anchor.Bottom, {fitContent:true, offsetY:-10});
        this.add.existing(credits);
        credits.on('destroy', this.startCharacterChoice, this);
        // this.startCharacterChoice();
        // this.Button = credits.addArrowButton();
		// this.Button.on('pointerup', () => {
		// 	if (this.StartDialog.isAnimationEnded()) {
        //         this.StartCredits.destroy();
		// 		this.startCharacterChoice();
		// 	} else {
		// 		this.StartDialog.endAnimation();
		// 	}
        // }, this);
        // this.add.existing(this.StartDialog);
    }
    startCharacterChoice() {
        this.registry.set('character', "");
        this.registry.set('starCount', 0);
        this.registry.set('GameOver', false);
        this.scene.stop("HudScene");
        this.scene.start('CharacterChoice')
    }


}
