import { Config } from "./Config";

export class GameText {
	Env			: Phaser.Scene;
	PhaserText	: Phaser.GameObjects.Text;

	constructor(env: Phaser.Scene, x: number, y: number, content: string) {
		let defaultStyle = {
			fontFamily: Config.Game.fontName,
			fontSize: 20,
			color: '#FFFFFF',
			align: 'center',
			wordWrap: { width: Config.Game.width, useAdvancedWrap: true }
		};

		this.Env = env;
		this.PhaserText = this.Env.add.text(x, y, content, defaultStyle);
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

	getAlpha() {
		return this.PhaserText.alpha;
	}
}