import { HudScene } from "./HudScene";
import { DialogBox, Anchor } from "../utils/DialogBox";

export class ValentinSubtitles extends Phaser.Scene {
    Config:any;
    hud: HudScene;
    Subtitles	 : DialogBox = null;
    SubtitleId	 : number = 0;

    constructor() {
        super({ key: 'ValentinSubtitles', active:false });
    }

    public init() {
        this.hud = <HudScene>this.scene.get("HudScene");
    }

    public create() {
		var character: string = this.registry.get('character');
        var games = this.cache.json.get('Games');
		this.Config = games.CarGame[character];
        if (!this.Config){
            throw new TypeError("Invalid config");
		}
		
		this.showSubtitles();
	}

    public update(time: number, deltaTime: number) {

    }

	private showSubtitles() {
		if (this.Subtitles != null) {
			this.Subtitles.endAnimation();
			this.Subtitles.destroy();
		}

		if (this.SubtitleId < 7) {
			this.Subtitles = new DialogBox(this, this.Config['subtitle' + this.SubtitleId.toString()], false, Anchor.Top, { fitContent: true, fontSize: 22 });
			
			this.time.addEvent({
				delay: this.Config['subtitleTime' + this.SubtitleId.toString()],
				callback: this.showSubtitles,
				callbackScope: this
			});
			++this.SubtitleId;
		} else {
			this.Subtitles = new DialogBox(this, this.Config['subtitle' + this.SubtitleId.toString()], false, Anchor.Top, { fitContent: true, fontSize: 22 });

			this.time.addEvent({
				delay: this.Config['subtitleTime' + this.SubtitleId.toString()],
				callback: () => { this.scene.stop() },
				callbackScope: this
			});
		}
	}
}
