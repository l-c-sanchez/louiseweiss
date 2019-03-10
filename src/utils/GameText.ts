import { Config } from "../Config";

export class GameText {
	env			: Phaser.Scene;
	phaserText	: Phaser.GameObjects.Text;

	constructor(env: Phaser.Scene, x: number, y: number, content: string) {
		this.env = env;
		this.phaserText = this.env.add.text(x, y, content, Config.GameText.defaultStyle);
	}

	setText(content: string) {
		this.phaserText.setText(content);
	}

	setOrigin(x: number, y: number) {
		this.phaserText.setOrigin(x, y);
	}

	setSize(size: number) {
		this.phaserText.setFontSize(size);
	}

	setColor(color: string) {
		this.phaserText.setColor(color);
	}

	setAlpha(alpha: number) {
		this.phaserText.setAlpha(alpha);
	}

	setWordWrap(width: number) {
		this.phaserText.setWordWrapWidth(width);
	}

	setAlign(align: string) {
		this.phaserText.setAlign(align);
	}

	getAlpha() {
		return this.phaserText.alpha;
	}
}
