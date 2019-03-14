import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";


export class FacebookInstructions extends Phaser.Scene {
    TextData	 : any;
    Title		 : GameText;
    StartDialog	 : DialogBox = null;

    constructor() {
        super({ key: 'FacebookInstructions', active: false });
    }
    
    init() {}

	preload() {}

	create() {
        this.TextData = this.cache.json.get('FacebookText');
        this.StartDialog = new DialogBox(this, this.TextData.title, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.input.on('pointerup', this.startFacebook, this);
    }

    startFacebook() { 
        this.scene.start("Facebook"); 
        this.scene.start("HudScene");
    }

    update() {}

}