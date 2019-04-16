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

export class ValentinConv extends Phaser.Scene {
	private Hud			: HudScene;
	private Quizz		: DialogTree;
    private Config		: any;

	private TileMap			: Phaser.Tilemaps.Tilemap;
	private ValentinSprite	: Phaser.Physics.Arcade.Sprite;
	private Target			: Phaser.Math.Vector2;
	private CurrentState	: SceneState;
	private EndMoveCallback	: any;
	private StartDialog		: DialogBox = null;
	private StarsBefore		: number;

    constructor() {
        super({ key: 'ValentinConv', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
        let character: string = this.registry.get('character');
        let games = this.cache.json.get('Games');
		this.Config = games.Conv[character];
        if (!this.Config){
            throw new TypeError("Invalid config");
		}
		
		this.cameras.main.setBackgroundColor('#000000');

		this.TileMap = this.make.tilemap({ key: 'PatientHouse2' });
		var tiles = [
			this.TileMap.addTilesetImage('Interiors', 'Interiors'), 
			this.TileMap.addTilesetImage('house', 'house')
		];
		this.TileMap.createStaticLayer('background', tiles, 0, 0);
		this.TileMap.createStaticLayer('objects1', tiles, 0, 0);
		this.TileMap.createStaticLayer('objects2', tiles, 0, 0);

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

		var pos = this.TileMap.tileToWorldXY(8, 9);
		pos.x += this.TileMap.tileWidth / 2;
		pos.y += this.TileMap.tileWidth / 2;
		var mamie = this.physics.add.sprite(pos.x , pos.y, 'Mamie');
		mamie.setFlipX(true);

		pos = this.TileMap.tileToWorldXY(7, 8);
		pos.x += this.TileMap.tileWidth / 2;
		pos.y += this.TileMap.tileWidth / 2;
		var papi = this.physics.add.sprite(pos.x , pos.y, 'Papi');

		pos = this.TileMap.tileToWorldXY(3, 9);
		pos.x += this.TileMap.tileWidth / 2;
		pos.y += this.TileMap.tileWidth / 2;
		this.ValentinSprite = this.physics.add.sprite(pos.x , pos.y, this.Config.sprite_char);

		this.CurrentState = SceneState.Moving;

		this.Target = this.TileMap.tileToWorldXY(6, 9);
		this.Target.x += this.TileMap.tileWidth / 2;
		this.Target.y += this.TileMap.tileWidth / 2;
		this.moveValentin(this.Target);
		this.EndMoveCallback = this.startGameInstructions;

	}
	
	private startGameInstructions() {
		this.StartDialog = new DialogBox(this, this.Config.instruction, true, Anchor.Center, {
			fitContent: true,
			fontSize: 22,
			// offsetY:-120
		});

		this.add.existing(this.StartDialog);
		let button = this.StartDialog.addArrowButton();
		button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startConv();
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
	}

	private startConv() {
		this.StartDialog.destroy();
        let character: string = this.registry.get('character');
        let games = this.cache.json.get('Games');
		this.Config = games.Conv[character];
		console.log(character, games, this.Config);
        if (!this.Config){
            throw new TypeError("Invalid config");
        }

		let quizzContent = this.cache.json.get('ValentinConv');

		this.Quizz = new DialogTree(this, quizzContent, true, Anchor.Bottom, { fitContent: true });

		this.add.existing(this.Quizz);
		this.Quizz.on('destroy', () => {
			this.showResultDialog();
		}, this);
	}

	private showResultDialog() {
		let starsAfter = this.getStarCount();
		let convContent: DialogTreeObj = null;
		if (starsAfter - this.StarsBefore >= 4) {
			convContent = this.cache.json.get('ValentinEndConvFailure');
		} else {
			convContent = this.cache.json.get('ValentinEndConvSuccess');
		}
		this.Quizz = new DialogTree(this, convContent, false, Anchor.Bottom, { fitContent: true });
		this.add.existing(this.Quizz);
		this.Quizz.on('destroy', () => {
			this.scene.start('ResultScene');
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
				this.time.addEvent({
					delay: 1000,
					callback: this.EndMoveCallback,
					callbackScope: this
				});
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

	private getStarCount(): number {
		if (this.registry.has('starCount')) {
			return (this.registry.get('starCount'));
		} else {
			console.warn("The starCount value should be initialized in the registry before this call.");
			return (0);
		}
	}
}
