import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { FacebookSheet } from "../utils/FacebookSheet";
import { HudScene } from "./HudScene";

import { KineticScroll, KineticScrollSettings } from "../utils/KineticScroll";
import { MouseWheel } from "../utils/MouseWheel";

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
    
    KineticScroll : KineticScroll;
    Wheel         : MouseWheel;

    Cursors: Phaser.Input.Keyboard.CursorKeys; // keyboard input for scrolling
    // total height if we take all the posts (including those not on screen into account) 
    TotalHeight: number;

    constructor() {
        super({ key: 'Facebook', active: false });
    }
     
    init() {
        this.Hud = <HudScene>this.scene.get("HudScene");      
        this.Hud.setRemainingTime(Config.Facebook.time, false);
        this.Cursors = this.input.keyboard.createCursorKeys();
	}

	preload() {

	}

	create() {
		var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');
        this.Config = games.Facebook[character];
        if (!this.Config){
            throw new TypeError("Invalid config");
        }
        // switch (character) {
        //     case "lucie": this.Config = games.Facebook.lucie;
        //     default:
        //         this.Config = games.Facebook.lucie;
        // }
        this.GameState = State.Paused;
        this.TextData = this.cache.json.get('FacebookText'); 
        this.StartDialog = new DialogBox(this, this.Config.instruction, true, Anchor.Center, { fontSize: 22, fitContent: true });
        
        this.add.existing(this.StartDialog);
        let button = this.StartDialog.addArrowButton();
        button.on('pointerup', () => {
            if (this.StartDialog.isAnimationEnded()) {
                this.startFacebook();
            } else {
                this.StartDialog.endAnimation();
            }
        });
        
    }

    startFacebook() {
        // This avoid starting the game multiple times
        if (this.GameState != State.Paused){
            return;
        }
        this.GameState = State.Started;

        this.StartDialog.destroy();
        this.Hud.startTimer();
        this.cameras.main.setBackgroundColor(Config.FacebookSheet.backgroundColor);
        this.createSheets();

        // Scrolling with mouse wheel
        this.Wheel = new MouseWheel();
        this.Wheel.addEvent(this.wheelCallback, this);

        // Scrolling with touch or mouse
        this.TotalHeight = this.getTotalHeight();
        const settings: KineticScrollSettings = {
            kineticMovement: true,
            timeConstantScroll: 325,
            horizontalScroll: false,
            verticalScroll: true,
            bounds: {left: 0, top: 0, bottom: this.TotalHeight, right: 300}
        }
        this.KineticScroll = new KineticScroll(this, settings);

        this.input.on(
            'pointerdown',
            function (pointer) {
                this.KineticScroll.beginMove(pointer); 
            },
            this
        );
        this.input.on(
            'pointerup', 
            function (pointer) {
                this.KineticScroll.endMove();
            },
            this);
        this.input.on(
            'pointermove', 
            function (pointer) {
                this.KineticScroll.move(pointer);
            },
            this
        );

    }

    update() {
        if (this.Hud.getRemainingTime() <= 0){
            if (this.GameState == State.Started){
                this.GameState = State.Ended;
                // update global number of stars
                // this.registry.values.starCount += this.getStarNumber();
                // TODO: disable like controls / go to next scene?

                // Before leaving the scene, we need to remove wheel events
                this.Wheel.removeEvents();
                this.scene.start("LucieFriends");
            }
        }

        if (this.GameState === State.Started){
            // Scrolling with Keyboard arrows
            if (this.Cursors.down != undefined && this.Cursors.down.isDown){
                this.scroll(8);
            } else if (this.Cursors.up != undefined && this.Cursors.up.isDown){
                this.scroll(-8);
            }
            // Kinetic scrolling (with Touch or mouse)
            if (this.KineticScroll){
                this.KineticScroll.update();
            }
        }

    }

    private wheelCallback(e){
        this.scroll(e.deltaY);
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
				sheet.removeButtonCallback();
				this.updateStarCount(sheet.getStarNumber());
				let color = sheet.isRealNews() ? 0x00FF00 : 0xFF0000;
				sheet.drawFrame(color);
            });
            y += sheetHeight + padding;
		}
    }
	
	private updateStarCount(difference: number) {
		if (this.registry.has('starCount')) {
			let stars: number = this.registry.get('starCount');
			stars = Math.max(0, stars + difference);
			this.registry.set('starCount', stars);
		} else {
			console.warn("The starCount value should be initialized in the registry before this call.");
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
