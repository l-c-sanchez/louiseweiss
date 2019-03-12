import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";


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
		// this.input.keyboard.on('keyup', this.onKeyReleased, this);
        // console.log(this.cache.json.get('FacebookText'))
		// this.Title = new GameText(this, 15, 10, this.TextData.title);

    }
    startFacebook() {
        console.log("in facebook scene")
        this.StartDialog.destroy()
	}

	update() {

	}

}