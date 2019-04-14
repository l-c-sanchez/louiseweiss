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

export class ValentinWhoSaid extends Phaser.Scene {
	private Hud			: HudScene;
	private Quizz		: DialogTree;
    private Config		: any;

	private TileMap			: Phaser.Tilemaps.Tilemap;
	private ValentinSprite	: Phaser.Physics.Arcade.Sprite;
	private Target			: Phaser.Math.Vector2;
	private CurrentState	: SceneState;
	private EndMoveCallback	: any;
	private CurrentIndex	: number;
	private StartDialog		: DialogBox = null;
	private StarsBefore		: number;

    constructor() {
        super({ key: 'ValentinWhoSaid', active: false });
    }

    init() {
		this.Hud = <HudScene>this.scene.get("HudScene");
	}

	preload() {

	}

	create() {
        let character: string = this.registry.get('character');
        let games = this.cache.json.get('Games');
		this.Config = games.WhoSaid[character];
        if (!this.Config){
            throw new TypeError("Invalid config");
		}
		
		this.cameras.main.setBackgroundColor('#000000');

		this.TileMap = this.make.tilemap({ key: 'ValentinHouse' });
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

		this.CurrentIndex = 0;
	
		var pos = this.Config.posList[this.CurrentIndex];
		this.Target = this.TileMap.tileToWorldXY(pos.x, pos.y);
		this.Target.x += this.TileMap.tileWidth / 2;
		this.Target.y += this.TileMap.tileWidth / 2;
		this.ValentinSprite = this.physics.add.sprite(this.Target.x , this.Target.y, this.Config.sprite_char);

		this.CurrentState = SceneState.Moving;
		this.EndMoveCallback = this.startInstruction2;

        this.StartDialog = new DialogBox(this, this.Config.instruction1, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			// offsetY:-120
		});
		this.add.existing(this.StartDialog);

	}
	
	private startQuizz() {
		this.StartDialog.destroy();

		this.StarsBefore = this.getStarCount();

		let quizzContent = this.cache.json.get('ValentinWhoSaid');
		this.Quizz = new DialogTree(this, quizzContent, true, Anchor.Bottom, { fitContent: true });

		this.add.existing(this.Quizz);
		this.Quizz.on('destroy', () => {
			this.showResultDialog();
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
			this.CurrentIndex++;
			if (this.CurrentIndex < this.Config.posList.length) {
				var pos = this.Config.posList[this.CurrentIndex];
				var target = this.TileMap.tileToWorldXY(pos.x, pos.y);
				target.x += this.TileMap.tileWidth / 2;
				target.y += this.TileMap.tileWidth / 2;
				this.moveValentin(target);
			} else {
				this.ValentinSprite.anims.pause();
				this.ValentinSprite.setVelocity(0, 0);
				this.CurrentState = SceneState.Idle;
				this.EndMoveCallback();
			}
		}
	}

	private startInstruction2() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction2, true, Anchor.Bottom, {
			fitContent: true,
			fontSize: 22,
			// offsetY:-120
		});

		this.add.existing(this.StartDialog);
		let button = this.StartDialog.addArrowButton();
		button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startGameInstructions();
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
	}

	private startGameInstructions() {
		this.StartDialog.destroy();
		this.StartDialog = new DialogBox(this, this.Config.instruction, true, Anchor.Center, {
			fitContent: true,
			fontSize: 22,
			// offsetY:-120
		});

		this.add.existing(this.StartDialog);
		let button = this.StartDialog.addArrowButton();
		button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startQuizz();
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
	}

	private showResultDialog() {
		let starsAfter = this.getStarCount();
		let convContent: DialogTreeObj = null;
		if (starsAfter - this.StarsBefore >= 2) {
			convContent = this.cache.json.get('ValentinWhoSaidSuccess');
		} else {
			convContent = this.cache.json.get('ValentinWhoSaidFailure');
		}
		this.Quizz = new DialogTree(this, convContent, false, Anchor.Bottom, { fitContent: true });
		this.add.existing(this.Quizz);
		this.Quizz.on('destroy', () => {
			this.scene.start('ValentinConv');
		}, this);
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
