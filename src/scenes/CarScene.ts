import { Config } from "../Config";
import { MS2S } from "../init";
import { GameText } from "../utils/GameText"
import { HudScene } from "./HudScene";


class Layer {
    layerSprites: Array<Phaser.GameObjects.Sprite>
    floorGroup: Phaser.Physics.Arcade.Group
    starGroup: Phaser.Physics.Arcade.Group
    rockGroup: Phaser.Physics.Arcade.Group
    
    y: number
    cols: number
    env: CarGame

    constructor (
        env: CarGame,
        floorGroup: Phaser.Physics.Arcade.Group, 
        starGroup: Phaser.Physics.Arcade.Group,
        rockGroup: Phaser.Physics.Arcade.Group,
        y: number,
        withObjects: boolean = true) 
	{
        this.env = env;
        this.cols = Config.CarGame.columns;
        this.y = y;

        this.layerSprites = [];
        this.starGroup = starGroup;
        this.rockGroup = rockGroup;
        this.floorGroup = floorGroup;
        this.createLayer(withObjects);
    }

    private createLayer(withObjects: boolean) {

        for (let tx = 0; tx < this.cols; tx++) {
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
                var star: Phaser.Physics.Arcade.Sprite = this.starGroup.create(x, this.y, 'star');
                star.setOrigin(0.5, 0.5);
                this.layerSprites.push(star);
            }
            if (Math.random() < Config.CarGame.starProbability){
                var column = Phaser.Math.Between(-2, 2);
                var x = Config.Game.centerX + column * Config.CarGame.corridorSize;
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


class Generator {
    cols: number;
    rows: number;
    env: CarGame;
    layers: Array<Layer>
    floorGroup: Phaser.Physics.Arcade.Group
    starGroup: Phaser.Physics.Arcade.Group
    rockGroup: Phaser.Physics.Arcade.Group

    constructor (env) {
        
        this.env = env;
        
        this.cols = 12;
        this.rows = 20;
        this.layers = [];

        this.floorGroup = this.env.physics.add.group();
        this.starGroup = this.env.physics.add.group();
        this.rockGroup = this.env.physics.add.group();
        this.floorGroup.setDepth(0, 0);
        this.starGroup.setDepth(1, 0);
        this.rockGroup.setDepth(1, 0);
    }

    public setup() {
        let y;
        let rows = this.rows + 1;

        this.layers = [];

        for (let ty = 0; ty < rows; ty++){
            y = (ty * Config.CarGame.tileSize)
            this.layers.push(new Layer(this.env, this.floorGroup, this.starGroup, this.rockGroup, y, false));
        }
	}
	
    public update() {
        let ty = this.layers.length;
        let offset = this.env.cameras.main.scrollY - this.layers[ty - 1].y;
        if (offset <= -640)  {
            this.appendLayer();
            this.destroyLastLayer();
        }
	}
	
    private destroyLastLayer() {
        let ty = this.layers.length;
        this.layers[ty-1].destroy();
        this.layers.splice(ty - 1, 1);
	}
	
    private appendLayer() {
        let y = this.layers[0].y - Config.CarGame.tileSize;
        this.layers.unshift(new Layer(this.env, this.floorGroup, this.starGroup, this.rockGroup, y));
    }
}


export class CarGame extends Phaser.Scene {
    generator: Generator;
    camSpeed: { base:number, current:number, max:number};
    player: Phaser.Physics.Arcade.Sprite;
    playerSpeed: number;
    targetPos: number;
    gameEnded: boolean;
    invicible: boolean;

    hud: HudScene;

    // Player movement
    cursors: Phaser.Input.Keyboard.CursorKeys;
    swipe: string;

    constructor() {
        super({ key: 'CarGame', active:false });
        this.targetPos = Config.Game.centerX;
    }

    public init() {
        this.generator = new Generator(this);
        this.camSpeed = {
            base: Config.CarGame.camSpeed, 
            current: Config.CarGame.camSpeed,
            max: Config.CarGame.camSpeed
        }
        this.gameEnded = false;
        this.invicible = false;
        this.playerSpeed = Config.CarGame.playerSpeed;
        this.hud = <HudScene>this.scene.get("HudScene");
        this.hud.setRemainingTime(Config.CarGame.time);
    }

    public create() {
        // Create initial environment
        this.generator.setup();

        // Create Player
        this.player = this.physics.add.sprite(Config.Game.centerX, Config.Game.centerY / 2 * 3, 'voiture');
        this.player.setOrigin(0.5, 0.5);
        this.player.setDepth(10);        
        this.player.setScale(2, 2);

        // Dealing with Swipes
        this.cursors = this.input.keyboard.createCursorKeys();
        var downX: number, upX: number, Threshold: number = 50;
        this.input.on('pointerdown', function (pointer : Phaser.Input.InputPlugin) {
            downX = pointer.x;
        });
        this.input.on('pointerup', (pointer : Phaser.Input.InputPlugin) => {
            upX = pointer.x;
            if (upX < downX - Threshold){
                this.swipe = 'left';
            } else if (upX > downX + Threshold) {
                this.swipe = 'right';
            }
        }); 

        // Collision with objects
        this.physics.add.overlap(this.player, this.generator.starGroup, this.collectStar, null, this);
        this.physics.add.overlap(this.player, this.generator.rockGroup, this.collideRock, null, this);
    }

	private updateStarCount(difference: number) {
		if (this.registry.has('starCount')) {
			let stars: number = this.registry.get('starCount');
			stars = Math.max(0, stars + difference);
			this.registry.set('starCount', stars);
		} else {
			console.warn("The starCount value should be initialized in the registry before this call.");
		}
	}

    private collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
        star.disableBody(true, true);
		this.updateStarCount(1);
    }

    private collideRock(player: Phaser.Physics.Arcade.Sprite, rock: Phaser.Physics.Arcade.Sprite) {
        rock.disableBody(true, true);

        if (!this.invicible){
            var blinkPeriod = 200; // ms
            var blinkCount = 5;

            this.time.addEvent({
                delay: blinkPeriod,
                callback: this.playerBlink,
                callbackScope: this,
                repeat: blinkCount
            });
            
            // player is invicible as long as he blinks
            this.invicible = true;
            this.time.addEvent({
                delay: blinkPeriod * blinkCount,
                callback: function(){ this.invicible = false; },
                callbackScope: this
            })

            this.updateStarCount(-1);
        }
    }

	private playerBlink() {
		if (this.player.alpha == 1.0) {
			this.player.setAlpha(0);
		} else {
			this.player.setAlpha(1);
		}
	}

    public update(time: number, deltaTime: number) {
		deltaTime = MS2S(deltaTime);
        this.updateCamera(deltaTime);
        this.generator.update();
        this.player.y += this.camSpeed.current * deltaTime;
        var corridor = Config.CarGame.corridorSize;
        if (this.cursors.left != undefined && this.cursors.left.isDown || this.swipe == "left" ){
            this.moveTo(this.player.x -  corridor);
            this.swipe = "";      
        }
        else if (this.cursors.right != undefined && this.cursors.right.isDown || this.swipe == "right") {
            this.moveTo(this.player.x + corridor);
            this.swipe = "";
        }
        this.move();

        if (this.hud.getRemainingTime() <= 0){
            this.gameEnded = true;            
        }
        if (this.gameEnded){
            this.scene.start("Pacman");
        }

    }

    private moveTo(x: number){
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

    private updateCamera(deltaTime: number) {
		let newPosY = this.cameras.main.scrollY + this.camSpeed.current * deltaTime;
        this.cameras.main.setScroll(0, newPosY);
    }

    // This function is never used. Should we keep it?
    private setCamSpeed(speed: number) {
        this.camSpeed.base = speed;
        this.camSpeed.current = speed;
        this.camSpeed.current = Math.min(
            this.camSpeed.current,
            this.camSpeed.max
        );

        this.camSpeed.current = Math.max(
            this.camSpeed.current,
            0
        );
    }

}
