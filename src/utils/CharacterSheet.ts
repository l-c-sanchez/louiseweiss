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
    
	private env				: Phaser.Scene;
	private character		: Characteristics;
	private pos				: Phaser.Math.Vector2;
	private options			: DialogOptions;
	private contentPos		: Phaser.Math.Vector2;
	private graphics		: Phaser.GameObjects.Graphics;
	private profilePicture	: Phaser.GameObjects.Sprite;
	private windowWidth		: number;

    constructor(env: Phaser.Scene, x: number, y: number, character: Characteristics, options?: DialogOptions) {
		super(env, 'charactersheet');

		this.env = env;
		this.character = character;
		this.pos = new Phaser.Math.Vector2(x, y);
		this.options = Config.CharacterSheet.defaultOptions;

		if (options != undefined)
			this.setOptions(options);
		this.initWindow();
    }

	private setOptions(options: DialogOptions) {
		for (const key in options) {
			this.options[key] = options[key];
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
		let y = this.pos.y + this.options.padding + this.options.innerPadding;
		let x = this.pos.x + this.options.padding + this.options.innerPadding;
		this.contentPos = new Phaser.Math.Vector2(x, y);
	}

	private createWindow() {
		this.windowWidth = Config.Game.width - this.options.padding * 2;
		let height = this.options.windowHeight;
		let x = this.pos.x + this.options.padding;
		let y = this.pos.y + this.options.padding;
		this.graphics = this.env.add.graphics();
		this.createOuterWindow(x, y, this.windowWidth, height);
		this.createInnerWindow(x, y, this.windowWidth, height);
	}

	private createInnerWindow(x: number, y: number, width: number, height: number) {
		this.graphics.fillStyle(this.options.windowColor, this.options.windowAlpha);
		this.graphics.fillRect(x + 1, y + 1, width - 1, height - 1);
	}

	private createOuterWindow(x: number, y: number, width: number, height: number) {
		this.graphics.lineStyle(this.options.borderThickness, this.options.borderColor, this.options.borderAlpha);
		this.graphics.strokeRect(x, y, width, height);
	}

	private createSprite() {
		let offsetX = Config.CharacterSheet.imageSize + this.options.innerPadding;
		let x = this.pos.x + this.options.padding + this.windowWidth - offsetX;
		this.profilePicture = this.env.add.sprite(x, this.contentPos.y, this.character.sprite);
		this.profilePicture.setOrigin(0, 0);
		let scaleX = Config.CharacterSheet.imageSize / this.profilePicture.width;
		let scaleY = Config.CharacterSheet.imageSize / this.profilePicture.height;
		this.profilePicture.setScale(scaleX, scaleY);
	}

	private createText() {
		let x = this.contentPos.x;
		let y = this.contentPos.y;
		let text = this.displayText(x, y, "Nom   : " + this.character.name);

		y += text.phaserText.displayHeight;
		text = this.displayText(x, y, "Age   : " + this.character.age);
		y += text.phaserText.displayHeight;
		text = this.displayText(x, y, "Job   : " + this.character.job);
		y += text.phaserText.displayHeight;
		text = this.displayText(x, y, "Ville : " + this.character.town);
		y = this.pos.y + this.options.windowHeight - this.options.padding - this.options.innerPadding ;
		text = this.displayText(x, y, "Politisation : ");
		text.setOrigin(0, 0);
		x += text.phaserText.displayWidth;
		this.addStars(x, y, this.character.stars);
	}

	private displayText(x: number, y: number, content: string): GameText {
		let text = new GameText(this.env, x, y, content);
		return text;
	}

	private addStars(x: number, y: number, quantity: number) {
		while(quantity--) {
			let star = this.env.add.sprite(x, y, 'star');
			star.setOrigin(0, 0);
			x += star.displayWidth;
		}
	}
}
