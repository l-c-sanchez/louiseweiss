import { Config } from "./Config";
import { NONE } from "phaser";

/**
 * TODO: there should be only one group of stars shared between all layers.
 * --> each layer contains only an array with its star(s)
 */
class Layer {
    layerSprites: Array<Phaser.GameObjects.Sprite>
    floorGroup: Phaser.Physics.Arcade.Group
    starGroup: Phaser.Physics.Arcade.Group
    rockGroup: Phaser.Physics.Arcade.Group
    
    y: number
    Cols: number
    Env: CarGame

    constructor (
        Env: CarGame,
        floorGroup: Phaser.Physics.Arcade.Group, 
        starGroup: Phaser.Physics.Arcade.Group,
        rockGroup: Phaser.Physics.Arcade.Group,
        y: number,
        withObjects: boolean = true) 
        {
        this.Env = Env;
        this.Cols = Config.CarGame.columns;
        this.y = y;

        this.layerSprites = [];
        this.starGroup = starGroup;
        this.rockGroup = rockGroup;
        this.floorGroup = floorGroup;
        this.createLayer(withObjects);
    }

    private createLayer(withObjects: boolean) {

        for (let tx = 0; tx < this.Cols; tx++) {
            var x = (tx * Config.CarGame.tileSize)
            if (tx != 3 && tx != 8) {
                this.floorGroup.create(x, this.y, 'road');
            } else {
                this.floorGroup.create(x, this.y, 'road_line');
            }
        }

        if (withObjects){
            if (Math.random() < Config.CarGame.starProbability){
                var column = Phaser.Math.Between(-2, 2);
                var x = Config.Game.centerX + column * Config.CarGame.corridorSize;
                // var x = Phaser.Math.Between(0, cols * Config.CarGame.tileSize);
                var star: Phaser.Physics.Arcade.Sprite = this.starGroup.create(x, this.y, 'star');
                star.setOrigin(0.5, 0.5);
                this.layerSprites.push(star);
            }
            if (Math.random() < Config.CarGame.starProbability){
                var column = Phaser.Math.Between(-2, 2);
                var x = Config.Game.centerX + column * Config.CarGame.corridorSize;
                // var x = Phaser.Math.Between(0, cols * Config.CarGame.tileSize);
                var rock: Phaser.Physics.Arcade.Sprite = this.rockGroup.create(x, this.y, 'rock');
                rock.setOrigin(0.5, 0.5);
                this.layerSprites.push(rock);
            }
        }
    }

    public destroy() {
        for (var i=0; i<this.layerSprites.length; i++){
            this.floorGroup.remove(this.layerSprites[i], true, true);
            this.starGroup.remove(this.layerSprites[i], true, true);
            this.rockGroup.remove(this.layerSprites[i], true, true);
        }
    }
}


class Generator 
{
    Cols: number;
    Rows: number;
    Env: CarGame;
    Layers: Array<Layer>
    floorGroup: Phaser.Physics.Arcade.Group
    starGroup: Phaser.Physics.Arcade.Group
    rockGroup: Phaser.Physics.Arcade.Group

    constructor (Env) {
        
        this.Env = Env;
        
        this.Cols = 12;
        this.Rows = 20;
        this.Layers = [];

        this.floorGroup = this.Env.physics.add.group();
        this.starGroup = this.Env.physics.add.group();
        this.rockGroup = this.Env.physics.add.group();
        this.floorGroup.setDepth(0, 0);
        this.starGroup.setDepth(1, 0);
        this.rockGroup.setDepth(1, 0);
    }

    public setup() {
        let y;
        let rows = this.Rows + 1;

        this.Layers = [];

        for (let ty = 0; ty < rows; ty++){
            y = (ty * Config.CarGame.tileSize)
            this.Layers.push(new Layer(this.Env, this.floorGroup, this.starGroup, this.rockGroup, y, false));
        }
    }
    public update() {
        let ty = this.Layers.length;
        let offset = this.Env.cameras.main.scrollY - this.Layers[ty - 1].y;
        if (offset <= -640)  { // this.config.tile
            this.appendLayer();
            this.destroyLastLayer();
        }
    }
    private destroyLastLayer() {
        let ty = this.Layers.length;
        this.Layers[ty-1].destroy();
        this.Layers.splice(ty - 1, 1);
    }
    private appendLayer() {
        let y = this.Layers[0].y - Config.CarGame.tileSize;
        this.Layers.unshift(new Layer(this.Env, this.floorGroup, this.starGroup, this.rockGroup, y));
    }
}


export class CarGame extends Phaser.Scene {
    static NONE = 0;
    static LEFT = 1;
    static RIGHT = 2;

    Generator!: Generator;
    cam_speed!: { base:number, current:number, max:number};
    player!: Phaser.Physics.Arcade.Sprite;
    playerSpeed:number = 120;
    targetPos:number;
    Corridor:number = 64;

