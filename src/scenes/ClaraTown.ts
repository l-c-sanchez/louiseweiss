import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { GameText } from "../utils/GameText"
import { DialogBox, Anchor } from "../utils/DialogBox";
import { MS2S } from "../init";

enum State {
    Beginning,
    UberComing,
    UberStopped,
    UberLeaving,
    Started,
    firstpart,
    secondpart,
    thirdpart,
    fourthpart,
    Ended
}

export class ClaraTown extends Phaser.Scene {
    GameState    : State;
    TileMap: Phaser.Tilemaps.Tilemap;
    Car:     Phaser.Physics.Arcade.Sprite;
    Radio:   Phaser.Physics.Arcade.Sprite;
    RadioSound: Phaser.Sound.BaseSound;
    private Config       	: any;
    private StartDialog	 	: DialogBox = null;
    private Button 		 : Phaser.GameObjects.Sprite

    
    private ClaraSprite		: Phaser.Physics.Arcade.Sprite;
    private ClaraTarget		: Phaser.Math.Vector2;

    private UberCurrentIndex	: number = 0;
    private UberSprite		: Phaser.Physics.Arcade.Sprite;
    private UberTarget		: Phaser.Math.Vector2;
    hud: HudScene;

    RemainingTime: number;
    RemainingTimeText: GameText;
    

    constructor() {
        super({ key: 'ClaraTown', active: false });
    }

