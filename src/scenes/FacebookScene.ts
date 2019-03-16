import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { FacebookSheet } from "../utils/FacebookSheet";
import { HudScene } from "./HudScene";

import { KineticScroll, KineticScrollSettings } from "../utils/KineticScroll";

// Idea for scrolling improvement: try that -> https://jdnichollsc.github.io/Phaser-Kinetic-Scrolling-Plugin/
// Ported to Phaser 3 here: https://gist.github.com/PaNaVTEC/ef18d2bee239514515e91d6c50012825

// Other idea:
// Scroller on object: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scroller/
// Complex objects: add everything to groups -> https://phasergames.com/complex-objects-phaser/

enum State {
    Paused,
    Started,
    Ended
}

export class Facebook extends Phaser.Scene {
    TextData	 : any;
    Title		 : GameText;
    StartDialog	 : DialogBox = null;
    Sheets       : Array<FacebookSheet>;
    Hud          : HudScene;
    GameEnded    : boolean;
    GameState    : State;
    Config       : any;
    
    Scroll       : KineticScroll;

    Cursors: Phaser.Input.Keyboard.CursorKeys; // keyboard input for scrolling
    // total height if we take all the posts (including those not on screen into account) 
    TotalHeight: number;

    constructor() {
        super({ key: 'Facebook', active: false });
    }
    
    init() {
        this.Hud = <HudScene>this.scene.get("HudScene");      
        this.Hud.setRemainingTime(Config.Facebook.time);
        this.Hud.pauseTimer(true);
        this.Cursors = this.input.keyboard.createCursorKeys();
        console.log("in init");
	}

	preload() {

	}

	create() {
        console.log("in create")
        var character: string = this.registry.get('character');
        console.log(character);        
        switch (character) {
            case "lucie": this.Config = Config.Facebook.lucie;
            default:
                this.Config = Config.Facebook.lucie;
        }
        this.GameState = State.Paused;
        this.TextData = this.cache.json.get('FacebookText'); 
        this.StartDialog = new DialogBox(this, this.Config.instruction, false, Anchor.Center, { windowHeight: 410, fontSize: 22 });
        this.add.existing(this.StartDialog);
        let button = this.StartDialog.addArrowButton();
        button.on('pointerup', this.startFacebook, this);

        this.TotalHeight = this.getTotalHeight();
        const settings: KineticScrollSettings = {
            kineticMovement: true,
            timeConstantScroll: 325,
            horizontalScroll: false,
            verticalScroll: true,
            bounds: {left: 0, top: 0, bottom: this.TotalHeight, right: 300}
        }
        this.Scroll = new KineticScroll(this, settings);

        // this.input.on('pointerup', this.startFacebook, this);
    }
    startFacebook() {
        this.StartDialog.destroy();
        this.Hud.pauseTimer(false);
        this.cameras.main.setBackgroundColor(Config.FacebookSheet.backgroundColor);
        this.createSheets();
       // this.Scroll = new KineticScroll(this, settings);

        // Scrolling with touch or mouse

        this.input.on(
            'pointerdown',
            function (pointer) {
                this.Scroll.beginMove(pointer); 
            },
            this
        );
        this.input.on(
            'pointerup', 
            function (pointer) {
                this.Scroll.endMove();
            },
            this);
        this.input.on(
            'pointermove', 
            function (pointer) {
                this.Scroll.move(pointer);
            },
            this
        );

        this.GameState = State.Started;
    }

    update() {
        // console.log(this.Hud)
        if (this.Hud.getRemainingTime() <= 0){
            if (this.GameState == State.Started){
                this.GameState = State.Ended;
                // update global number of stars
                this.registry.values.starCount += this.getStarNumber();
                // TODO: disable like controls / go to next scene?
            }
        }

        // Scrolling with Keyboard arrows
        if (this.Cursors.down != undefined && this.Cursors.down.isDown){
            this.scroll(8);
        } else if (this.Cursors.up != undefined && this.Cursors.up.isDown){
            this.scroll(-8);
        }
        // Kinetic scrolling (with Touch or mouse)
        this.Scroll.update();
    }

    private getTotalHeight(){
        let topPadding = Config.Facebook.topPadding;
        let postPerPage = Config.Facebook.postPerPage;
        let padding = Config.Facebook.padding;
        let sheetHeight = (Config.Game.height - topPadding) / postPerPage - padding;
        let totalHeight = topPadding + (sheetHeight + padding) * this.TextData.lucie.length + padding;
        return totalHeight;
    }

    private scroll(deltaY: number){
        let targetY = this.cameras.main.scrollY + deltaY;
        // We cannot scroll above or below the posts
        let maxY = this.TotalHeight - Config.Game.height;
        targetY = Math.min(Math.max(targetY, 0), maxY);

        this.cameras.main.setScroll(0, targetY);
    }
    
    private createSheets() {
        let topPadding = Config.Facebook.topPadding;
        let postPerPage = Config.Facebook.postPerPage;
        let padding = Config.Facebook.padding;
        let sheetHeight = (Config.Game.height - topPadding) / postPerPage - padding;

        let x = 0;
        let y = topPadding;
        this.Sheets = [];
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
