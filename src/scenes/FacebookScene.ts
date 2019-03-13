import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { FacebookSheet } from "../utils/FacebookSheet";
import { HudScene } from "./HudScene";


// Idea for scrolling improvement: try that -> https://jdnichollsc.github.io/Phaser-Kinetic-Scrolling-Plugin/

export class Facebook extends Phaser.Scene {
    TextData	: any;
    Title		: GameText;
    StartDialog	: DialogBox = null;
    Sheets      : Array<FacebookSheet>;
    Hud         : HudScene;
    GameEnded   : boolean;

    Cursors: Phaser.Input.Keyboard.CursorKeys; // keyboard input for scrolling
    // total height if we take all the posts (including those not on screen into account) 
    TotalHeight: number;

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
        this.Cursors = this.input.keyboard.createCursorKeys();
        this.GameEnded = false;

        // Scrolling with touch or mouse
        var screenY = 0;
        var scrollY = 0;
        var draw = false;
        this.input.on(
            'pointerdown',
            function (pointer) {
                screenY = pointer.y;
                scrollY = this.cameras.main.scrollY;
                draw = true;
            },
            this
        );
        this.input.on(
            'pointerup', 
            function (pointer) {
                draw = false;
            },
            this);
        this.input.on(
            'pointermove', 
            function (pointer) {
                if (draw) {
                    this.scrollTo(scrollY + screenY - pointer.y);
                }
            },
            this
        );
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

        // Scrolling with Keyboard arrows
        if (this.Cursors.down != undefined && this.Cursors.down.isDown){
            this.scroll(10);
        }
        else if (this.Cursors.up != undefined && this.Cursors.up.isDown){
            this.scroll(-10);
        }
    }

    private scrollTo(y: number){
        // We cannot scroll above or below the posts
        let maxY = this.TotalHeight - Config.Game.height;
        y = Math.min(Math.max(y, 0), maxY);
        this.cameras.main.setScroll(0, y);
    }

    private scroll(deltaY: number){
        let y = this.cameras.main.scrollY;
        this.scrollTo(y + deltaY);
    }
    
    private createSheets() {
        let topPadding = Config.Facebook.topPadding;
        let postPerPage = Config.Facebook.postPerPage;
        let padding = Config.Facebook.padding;
        let sheetHeight = (Config.Game.height - topPadding) / postPerPage - padding;

        this.TotalHeight = topPadding + (sheetHeight + padding) * this.TextData.lucie.length + padding;

        let x = 0;
        let y = topPadding;
		for (let i = 0; i < this.TextData.lucie.length; ++i) {
            let sheet = new FacebookSheet(this, x, y, this.TextData.lucie[i], { windowHeight: sheetHeight, fontSize: 22 });
            this.Sheets.push(sheet);
            this.add.existing(sheet);
            sheet.addButton(() => {
                sheet.changeButton();
            });
            y += sheetHeight + padding;
		}
    }
    
    private getStarNumber(): number {
        let starNumber = 0;
        for (let sheet of this.Sheets){
            starNumber += sheet.getStarNumber();
        }
        return starNumber;
    }
}