import { Config } from "../Config";
import { MS2S } from "../init";
import { GameText } from "../utils/GameText"
import { HudScene } from "./HudScene";


class Layer {
    LayerSprites: Array<Phaser.GameObjects.Sprite>
    FloorGroup: Phaser.Physics.Arcade.Group
    StarGroup: Phaser.Physics.Arcade.Group
    RockGroup: Phaser.Physics.Arcade.Group
    
    PosY: number
    Cols: number
    Env: CarGame

    constructor (
        env: CarGame,
        floorGroup: Phaser.Physics.Arcade.Group, 
        starGroup: Phaser.Physics.Arcade.Group,
        rockGroup: Phaser.Physics.Arcade.Group,
        y: number,
        withObjects: boolean = true) 
	{
        this.Env = env;
        this.Cols = Config.CarGame.columns;
        this.PosY = y;

        this.LayerSprites = [];
        this.StarGroup = starGroup;
        this.RockGroup = rockGroup;
        this.FloorGroup = floorGroup;
        this.createLayer(withObjects);
    }

    private createLayer(withObjects: boolean) {

        for (let tx = 0; tx < this.Cols; tx++) {
            var x = (tx * Config.CarGame.tileSize)
            if (tx != 3 && tx != 8) {
                this.FloorGroup.create(x, this.PosY, 'road');
            } else {
                this.FloorGroup.create(x, this.PosY, 'road_line');
            }
        }

        if (withObjects){
            if (Math.random() < Config.CarGame.starProbability){
                var column = Phaser.Math.Between(-2, 2);
                var x = Config.Game.centerX + column * Config.CarGame.corridorSize;
                var star: Phaser.Physics.Arcade.Sprite = this.StarGroup.create(x, this.PosY, 'star');
                star.setOrigin(0.5, 0.5);
                this.LayerSprites.push(star);
            }
            if (Math.random() < Config.CarGame.starProbability){
                var column = Phaser.Math.Between(-2, 2);
                var x = Config.Game.centerX + column * Config.CarGame.corridorSize;
                var rock: Phaser.Physics.Arcade.Sprite = this.RockGroup.create(x, this.PosY, 'rock');
                rock.setOrigin(0.5, 0.5);
                this.LayerSprites.push(rock);
            }
        }
    }

    public destroy() {
        for (var i=0; i<this.LayerSprites.length; i++){
            this.FloorGroup.remove(this.LayerSprites[i], true, true);
            this.StarGroup.remove(this.LayerSprites[i], true, true);
            this.RockGroup.remove(this.LayerSprites[i], true, true);
        }
    }
}


class Generator {
    Cols: number;
    Rows: number;
    Env: CarGame;
    Layers: Array<Layer>
    FloorGroup: Phaser.Physics.Arcade.Group
    StarGroup: Phaser.Physics.Arcade.Group
    RockGroup: Phaser.Physics.Arcade.Group

    constructor (Env) {
        
        this.Env = Env;
        
        this.Cols = 12;
        this.Rows = 20;
        this.Layers = [];

        this.FloorGroup = this.Env.physics.add.group();
        this.StarGroup = this.Env.physics.add.group();
        this.RockGroup = this.Env.physics.add.group();
        this.FloorGroup.setDepth(0, 0);
        this.StarGroup.setDepth(1, 0);
        this.RockGroup.setDepth(1, 0);
    }

    public setup() {
        let y;
        let rows = this.Rows + 1;

        this.Layers = [];

        for (let ty = 0; ty < rows; ty++){
            y = (ty * Config.CarGame.tileSize)
            this.Layers.push(new Layer(this.Env, this.FloorGroup, this.StarGroup, this.RockGroup, y, false));
        }
	}
	
