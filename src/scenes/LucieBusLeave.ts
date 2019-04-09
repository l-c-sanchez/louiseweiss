import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

enum SceneState {
    BusComing,
    LucieMoving,
    LucieMessage
};

export class LucieBusLeave extends Phaser.Scene {
	private Hud				: HudScene;
	private Config      	: any;
	private MessageDialog	: DialogBox = null;
	private TileMap			: Phaser.Tilemaps.Tilemap;
	private LucieSprite		: Phaser.Physics.Arcade.Sprite;
	private BusSprite		: Phaser.Physics.Arcade.Sprite;
	private BusCurrentIndex	: number;
    private BusTarget		: Phaser.Math.Vector2;
    private LucieTarget     : Phaser.Math.Vector2;
	private CurrentState	: SceneState;

    constructor() {
        super({ key: 'LucieBusLeave', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
        console.log("in create bus leave")
		var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');
		this.Config = games.BusOut[character];

		this.cameras.main.setBackgroundColor('#000000');
        this.TileMap = this.make.tilemap({ key: 'LeavingBus' });        
		var tiles = [
			this.TileMap.addTilesetImage('RoadTile', 'RoadTile')
		];
		this.TileMap.createStaticLayer('road', tiles, 0, 0);
        this.BusTarget = this.TileMap.tileToWorldXY(0, 8);
        this.BusSprite = this.physics.add.sprite(this.BusTarget.x , this.BusTarget.y, 'Bus');
        this.BusCurrentIndex = 0;
        this.CurrentState = SceneState.BusComing;
        
        var pos = this.Config.busPosList[this.BusCurrentIndex]

        this.BusTarget = this.TileMap.tileToWorldXY(pos.x, pos.y);
        this.physics.moveTo(this.BusSprite, this.BusTarget.x, this.BusTarget.y, 60);

        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers(character, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
	}

    update() {
		switch (this.CurrentState) {
			case SceneState.BusComing:
				this.updateBusComing();		
                break;
            case SceneState.LucieMoving:
                this.updateLucieMoving();                		
                break;
			default:
				break;
		}
    }

    // Called once bus has stopped
    private lucieComing() {
        var pos = this.Config.busPosList[this.BusCurrentIndex];
        var res = this.TileMap.tileToWorldXY(pos.x, pos.y + 1);
        this.LucieSprite = this.physics.add.sprite(this.BusTarget.x, res.y, this.Config.sprite_char);
        this.CurrentState = SceneState.LucieMoving;
        this.BusCurrentIndex++;
        this.time.addEvent({
            delay: 1000,
            callback: this.busLeaving,
            callbackScope: this
        });

        // Move Lucie down one case
        this.LucieTarget = new Phaser.Math.Vector2(this.LucieSprite.x, this.LucieSprite.y + 64);
        let lucieSpeed = 30;
        this.physics.moveTo(this.LucieSprite, this.LucieTarget.x, this.LucieTarget.y, lucieSpeed);
        this.LucieSprite.anims.play('down');
    }

    private busLeaving(){
        var pos = this.Config.busPosList[this.BusCurrentIndex]
        this.BusTarget = this.TileMap.tileToWorldXY(pos.x, pos.y);
        this.physics.moveTo(this.BusSprite, this.BusTarget.x, this.BusTarget.y, 60);
    }

    private updateBusComing() {
        if (Phaser.Math.Fuzzy.Equal(this.BusSprite.x, this.BusTarget.x, 0.5)
                && Phaser.Math.Fuzzy.Equal(this.BusSprite.y, this.BusTarget.y, 0.5)) {
            this.BusSprite.anims.stop();
            this.BusSprite.setVelocity(0, 0);
            this.lucieComing();
        }
	}
    
    private updateLucieMoving() {
        // Stopping once Lucie has reached her target
        if (Phaser.Math.Fuzzy.Equal(this.LucieSprite.x, this.LucieTarget.x, 0.5)
                && Phaser.Math.Fuzzy.Equal(this.LucieSprite.y, this.LucieTarget.y, 0.5)) {
            this.LucieSprite.setVelocity(0, 0);
            this.LucieSprite.anims.stop();

            // Lucie receives a message
            this.CurrentState = SceneState.LucieMessage;
            let ringtone = this.sound.add('ringtone', {volume: 1});
            ringtone.play();
            this.MessageDialog = new DialogBox(this, this.Config.message_received, true, Anchor.Bottom, {
                fitContent: true,
                fontSize: 22,
                offsetY:-120
            });

            this.time.addEvent({
                delay: 2000,
                callback: this.startConversation,
                callbackScope: this
            });
        }
    }

    private startConversation(): void {
        this.MessageDialog.destroy();

        // TODO: This should probably be defined elsewhere (some default values for conversations?)
        let messageOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xedecec,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 22
		};
        let answerOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0x1083ff,
			borderThickness: 0,
			fontSize: 22
		};
		let inputFieldOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xffffff,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 22
		};
		let buttonOptions: ButtonOptions = {
			borderColor: 0x1083ff
        };

        let dialogContent = this.cache.json.get('LucieBusLeaveConv');

        // Depending on the number of stars, Lucie has won or not and we change the conversation accordingly.
        if (this.hasWon()){
            dialogContent["Dialogs"]["start"]["linkedChoices"] = ['win'];
        } else {
            dialogContent["Dialogs"]["start"]["linkedChoices"] = ['lose'];
        }
        
        let dialogs = new DialogPhone(this, dialogContent, false, messageOptions, answerOptions,
			inputFieldOptions, buttonOptions);
		this.add.existing(dialogs);
		dialogs.on('destroy', () => {

            // TODO: start the right scene after that.
			this.scene.start("LucieFriends");
		});
    }

    private hasWon(): boolean {
        let starCount = this.registry.get('starCount');
        return starCount >= 7;
    }
}
