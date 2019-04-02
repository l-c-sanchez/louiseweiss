import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

enum SceneState {
	Idle,
	GoToBusStop,
	BusArriving,
	EnteringBus,
	BusLeaving
};

export class LucieBus extends Phaser.Scene {
	private Hud				: HudScene;
	private Config      	: any;
	private StartDialog		: DialogBox = null;
	private TileMap			: Phaser.Tilemaps.Tilemap;
	private Sprite			: Phaser.Physics.Arcade.Sprite;
	private CurrentIndex	: number;
	private Target			: Phaser.Math.Vector2;
	private CurrentState	: SceneState;
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
		this.Config = games.Bus[character];

		this.cameras.main.setBackgroundColor('#000000');

		this.TileMap = this.make.tilemap({ key: 'WaitingBus' });
		var tiles = [
			this.TileMap.addTilesetImage('RailwayStation', 'RailwayStation'), 
			this.TileMap.addTilesetImage('BlackTile', 'BlackTile'),
			this.TileMap.addTilesetImage('RoadTile', 'RoadTile')
		];
		this.TileMap.createStaticLayer('fond', tiles, 0, 0);
		this.TileMap.createStaticLayer('decor', tiles, 0, 0);

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
		this.CurrentState = SceneState.GoToBusStop;

		var pos = this.Config.posList[this.CurrentIndex];
		this.Target = this.TileMap.tileToWorldXY(pos.x, pos.y);
		// this.Target.x += this.TileMap.tileWidth / 2;
		// this.Target.y += this.TileMap.tileWidth / 2;

		this.Sprite = this.physics.add.sprite(this.Target.x , this.Target.y, this.Config.sprite_char);
		
        this.StartDialog = new DialogBox(this, this.Config.instruction1, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			offsetY:-120
		});
		this.add.existing(this.StartDialog);
	}

    update() {
		switch (this.CurrentState) {
			case SceneState.GoToBusStop:
				this.updateGoToBusStop();		
				break;
			default:
				break;
		}
	}

	private updateGoToBusStop() {
		if (Phaser.Math.Fuzzy.Equal(this.Sprite.x, this.Target.x, 0.5)
			&& Phaser.Math.Fuzzy.Equal(this.Sprite.y, this.Target.y, 0.5)) {
			this.CurrentIndex++;
			if (this.CurrentIndex < this.Config.posList.length) {
				var pos = this.Config.posList[this.CurrentIndex];
				var target = this.TileMap.tileToWorldXY(pos.x, pos.y);
				// target.x += this.TileMap.tileWidth / 2;
				// target.y += this.TileMap.tileWidth / 2;
				this.moveTo(target);
			}
			else  {
				this.Sprite.anims.stop();
				this.Sprite.setVelocity(0, 0);
			// 	this.time.addEvent({
			// 		delay: 2000,
			// 		callback: this.startInstruction2,
			// 		callbackScope: this
			// 	});
				this.CurrentState = SceneState.Idle;
			}
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

		this.physics.moveTo(this.Sprite, target.x, target.y,60);
		this.Target = target;
	}
}