	create() {
        this.hud = <HudScene>this.scene.get("HudScene");
        this.hud.setRemainingTime(30, false);
        var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');
        this.Config = games.ClaraTown[character];
        this.GameState = State.Beginning;
        this.cameras.main.setBackgroundColor('#000000');
        this.TileMap = this.make.tilemap({ key: 'LeavingBus' });        
		var tiles = [
			this.TileMap.addTilesetImage('RoadTile', 'RoadTile')
		];
        this.TileMap.createStaticLayer('road', tiles, 0, 0);
        
		this.ClaraTarget = this.TileMap.tileToWorldXY(2, 10);
		
		this.anims.remove('right');
        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers(character, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.ClaraSprite = this.physics.add.sprite(this.ClaraTarget.x , this.ClaraTarget.y, 'clara');
        this.physics.moveTo(this.ClaraSprite, this.ClaraTarget.x, this.ClaraTarget.y, 40);
   
        this.ClaraSprite.anims.play('right');
        
        // this.startAll();
        this.time.addEvent({
            delay: 3800,
            callback: this.uberComing,
            callbackScope: this
        });
        this.StartDialog = new DialogBox(this, this.Config.instruction, true, Anchor.Top, {
            fitContent: true,
            fontSize: 22,
            offsetY:70
        });

    }

    private uberComing() {
        this.ClaraSprite.anims.stop();
        this.ClaraSprite.setVelocity(0, 0);
        var pos = this.Config.uberPosList[this.UberCurrentIndex]

        this.UberTarget = this.TileMap.tileToWorldXY(pos.x, pos.y);
        this.UberSprite = this.physics.add.sprite(this.UberTarget.x , this.UberTarget.y, 'uber');
        this.UberCurrentIndex += 1;

        var pos = this.Config.uberPosList[this.UberCurrentIndex];
        console.log(pos)
        this.UberTarget = this.TileMap.tileToWorldXY(pos.x, pos.y);
        this.physics.moveTo(this.UberSprite, this.UberTarget.x, this.ClaraTarget.y, 70);
        this.GameState = State.UberComing;
    }

    private uberLeaving(){
        this.ClaraSprite.destroy();
        this.GameState = State.UberLeaving;
        var instruction_details = this.Config.instructionUber_desktop;
		if(!this.sys.game.device.os.desktop)
            instruction_details = this.Config.instructionUber_mobile;
        this.StartDialog.destroy();
        this.StartDialog = new DialogBox(this, instruction_details, true, Anchor.Center, {
			fitContent: true,
			fontSize: 22
		});
		this.Button = this.StartDialog.addArrowButton(); 
        this.Button.on('pointerup', () => {
            if (this.StartDialog.isAnimationEnded()) {
				this.startAll();
            } else {
                this.StartDialog.endAnimation();
            }
        });
        this.add.existing(this.StartDialog);
    }
    
    private startAll() {

            // Town TileMap
            this.StartDialog.destroy();
            this.TileMap = this.make.tilemap({ key: 'claratown' });
            var tiles = this.TileMap.addTilesetImage('galletcity', 'galletcity');
            var layer = this.TileMap.createStaticLayer('Tile Layer 1', tiles, 0, 0);
            
            this.Car = this.physics.add.sprite(0, 40, 'voiture');
            // Car oriented to right
            this.Car.angle = 90;
            let carY = 43;
            this.Car.setVelocityX(carY);
            this.RadioSound = this.sound.add('ClaraFlash', {volume: 1});
            this.RadioSound.play();
            let middleX = Config.Game.width / 2;
            let middleY = Config.Game.height / 2;
            this.Radio = this.physics.add.sprite(middleX, middleY + 40, 'radio');
			this.anims.remove('blink');
			this.anims.create({
                key: 'blink',
                frames: this.anims.generateFrameNumbers('radio', { start: 0, end: 1}),
                frameRate: 3,
                repeat: -1
            });
            this.Radio.anims.play('blink', true);
            this.time.addEvent({
                delay: 32000,
                callback: this.startNextScene,
                callbackScope: this
            });
            this.hud.startTimer();
            this.GameState = State.Started

    }

    public update() {
        // console.log(this.GameState);
        // if (this.UberSprite){
        //     // console.log(this.UberSprite);
        //     console.log(this.UberTarget.y, this.UberSprite.y);
        // }
        if (this.GameState == State.UberComing && Phaser.Math.Fuzzy.Equal(this.UberSprite.y, this.UberTarget.y, 1)){
            this.GameState = State.UberStopped;
            this.UberSprite.setVelocity(0, 0);
            this.time.addEvent({
                delay: 1000,
                callback: this.uberLeaving,
                callbackScope: this
            });
            // console.log("stop car")
        }
        else if (this.GameState == State.Started && this.hud.getRemainingTime() == 30){
            this.StartDialog = new DialogBox(this, this.Config.firstpart, true, Anchor.Bottom, {
                fitContent: true,
                fontSize: 22,
                offsetY:-10
            });
            this.add.existing(this.StartDialog);
            this.GameState = State.firstpart;
        }
        else if (this.hud.getRemainingTime() == 20 && this.GameState == State.firstpart){
            this.GameState = State.secondpart;
            // this.RadioSound.pause();
            // this.time.addEvent({
            //     delay: 500,
            //     callback: this.startSecondpart,
            //     callbackScope: this
            // });
            this.StartDialog.destroy();
            this.StartDialog = new DialogBox(this, this.Config.secondpart, true, Anchor.Bottom, {
                fitContent: true,
                fontSize: 22,
                offsetY:-40
            });
            this.add.existing(this.StartDialog);
        }
        else if (this.hud.getRemainingTime() == 14 && this.GameState == State.secondpart){
            this.GameState = State.thirdpart;
            this.StartDialog.destroy();
            this.StartDialog = new DialogBox(this, this.Config.thirdpart, true, Anchor.Bottom, {
                fitContent: true,
                fontSize: 22,
                offsetY:-40
            });
            this.add.existing(this.StartDialog);
        }
        else if (this.hud.getRemainingTime() == 7 && this.GameState == State.thirdpart){
            this.GameState = State.fourthpart;
            this.StartDialog.destroy();
            this.StartDialog = new DialogBox(this, this.Config.fourthpart, true, Anchor.Bottom, {
                fitContent: true,
                fontSize: 22,
                offsetY:-40
            });
            this.add.existing(this.StartDialog);
        }

    }
    // private startSecondpart(){
    //     this.StartDialog.destroy();
    //     this.StartDialog = new DialogBox(this, this.Config.secondpart, true, Anchor.Bottom, {
    //         fitContent: true,
    //         fontSize: 22,
    //         offsetY:-10
    //     });
    //     this.add.existing(this.StartDialog);
    //     // this.RadioSound.resume();
    // }
    private startNextScene(){
        console.log("in start next scene")
        this.scene.start('QuizzClara');
    }
}
