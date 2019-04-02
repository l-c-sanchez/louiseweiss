import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree } from "../utils/DialogTree";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";
import { KineticScrollSettings, KineticScroll } from "../utils/KineticScroll";

export class LucieConv extends Phaser.Scene {
	private Hud			 	: HudScene;
	private StartDialog	 	: DialogBox = null;
	private Dialogs		 	: DialogPhone;
	private Config       	: any;
	private Button 		 	: Phaser.GameObjects.Sprite;
	private Sprite			: Phaser.Physics.Arcade.Sprite;
	private TileMap!		: Phaser.Tilemaps.Tilemap;
	private CurrentIndex	: number;
	private Stop: Boolean = false;
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

	
		this.TileMap = this.make.tilemap({ key: 'LivingRoom' });
		var tiles = [this.TileMap.addTilesetImage('OfficeTileset', 'OfficeTileset'), 
					this.TileMap.addTilesetImage('BlackTile', 'BlackTile'),
					this.TileMap.addTilesetImage('OfficeTilesetBis', 'OfficeTilesetBis')];
		var fond = this.TileMap.createStaticLayer('fond', tiles, 0, 0);
		var office = this.TileMap.createStaticLayer('office', tiles, 0, 0);
		var tasseandmobile = this.TileMap.createStaticLayer('tasseandmobile', tiles, 0, 0);
		this.cameras.main.setBackgroundColor('#000000');
		var lucieAnims = ["", "left", "right", "up", "down" ];
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
        this.anims.create({
            key:"up",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"down",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
		});
		this.CurrentIndex = 0;
		var pos = this.TileMap.tileToWorldXY(8, 0);
		this.Sprite = this.physics.add.sprite(pos.x + this.TileMap.tileWidth / 2, pos.y + this.TileMap.tileWidth / 2, this.Config.sprite_char);
		
        this.StartDialog = new DialogBox(this, this.Config.instruction1, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		// this.Button = this.StartDialog.addArrowButton();
		this.add.existing(this.StartDialog);

		// pos = this.TileMap.tileToWorldXY(4, 7);
		// this.Button = this.StartDialog.addArrowButton();
		// this.Button.on('pointerup', () => {
		// 	if (this.StartDialog.isAnimationEnded()) {
		// 		this.startConv()
		// 	} else {
		// 		this.StartDialog.endAnimation();
		// 	}
		// }, this);
		// this.add.existing(this.StartDialog);
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
			
			this.scene.start('Facebook');
		});
    }

    update() {
		if (this.Stop == true)
			return
		var pos = this.Config.posList[this.CurrentIndex];
		var target = this.TileMap.tileToWorldXY(pos.x, pos.y);
		target.x += this.TileMap.tileWidth / 2;
		target.y += this.TileMap.tileWidth / 2;
		if (Phaser.Math.Fuzzy.Equal(this.Sprite.x, target.x, 0.5)
			&& Phaser.Math.Fuzzy.Equal(this.Sprite.y, target.y, 0.5)) {
				this.CurrentIndex++;
				if (this.CurrentIndex < this.Config.posList.length) {
					
					pos = this.Config.posList[this.CurrentIndex];
					var target2 = this.TileMap.tileToWorldXY(pos.x, pos.y);
					target2.x += this.TileMap.tileWidth / 2;
					target2.y += this.TileMap.tileWidth / 2;
					var direction_x = target.x - target2.x;
					var direction_y = target.y - target2.y;
					if (this.Sprite.anims.currentAnim !== this.anims.get('left') && direction_x < 0) {
						this.Sprite.anims.play('left', true);
					}
					else if (this.Sprite.anims.currentAnim !== this.anims.get('right') && direction_x >= 0) {
						this.Sprite.anims.play('right', true);
					}
					else if (this.Sprite.anims.currentAnim !== this.anims.get('up') && direction_y < 0) {
						this.Sprite.anims.play('up', true);
					}
					else if (this.Sprite.anims.currentAnim !== this.anims.get('down') && direction_y >= 0) {
						this.Sprite.anims.play('down', true);
					}

					this.physics.moveTo(this.Sprite, target2.x, target2.y,80);
				}
				else {
					this.Stop = true;
					this.Sprite.anims.stop();
					this.Sprite.setVelocity(0, 0);
					this.time.addEvent({
						delay: 500,
						callback: () => { 
							this.time.addEvent({
								delay: 500,
								callback: this.startInstruction2,
								callbackScope: this
							});
						},
						callbackScope: this
					});
				}
		}
		// this.physics.moveTo(sprite, pos.x + this.TileMap.tileWidth / 2, pos.y + this.TileMap.tileWidth / 2, 25);

		// // pos = this.TileMap.tileToWorldXY(4, 7);

	}
	startInstruction2() {

		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction2, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		
		this.Button = this.StartDialog.addArrowButton();
		this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startInstruction3()
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
		this.add.existing(this.StartDialog);
	}
	startInstruction3() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction3, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		
		this.Button = this.StartDialog.addArrowButton();
		this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startConv()
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
		this.add.existing(this.StartDialog);
	}
}
