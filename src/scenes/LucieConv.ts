import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

enum SceneState {
	Idle,
	GoToTable,
	GoToPhone,
	GetOutOfLivingRoom
};

export class LucieConv extends Phaser.Scene {

	private Hud			 	: HudScene;
	private StartDialog	 	: DialogBox = null;
	private Dialogs		 	: DialogPhone;
	private Config       	: any;
	private Button 		 	: Phaser.GameObjects.Sprite;
	private Sprite			: Phaser.Physics.Arcade.Sprite;
	private TileMap			: Phaser.Tilemaps.Tilemap;
	private CurrentIndex	: number;
	private Target			: Phaser.Math.Vector2;
	private CurrentState	: SceneState;
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'LucieConv', active: false });
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

		this.TileMap = this.make.tilemap({ key: 'LivingRoom' });
		var tiles = [
			this.TileMap.addTilesetImage('OfficeTileset', 'OfficeTileset'), 
			this.TileMap.addTilesetImage('BlackTile', 'BlackTile'),
			this.TileMap.addTilesetImage('OfficeTilesetBis', 'OfficeTilesetBis')
		];
		this.TileMap.createStaticLayer('fond', tiles, 0, 0);
		this.TileMap.createStaticLayer('office', tiles, 0, 0);
		this.TileMap.createStaticLayer('tasseandmobile', tiles, 0, 0);

        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"left",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
		});

		this.CurrentIndex = 0;
		this.CurrentState = SceneState.GoToTable;

		this.Target = this.TileMap.tileToWorldXY(8, 0);
		this.Target.x += this.TileMap.tileWidth / 2;
		this.Target.y += this.TileMap.tileWidth / 2;

		this.Sprite = this.physics.add.sprite(this.Target.x , this.Target.y, this.Config.sprite_char);
        this.StartDialog = new DialogBox(this, this.Config.instruction1, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		this.add.existing(this.StartDialog);
	}

	startConv() {
		this.TileMap.destroy();
		this.Sprite.destroy();
        let dialogContent = this.cache.json.get('LucieConv');
		this.cameras.main.setBackgroundColor("#ffffff"); 
		this.Button.off("pointerup");
		this.StartDialog.destroy();
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

		this.Dialogs = new DialogPhone(this, dialogContent, false, messageOptions, answerOptions,
			inputFieldOptions, buttonOptions);
		this.add.existing(this.Dialogs);
		this.Dialogs.on('destroy', () => {
			// this.Dialogs.destroy();
			this.LucieGetOut();
		});
    }

    update() {
		switch (this.CurrentState) {
			case SceneState.GoToTable:
				this.updateGoToTable();		
				break;
			case SceneState.GoToPhone:
				this.updateGoToPhone();
				break;
			case SceneState.GetOutOfLivingRoom:
				this.updateGetOutOfLivingRoom();
				break;
			default:
				break;
		}
	}

	private updateGoToTable() {
		if (Phaser.Math.Fuzzy.Equal(this.Sprite.x, this.Target.x, 0.5)
			&& Phaser.Math.Fuzzy.Equal(this.Sprite.y, this.Target.y, 0.5)) {
			this.CurrentIndex++;
			if (this.CurrentIndex < this.Config.posList.length) {
				var pos = this.Config.posList[this.CurrentIndex];
				var target = this.TileMap.tileToWorldXY(pos.x, pos.y);
				target.x += this.TileMap.tileWidth / 2;
				target.y += this.TileMap.tileWidth / 2;
				this.moveTo(target);
			}
			else  {
				this.Sprite.anims.stop();
				this.Sprite.setVelocity(0, 0);
				this.time.addEvent({
					delay: 2000,
					callback: this.startInstruction2,
					callbackScope: this
				});
				this.CurrentState = SceneState.Idle;
			}
		}

	
	}

	private updateGoToPhone() {
		if (Phaser.Math.Fuzzy.Equal(this.Sprite.x, this.Target.x, 0.5)
			&& Phaser.Math.Fuzzy.Equal(this.Sprite.y, this.Target.y, 0.5)) {
				this.Sprite.anims.stop();
				this.Sprite.setVelocity(0, 0);
				this.time.addEvent({
					delay: 500,
					callback: this.startInstruction3,
					callbackScope: this
				});
				this.CurrentState = SceneState.Idle;
		}
	}

	private updateGetOutOfLivingRoom() {
		console.log("here");
		console.log(this.Sprite.y,  this.Target.y)
		if (Phaser.Math.Fuzzy.Equal(this.Sprite.x, this.Target.x, 0.5)
			&& Phaser.Math.Fuzzy.Equal(this.Sprite.y, this.Target.y, 0.5)) {
			this.Target = this.TileMap.tileToWorldXY(8, 0);
			this.Target.x += this.TileMap.tileWidth / 2;
			this.Target.y += this.TileMap.tileWidth / 2;
			this.moveTo(this.Target);
		}

		if (Phaser.Math.Fuzzy.Equal(this.Sprite.y, 0, 0.5)) {
			this.Sprite.anims.stop();
			this.Sprite.setVelocity(0, 0);	
			this.Sprite.destroy();
			this.scene.start('LucieBus');	

		}
	
	}

	private moveTo(target: Phaser.Math.Vector2) {
		var direction_x = this.Sprite.x - target.x;

		if (this.Sprite.anims.currentAnim !== this.anims.get('right') && direction_x < 0) {
			this.Sprite.anims.play('right', true);
		}
		else if (this.Sprite.anims.currentAnim !== this.anims.get('left') && direction_x >= 0) {
			this.Sprite.anims.play('left', true);
		}

		// this.physics.moveTo(this.Sprite, target.x, target.y,60);
		this.physics.moveTo(this.Sprite, target.x, target.y,60);
		this.Target = target;
	}

	private startInstruction2() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction2, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});

		this.time.addEvent({
			delay: 1000,
			callback: () => {

				var target = this.TileMap.tileToWorldXY(5, 8);
				target.x += this.TileMap.tileWidth / 2;
				target.y += this.TileMap.tileWidth / 2;

				this.moveTo(target);
				this.CurrentState = SceneState.GoToPhone;
			},
			callbackScope: this
		});
	}

	private startInstruction3() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction3, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		this.add.existing(this.StartDialog);
		this.Button = this.StartDialog.addArrowButton();
		this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.StartDialog.destroy();
				this.startConv()
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);

	}

	private startEnd() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.end, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		this.add.existing(this.StartDialog);
		this.time.addEvent({
			delay: 1000,
			callback: () => {
				this.Target = this.TileMap.tileToWorldXY(8, 7);
				this.Target.x += this.TileMap.tileWidth / 2;
				this.Target.y += this.TileMap.tileWidth / 2;
				this.moveTo(this.Target);
				this.CurrentState = SceneState.GetOutOfLivingRoom;
			},
			callbackScope: this
		});
	}

	private LucieGetOut() {
		this.cameras.main.setBackgroundColor('#000000');

		this.TileMap = this.make.tilemap({ key: 'LivingRoom' });
		var tiles = [
			this.TileMap.addTilesetImage('OfficeTileset', 'OfficeTileset'), 
			this.TileMap.addTilesetImage('BlackTile', 'BlackTile'),
			this.TileMap.addTilesetImage('OfficeTilesetBis', 'OfficeTilesetBis')
		];
		this.TileMap.createStaticLayer('fond', tiles, 0, 0);
		this.TileMap.createStaticLayer('office', tiles, 0, 0);
		this.TileMap.createStaticLayer('tasseandmobile', tiles, 0, 0);

        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"left",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
		});

		this.CurrentIndex = 0;
		this.CurrentState = SceneState.GetOutOfLivingRoom;

		this.Target = this.TileMap.tileToWorldXY(5, 8);
		this.Target.x += this.TileMap.tileWidth / 2;
		this.Target.y += this.TileMap.tileWidth / 2;

		this.Sprite = this.physics.add.sprite(this.Target.x , this.Target.y, this.Config.sprite_char);
		this.time.addEvent({
			delay: 500,
			callback: this.startEnd,
			callbackScope: this
		});
		// this.scene.start('LucieBus');
	}
}
