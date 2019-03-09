import { Config } from "./Config";
import { GameText } from "./GameText";
import { Time } from "phaser";

export interface DialogOptions {
	borderThickness?: number,
	borderColor?: number,
	borderAlpha?: number,
	windowAlpha?: number,
	windowColor?: number,
	windowHeight?: number,
	padding?: number,
	dialogSpeed?: number,
	arrowPadding?: number,
	arrowScale?: number,
	fontSize?: number
}

export enum Anchor {
	Top,
	Down,
	Center
}

export class DialogBox extends Phaser.GameObjects.GameObject {

	//#region Fields
	private Env				: Phaser.Scene;
	private Graphics		: Phaser.GameObjects.Graphics;
	private TextObject		: GameText;
	private Arrow			: Phaser.Physics.Arcade.Sprite;

	private Text			: string;
	private Anchor			: Anchor;
	private Animate			: boolean;
	private Options			: DialogOptions;

	private Dialog			: string[];
	private TextPos			: Phaser.Math.Vector2;
	private EventCounter	: number = 0;
	private TimedEvent		: Phaser.Time.TimerEvent = null;
	private ArrowLeftLimit	: number;
	private ArrowRightLimit	: number;
	//#endregion

	//#region Constructor
	constructor(env: Phaser.Scene, text: string, animate: boolean, anchor: Anchor, options?: DialogOptions) {
		super(env, 'dialogbox');
		this.Env = env;
		this.Anchor = anchor;
		this.Animate = animate;
		this.Text = text;

		this.Options = Config.DialogBox.defaultOptions;

		if (options != undefined)
			this.setOptions(options);

		this.initWindow();
	}
	//#endregion

	//#region Private methods
	preUpdate() {
		this.animateArrow();
	}

	private setOptions(options: DialogOptions) {
		for (const key in options) {
			this.Options[key] = options[key];
		}
	}

	private initWindow() {
		this.computeTextPos();
		this.createWindow();

		this.TextObject = new GameText(this.Env, this.TextPos.x, this.TextPos.y, this.Text);
		this.TextObject.setWordWrap(Config.Game.width - this.Options.padding * 2 - 25);
		this.TextObject.setSize(this.Options.fontSize);
		this.TextObject.setAlign('left');

		this.showText();
	}

	private computeTextPos() {
		let y = Config.Game.height - this.Options.windowHeight - this.Options.padding + 10;
		if (this.Anchor == Anchor.Top) {
			y = this.Options.padding + 10;
		} else if (this.Anchor == Anchor.Center) {
			y = Config.Game.centerY - this.Options.windowHeight * 0.5 + 10;
		}
		this.TextPos = new Phaser.Math.Vector2(this.Options.padding + 10, y);
	}

	private createWindow() {
		let width = Config.Game.width - this.Options.padding * 2;
		let height = this.Options.windowHeight;
		let x = this.Options.padding;
		let y = Config.Game.height - this.Options.windowHeight - this.Options.padding;

		if (this.Anchor == Anchor.Top) {
			y = this.Options.padding;
		} else if (this.Anchor == Anchor.Center) {
			y = Config.Game.centerY - this.Options.windowHeight * 0.5;
		}
		this.Graphics = this.Env.add.graphics();
		this.createOuterWindow(x, y, width, height);
		this.createInnerWindow(x, y, width, height);
		this.createArrow(x, y, width, height);
	}

	private createArrow(x: number, y: number, width: number, height: number) {
		let arrowX = x + width - this.Options.arrowPadding;
		let arrowY = y + height - this.Options.arrowPadding;
		this.Arrow = this.Env.physics.add.sprite(arrowX, arrowY, 'Arrow');
		this.Arrow.setScale(this.Options.arrowScale, this.Options.arrowScale);
		this.ArrowLeftLimit = arrowX - Config.DialogBox.arrow.offset;
		this.ArrowRightLimit = arrowX + Config.DialogBox.arrow.offset;
		this.Arrow.setVelocityX(Config.DialogBox.arrow.speed);
	}

	private createInnerWindow(x: number, y: number, width: number, height: number) {
		this.Graphics.fillStyle(this.Options.windowColor, this.Options.windowAlpha);
		this.Graphics.fillRect(x + 1, y + 1, width - 1, height - 1);
	}

	private createOuterWindow(x: number, y: number, width: number, height: number) {
		this.Graphics.lineStyle(this.Options.borderThickness, this.Options.borderColor, this.Options.borderAlpha);
		this.Graphics.strokeRect(x, y, width, height);
	}

	private showText() {
		this.EventCounter = 0;
		this.Dialog = this.Text.toString().split('');
		this.TextObject.setText(this.Animate ? '' : this.Text);

		if (this.TimedEvent !== null) {
			this.TimedEvent.remove(() => {});
			this.TimedEvent = null;
		}

		if (this.Animate) {
			this.TimedEvent = this.Env.time.addEvent({
				delay: 150 - (this.Options.dialogSpeed * 30),
				callback: this.animateText,
				callbackScope: this,
				loop: true
			});
		}
	}

	private animateText() {
		if (this.TimedEvent === null)
			return;

		++this.EventCounter;

		// console.log(this.TextObject.PhaserText.text + this.Dialog[this.EventCounter - 1]);
		this.TextObject.setText(this.TextObject.PhaserText.text + this.Dialog[this.EventCounter - 1]);
		if (this.EventCounter === this.Dialog.length) {
			this.TimedEvent.remove(() => {});
			this.TimedEvent = null;
		}
	}

	private animateArrow() {
		if (this.Arrow.x <= this.ArrowLeftLimit) {
			this.Arrow.setVelocityX(Config.DialogBox.arrow.speed)
		} else if (this.Arrow.x >= this.ArrowRightLimit) {
			this.Arrow.setVelocityX(-Config.DialogBox.arrow.speed)
		}
	}
	//#endregion

	//#region Public Methods
	public setText(text: string) {
		this.Text = text;
		this.showText();
	}

	public endAnimation() {
		if (this.TimedEvent != null) {
			this.TextObject.setText(this.Text);
			this.TimedEvent.remove(() => {});
			this.TimedEvent = null;
		}
	}

	public isAnimationEnded(): boolean {
		return this.TimedEvent == null;
	}

	public destroy() {
		this.TextObject.PhaserText.setVisible(false);
		this.Graphics.destroy();
		super.destroy();
	}
	//#endregion
}
