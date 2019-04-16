import { Config } from "../Config";

export class WinStarAnim extends Phaser.GameObjects.GameObject {
	private Env			: Phaser.Scene;
	private Sprite		: Phaser.Physics.Arcade.Sprite; 

	private StartX		: number = Config.Game.centerX + 12;
	private StartY		: number = 80;
	private EndY		: number = 17;
	private Speed		: number = -300;
	private ScaleStep	: number = 0.1;
	private Moving		: boolean = false;


    constructor(env: Phaser.Scene) {
		super(env, 'anim');
		
		this.Env = env;
		this.Sprite = this.Env.physics.add.sprite(this.StartX, this.StartY, 'star');
		this.Sprite.setOrigin(0.5, 0.5);
		this.Sprite.setScale(0, 0);
	}
	
	preUpdate() {
		if (this.Moving) {
			if (this.Sprite.y <= this.EndY) {
				this.Sprite.setVelocity(0, 0);
				this.Sprite.setPosition(this.Sprite.x, this.EndY);
				this.Sprite.destroy();
				this.destroy();
			}
		} else if (this.Sprite.scaleX < 1 && this.Sprite.scaleY < 1) {
			this.Sprite.setScale(this.Sprite.scaleX + this.ScaleStep, this.Sprite.scaleY + this.ScaleStep);
		} else {
			this.Sprite.setScale(1, 1);
			this.Sprite.setVelocityY(this.Speed);
			this.Moving = true;
		}
	}
}

export class LoseStarAnim extends Phaser.GameObjects.GameObject {
	private Env			: Phaser.Scene;
	private Sprite		: Phaser.Physics.Arcade.Sprite; 

	private StartX		: number = Config.Game.centerX + 12;
	private StartY		: number = 17;
	private EndY		: number = 80;
	private EndX		: number = Config.Game.centerX + 50;
	private Speed		: number = 300;
	private ScaleStep	: number = -0.02;
	private Moving		: boolean = false;


    constructor(env: Phaser.Scene) {
		super(env, 'anim');
		
		this.Env = env;
		this.Sprite = this.Env.physics.add.sprite(this.StartX, this.StartY, 'star');
		this.Sprite.setOrigin(0.5, 0.5);

		var dir = new Phaser.Math.Vector2(this.EndX - this.StartX, this.EndY - this.StartY);
		dir = dir.normalize();

		this.Sprite.setVelocityX(dir.x * 300);
		this.Sprite.setVelocityY(dir.y * 300);
	}
	
	preUpdate() {
		// if (this.Moving) {
			if (this.Sprite.y >= this.EndY) {
				this.Sprite.setVelocity(0, 0);
				this.Sprite.setPosition(this.Sprite.x, this.EndY);
				this.Sprite.destroy();
				this.destroy();
			}
		// } else if (this.Sprite.scaleX < 1 && this.Sprite.scaleY < 1) {
		if (this.Sprite.scaleX > 0 && this.Sprite.scaleY > 0) {
			this.Sprite.setScale(this.Sprite.scaleX + this.ScaleStep, this.Sprite.scaleY + this.ScaleStep);
		}
		// } else {
			// this.Sprite.setScale(1, 1);
		// 	this.Sprite.setVelocityY(this.Speed);
		// 	this.Moving = true;
		// }
	}
}
