import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";

enum SceneState {
    BusComing,
    BusLeaving,
    test
};

export class LucieBusLeave extends Phaser.Scene {
	private Hud				: HudScene;
	private Config      	: any;
	private StartDialog		: DialogBox = null;
	private TileMap			: Phaser.Tilemaps.Tilemap;
	private LucieSprite		: Phaser.Physics.Arcade.Sprite;
	private BusSprite		: Phaser.Physics.Arcade.Sprite;
	private CurrentIndex	: number;
	private BusCurrentIndex	: number;
	private Target			: Phaser.Math.Vector2;
	private BusTarget		: Phaser.Math.Vector2;
	private CurrentState	: SceneState;
	// private Dialogs	: DialogTree;

    constructor() {
        super({ key: 'LucieBusLeave', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
		var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');
		this.Config = games.BusOut[character];

		this.cameras.main.setBackgroundColor('#000000');

        this.TileMap = this.make.tilemap({ key: 'LeavingBus' });
        
        			// this.TileMap.addTilesetImage('RailwayStation', 'RailwayStation'), 
			// this.TileMap.addTilesetImage('BlackTile', 'BlackTile'),
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
        // this.anims.create({
        //     key:"right",
        //     frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 1, end:6 }),
        //     frameRate: 10,
        //     repeat: -1
        // });
        // this.anims.create({
        //     key:"left",
        //     frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 7, end:13 }),
        //     frameRate: 10,
        //     repeat: -1
        // });

		// this.CurrentIndex = 0;
		// this.BusCurrentIndex = 0;
		// this.CurrentState = SceneState.BusComing;

		// var pos = this.Config.posList[this.CurrentIndex];
		// this.Target = this.TileMap.tileToWorldXY(pos.x, pos.y);
		// this.Target.x += this.TileMap.tileWidth / 2;
		// this.Target.y += this.TileMap.tileWidth / 2;
		// this.LucieSprite = this.physics.add.sprite(this.Target.x , this.Target.y, this.Config.sprite_char);

		// pos = this.Config.busPosList[this.BusCurrentIndex];
		// this.BusTarget = this.TileMap.tileToWorldXY(pos.x, pos.y);
		// this.BusSprite = this.physics.add.sprite(this.BusTarget.x , this.BusTarget.y, 'Bus');		

        // this.StartDialog = new DialogBox(this, this.Config.instruction1, true, Anchor.Bottom, {
		// 	fitContent: true,
		// 	fontSize: 22,
		// 	offsetY:-120
		// });
		// this.add.existing(this.StartDialog);
	}

    update() {
		switch (this.CurrentState) {
			case SceneState.BusComing:
				this.updateBusComing();		
                break;
            case SceneState.BusLeaving:
				this.updateBusLeaving();		
				break;
			default:
				break;
		}
    }

    lucieComing() {
        var pos = this.Config.busPosList[this.BusCurrentIndex];
        var res = this.TileMap.tileToWorldXY(pos.x, pos.y + 1);
        this.LucieSprite = this.physics.add.sprite(this.BusTarget.x, res.y, this.Config.sprite_char);
        this.CurrentState = SceneState.BusLeaving;
        this.BusCurrentIndex++;
        this.time.addEvent({
            delay: 1000,
            callback: this.busLeaving,
            callbackScope: this
        });
    }

    busLeaving(){
        var pos = this.Config.busPosList[this.BusCurrentIndex]
        this.BusTarget = this.TileMap.tileToWorldXY(pos.x, pos.y);
        this.physics.moveTo(this.BusSprite, this.BusTarget.x, this.BusTarget.y, 60);
    }

    
    
    private updateBusComing() {
        console.log("here");
        if (Phaser.Math.Fuzzy.Equal(this.BusSprite.x, this.BusTarget.x, 0.5)
        			&& Phaser.Math.Fuzzy.Equal(this.BusSprite.y, this.BusTarget.y, 0.5)) {
                this.BusSprite.anims.stop();
                this.BusSprite.setVelocity(0, 0);
                this.lucieComing();
        }
	}

	private updateBusLeaving() {
        console.log("Bus Leaving")
        if (Phaser.Math.Fuzzy.Equal(this.BusSprite.x, this.BusTarget.x, 0.5)
        			&& Phaser.Math.Fuzzy.Equal(this.BusSprite.y, this.BusTarget.y, 0.5)) {
            console.log("here");
        }
	}

// 	private updateGoToBusStop() {
// 		if (Phaser.Math.Fuzzy.Equal(this.LucieSprite.x, this.Target.x, 0.5)
// 			&& Phaser.Math.Fuzzy.Equal(this.LucieSprite.y, this.Target.y, 0.5)) {
// 			this.CurrentIndex++;
// 			if (this.CurrentIndex < this.Config.posList.length) {
// 				var pos = this.Config.posList[this.CurrentIndex];
// 				var target = this.TileMap.tileToWorldXY(pos.x, pos.y);
// 				// target.x += this.TileMap.tileWidth / 2;
// 				// target.y += this.TileMap.tileWidth / 2;
// 				this.moveLucie(target);
// 			}
// 			else  {
// 				this.LucieSprite.anims.stop();
// 				this.LucieSprite.setVelocity(0, 0);
// 				this.startInstruction2();
// 			}
// 		}
// 	}

// 	private updateBusArriving() {
// 		if (Phaser.Math.Fuzzy.Equal(this.BusSprite.x, this.BusTarget.x, 0.5)
// 			&& Phaser.Math.Fuzzy.Equal(this.BusSprite.y, this.BusTarget.y, 0.5)) {
// 			this.BusCurrentIndex++;
// 			if (this.BusCurrentIndex < this.Config.busPosList.length) {
// 				var pos = this.Config.busPosList[this.BusCurrentIndex];
// 				var target = this.TileMap.tileToWorldXY(pos.x, pos.y);
// 				// target.x += this.TileMap.tileWidth / 2;
// 				// target.y += this.TileMap.tileWidth / 2;
// 				this.moveBus(target);
// 			}
// 			else  {
// 				// this.LucieSprite.anims.stop();
// 				this.BusSprite.setVelocity(0, 0);
// 				this.time.addEvent({
// 					delay: 2000,
// 					callback: this.startInstruction3,
// 					callbackScope: this
// 				});
// 				this.CurrentState = SceneState.Idle;
// 			}
// 		}
// 	}

// 	private startInstruction2() {
// 		this.StartDialog.destroy();
// 		this.StartDialog = new DialogBox(this, this.Config.instruction2, true, Anchor.Bottom, {
// 			fitContent: true,
// 			fontSize: 22,
// 			offsetY:-120
// 		});

// 		this.CurrentState = SceneState.BusArriving;
// 	}

// 	private startInstruction3() {
// 		this.StartDialog.destroy();
// 		this.StartDialog = new DialogBox(this, this.Config.instruction3, true, Anchor.Bottom, {
// 			fitContent: true,
// 			fontSize: 22,
// 			offsetY:-120
// 		});

// 		this.time.addEvent({
// 			delay: 1000,
// 			callback: () => {
// 				this.BusTarget = this.TileMap.tileToWorldXY(13, 4);
// 				this.moveBus(this.BusTarget);
// 				this.LucieSprite.destroy();
// 				this.CurrentState = SceneState.BusLeaving;
// 			},
// 			callbackScope: this
// 		});
// 	}

// 	private moveLucie(target: Phaser.Math.Vector2) {
// 		var direction_x = this.LucieSprite.x - target.x;

// 		if (this.LucieSprite.anims.currentAnim !== this.anims.get('right') && direction_x < 0) {
// 			this.LucieSprite.anims.play('right', true);
// 		}
// 		else if (this.LucieSprite.anims.currentAnim !== this.anims.get('left') && direction_x >= 0) {
// 			this.LucieSprite.anims.play('left', true);
// 		}

// 		this.physics.moveTo(this.LucieSprite, target.x, target.y,60);
// 		this.Target = target;
// 	}

// 	private moveBus(target: Phaser.Math.Vector2) {
// 		this.physics.moveTo(this.BusSprite, target.x, target.y,60);
// 		this.BusTarget = target;
// 	}
}
