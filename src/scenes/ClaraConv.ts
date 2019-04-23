import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";
import { Config } from "../Config";

export class ClaraConv extends Phaser.Scene {
	private Hud			 : HudScene;
	private StartDialog	 : DialogBox = null;
	private Dialogs		 : DialogPhone;
	private Config       : any;
	private Button 		 : Phaser.GameObjects.Sprite
	private ClaraSprite	: Phaser.Physics.Arcade.Sprite;
	private TileMap			: Phaser.Tilemaps.Tilemap;
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'ClaraConv', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
		var character: string = this.registry.get('character');
		
		var games = this.cache.json.get('Games');
		this.Config = games.Conv[character];

		this.cameras.main.setBackgroundColor('#000000');
		this.TileMap = this.make.tilemap({ key: 'ClaraPacmanMap' });
        var tiles = this.TileMap.addTilesetImage('OfficeTileset', 'OfficeTileset');
		var layer = this.TileMap.createStaticLayer('layer0', tiles, 0, 0);
		var res = this.TileMap.tileToWorldXY(this.Config.posList[0].x, this.Config.posList[0].y);

		this.ClaraSprite = this.physics.add.sprite(res.x , res.y, this.Config.sprite_char);
		var claraAnims = ["", "left", "right", "up", "down" ];
		var target = this.TileMap.tileToWorldXY(this.Config.posList[1].x, this.Config.posList[1].y);
		this.physics.moveTo(this.ClaraSprite, target.x, target.y, 40);
		
		this.anims.remove('right');
        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
		this.ClaraSprite.anims.play('right');

		
		this.StartDialog = new DialogBox(this, this.Config.instruction, true, Anchor.Center, { fitContent:true, fontSize: 22 });
		this.time.addEvent({
			delay: 4000,
			callback: this.startPhone,
			callbackScope: this
		});


      
	}
	startPhone() {
		this.StartDialog.destroy();
		this.ClaraSprite.anims.stop();
		this.ClaraSprite.setVelocity(0, 0);
		let ringtone = this.sound.add('ringtone', {volume: 1});
		ringtone.play();
		this.StartDialog = new DialogBox(this, this.Config.message_received_ring, true, Anchor.Center, {
			fitContent: true,
			fontSize: 22
		});
		this.Button = this.StartDialog.addArrowButton(); 
        this.Button.on('pointerup', () => {
            if (this.StartDialog.isAnimationEnded()) {
				this.startMessage();
            } else {
                this.StartDialog.endAnimation();
            }
        });
        this.add.existing(this.StartDialog);
	
	}
	startMessage(){
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.message_received, true, Anchor.Center, { fitContent:true, fontSize: 22 });
        this.Button = this.StartDialog.addArrowButton(); 
        this.Button.on('pointerup', () => {
            if (this.StartDialog.isAnimationEnded()) {
				this.startConv();
            } else {
                this.StartDialog.endAnimation();
            }
        });
		this.add.existing(this.StartDialog);
	
	}

	startConv() {
		this.StartDialog.destroy();
		this.TileMap.destroy();
		this.ClaraSprite.destroy();
		let dialogContent = this.cache.json.get('ClaraConv');
		this.cameras.main.setBackgroundColor("#ffffff"); 
		this.Button.off("pointerup");
		this.StartDialog.destroy();

		// TODO: We should define some global default settings for all conversations.
		let messageOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xedecec,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 20,
			padding: 10
		};
		let answerOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0x1083ff,
			borderThickness: 0,
			fontSize: 20,
			padding: 10
		};
		let inputFieldOptions: DialogOptions = {
			fitContent: true,
			windowColor: 0xffffff,
			textColor: "#000000",
			borderThickness: 0,
			fontSize: 20,
			padding: 0,
		}
		let buttonOptions: ButtonOptions = {
			borderColor: 0x1083ff
		}

		this.StartDialog.destroy();
		this.cameras.main.setBackgroundColor("#ffffff"); 
		this.Dialogs = new DialogPhone(this, dialogContent, false, messageOptions, answerOptions,
			inputFieldOptions, buttonOptions);
		this.add.existing(this.Dialogs);
		this.Dialogs.on('destroy', () => {
			console.log('destroyed, let s start pacman');
			this.scene.start('Pacman');
		});
    }

    update() {

    }
}
