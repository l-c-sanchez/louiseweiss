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
        obstacleGroup: Phaser.Physics.Arcade.Group,
    
        y: number,
        withObjects: boolean = true) 
	{
        this.Env = env;
        this.Cols = Config.CarGame.columns;
        this.PosY = y;
        

        this.LayerSprites = [];
        this.StarGroup = starGroup;
        this.RockGroup = obstacleGroup;
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
            if (Math.random() < Config.CarGame.rockProbability){
                var column = Phaser.Math.Between(-2, 2);
                var x = Config.Game.centerX + column * Config.CarGame.corridorSize;

                let obstacleName = this.getObstacleName();
                let obstacle = this.RockGroup.create(x, this.PosY, obstacleName);
                obstacle.setOrigin(0.5, 0.5);
                this.LayerSprites.push(obstacle);
            }
        }
    }

    private getObstacleName(){
        let character = this.Env.registry.get('character');
        let obstacles = Config.CarGame.obstacles[character];
        // Choose randomly among the obstacles
        let idx = Phaser.Math.Between(0, obstacles.length - 1);
        return obstacles[idx];
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
    ObstacleGroup: Phaser.Physics.Arcade.Group;

    constructor (Env) {
        
        this.Env = Env;
        
        this.Cols = 12;
        this.Rows = 20;
        this.Layers = [];

        this.FloorGroup = this.Env.physics.add.group();
        this.StarGroup = this.Env.physics.add.group();
        this.ObstacleGroup = this.Env.physics.add.group();
        this.FloorGroup.setDepth(0, 0);
        this.StarGroup.setDepth(1, 0);
        this.ObstacleGroup.setDepth(1, 0);
    }

    public setup() {
        let y;
        let rows = this.Rows + 1;

        this.Layers = [];

        for (let ty = 0; ty < rows; ty++){
            y = (ty * Config.CarGame.tileSize)
            this.Layers.push(new Layer(this.Env, this.FloorGroup, this.StarGroup, this.ObstacleGroup, y, false));
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
        this.Layers.unshift(new Layer(this.Env, this.FloorGroup, this.StarGroup, this.ObstacleGroup, y));
    }
}

enum Direction {
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
    private Button 		 : Phaser.GameObjects.Sprite
	PlayerMoving: boolean = false;

    hud: HudScene;

    RemainingTime: number;
    RemainingTimeText: GameText;
    GameEnded    : boolean;
    GameState    : State;
    StartDialog	 : DialogBox = null;
    Subtitles	 : DialogBox = null;
    SubtitleId	 : number = 0;

    invicible: boolean;

    // Player movement
    Cursors: Phaser.Input.Keyboard.CursorKeys;
    TouchDirection: Direction;

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
            this.hud.setRemainingTime(Config.CarGame.time_Valentin, false);
    }

    public create() {
        var games = this.cache.json.get('Games');
        this.Config = games.CarGame[this.Character];
        if (!this.Config){
            throw new TypeError("Invalid config");
        }
        this.GameState = State.Paused;
        this.StartDialog = new DialogBox(this, this.Config.instruction, true, Anchor.Center, { fitContent: true, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Button = this.StartDialog.addArrowButton();
        this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startInstruction();
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
    }

    public startInstruction() {
        this.StartDialog.destroy();
        this.Button.off("pointerup");
        var instruction_details = this.Config.instruction_details_desktop;
		if(!this.sys.game.device.os.desktop)
            instruction_details = this.Config.instruction_details_mobile;
        this.StartDialog = new DialogBox(this, instruction_details, true, Anchor.Center, { fitContent: true, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Button = this.StartDialog.addArrowButton();
        this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startCarGame()
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
        // let button = this.StartDialog.addArrowButton();
        // button.on('pointerup', this.startCarGame, this);
    }
    

    public startCarGame() {    // Create initial environment
        // This avoid starting the game multiple times
        
        if (this.GameState != State.Paused){
            return;
        }
        this.Button.off("pointerup");
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

        // Player movement on Mobile environment
		if (!this.sys.game.device.os.desktop) {
            this.addControlArrow(Config.Game.width * 1 / 4, 'LeftArrow');
            this.addControlArrow(Config.Game.width * 3 / 4, 'RightArrow');

            this.input.on(
                'pointerdown',
                function(pointer: Phaser.Input.InputPlugin){ this.updateTouchDirection(pointer) },
                this
            );
            this.input.on(
                'pointermove',
                function(pointer: Phaser.Input.InputPlugin){ this.updateTouchDirection(pointer) },
                this
            );
            this.input.on(
                'pointerup',
                function(pointer: Phaser.Input.InputPlugin){ this.TouchDirection = Direction.None },
                this
            );
        }

        this.Cursors = this.input.keyboard.createCursorKeys();

        // Collision with objects
        this.physics.add.overlap(this.Player, this.Generator.StarGroup, this.collectStar, null, this);
		this.physics.add.overlap(this.Player, this.Generator.ObstacleGroup, this.collideObstacle, null, this);
		
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
			this.scene.launch('ValentinSubtitles')
        }
    }

    private updateTouchDirection(pointer: Phaser.Input.InputPlugin){    
        let downX = pointer.x;
        let centerX = Config.Game.centerX;
        let threshold = 30;
        if (downX < centerX - threshold) {
            this.TouchDirection = Direction.Left;
        } else if (downX > centerX + threshold) {
            this.TouchDirection = Direction.Right;
        }
    }

    private addControlArrow(x: number, name: string): void {
        let arrow = this.physics.add.sprite(x, Config.Game.height * 3 / 4, name);
        arrow.setScrollFactor(0);
        arrow.setAlpha(0.3);
        arrow.depth = 2;
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

    private collideObstacle(player: Phaser.Physics.Arcade.Sprite, rock: Phaser.Physics.Arcade.Sprite) {
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
		if (!this.PlayerMoving)
		{
			if (this.Cursors.left != undefined && Phaser.Input.Keyboard.JustDown(this.Cursors.left) || this.TouchDirection == Direction.Left ){
				this.moveTo(this.Player.x -  corridor);
			}
			else if (this.Cursors.right != undefined && Phaser.Input.Keyboard.JustDown(this.Cursors.right) || this.TouchDirection == Direction.Right) {
				this.moveTo(this.Player.x + corridor);
			}
		}
        this.move();

        if (this.hud.getRemainingTime() <= 0){
            this.GameEnded = true;            
        }
        if (this.GameEnded){
            if (this.Character == "valentin")
                this.scene.start("PatientStreet");
            else if (this.Character == "lucie")
                this.scene.start("Result");
		}
    }

	private showSubtitles() {
		if (this.Subtitles != null)
			this.Subtitles.destroy();

		if (this.SubtitleId < 1) {
			console.log(this.SubtitleId.toString());
			console.log(this.Config['subtitle' + this.SubtitleId.toString()]);
			this.Subtitles = new DialogBox(this, this.Config['subtitle' + this.SubtitleId.toString()], true, Anchor.Top, { fitContent: true, fontSize: 22 });
			++this.SubtitleId;
			this.time.addEvent({
				delay: 5000,
				callback: this.showSubtitles,
				callbackScope: this
			});
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
		this.PlayerMoving = true;
    }

    private move() {
        var speedX = this.Player.body.velocity.x;
        if ((speedX > 0 && this.Player.x >= this.TargetPos) ||
            (speedX < 0 && this.Player.x <= this.TargetPos)) {
                this.Player.setVelocityX(0);
				this.Player.x = this.TargetPos;
				this.PlayerMoving = false;
        }
    }

    private updateCamera(deltaTime: number) {
		let newPosY = this.cameras.main.scrollY + this.CamSpeed * deltaTime;
        this.cameras.main.setScroll(0, newPosY);
    }
}
