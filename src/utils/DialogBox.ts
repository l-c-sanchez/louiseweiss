import { Config } from "../Config";
import { GameText } from "./GameText";

/*
** DialogBox : Creates a dialog box to show text within a frame.
**
** Constructor parameters:
**  - env: a Phaser scene
**  - text: the string to display
**  - animate: if true, the text appears on screen over time letter by letter
**  - anchor: where on screen to anchor the box. Center, Top and Down are possible
**  - options: the options of the box (see DialogOptions)
**
** addArrowButton() : adds an arrow button to the box taking the whole screen
** Returns the created button, so you can bind an event to it.
** eg: button = myDialogBox.addArraowButton(); 
**     button.on('pointerup', myFunction, this);
**
** addButtons() : adds textual buttons to the box.
**
** It could be a good thing to add Frame and Button classes if I have time
*/

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
	private Frame			: Phaser.GameObjects.Graphics;
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
	private ArrowLeftLimit	: number;
	private ArrowRightLimit	: number;
	private Buttons			: Array<Phaser.GameObjects.Sprite>;
	private ButtonFrames	: Array<Phaser.GameObjects.Graphics>;
	private ButtonText		: Array<GameText>;

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
		this.Arrow = null;
		this.Buttons = new Array<Phaser.GameObjects.Sprite>();
		this.ButtonFrames = new Array<Phaser.GameObjects.Graphics>();
		this.ButtonText = new Array<GameText>();

		if (options != undefined)
			this.setOptions(options);
		this.initWindow();
	}
	//#endregion

	//#region Private methods
	preUpdate() {
		if (this.Arrow != null)
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
		this.Frame = this.Env.add.graphics();
		this.createInnerWindow(this.PosX, this.PosY, this.Width, this.Height);
		this.createOuterWindow(this.PosX, this.PosY, this.Width, this.Height);
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
		let offset = this.Options.borderThickness;
		this.Frame.fillStyle(this.Options.windowColor, this.Options.windowAlpha);
		this.Frame.fillRect(x + offset * 0.5, y + offset * 0.5, width - offset, height - offset);
	}

	private createOuterWindow(x: number, y: number, width: number, height: number) {
		this.Frame.lineStyle(this.Options.borderThickness, this.Options.borderColor, this.Options.borderAlpha);
		this.Frame.strokeRect(x, y, width, height);
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

	private setButtonOptions(options: DialogOptions) {
		for (const key in options) {
			this.ButtonOptions[key] = options[key];
		}
	}

	/*
	** createVerticalButtons and createHorizontalButtons could be cleaned if we have time
	*/

	private createVerticalButtons(labels: string[], frame: boolean): Phaser.GameObjects.Sprite[] {
		let x = this.PosX + this.Options.innerPadding * 2;
		let y = this.PosY + this.Height - this.Options.innerPadding * 2;

		for (let i = 0; i < labels.length; ++i) {
			let text = new GameText(this.Env, x, y, labels[i]);
			text.setOrigin(0, 1);
			text.setWordWrap(Config.Game.width - this.Options.padding * 2 - 25);
			text.setSize(this.ButtonOptions.fontSize);
			text.setAlign('left');
			this.ButtonText.push(text);
			let button = this.createButton(x, y, text.PhaserText.displayWidth, text.PhaserText.displayHeight);
			this.Buttons.push(button);
			if(frame) {
				let frameX = x - this.Options.innerPadding;
				let frameY = y - text.PhaserText.displayHeight - this.Options.innerPadding;
				let frameWidth = this.Width - this.Options.innerPadding * 2;
				let frameHeight = text.PhaserText.displayHeight + this.Options.innerPadding * 2;
				this.createButtonFrame(frameX, frameY, frameWidth, frameHeight);
			}
			y -= text.PhaserText.displayHeight + this.Options.innerPadding  * 3;
		}
		return this.Buttons;
	}

	private createHorizontalButtons(labels: string[], drawFrame: boolean): Phaser.GameObjects.Sprite[] {
		let x = this.Options.innerPadding;
		let y = this.Options.innerPadding;
		let parent = this.Env.add.container(0, 0);

		for (let i = 0; i < labels.length; ++i) {
			let text = new GameText(this.Env, x, y, labels[i]);
			text.setOrigin(0, 0);
			// text.setWordWrap(Config.Game.width - this.Options.padding * 2 - 25);
			text.setSize(this.ButtonOptions.fontSize);
			this.ButtonText.push(text);
			let frameX = x - this.Options.innerPadding;
			let frameY = y - this.Options.innerPadding;
			let frameWidth = text.PhaserText.displayWidth + this.Options.innerPadding * 2;
			let frameHeight = text.PhaserText.displayHeight + this.Options.innerPadding * 2;
			let frame: Phaser.GameObjects.Graphics;
			if(drawFrame) {
				frame = this.createButtonFrame(frameX, frameY, frameWidth, frameHeight);
			}
			let button = this.createButton(frameX, frameY, frameWidth, frameHeight);
			parent.add([button, text.PhaserText, frame])
			this.Buttons.push(button);
			this.ButtonFrames.push(frame);
			x += text.PhaserText.displayWidth + this.Options.innerPadding  * 3;
		}

		let totalWidth = 0;
		let height = 0;

		for (let i = 0; i < this.Buttons.length; ++i) {
			totalWidth += this.Buttons[i].displayWidth;
			if (this.Buttons[i].displayHeight > height) {
				height = this.Buttons[i].displayHeight;
			}
		}
		totalWidth += (this.Buttons.length - 1) * this.Options.innerPadding;
		parent.x  = Config.Game.centerX - totalWidth * 0.5;
		parent.y  = (this.PosY + this.Height - this.Options.innerPadding * 2) - height;
		return this.Buttons;
	}

	private createButton(x: number, y: number, width: number, height: number): Phaser.GameObjects.Sprite {
		let button = this.Env.add.sprite(x, y, 'Transparent');
		button.displayWidth = width;
		button.displayHeight = height;
		button.setOrigin(0, 1);
		button.setInteractive();
		return button;
	}

	private createButtonFrame(x: number, y: number, width: number, height: number): Phaser.GameObjects.Graphics {
		let buttonFrame = this.Env.add.graphics();
		buttonFrame.lineStyle(this.ButtonOptions.borderThickness, this.ButtonOptions.borderColor,
			this.ButtonOptions.borderAlpha);
		buttonFrame.strokeRect(x, y, width, height);
		this.ButtonFrames.push(buttonFrame);
		return buttonFrame;
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
		this.Frame.destroy();
		this.removeButtons();
		super.destroy();
	}

	public addArrowButton(): Phaser.GameObjects.Sprite {
		this.createArrow(this.PosX, this.PosY, this.Width, this.Height);
		let arrowButton = this.Env.add.sprite(0, 0, 'Transparent');
		arrowButton.setOrigin(0, 0);
		arrowButton.displayWidth = Config.Game.width;
		arrowButton.displayHeight = Config.Game.height;
		arrowButton.setInteractive();
		this.Buttons.push(arrowButton);
		return arrowButton;
	}

	public addButtons(labels: string[], orientation?: Orientation, frame?: boolean, options?: ButtonOptions): Phaser.GameObjects.Sprite[] {
		if (orientation == undefined)
			orientation = Orientation.Vertical;
		if (frame == undefined)
			frame = false;
		this.ButtonOptions = Config.DialogBox.defaultButtonOptions;
		if (options != undefined)
			this.setButtonOptions(options);

		let buttons: Array<Phaser.GameObjects.Sprite>;
		if (orientation == Orientation.Vertical) {
			buttons = this.createVerticalButtons(labels, frame);
		} else {
			buttons = this.createHorizontalButtons(labels, frame);
		}
		return buttons;
	}

	public removeButtons() {
		for (let i = 0; i < this.Buttons.length; ++i) {
			this.Buttons[i].destroy();
		}
		this.Buttons = new Array<Phaser.GameObjects.Sprite>();
		for (let i = 0; i < this.ButtonFrames.length; ++i) {
			this.ButtonFrames[i].destroy();
		}
		this.ButtonFrames = new Array<Phaser.GameObjects.Graphics>();
		for (let i = 0; i < this.ButtonText.length; ++i) {
			this.ButtonText[i].destroy();
		}
		this.ButtonText = new Array<GameText>();
		if (this.Arrow != null)
			this.Arrow.destroy();
	}

	// public getArrowButton(){
	// 	return this.ArrowButton;
	// }
}
