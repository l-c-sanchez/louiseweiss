import { Config } from "../Config";
import { GameText } from "./GameText";

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
	fontSize?: number,
	innerPadding?: number
}

export enum Anchor {
	Top,
	Down,
	Center
}

export class DialogBox extends Phaser.GameObjects.GameObject {

	//#region Fields
	private env				: Phaser.Scene;
	private graphics		: Phaser.GameObjects.Graphics;
	private textObject		: GameText;
	private arrow			: Phaser.Physics.Arcade.Sprite;

	private text			: string;
	private anchor			: Anchor;
	private animate			: boolean;
	private options			: DialogOptions;

	private dialog			: string[];
	private textPos			: Phaser.Math.Vector2;
	private eventCounter	: number = 0;
	private timedEvent		: Phaser.Time.TimerEvent = null;
	private arrowLeftLimit	: number;
	private arrowRightLimit	: number;
	//#endregion

	//#region Constructor
	constructor(env: Phaser.Scene, text: string, animate: boolean, anchor: Anchor, options?: DialogOptions) {
		super(env, 'dialogbox');
		this.env = env;
		this.anchor = anchor;
		this.animate = animate;
		this.text = text;
		this.options = Config.DialogBox.defaultOptions;

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
			this.options[key] = options[key];
		}
	}

	private initWindow() {
		this.computeTextPos();
		this.createWindow();

		this.textObject = new GameText(this.env, this.textPos.x, this.textPos.y, this.text);
		this.textObject.setWordWrap(Config.Game.width - this.options.padding * 2 - 25);
		this.textObject.setSize(this.options.fontSize);
		this.textObject.setAlign('left');

		this.showText();
	}

	private computeTextPos() {
		let y = Config.Game.height - this.options.windowHeight - this.options.padding + 10;
		if (this.anchor == Anchor.Top) {
			y = this.options.padding + 10;
		} else if (this.anchor == Anchor.Center) {
			y = Config.Game.centerY - this.options.windowHeight * 0.5 + 10;
		}
		this.textPos = new Phaser.Math.Vector2(this.options.padding + 10, y);
	}

	private createWindow() {
		let width = Config.Game.width - this.options.padding * 2;
		let height = this.options.windowHeight;
		let x = this.options.padding;
		let y = Config.Game.height - this.options.windowHeight - this.options.padding;

		if (this.anchor == Anchor.Top) {
			y = this.options.padding;
		} else if (this.anchor == Anchor.Center) {
			y = Config.Game.centerY - this.options.windowHeight * 0.5;
		}
		this.graphics = this.env.add.graphics();
		this.createOuterWindow(x, y, width, height);
		this.createInnerWindow(x, y, width, height);
		this.createArrow(x, y, width, height);
	}

	private createArrow(x: number, y: number, width: number, height: number) {
		let arrowX = x + width - this.options.arrowPadding;
		let arrowY = y + height - this.options.arrowPadding;
		this.arrow = this.env.physics.add.sprite(arrowX, arrowY, 'Arrow');
		this.arrow.setScale(this.options.arrowScale, this.options.arrowScale);
		this.arrowLeftLimit = arrowX - Config.DialogBox.arrow.offset;
		this.arrowRightLimit = arrowX + Config.DialogBox.arrow.offset;
		this.arrow.setVelocityX(Config.DialogBox.arrow.speed);
	}

	private createInnerWindow(x: number, y: number, width: number, height: number) {
		this.graphics.fillStyle(this.options.windowColor, this.options.windowAlpha);
		this.graphics.fillRect(x + 1, y + 1, width - 1, height - 1);
	}

	private createOuterWindow(x: number, y: number, width: number, height: number) {
		this.graphics.lineStyle(this.options.borderThickness, this.options.borderColor, this.options.borderAlpha);
		this.graphics.strokeRect(x, y, width, height);
	}

	private showText() {
		this.eventCounter = 0;
		this.dialog = this.text.toString().split('');
		this.textObject.setText(this.animate ? '' : this.text);

		if (this.timedEvent !== null) {
			this.timedEvent.remove(() => {});
			this.timedEvent = null;
		}

		if (this.animate) {
			this.timedEvent = this.env.time.addEvent({
				delay: 150 - (this.options.dialogSpeed * 30),
				callback: this.animateText,
				callbackScope: this,
				loop: true
			});
		}
	}

	private animateText() {
		if (this.timedEvent === null)
			return;

		++this.eventCounter;

		// console.log(this.TextObject.PhaserText.text + this.Dialog[this.EventCounter - 1]);
		this.textObject.setText(this.textObject.phaserText.text + this.dialog[this.eventCounter - 1]);
		if (this.eventCounter === this.dialog.length) {
			this.timedEvent.remove(() => {});
			this.timedEvent = null;
		}
	}

	private animateArrow() {
		if (this.arrow.x <= this.arrowLeftLimit) {
			this.arrow.setVelocityX(Config.DialogBox.arrow.speed)
		} else if (this.arrow.x >= this.arrowRightLimit) {
			this.arrow.setVelocityX(-Config.DialogBox.arrow.speed)
		}
	}
	//#endregion

	//#region Public Methods
	public setText(text: string) {
		this.text = text;
		this.showText();
	}

	public endAnimation() {
		if (this.timedEvent != null) {
			this.textObject.setText(this.text);
			this.timedEvent.remove(() => {});
			this.timedEvent = null;
		}
	}

	public isAnimationEnded(): boolean {
		return this.timedEvent == null;
	}

	public destroy() {
		this.textObject.phaserText.setVisible(false);
		this.graphics.destroy();
		super.destroy();
	}
	//#endregion
}
