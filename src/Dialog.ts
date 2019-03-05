import { Config } from "./Config";
import { GameText } from "./GameText";

interface DialogOptions {
	borderThickness: number,
	borderColor: number,
	borderAlpha: number,
	windowAlpha: number,
	windowColor: number,
	windowHeight: number,
	padding: number,
	dialogSpeed: number
}

export enum Anchor {
	Top,
	Down,
	Center
}

export class Dialog {
	Graphics		: Phaser.GameObjects.Graphics;
	Env				: Phaser.Scene;
	Text			: string[];
	CurrentText		: GameText;
	Dialog			: string[];
	Animate			: boolean;
	TextPos			: Phaser.Math.Vector2;

	Options			: DialogOptions;
	Anchor			: Anchor;

	Visible			: boolean = true;
	EventCounter	: number = 0;
	TextCounter		: number = 0;
	TimedEvent		: Phaser.Time.TimerEvent = null;

	constructor(env: Phaser.Scene, text: string[], animate: boolean, anchor: Anchor, height?: number) {
		this.Env = env;
		this.Text = text;
		this.Anchor = anchor;
		this.Animate = animate;

		this.Options = {
			borderThickness: 3,
			borderColor: 0xfeb809,
			borderAlpha: 1,
			windowAlpha: 1,
			windowColor: 0x303030,
			windowHeight: 150,
			padding: 32,
			dialogSpeed: 3
		}

		if (height !== undefined) {
			this.Options.windowHeight = height;
		}

		let y = Config.Game.height - this.Options.windowHeight - this.Options.padding + 10;
		if (this.Anchor == Anchor.Top) {
			y = this.Options.padding + 10;
		} else if (this.Anchor == Anchor.Center) {
			y = Config.Game.centerY - this.Options.windowHeight * 0.5 - this.Options.padding + 10;
		}
		this.TextPos = new Phaser.Math.Vector2(this.Options.padding + 10, y);

		this.createWindow();
		this.CurrentText = new GameText(this.Env, this.TextPos.x, this.TextPos.y, "");
		this.CurrentText.setWordWrap(Config.Game.width - this.Options.padding * 2 - 25);
		this.CurrentText.setAlign('left');
		this.showNextText();

		this.Env.input.on('pointerup', this.onPointerUp, this);		
	}

	createWindow() {
		let x = this.Options.padding;
		let y = Config.Game.height - this.Options.windowHeight - this.Options.padding;
		if (this.Anchor == Anchor.Top) {
			y = this.Options.padding;
		} else if (this.Anchor == Anchor.Center) {
			y = Config.Game.centerY - this.Options.windowHeight * 0.5 - this.Options.padding;
		}
		let width = Config.Game.width - this.Options.padding * 2;
		let height = this.Options.windowHeight;

		this.Graphics = this.Env.add.graphics();
		this.createOuterWindow(x, y, width, height);
		this.createInnerWindow(x, y, width, height);
	}

	createInnerWindow(x: number, y: number, width: number, height: number) {
		this.Graphics.fillStyle(this.Options.windowColor, this.Options.windowAlpha);
		this.Graphics.fillRect(x + 1, y + 1, width - 1, height - 1);
	}

	createOuterWindow(x: number, y: number, width: number, height: number) {
		this.Graphics.lineStyle(this.Options.borderThickness, this.Options.borderColor, this.Options.borderAlpha);
		this.Graphics.strokeRect(x, y, width, height);
	}

	showNextText() {
		if (this.TextCounter < this.Text.length) {
			this.EventCounter = 0;
			this.Dialog = this.Text[this.TextCounter].split('');
			this.CurrentText.setText(this.Animate ? '' : this.Text[this.TextCounter]);

			if (this.TimedEvent !== null) {
				this.TimedEvent.remove(() => {});
				this.TimedEvent = null;
			}

			console.log("here");
			this.TimedEvent = this.Env.time.addEvent({
				delay: 150 - (this.Options.dialogSpeed * 30),
				callback: this.animateText,
				callbackScope: this,
				loop: true
			});
			++this.TextCounter;
			return true;
		}
		return false;
	}

	animateText() {
		if (this.TimedEvent === null)
			return;

		++this.EventCounter;

		console.log(this.CurrentText.PhaserText.text + this.Dialog[this.EventCounter - 1]);
		this.CurrentText.setText(this.CurrentText.PhaserText.text + this.Dialog[this.EventCounter - 1]);
		if (this.EventCounter === this.Dialog.length) {
			this.TimedEvent.remove(() => {});
			this.TimedEvent = null;
		}
	}

	onPointerUp() {
		if (this.TimedEvent === null) {
			this.showNextText();
		} else {
			this.CurrentText.setText(this.Text[this.TextCounter - 1]);
			this.TimedEvent.remove(() => {});
			this.TimedEvent = null;
		}
	}
}
