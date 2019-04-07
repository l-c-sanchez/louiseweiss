import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";

export class LucieFriends extends Phaser.Scene {
	private Hud				: HudScene;
	private Config      	: any;
	private StartDialog		: DialogBox = null;
	private TileMap			: Phaser.Tilemaps.Tilemap;
	private LucieSprite		: Phaser.Physics.Arcade.Sprite;
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'LucieFriends', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
		var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');
		this.Config = games.CarGame[character];

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
		
		var pos = this.TileMap.tileToWorldXY(5, 8);
		pos.x += this.TileMap.tileWidth / 2;
		pos.y += this.TileMap.tileWidth / 2;
		this.LucieSprite = this.physics.add.sprite(pos.x , pos.y, this.Config.sprite_char);

        this.StartDialog = new DialogBox(this, this.Config.instruction1, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		this.add.existing(this.StartDialog);

		this.time.addEvent({
			delay: 2000,
			callback: this.startInstruction2,
			callbackScope: this
		});
	}

    update() {

	}

	private startInstruction2() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction2, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});

		var arrow = this.StartDialog.addArrowButton();
		arrow.addListener('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.StartDialog.destroy();
				this.startInstruction3()
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
		this.add.existing(this.StartDialog);
	}

	private startInstruction3() {
		this.time.addEvent({
			delay: 1000,
			callback: () => {
				this.StartDialog.destroy();
				this.StartDialog = new DialogBox(this, this.Config.instruction3, true, Anchor.Bottom, {
					fitContent: true,
					fontSize: 22,
					offsetY:-120
				});
				this.add.existing(this.StartDialog);
		
				this.time.addEvent({
					delay: 2000,
					callback: this.startInstruction4,
					callbackScope: this
				});
			},
			callbackScope: this
		});
	}

	private startInstruction4() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction4, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});

		var arrow = this.StartDialog.addArrowButton();
		arrow.addListener('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.scene.start("CarGame");
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
		this.add.existing(this.StartDialog);
	}
}
