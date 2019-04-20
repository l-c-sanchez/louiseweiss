import { Config } from "../Config";
import { GameText } from "../utils/GameText";
import { WinStarAnim, LoseStarAnim } from "../utils/StarAnim";

export class HudScene extends Phaser.Scene {

    private StarCountText: GameText;
    private TimeText: GameText;
    private RemainingTime: number;
    private TimerEvent: Phaser.Time.TimerEvent;

	constructor() {
        super({ key: 'HudScene', active: false });
	}

	init() {
        this.scene.bringToTop('HudScene');
        this.registry.set('starCount', 0);
        this.registry.set('GameOver', false);
    }

	preload() {}

	create() {
		if (Config.Game.debugMode) {
			console.log(this);
        }

        // Adding a background for HUD
        let graphics = this.add.graphics();
        let darkGrey = Phaser.Display.Color.GetColor(96, 104, 117);
        graphics.fillStyle(darkGrey, 0.8);
        graphics.fillRect(0, 0, Config.Game.width, Config.Hud.height);

        // TODO: put star and counter at right positions.
        var star = this.add.image(Config.Game.centerX, 17, 'star');
		star.setOrigin(0, 0.5);
        this.StarCountText = new GameText(this, Config.Game.centerX - 15, 17, "0");
        this.StarCountText.setOrigin(1, 0.5);
        this.TimeText = new GameText(this, Config.Game.centerX / 2, 17, "");
        this.TimeText.setOrigin(0, 0.5);
        
        this.registry.events.on('changedata', this.updateData, this);
    }

    update() {}
    
    private updateData(parent, key, value, previousValue){
        if (key === 'starCount'){
            let difference = value - previousValue;
			if (difference > 0) {
                this.winStarAnim();
                let winStarSound = this.sound.add('WinStarSound', {volume: 1});
                winStarSound.play();

			} else if (difference < 0 && previousValue >= 1) {
                this.loseStarAnim();
                let loseStarSound = this.sound.add('LoseStarSound', {volume: 1});
                loseStarSound.play();
			}
			let stars = Math.max(0, value);
            this.StarCountText.setText(stars.toString());
        }
    }

    public setRemainingTime(seconds: number, start: boolean){
        this.RemainingTime = seconds;
        this.TimeText.setText(this.RemainingTime.toString());
        if (start){
            this.startTimer();
        } else {
            this.stopTimer();
        }
    }

    public startTimer(){
        // Remove any existing timer. Prevent from having a timer decreasing to quickly!
        this.stopTimer();
        this.TimerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTime,
            callbackScope: this,
            loop: true
        });
    }

	public winStarAnim() {
		var star = new WinStarAnim(this);
		this.add.existing(star);
	}

	public loseStarAnim() {
		var star = new LoseStarAnim(this);
		this.add.existing(star);
	}

    public stopTimer(){
        if (this.TimerEvent){
            this.TimerEvent.remove();
        }
    }

    public getRemainingTime(){
        return this.RemainingTime;
    }

    private updateTime(){
        if (this.RemainingTime > 0){
            this.RemainingTime -= 1;
        }
        this.TimeText.setText(this.RemainingTime.toString());
    }
}
