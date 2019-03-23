import { Config } from "../Config";
import { GameText } from "../utils/GameText";

export class HudScene extends Phaser.Scene {

    private starCountText: GameText;
    private timeText: GameText;
    private remainingTime: number;
    private timerEvent: Phaser.Time.TimerEvent;

	constructor() {
        super({ key: 'HudScene', active: false });
	}

	init() {
        this.scene.bringToTop('HudScene');
        this.registry.set('starCount', 0);
    }

	preload() {}

	create() {
		if (Config.Game.debugMode) {
			console.log(this);
        }

        // TODO: put star and counter at right positions.
        var star = this.add.image(Config.Game.centerX, 17, 'star');
		star.setOrigin(0, 0.5);
        this.starCountText = new GameText(this, Config.Game.centerX - 15, 17, "0");
        this.starCountText.setOrigin(1, 0.5)
        this.timeText = new GameText(this, Config.Game.centerX / 2, 17, "");
        this.timeText.setOrigin(0, 0.5);
        
        this.registry.events.on('changedata', this.updateData, this);
    }

    update() {}
    
    private updateData(parent, key, data){
        if (key === 'starCount'){
            this.starCountText.setText(data.toString());
        }
    }

    public setRemainingTime(seconds: number, start: boolean){
        this.remainingTime = seconds;
        this.timeText.setText(this.remainingTime.toString());
        if (start){
            this.startTimer();
        } else {
            this.stopTimer();
        }
    }

    public startTimer(){
        // Remove any existing timer. Prevent from having a timer decreasing to quickly!
        this.stopTimer();
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTime,
            callbackScope: this,
            loop: true
        });
    }

    public stopTimer(){
        if (this.timerEvent){
            this.timerEvent.remove();
        }
    }

    public getRemainingTime(){
        return this.remainingTime;
    }

    private updateTime(){
        if (this.remainingTime > 0){
            this.remainingTime -= 1;
        }
        this.timeText.setText(this.remainingTime.toString());
    }
}
