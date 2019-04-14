import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogTree, DialogTreeObj } from "../utils/DialogTree";
import { Anchor, DialogOptions, ButtonOptions, DialogBox } from "../utils/DialogBox";
import { DialogPhone } from "../utils/DialogPhone";
import { ValentinCar } from "./ValentinCar";

enum SceneState {
	Idle,
	Moving
};

export class ValentinQuizz extends Phaser.Scene {
	private Hud			: HudScene;
	private Quizz		: DialogTree;
    private Config		: any;

	private TileMap			: Phaser.Tilemaps.Tilemap;
	private ValentinSprite	: Phaser.Physics.Arcade.Sprite;
	private Target			: Phaser.Math.Vector2;
	private CurrentState	: SceneState;
	private EndMoveCallback	: any;


    constructor() {
        super({ key: 'ValentinQuizz', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
        let character: string = this.registry.get('character');
        let games = this.cache.json.get('Games');
		this.Config = games.Quizz[character];
        if (!this.Config){
            throw new TypeError("Invalid config");
		}
		
		this.cameras.main.setBackgroundColor('#000000');

		this.TileMap = this.make.tilemap({ key: 'PatientHouse1' });
		var tiles = [
			this.TileMap.addTilesetImage('Interiors', 'Interiors'), 
			this.TileMap.addTilesetImage('house', 'house')
		];
		this.TileMap.createStaticLayer('background', tiles, 0, 0);
		this.TileMap.createStaticLayer('objects1', tiles, 0, 0);
		this.TileMap.createStaticLayer('objects2', tiles, 0, 0);

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

		var pos = this.TileMap.tileToWorldXY(4, 10);
		pos.x += this.TileMap.tileWidth / 2;
		pos.y += this.TileMap.tileWidth / 2;
		this.physics.add.sprite(pos.x , pos.y, 'Mamie');

		pos = this.TileMap.tileToWorldXY(5, 11);
		pos.x += this.TileMap.tileWidth / 2;
		pos.y += this.TileMap.tileWidth / 2;
		var papi = this.physics.add.sprite(pos.x , pos.y, 'Papi');
		papi.setFlipX(true);

		pos = this.TileMap.tileToWorldXY(4, 14);
		pos.x += this.TileMap.tileWidth / 2;
		pos.y += this.TileMap.tileWidth / 2;
		this.ValentinSprite = this.physics.add.sprite(pos.x , pos.y, this.Config.sprite_char);

		this.CurrentState = SceneState.Moving;

		this.Target = this.TileMap.tileToWorldXY(4, 12);
		this.Target.x += this.TileMap.tileWidth / 2;
		this.Target.y += this.TileMap.tileWidth / 2;
		this.moveValentin(this.Target);
		this.EndMoveCallback = this.startQuizz;

	}
	
	private startQuizz() {
        let character: string = this.registry.get('character');
        let games = this.cache.json.get('Games');
		this.Config = games.Conv[character];
		console.log(character, games, this.Config);
        if (!this.Config){
            throw new TypeError("Invalid config");
        }

		let quizzContent = this.cache.json.get('ValentinQuizz');

		this.Quizz = new DialogTree(this, quizzContent, true, Anchor.Bottom, { fitContent: true });

		this.add.existing(this.Quizz);
		this.Quizz.on('destroy', () => {
			this.Target = this.TileMap.tileToWorldXY(4, 14);
			this.Target.x += this.TileMap.tileWidth / 2;
			this.Target.y += this.TileMap.tileWidth / 2;
			this.moveValentin(this.Target);
			this.CurrentState = SceneState.Moving;
			this.EndMoveCallback = () => { this.scene.start('ValentinCar') };
		}, this);
	}

    update() {
		switch (this.CurrentState) {
			case SceneState.Moving:
				this.updateMove();		
				break;
			default:
				break;
		}
	}
	
	private updateMove() {
		if (Phaser.Math.Fuzzy.Equal(this.ValentinSprite.x, this.Target.x, 0.5)
			&& Phaser.Math.Fuzzy.Equal(this.ValentinSprite.y, this.Target.y, 0.5)) {
				this.ValentinSprite.anims.pause();
				this.ValentinSprite.setVelocity(0, 0);
				this.CurrentState = SceneState.Idle;
				this.EndMoveCallback();
		}
	}

	private moveValentin(target: Phaser.Math.Vector2) {
		var direction_x = this.ValentinSprite.x - target.x;

		if (!this.ValentinSprite.anims.isPlaying
			|| (this.ValentinSprite.anims.currentAnim !== this.anims.get('right') && direction_x < 0)) {
			this.ValentinSprite.anims.play('right', true);
		}
		else if (!this.ValentinSprite.anims.isPlaying
			|| (this.ValentinSprite.anims.currentAnim !== this.anims.get('left') && direction_x >= 0)) {
			this.ValentinSprite.anims.play('left', true);
		}

		this.physics.moveTo(this.ValentinSprite, target.x, target.y,60);
		this.Target = target;
	}
}
