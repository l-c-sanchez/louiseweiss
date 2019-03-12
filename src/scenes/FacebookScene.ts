import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { FacebookSheet } from "../utils/FacebookSheet";


export class Facebook extends Phaser.Scene {
    TextData	: any;
    Title		: GameText;
    StartDialog	: DialogBox = null;

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
        this.input.on('pointerup', this.startFacebook, this);

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

    }
    private createSheets() {
		let y = 20 + Config.Facebook.padding;
		let x = 0;
		let offset = y + Config.Facebook.padding * (this.TextData.lucie.length + 1);
		let height = (Config.Game.height - offset) / 3;

		for (let i = 0; i < this.TextData.lucie.length; ++i) {
            let sheet = new FacebookSheet(this, x, y, this.TextData.lucie[i], { windowHeight: height, fontSize: 22 });
            this.add.existing(sheet);
            sheet.addButton(() => {
                sheet.changeButton();
            });
			y += height + Config.Facebook.padding;
		}
	}


}