import { Config } from "../Config";
import { DialogOptions } from "./DialogBox";
import { GameText } from "./GameText";


export interface Post {
    publisher: string,
    text: string,
    fake: boolean,
    comments: number,
    likes: number,
	sprite: string,
	explanation: string
}

export class FacebookSheet extends Phaser.GameObjects.GameObject {
    
	private Env				: Phaser.Scene;
	private Post		    : Post;
	private Pos				: Phaser.Math.Vector2;
	private Options			: DialogOptions;
	private ContentPos		: Phaser.Math.Vector2;
	private Graphics		: Phaser.GameObjects.Graphics;
	public Reactions		: Phaser.GameObjects.Sprite;
	public Like		    	: Phaser.GameObjects.Sprite;
	public LikeOk		    : Phaser.GameObjects.Sprite;
	private ProfilePicture	: Phaser.GameObjects.Sprite;
	private Explanation		: GameText;

	private WindowWidth		: number;
	private WindowHeight	: number;
	private PosX			: number;
	private PosY			: number;

    constructor(env: Phaser.Scene, x: number, y: number, post: Post, options?: DialogOptions) {
		super(env, 'facebooksheet');

		this.Env = env;
		this.Post = post;
		this.Pos = new Phaser.Math.Vector2(x, y);
		this.Options = Config.FacebookSheet.defaultOptions;

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
		// this.createSprite();
		this.createText();
	}

	private computeContentPos() {
		let y = this.Pos.y + this.Options.padding + this.Options.innerPadding;
		let x = this.Pos.x + this.Options.padding + this.Options.innerPadding;
		this.ContentPos = new Phaser.Math.Vector2(x, y);
	}

	private createWindow() {
		this.WindowWidth = Config.Game.width - this.Options.padding * 2;
		this.WindowHeight = this.Options.windowHeight;
		this.PosX = this.Pos.x + this.Options.padding;
		this.PosY = this.Pos.y + this.Options.padding;
		this.Graphics = this.Env.add.graphics();
		this.createOuterWindow(this.PosX, this.PosY, this.WindowWidth, this.WindowHeight);
		this.createInnerWindow(this.PosX, this.PosY, this.WindowWidth, this.WindowHeight);
	}

	private createInnerWindow(x: number, y: number, width: number, height: number) {
		let offset = this.Options.borderThickness;
		this.Graphics.fillStyle(this.Options.windowColor, this.Options.windowAlpha);
		this.Graphics.fillRect(x + offset * 0.5, y + offset * 0.5, width - offset, height - offset);
	}

	private createOuterWindow(x: number, y: number, width: number, height: number) {
		this.Graphics.lineStyle(this.Options.borderThickness, this.Options.borderColor, this.Options.borderAlpha);
		this.Graphics.strokeRect(x, y, width, height);
	}

	private createSprite() {
		let offsetX = Config.CharacterSheet.imageSize + this.Options.innerPadding;
		let x = this.Pos.x + this.Options.padding + this.WindowWidth - offsetX;
		this.ProfilePicture = this.Env.add.sprite(x, this.ContentPos.y, this.Post.sprite);
		this.ProfilePicture.setOrigin(0, 0);
		let scaleX = Config.CharacterSheet.imageSize / this.ProfilePicture.width;
		let scaleY = Config.CharacterSheet.imageSize / this.ProfilePicture.height;
		this.ProfilePicture.setScale(scaleX, scaleY);
	}

	private createText() {
		let x = this.ContentPos.x;
		let y = this.ContentPos.y;
		let text = this.displayText(x, y, this.Post.publisher, "bold");

        y += text.PhaserText.displayHeight + 15;
        
		text = this.displayText(x, y, this.Post.text, "normal");
		y += text.PhaserText.displayHeight + this.Options.innerPadding * 2;

		
		// do no display fake new (useful only for coding)
		this.Explanation = new GameText(this.Env, x, y, this.Post.explanation);
		let color = this.Post.fake ? "#FF0000" : "#00FF00";
		this.Explanation.setColor(color);
		this.Explanation.setWordWrap(this.WindowWidth - this.Options.innerPadding);
		this.Explanation.setAlpha(0);
		// y += text.PhaserText.displayHeight;
        // text = this.displayText(x, y, String(this.Post.comments));
        // y += text.PhaserText.displayHeight;
		
		y = this.Pos.y + this.Options.windowHeight - this.Options.padding - this.Options.innerPadding ;
		// text = this.displayText(x + 15, y, String(this.Post.likes));
		this.Reactions = this.Env.add.sprite(x, y, 'fb_reactions');
		this.Reactions.setOrigin(0, 0);
        x = this.Pos.x + this.WindowWidth / 2;
		this.addLikeButton(x, y);
	}

	private displayText(x: number, y: number, content: string, fontStyle: string): GameText {
		let text = new GameText(this.Env, x, y, content);
		text.setAlign("left");
		text.setColor("#1d2028");
		text.setFontStyle(fontStyle)
		text.setWordWrap(this.WindowWidth - this.Options.innerPadding);
		return text;
	}

	private addLikeButton(x: number, y: number) {
		this.Like = this.Env.add.sprite(x, y, 'heart_empty');
		this.LikeOk = this.Env.add.sprite(x, y, 'heart');
		this.Like.depth = 0;
		this.LikeOk.depth = 0;
		this.LikeOk.visible = false;
		this.Like.setOrigin(0, 0);
		this.LikeOk.setOrigin(0, 0);
    }
    
    public addButton(callback: Function) {
		this.Like.setInteractive();
		this.Like.on('pointerup', callback, this.Env);
	}

	public removeButtonCallback() {
		this.Like.off('pointerup');
	}

	public changeButton() {
		this.LikeOk.visible = !this.LikeOk.visible
		this.Explanation.setAlpha(1);
	}

	public putLikeOkVisible() {
		this.LikeOk.visible = true;
	}

	public isRealNews(): boolean {
		if (this.Post.fake)
			return false;
		return true;
	}

	public drawFrame(color: number)
	{
		this.Graphics.lineStyle(5, color, this.Options.borderAlpha);
		this.Graphics.strokeRect(this.PosX, this.PosY, this.WindowWidth, this.WindowHeight);
	}

	public getStarNumber(): number {
		if (this.LikeOk.visible) {
			if (this.Post.fake) {
				return -1;
			} else {
				return 1;
			}
		} else {
			return 0;
		}
	}

}
