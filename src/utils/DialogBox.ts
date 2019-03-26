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
	fitContent?: boolean,
	offsetX?: number,
	offsetY?: number,
	cropRight?: number,
	cropLeft?: number,
	textColor?: string,
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
	private FullTextObject	: GameText;

	private Text			: string;
	private CurrentText		: string;
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
	private ButtonsOrient	: Orientation;
	private Buttons			: Array<Phaser.GameObjects.Sprite>;
	private ButtonFrames	: Array<Phaser.GameObjects.Graphics>;
	private ButtonText		: Array<GameText>;

	private PosX: number;
	private PosY: number;
	private Width: number;
	private Height: number;
	private TextHeight: number;
	//#endregion

	//#region Constructor
	constructor(env: Phaser.Scene, text: string, animate: boolean, anchor: Anchor, options?: DialogOptions) {
		super(env, 'dialogbox');
		this.Env = env;
		this.Anchor = anchor;
		this.Animate = animate;
		this.Text = text;
		this.Options = {}
		Object.assign(this.Options, Config.DialogBox.defaultOptions);
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
		// this.createWindow();

		this.FullTextObject = new GameText(this.Env, this.TextPos.x, this.TextPos.y, this.Text);
		this.FullTextObject.setSize(this.Options.fontSize);
		this.FullTextObject.setAlign('left');
		this.FullTextObject.setColor("#00000000");

		this.TextObject = new GameText(this.Env, this.TextPos.x, this.TextPos.y, this.Text);
		this.TextObject.setSize(this.Options.fontSize);
		this.TextObject.setAlign('left');
		this.TextObject.setColor(this.Options.textColor);
		this.TextObject.PhaserText.setDepth(1);

		// this.createWindow();
		this.Width = Config.Game.width - this.Options.padding * 2;
		this.Width -= this.Options.cropRight;
		this.Width -= this.Options.cropLeft;
	
		this.FullTextObject.setWordWrap(this.Width - 25);
		this.TextHeight = this.FullTextObject.PhaserText.displayHeight;

		this.fitContent();
		this.Frame.setDepth(0);

		this.showText();
		// this.TextObject.setWordWrap(this.Width - 25);
		this.TextObject.PhaserText.setWordWrapCallback(this.textWrap, this);
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
		if (this.Options.fitContent) {
			this.Height = this.getContentHeight();
			this.PosY = Config.Game.height - this.Height - this.Options.padding + this.Options.offsetY;
			if (this.Anchor == Anchor.Top) {
				this.PosY = this.Options.padding + this.Options.offsetY;
			} else if (this.Anchor == Anchor.Center) {
				this.PosY = Config.Game.centerY - this.Height * 0.5 + this.Options.offsetY;
			}
		} else {
			this.Height = this.Options.windowHeight;
			this.PosY = Config.Game.height - this.Options.windowHeight - this.Options.padding + this.Options.offsetY;
			if (this.Anchor == Anchor.Top) {
				this.PosY = this.Options.padding + this.Options.offsetY;
			} else if (this.Anchor == Anchor.Center) {
				this.PosY = Config.Game.centerY - this.Options.windowHeight * 0.5 + this.Options.offsetY;
			}
		}

		this.PosX = this.Options.padding + this.Options.offsetX + this.Options.cropLeft;


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
		this.Arrow.setDepth(1);
	}

	private repositionArrow(x: number, y: number, width: number, height: number) {
		let arrowX = x + width - this.Options.arrowPadding;
		let arrowY = y + height - this.Options.arrowPadding;
		this.ArrowLeftLimit = arrowX - Config.DialogBox.arrow.offset;
		this.ArrowRightLimit = arrowX + Config.DialogBox.arrow.offset;
		this.Arrow.setPosition(arrowX, arrowY);
	}

	private createInnerWindow(x: number, y: number, width: number, height: number) {
		let offset = this.Options.borderThickness;
		this.Frame.fillStyle(this.Options.windowColor, this.Options.windowAlpha);
		this.Frame.fillRoundedRect(x + offset * 0.5, y + offset * 0.5, width - offset, height - offset);
	}

	private createOuterWindow(x: number, y: number, width: number, height: number) {
		this.Frame.lineStyle(this.Options.borderThickness, this.Options.borderColor, this.Options.borderAlpha);
		this.Frame.strokeRoundedRect(x, y, width, height);
	}

	private showText() {
		this.EventCounter = 0;
		this.Dialog = this.Text.toString().split('');
		this.CurrentText = this.Animate ? '' : this.Text;
		this.TextObject.setText(this.CurrentText);
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

		this.CurrentText += this.Dialog[this.EventCounter - 1];
		this.TextObject.setText(this.CurrentText);
		if (this.EventCounter === this.Dialog.length) {
			this.TimedEvent.remove(false);
			this.TimedEvent = null;
		}
	}

	private fitContent() {
		if (this.Frame != null)
			this.Frame.destroy();
		this.createWindow();
		this.TextObject.setPosition(this.PosX + this.Options.innerPadding, this.PosY + this.Options.innerPadding);
	}

	private getContentHeight(): number {
		let height = 0
		if (this.Text != "") {
			height += this.TextHeight + this.Options.innerPadding * 2;
		}
		if (this.Arrow != null) {
			height += this.Arrow.displayHeight;
		} else if (this.Buttons.length > 0) {
			if (this.ButtonsOrient == Orientation.Vertical) {
				for (let i = 0; i < this.Buttons.length; ++i) {
					height += this.Buttons[i].displayHeight + this.Options.innerPadding * 2;
				}
			} else {
				height += this.Buttons[0].displayHeight + this.Options.innerPadding * 2;
			}
		}
		return height;
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

	private textWrap(text: string, textObject: Phaser.GameObjects.Text) {
		let original = this.FullTextObject.PhaserText.getWrappedText(this.Text);
		let output = new Array<string>();
		let cutPosition = 0;
		text = text.replace(/\n+/g, ' ');
		for (let i = 0; i < original.length && cutPosition < text.length; ++i) {
			output.push(text.substr(cutPosition, original[i].length));
			cutPosition += original[i].length;
			// console.log(original[i] +  "|");
			// console.log(output[output.length - 1] + "|");
		}
		return output;
	}

	/*
	** createVerticalButtons and createHorizontalButtons could be cleaned if we have time
	*/

	private createVerticalButtons(labels: string[], drawFrame: boolean): Phaser.GameObjects.Sprite[] {
		let x = this.PosX + this.Options.innerPadding * 2;
		let y = this.PosY + this.Height - this.Options.innerPadding * 2;

		for (let i = 0; i < labels.length; ++i) {
			let text = new GameText(this.Env, x, y, labels[i]);
			text.setOrigin(0, 1);
			text.setWordWrap(this.Width - this.Options.padding * 2 - 25);
			text.setSize(this.ButtonOptions.fontSize);
			text.setAlign('left');
			text.setColor(this.Options.textColor);
			this.ButtonText.push(text);
			let frameX = x - this.Options.innerPadding;
			let frameY = y - text.PhaserText.displayHeight - this.Options.innerPadding;
			let frameWidth = this.Width - this.Options.innerPadding * 2;
			let frameHeight = text.PhaserText.displayHeight + this.Options.innerPadding * 2;
			if(drawFrame) {
				this.createButtonFrame(frameX, frameY, frameWidth, frameHeight);
			}
			let button = this.createButton(frameX, frameY, frameWidth, frameHeight);
			this.Buttons.push(button);
			button.setDepth(1);
			text.PhaserText.setDepth(1);
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
			text.setColor(this.Options.textColor);
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
			button.setDepth(1);
			parent.add([button, text.PhaserText, frame])
			this.Buttons.push(button);
			text.PhaserText.setDepth(1);
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
		button.setOrigin(0, 0);
		button.setInteractive();
		return button;
	}

	private createButtonFrame(x: number, y: number, width: number, height: number): Phaser.GameObjects.Graphics {
		let buttonFrame = this.Env.add.graphics();
		buttonFrame.lineStyle(this.ButtonOptions.borderThickness, this.ButtonOptions.borderColor,
			this.ButtonOptions.borderAlpha);
		buttonFrame.strokeRoundedRect(x, y, width, height);
		this.ButtonFrames.push(buttonFrame);
		buttonFrame.setDepth(1);
		return buttonFrame;
	}
	//#endregion

	//#region Public Methods
	public setText(text: string) {
		this.Text = text;
		this.showText();
		this.fitContent();
	}

	public endAnimation() {
		if (this.TimedEvent != null) {
			this.TimedEvent.remove(false);
			this.TimedEvent = null;
			this.TextObject.setText(this.Text);
		}
	}

	public isAnimationEnded(): boolean {
		return this.TimedEvent == null;
	}

	public destroy() {
		this.TextObject.PhaserText.destroy();
		this.FullTextObject.PhaserText.destroy();
		this.Frame.destroy();
		this.removeButtons();
		super.destroy();
	}

	public addArrowButton(): Phaser.GameObjects.Sprite {
		this.ButtonsOrient = Orientation.Horizontal;
		this.createArrow(this.PosX, this.PosY, this.Width, this.Height);
		let arrowButton = this.Env.add.sprite(0, 0, 'Transparent');
		arrowButton.setOrigin(0, 0);
		arrowButton.displayWidth = Config.Game.width;
		arrowButton.displayHeight = Config.Game.height;
		arrowButton.setInteractive();
		this.Buttons.push(arrowButton);
		this.fitContent();
		this.repositionArrow(this.PosX, this.PosY, this.Width, this.Height);
		return arrowButton;
	}

	public addButtons(labels: string[], orientation?: Orientation, frame?: boolean, options?: ButtonOptions): Phaser.GameObjects.Sprite[] {
		if (orientation == undefined)
			orientation = Orientation.Vertical;
		if (frame == undefined)
			frame = false;
		this.ButtonsOrient = orientation;
		this.ButtonOptions = Config.DialogBox.defaultButtonOptions;
		if (options != undefined)
			this.setButtonOptions(options);

		let buttons: Array<Phaser.GameObjects.Sprite>;
		if (orientation == Orientation.Vertical) {
			buttons = this.createVerticalButtons(labels, frame);
		} else {
			buttons = this.createHorizontalButtons(labels, frame);
		}
		this.fitContent();
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
		if (this.Arrow != null) {
			this.Arrow.destroy();
			this.Arrow = null;
		}
	}

	public getHeight(): number {
		return (this.getContentHeight() + this.Options.innerPadding * 2);
	}

	public getPos(): Phaser.Math.Vector2 {
		return (new Phaser.Math.Vector2(this.PosX, this.PosY));
	}
}
