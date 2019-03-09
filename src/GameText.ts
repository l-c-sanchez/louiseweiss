import { Config } from "./Config";

export class GameText {
	Env			: Phaser.Scene;
	PhaserText	: Phaser.GameObjects.Text;

	constructor(env: Phaser.Scene, x: number, y: number, content: string) {
		this.Env = env;
		this.PhaserText = this.Env.add.text(x, y, content, Config.GameText.defaultStyle);
	}

	setText(content: string) {
		this.PhaserText.setText(content);
	}

	setOrigin(x: number, y: number) {
		this.PhaserText.setOrigin(x, y);
	}

	setSize(size: number) {
		this.PhaserText.setFontSize(size);
	}

	setColor(color: string) {
		this.PhaserText.setColor(color);
	}

	setAlpha(alpha: number) {
		this.PhaserText.setAlpha(alpha);
	}

	setWordWrap(width: number) {
		this.PhaserText.setWordWrapWidth(width);
	}

	setAlign(align: string) {
		this.PhaserText.setAlign(align);
	}

	getAlpha() {
		return this.PhaserText.alpha;
	}
}