    public update() {
        let ty = this.Layers.length;
        let offset = this.Env.cameras.main.scrollY - this.Layers[ty - 1].PosY;
        if (offset <= -640)  {
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
        let y = this.Layers[0].PosY - Config.CarGame.tileSize;
        this.Layers.unshift(new Layer(this.Env, this.FloorGroup, this.StarGroup, this.RockGroup, y));
    }
}

enum SwipeDirection {
	None,
	Right,
	Left
}

export class CarGame extends Phaser.Scene {
    Generator: Generator;
    CamSpeed: { base:number, current:number, max:number};
    Player: Phaser.Physics.Arcade.Sprite;
    PlayerSpeed: number;
    TargetPos: number;

    hud: HudScene;

    RemainingTime: number;
    RemainingTimeText: GameText;
    GameEnded: boolean;

    invicible: boolean;

    // Player movement
    Cursors: Phaser.Input.Keyboard.CursorKeys;
    Swipe: string;

    constructor() {
        super({ key: 'CarGame', active:false });
        this.TargetPos = Config.Game.centerX;
    }

    public init() {
        this.Generator = new Generator(this);
        this.CamSpeed = {
            base: Config.CarGame.camSpeed, 
            current: Config.CarGame.camSpeed,
            max: Config.CarGame.camSpeed
        }
        this.GameEnded = false;
        this.invicible = false;
        this.PlayerSpeed = Config.CarGame.playerSpeed;
        this.hud = <HudScene>this.scene.get("HudScene");
        this.hud.setRemainingTime(Config.CarGame.time);
    }

    public create() {
        // Create initial environment
        this.Generator.setup();

        // Create Player
        this.Player = this.physics.add.sprite(Config.Game.centerX, Config.Game.centerY / 2 * 3, 'voiture');
        this.Player.setOrigin(0.5, 0.5);
        this.Player.setDepth(10);        
        this.Player.setScale(2, 2);

        // Dealing with Swipes
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
        this.physics.add.overlap(this.Player, this.Generator.StarGroup, this.collectStar, null, this);
        this.physics.add.overlap(this.Player, this.Generator.RockGroup, this.collideRock, null, this);
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
		if (this.Player.alpha == 1.0) {
			this.Player.setAlpha(0);
		} else {
			this.Player.setAlpha(1);
		}
	}

    public update(time: number, deltaTime: number) {
		deltaTime = MS2S(deltaTime);
        this.updateCamera(deltaTime);
        this.Generator.update();
        this.Player.y += this.CamSpeed.current * deltaTime;
        var corridor = Config.CarGame.corridorSize;
        if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == "left" ){
            this.moveTo(this.Player.x -  corridor);
            this.Swipe = "";      
        }
        else if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == "right") {
            this.moveTo(this.Player.x + corridor);
            this.Swipe = "";
        }
        this.move();

        if (this.hud.getRemainingTime() <= 0){
            this.GameEnded = true;            
        }
        if (this.GameEnded){
            this.scene.start("Pacman");
        }

    }

    private moveTo(x: number){
        var carWidth = Config.CarGame.tileSize;
        if (x + carWidth/2 > Config.Game.width || x - carWidth/2 < 0) {
            return;
        }
        this.TargetPos = x;
        if (x - this.Player.x < 0)
            this.Player.setVelocityX(-this.PlayerSpeed);
        else
            this.Player.setVelocityX(this.PlayerSpeed);
    }

    private move() {
        var speedX = this.Player.body.velocity.x;
        if ((speedX > 0 && this.Player.x >= this.TargetPos) ||
            (speedX < 0 && this.Player.x <= this.TargetPos)) {
                this.Player.setVelocityX(0);
                this.Player.x = this.TargetPos;
        }
    }

    private updateCamera(deltaTime: number) {
		let newPosY = this.cameras.main.scrollY + this.CamSpeed.current * deltaTime;
        this.cameras.main.setScroll(0, newPosY);
    }

    // This function is never used. Should we keep it?
    private setCamSpeed(speed: number) {
        this.CamSpeed.base = speed;
        this.CamSpeed.current = speed;
        this.CamSpeed.current = Math.min(
            this.CamSpeed.current,
            this.CamSpeed.max
        );

        this.CamSpeed.current = Math.max(
            this.CamSpeed.current,
            0
        );
    }

}
