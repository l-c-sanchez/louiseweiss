import { HudScene } from "./HudScene";
import {  DialogBox, Anchor, DialogOptions, ButtonOptions } from "../utils/DialogBox";

enum SceneState {
	Idle,
	CarArriving,
	GoToHouse
};

export class PatientStreet extends Phaser.Scene {
	private Hud				: HudScene;
	private Config      	: any;
	private TileMap			: Phaser.Tilemaps.Tilemap;
	private ValentinSprite	: Phaser.Physics.Arcade.Sprite;
	private CarSprite		: Phaser.Physics.Arcade.Sprite;
	private CurrentIndex	: number;
	private Target			: Phaser.Math.Vector2;
	private CarTarget		: Phaser.Math.Vector2;
	private CurrentState	: SceneState;

    constructor() {
        super({ key: 'PatientStreet', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
		var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');
		this.Config = games.PatientStreet[character];

		this.cameras.main.setBackgroundColor('#000000');

		this.TileMap = this.make.tilemap({ key: 'PatientStreet' });
		var tiles = [
			this.TileMap.addTilesetImage('CountryTiles', 'CountryTiles'), 
			this.TileMap.addTilesetImage('house', 'house')
		];
		this.TileMap.createStaticLayer('background', tiles, 0, 0);
		this.TileMap.createStaticLayer('house', tiles, 0, 0);
		this.TileMap.createStaticLayer('foreground', tiles, 0, 0);

		this.anims.remove('right');
		this.anims.remove('left');
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
		this.CurrentState = SceneState.CarArriving;

		var pos = this.Config.posList[this.CurrentIndex];
		this.Target = this.TileMap.tileToWorldXY(pos.x, pos.y);
		this.Target.x += this.TileMap.tileWidth / 2;
		this.Target.y += this.TileMap.tileWidth / 2;
		this.ValentinSprite = this.physics.add.sprite(this.Target.x , this.Target.y, this.Config.sprite_char);
		this.ValentinSprite.setAlpha(0);

		this.CarTarget = this.TileMap.tileToWorldXY(3, 20);
		this.CarSprite = this.physics.add.sprite(this.CarTarget.x , this.CarTarget.y, 'voiture64');	
		this.CarSprite.setOrigin(0.5, 0.25);
		this.CarTarget = this.TileMap.tileToWorldXY(3, 11);
		this.moveCar(this.CarTarget);
	}

    update() {
		switch (this.CurrentState) {
			case SceneState.CarArriving:
				this.updateCarArriving();		
				break;
			case SceneState.GoToHouse:
				this.updateGoToHouse();
				break;
			default:
				break;
		}
	}

	private updateCarArriving() {
		if (Phaser.Math.Fuzzy.Equal(this.CarSprite.x, this.CarTarget.x, 2)
			&& Phaser.Math.Fuzzy.Equal(this.CarSprite.y, this.CarTarget.y, 2)) {
			this.CarSprite.setVelocity(0, 0);
			this.time.addEvent({
				delay: 500,
				callback: () => {
					this.ValentinSprite.setAlpha(1);
					this.CurrentState = SceneState.GoToHouse;
				},
				callbackScope: this
			});
		}
	}

	private updateGoToHouse() {
		if (Phaser.Math.Fuzzy.Equal(this.ValentinSprite.x, this.Target.x, 0.5)
			&& Phaser.Math.Fuzzy.Equal(this.ValentinSprite.y, this.Target.y, 0.5)) {
			this.CurrentIndex++;
			if (this.CurrentIndex < this.Config.posList.length) {
				var pos = this.Config.posList[this.CurrentIndex];
				var target = this.TileMap.tileToWorldXY(pos.x, pos.y);
				target.x += this.TileMap.tileWidth / 2;
				target.y += this.TileMap.tileWidth / 2;
				this.moveValentin(target);
			}
			else {
				this.ValentinSprite.anims.stop();
				this.ValentinSprite.setVelocity(0, 0);
				this.CurrentState = SceneState.Idle;

				this.scene.start('ValentinQuizz');
			}
		}
	}

	private moveValentin(target: Phaser.Math.Vector2) {
		var direction_x = this.ValentinSprite.x - target.x;

		if (this.ValentinSprite.anims.currentAnim !== this.anims.get('right') && direction_x < 0) {
			this.ValentinSprite.anims.play('right', true);
		}
		else if (this.ValentinSprite.anims.currentAnim !== this.anims.get('left') && direction_x >= 0) {
			this.ValentinSprite.anims.play('left', true);
		}

		this.physics.moveTo(this.ValentinSprite, target.x, target.y,60);
		this.Target = target;
	}

	private moveCar(target: Phaser.Math.Vector2) {
		this.physics.moveTo(this.CarSprite, target.x, target.y,120);
		this.CarTarget = target;
	}
}
