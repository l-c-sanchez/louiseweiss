import { Config } from "../Config";
import { DialogOptions } from "./DialogBox";
import { GameText } from "./GameText";


export interface Characteristics {
    name: string;
    age: number;
    job: string;
    town: string;
    stars: number;
    sprite: string;
}

export class CharacterSheet extends Phaser.GameObjects.GameObject {
    
	private Env				: Phaser.Scene;
	private Character		: Characteristics;
	private Pos				: Phaser.Math.Vector2;
	private Options			: DialogOptions;
	private ContentPos		: Phaser.Math.Vector2;
	private Graphics		: Phaser.GameObjects.Graphics;
	private ProfilePicture	: Phaser.GameObjects.Sprite;
	private WindowWidth		: number;

    constructor(env: Phaser.Scene, x: number, y: number, character: Characteristics, options?: DialogOptions) {
		super(env, 'charactersheet');

		this.Env = env;
		this.Character = character;
		this.Pos = new Phaser.Math.Vector2(x, y);
		this.Options = Config.CharacterSheet.defaultOptions;

		if (options != undefined)
			this.setOptions(options);
		this.initWindow();
    }

	private setOptions(options: DialogOptions) {
		for (const key in options) {
			this.Options[key] = options[key];
		}
	}

	private initWindow() {
		this.computeContentPos();
		this.createWindow();
		this.createSprite();
		this.createText();

		// this.TextObject = new GameText(this.Env, this.TextPos.x, this.TextPos.y, this.Text);
		// this.TextObject.setWordWrap(Config.Game.width - this.Options.padding * 2 - 25);
		// this.TextObject.setSize(this.Options.fontSize);
		// this.TextObject.setAlign('left');

		// this.showText();
	}

	private computeContentPos() {
		let y = this.Pos.y + this.Options.padding + this.Options.innerPadding;
		let x = this.Pos.x + this.Options.padding + this.Options.innerPadding;
		this.ContentPos = new Phaser.Math.Vector2(x, y);
	}

	private createWindow() {
		this.WindowWidth = Config.Game.width - this.Options.padding * 2;
		let height = this.Options.windowHeight;
		let x = this.Pos.x + this.Options.padding;
		let y = this.Pos.y + this.Options.padding;
		this.Graphics = this.Env.add.graphics();
		this.createOuterWindow(x, y, this.WindowWidth, height);
		this.createInnerWindow(x, y, this.WindowWidth, height);
	}

	private createInnerWindow(x: number, y: number, width: number, height: number) {
		this.Graphics.fillStyle(this.Options.windowColor, this.Options.windowAlpha);
		this.Graphics.fillRect(x + 1, y + 1, width - 1, height - 1);
	}

	private createOuterWindow(x: number, y: number, width: number, height: number) {
		this.Graphics.lineStyle(this.Options.borderThickness, this.Options.borderColor, this.Options.borderAlpha);
		this.Graphics.strokeRect(x, y, width, height);
	}

	private createSprite() {
		let offsetX = Config.CharacterSheet.imageSize + this.Options.innerPadding;
		let x = this.Pos.x + this.Options.padding + this.WindowWidth - offsetX;
		this.ProfilePicture = this.Env.add.sprite(x, this.ContentPos.y, this.Character.sprite);
		this.ProfilePicture.setOrigin(0, 0);
		let scaleX = Config.CharacterSheet.imageSize / this.ProfilePicture.width;
		let scaleY = Config.CharacterSheet.imageSize / this.ProfilePicture.height;
		this.ProfilePicture.setScale(scaleX, scaleY);
	}

	private createText() {
		let x = this.ContentPos.x;
		let y = this.ContentPos.y;
		let text = this.displayText(x, y, "Nom   : " + this.Character.name);

		y += text.PhaserText.displayHeight;
		text = this.displayText(x, y, "Age   : " + this.Character.age);
		y += text.PhaserText.displayHeight;
		text = this.displayText(x, y, "Job   : " + this.Character.job);
		y += text.PhaserText.displayHeight;
		text = this.displayText(x, y, "Ville : " + this.Character.town);
		y = this.Pos.y + this.Options.windowHeight - this.Options.padding - this.Options.innerPadding ;
		text = this.displayText(x, y, "Politisation : ");
		text.setOrigin(0, 0);
		x += text.PhaserText.displayWidth;
		this.addStars(x, y, this.Character.stars);
	}

	private displayText(x: number, y: number, content: string): GameText {
		let text = new GameText(this.Env, x, y, content);
		return text;
	}

	private addStars(x: number, y: number, quantity: number) {
		while(quantity--) {
			let star = this.Env.add.sprite(x, y, 'star');
			star.setOrigin(0, 0);
			x += star.displayWidth;
		}
	}
}