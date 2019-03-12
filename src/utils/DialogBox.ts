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

export interface ButtonOptions {
	borderThickness?: number,
	borderColor?: number,
	borderAlpha?: number,
	fontSize?: number
}

export enum Anchor {
	Top,
	Down,
	Center
}

export enum Orientation {
	Vertical,
	Horizontal
}

export class DialogBox extends Phaser.GameObjects.GameObject {

	//#region Fields
	private Env				: Phaser.Scene;
	private Graphics		: Phaser.GameObjects.Graphics;
	private TextObject		: GameText;

	private Text			: string;
	private Anchor			: Anchor;
	private Animate			: boolean;
	private Options			: DialogOptions;
	private ButtonOptions	: ButtonOptions;

	private Dialog			: string[];
	private TextPos			: Phaser.Math.Vector2;
	private EventCounter	: number = 0;
	private TimedEvent		: Phaser.Time.TimerEvent = null;

	private Arrow			: Phaser.Physics.Arcade.Sprite;
	private ArrowButton		: Phaser.GameObjects.Sprite;
	private ArrowLeftLimit	: number;
	private ArrowRightLimit	: number;

	private PosX: number;
	private PosY: number;
	private Width: number;
	private Height: number;
	//#endregion

	//#region Constructor
	constructor(env: Phaser.Scene, text: string, animate: boolean, anchor: Anchor, options?: DialogOptions) {
		super(env, 'dialogbox');
		this.Env = env;
		this.Anchor = anchor;
		this.Animate = animate;
		this.Text = text;
		this.Options = Config.DialogBox.defaultOptions;

		this.addArrowButton();

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
		let y = Config.Game.height - this.Options.windowHeight - this.Options.padding + this.Options.innerPadding;
		if (this.Anchor == Anchor.Top) {
			y = this.Options.padding + this.Options.innerPadding;
		} else if (this.Anchor == Anchor.Center) {
			y = Config.Game.centerY - this.Options.windowHeight * 0.5 + this.Options.innerPadding;
		}
		this.TextPos = new Phaser.Math.Vector2(this.Options.padding + this.Options.innerPadding, y);
	}

	private createWindow() {
		this.Width = Config.Game.width - this.Options.padding * 2;
		this.Height = this.Options.windowHeight;
		this.PosX = this.Options.padding;
		this.PosY = Config.Game.height - this.Options.windowHeight - this.Options.padding;

		if (this.Anchor == Anchor.Top) {
			this.PosY = this.Options.padding;
		} else if (this.Anchor == Anchor.Center) {
			this.PosY = Config.Game.centerY - this.Options.windowHeight * 0.5;
		}
		this.Graphics = this.Env.add.graphics();
		this.createOuterWindow(this.PosX, this.PosY, this.Width, this.Height);
		this.createInnerWindow(this.PosX, this.PosY, this.Width, this.Height);
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
			this.TimedEvent.remove(false);
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
			this.TimedEvent.remove(false);
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

	private createButton(x: number, y: number, width: number, height: number): Phaser.GameObjects.Sprite {
		let button = this.Env.add.sprite(x, y, 'Transparent');
		button.displayWidth = width;
		button.displayHeight = height;
		button.setOrigin(0, 1);
		button.setInteractive();
		return button;
	}

	private createButtonFrame(x: number, y: number, width: number, height: number) {
		this.Graphics.lineStyle(2, this.Options.borderColor, 0.8);
		this.Graphics.strokeRect(x, y, width, height);
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
			this.TimedEvent.remove(false);
			this.TimedEvent = null;
		}
	}

	public isAnimationEnded(): boolean {
		return this.TimedEvent == null;
	}

	public destroy() {
		this.TextObject.PhaserText.destroy();
		this.Arrow.destroy();
		this.Graphics.destroy();
		super.destroy();
	}

	private addArrowButton(): Phaser.GameObjects.Sprite {
		this.createArrow(this.PosX, this.PosY, this.Width, this.Height);
		this.ArrowButton = this.Env.add.sprite(0, 0, 'Transparent');
		this.ArrowButton.setOrigin(0, 0);
		this.ArrowButton.displayWidth = Config.Game.width;
		this.ArrowButton.displayHeight = Config.Game.height;
		this.ArrowButton.setInteractive();
		return this.ArrowButton;
	}

	public addButtons(labels: string[], orientation?: Orientation, frame?: boolean, options?: ButtonOptions): Phaser.GameObjects.Sprite[] {
		if (orientation == undefined) {
			orientation = Orientation.Vertical;
		}
		if (frame == undefined) {
			frame = false;
		}

		let buttons: Array<Phaser.GameObjects.Sprite> = new Array();
		let x = this.PosX + this.Options.innerPadding * 2;
		let y = this.PosY + this.Height - this.Options.innerPadding * 2;
		for (let i = 0; i < labels.length; ++i) {
			let text = new GameText(this.Env, x, y, labels[i]);
			text.setOrigin(0, 1);
			text.setWordWrap(Config.Game.width - this.Options.padding * 2 - 25);
			text.setSize(this.Options.fontSize);
			text.setAlign('left');
			let button = this.createButton(x, y, text.PhaserText.displayWidth, text.PhaserText.displayHeight);
			buttons.push(button);

			let frameX = x - this.Options.innerPadding;
			let frameY = y - text.PhaserText.displayHeight - this.Options.innerPadding;
			let frameWidth = this.Width - this.Options.innerPadding * 2;
			let frameHeight = text.PhaserText.displayHeight + this.Options.innerPadding * 2;
			this.createButtonFrame(frameX, frameY, frameWidth, frameHeight);

			y -= text.PhaserText.displayHeight + this.Options.innerPadding  * 3;
		}
		this.Arrow.setVisible(false);
		return buttons;
	}

	public getArrowButton(){
		return this.ArrowButton;
	}
}
