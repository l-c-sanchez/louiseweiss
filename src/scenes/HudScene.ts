import { Config } from "../Config";

export class HudScene extends Phaser.Scene {

    starCountText: Phaser.GameObjects.Text;

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

        this.starCountText = this.add.text(Config.Game.centerX - 15, 11, ""+0);
        this.starCountText.setOrigin(1, 0)
        // this.star.setOrigin(0.5, 0.5);
        
        this.registry.events.on('changedata', this.updateData, this);
    }

    update() {}
    
    updateData(parent, key, data){
        if (key === 'starCount'){
            this.starCountText.setText(""+data);
        }
    }
}