    remainingTime: number;
    remainingTimeText: Phaser.GameObjects.Text;
    gameEnded: boolean;

    // Player movement
    Cursors!: Phaser.Input.Keyboard.CursorKeys;
    Swipe!: string;
    Threshold!: number;

    public init() {
        this.Generator = new Generator(this);
        this.cam_speed = {
            base:-3, 
            current:-3,
            max:-3
        }
        this.remainingTime = Config.CarGame.time; // in seconds
        this.gameEnded = false;
    }

    constructor() {
        super({ key: 'CarGame', active:false });
        this.targetPos = Config.Game.centerX;
    }

    preload(){}

    public create() {
        // Create initial environment
        this.Generator.setup();

        // Create Player
        this.player = this.physics.add.sprite(Config.Game.centerX, Config.Game.centerY / 2 * 3, 'voiture');
        this.player.setOrigin(0.5, 0.5);
        this.player.setDepth(10);        
        this.player.setScale(2, 2);

        // Dealing with Swipes
        this.Threshold = 1;
        this.Cursors = this.input.keyboard.createCursorKeys();
        var downX: number, upX: number, Threshold: number = 50;
        this.input.on('pointerdown', function (pointer : Phaser.Input.InputPlugin) {
            downX = pointer.x;
        });
        this.input.on('pointerup', (pointer : Phaser.Input.InputPlugin) => {
            upX = pointer.x;
            if (upX < downX - Threshold){
                this.Swipe = 'left';
            } else if (upX > downX + Threshold) {
                this.Swipe = 'right';
            }
        }); 

        // Collision with objects
        this.physics.add.overlap(this.player, this.Generator.starGroup, this.collectStar, null, this);
        this.physics.add.overlap(this.player, this.Generator.rockGroup, this.collideRock, null, this);

        this.time.addEvent({
            delay: 1000,
            callback: this.updateTime,
            callbackScope: this,
            loop: true
        });
        this.remainingTimeText = this.add.text(0, 0, ""+this.remainingTime, {});
        this.remainingTimeText.setScrollFactor(0, 0);
        this.remainingTimeText.setDepth(1);
    }

    private updateTime(){
        this.remainingTime -= 1;
        this.remainingTimeText.setText(""+ this.remainingTime);
    }

    private collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
        star.disableBody(true, true);

        // Warning: The value has to be created in registry beforehand.
        this.registry.values.starCount += 1;
    }

    private collideRock(player: Phaser.Physics.Arcade.Sprite, rock: Phaser.Physics.Arcade.Sprite) {
        rock.disableBody(true, true);
        this.time.addEvent({
			delay: 200,
			callback: this.playerBlink,
			callbackScope: this,
			repeat:5
        });
        this.registry.values.starCount -= 1;
        // player.disableBody(true, true);
        // this.gameEnded = true;

    }

	private playerBlink() {
      
		if (this.player.alpha == 1.0) {
			this.player.setAlpha(0);
		} else {
			this.player.setAlpha(1);
		}
	}

    public update() {
        this.updateCamera();
        this.Generator.update();
        this.player.y += this.cam_speed.current;
        // this.remainingTimeText.y += this.cam_speed.current;
        var corridor = Config.CarGame.corridorSize;
        if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == "left" ){
            this.moveTo(this.player.x -  corridor);
            this.Swipe = "";      
        }
        else if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == "right") {
            this.moveTo(this.player.x + corridor);
            this.Swipe = "";
        }
        this.move();

        if (this.remainingTime <= 0){
            this.gameEnded = true;
        }
        if (this.gameEnded){
            this.scene.start("Pacman");
        }

    }

    private moveTo(x:number){
        var carWidth = Config.CarGame.tileSize;
        if (x + carWidth/2 > Config.Game.width || x - carWidth/2 < 0) {
            return;
        }
        this.targetPos = x;
        if (x - this.player.x < 0)
            this.player.setVelocityX(-this.playerSpeed);
        else
            this.player.setVelocityX(this.playerSpeed);
    }

    private move() {
        var speedX = this.player.body.velocity.x;
        if ((speedX > 0 && this.player.x >= this.targetPos) ||
            (speedX < 0 && this.player.x <= this.targetPos)) {
                this.player.setVelocityX(0);
                this.player.x = this.targetPos;
        }
    }

    private updateCamera() {
        // Scroll camera
        this.cameras.main.setScroll(
            0,
            this.cameras.main.scrollY + this.cam_speed.current
        );
    }

    private setCamSpeed(speed) {
        this.cam_speed.base = speed;
        this.cam_speed.current = speed;
        this.cam_speed.current = Math.min(
            this.cam_speed.current,
            this.cam_speed.max
        );

        this.cam_speed.current = Math.max(
            this.cam_speed.current,
            0
        );
    }

}
