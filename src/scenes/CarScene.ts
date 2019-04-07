import { Config } from "../Config";
import { MS2S } from "../init";
import { GameText } from "../utils/GameText"
import { HudScene } from "./HudScene";
import { DialogBox, Anchor } from "../utils/DialogBox";

enum State {
    Paused,
    Started,
    Ended
}

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
            var x = (tx * Config.CarGame.tileSize);
            var floor:Phaser.GameObjects.Sprite;

            if (tx != 3 && tx != 8) {
                floor = this.FloorGroup.create(x, this.PosY, 'road');
            } else {
                floor = this.FloorGroup.create(x, this.PosY, 'road_line');
            }
            this.LayerSprites.push(floor);
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
                var rock: Phaser.Physics.Arcade.Sprite;
                var character = this.Env.registry.get('character');
                if (character == "valentin")
                    rock = this.RockGroup.create(x, this.PosY, 'rock');
                else
                    rock = this.RockGroup.create(x, this.PosY, 'burger');
                rock.setOrigin(0.5, 0.5);
                this.LayerSprites.push(rock);
            }
        }
    }

    public destroy() {

        for (var i=0; i < this.LayerSprites.length; i++){
            this.FloorGroup.remove(this.LayerSprites[i], true, true);
            this.StarGroup.remove(this.LayerSprites[i], true, true);
            this.RockGroup.remove(this.LayerSprites[i], true, true);
            this.LayerSprites[i].destroy();
        }
    }
}


class Generator {
    Cols: number;
    Rows: number;
    Env: CarGame;
    Layers: Array<Layer>;
    FloorGroup: Phaser.Physics.Arcade.Group;
    StarGroup: Phaser.Physics.Arcade.Group;
    RockGroup: Phaser.Physics.Arcade.Group;

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
        if (offset <= -Config.Game.height - 16)  {
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
    Games: any;
    Generator: Generator;
    CamSpeed: number;
    Player: Phaser.Physics.Arcade.Sprite;
    PlayerSpeed: number;
    TargetPos: number;
    Config:any;
    Character:string;

    hud: HudScene;

    RemainingTime: number;
    RemainingTimeText: GameText;
    GameEnded    : boolean;
    GameState    : State;
    StartDialog	 : DialogBox = null;

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
        this.CamSpeed = Config.CarGame.camSpeed;
        this.Character = this.registry.get('character'); 
        this.GameEnded = false;
        this.invicible = false;
        this.PlayerSpeed = Config.CarGame.playerSpeed;
        this.hud = <HudScene>this.scene.get("HudScene");
        if (this.Character == "lucie")
            this.hud.setRemainingTime(Config.CarGame.time_Lucie, false);
        else if (this.Character == "clara" || this.Character == "valentin")
            this.hud.setRemainingTime(Config.CarGame.time_Clara, false);
    }

    public create() {
        var games = this.cache.json.get('Games');
        this.Config = games.CarGame[this.Character];
        if (!this.Config){
            throw new TypeError("Invalid config");
        }
        this.GameState = State.Paused;

        // this.StartDialog = new DialogBox(this, this.Config.instruction, false, Anchor.Center, { fitContent: true, fontSize: 22 });
        // this.add.existing(this.StartDialog);
        // let button = this.StartDialog.addArrowButton();
		// button.on('pointerup', this.startInstruction, this);
		this.startInstruction();
    }

    public startInstruction() {
        // this.StartDialog.destroy();
        var instruction_details = this.Config.instruction_details_desktop;
		if(!this.sys.game.device.os.desktop)
            instruction_details = this.Config.instruction_details_mobile;
        this.StartDialog = new DialogBox(this, instruction_details, false, Anchor.Center, { fitContent: true, fontSize: 22 });
        this.add.existing(this.StartDialog);
        let button = this.StartDialog.addArrowButton();
        button.on('pointerup', this.startCarGame, this);
    }
    
    public startCarGame() {    // Create initial environment
        // This avoid starting the game multiple times
        if (this.GameState != State.Paused){
            return;
        }
        this.GameState = State.Started;

        this.Generator.setup();
        this.hud.startTimer();

        // Create Player
        if (this.Character == "lucie")
            this.Player = this.physics.add.sprite(Config.Game.centerX, Config.Game.centerY / 2 * 3, 'lucie');
		else
		{
            this.Player = this.physics.add.sprite(Config.Game.centerX, Config.Game.centerY / 2 * 3, 'voiture');
			this.Player.setScale(2, 2);
		}
		this.Player.setOrigin(0.5, 0.5);
        this.Player.setDepth(10);        

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
		
        //Start sounds
        if (this.Character == "valentin"){
            let flash = this.sound.add('ValentinFlash', {
                mute: false,
                volume: 1,
                rate: 1,
                detune: 0,
                seek: 0,
                loop: false,
                delay: 0
            });
            flash.play();
        }
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
        if (this.GameState != State.Started)
            return;
		deltaTime = MS2S(deltaTime);
        this.updateCamera(deltaTime);
        this.Generator.update();
        this.Player.y += this.CamSpeed * deltaTime;
		var corridor = Config.CarGame.corridorSize;
        if (this.Cursors.left != undefined && Phaser.Input.Keyboard.JustDown(this.Cursors.left) || this.Swipe == "left" ){
            this.moveTo(this.Player.x -  corridor);
            this.Swipe = "";
        }
        else if (this.Cursors.right != undefined && Phaser.Input.Keyboard.JustDown(this.Cursors.right) || this.Swipe == "right") {
            this.moveTo(this.Player.x + corridor);
            this.Swipe = "";
        }
        this.move();

        if (this.hud.getRemainingTime() <= 0){
            this.GameEnded = true;            
        }
        if (this.GameEnded){
            if (this.Character == "valentin")
                this.scene.start("ValentinConv");
            else if (this.Character == "lucie")
                this.scene.start("Result");
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
		let newPosY = this.cameras.main.scrollY + this.CamSpeed * deltaTime;
        this.cameras.main.setScroll(0, newPosY);
    }
}
