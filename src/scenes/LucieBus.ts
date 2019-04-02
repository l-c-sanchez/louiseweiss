import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

export class LucieBus extends Phaser.Scene {
	private Hud			: HudScene;
	private Config      : any;
	private StartDialog	: DialogBox = null;
	private TileMap		: Phaser.Tilemaps.Tilemap;
	private Sprite		: Phaser.Physics.Arcade.Sprite;
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'LucieBus', active: false });
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

		this.TileMap = this.make.tilemap({ key: 'WaitingBus' });
		var tiles = [this.TileMap.addTilesetImage('RailwayStation', 'RailwayStation'), 
					this.TileMap.addTilesetImage('BlackTile', 'BlackTile'),
					this.TileMap.addTilesetImage('RoadTile', 'RoadTile')];
		var fond = this.TileMap.createStaticLayer('fond', tiles, 0, 0);
		var office = this.TileMap.createStaticLayer('decor', tiles, 0, 0);
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
		// this.CurrentIndex = 0;
		var pos = this.TileMap.tileToWorldXY(8, 0);
		this.Sprite = this.physics.add.sprite(pos.x + this.TileMap.tileWidth / 2, pos.y + this.TileMap.tileWidth / 2, this.Config.sprite_char);
		
        this.StartDialog = new DialogBox(this, this.Config.instruction1, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		// this.Button = this.StartDialog.addArrowButton();
		this.add.existing(this.StartDialog);
	}

    update() {

    }
}
