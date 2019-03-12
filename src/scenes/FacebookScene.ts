import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { FacebookSheet } from "../utils/FacebookSheet";
import { HudScene } from "./HudScene";


export class Facebook extends Phaser.Scene {
    TextData	: any;
    Title		: GameText;
    StartDialog	: DialogBox = null;
    Sheets      : Array<FacebookSheet>;
    Hud         : HudScene;
    GameEnded   : boolean;

    constructor() {
        super({ key: 'Facebook', active: false });
    }
    
    init() {

	}

	preload() {

	}

	create() {
        this.TextData = this.cache.json.get('FacebookText');
        this.StartDialog = new DialogBox(this, this.TextData.title, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Sheets = [];
        this.Hud = <HudScene>this.scene.get("HudScene");
        this.Hud.setRemainingTime(Config.Facebook.time);
        this.input.on('pointerup', this.startFacebook, this);

        this.GameEnded = false;

    }
    startFacebook() {
        if (this.StartDialog != null){
            this.StartDialog.destroy();
            this.StartDialog = null;
            this.createSheets();
            this.cameras.main.setBackgroundColor(Config.FacebookSheet.backgroundColor);
        }
    
	}

    update() {
        if (this.Hud.getRemainingTime() <= 0){
            if (!this.GameEnded){
                this.GameEnded = true;

                // update global number of stars
                this.registry.values.starCount += this.getStarNumber();

                // TODO: disable like controls / go to next scene?
            }
        }
    }
    
    private createSheets() {
		let y = 20 + Config.Facebook.padding;
		let x = 0;
		let offset = y + Config.Facebook.padding * (this.TextData.lucie.length + 1);
		let height = (Config.Game.height - offset) / 3;

		for (let i = 0; i < this.TextData.lucie.length; ++i) {
            let sheet = new FacebookSheet(this, x, y, this.TextData.lucie[i], { windowHeight: height, fontSize: 22 });
            this.Sheets.push(sheet);
            this.add.existing(sheet);
            sheet.addButton(() => {
                sheet.changeButton();
            });
			y += height + Config.Facebook.padding;
		}
    }
    
    private getStarNumber(): number {
        let starNumber = 0;
        for (let sheet of this.Sheets){
            starNumber += sheet.getStarNumber();
        }
        return starNumber;
    }

    // We want to update the stars depending on the number of likes


}