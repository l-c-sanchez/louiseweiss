import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { DialogTree, DialogTreeObj } from "../utils/DialogTree";

enum State {
    Paused,
    Started,
    Ended
}

class PacmanCharacter {

    Sprite: Phaser.Physics.Arcade.Sprite;
    Env: Pacman;
    Speed: number;
    Animations: Array<string>;

    Marker!: Phaser.Math.Vector2;
    Current!: number;
    Turning!: number;

    PrevTurnPoint = new Phaser.Math.Vector2(-1, -1);
    TurnPoint = new Phaser.Math.Vector2();
    Directions: Array<Phaser.Tilemaps.Tile> = [ null, null, null, null, null ];
    Opposites: Array<number> = [ Pacman.NONE, Pacman.RIGHT, Pacman.LEFT, Pacman.DOWN, Pacman.UP ];

    constructor(env: Pacman, spriteName: string, spawnX: number, spawnY: number, animations: Array<string>) {
        this.Env = env;
        this.Sprite = this.Env.physics.add.sprite(spawnX, spawnY, spriteName);
        this.Speed = 10;
        this.Turning = Pacman.NONE;
        this.Animations = animations;
    }

    public setSpeed(speed: number) {
        this.Speed = speed;
    }

    public checkSpaceAround() {
        this.Marker = new Phaser.Math.Vector2();
        var playerTile = this.Env.TileMap.getTileAtWorldXY(this.Sprite.x, this.Sprite.y);
        this.Marker.x = playerTile.x;
        this.Marker.y = playerTile.y;
        this.Directions[Pacman.LEFT] = this.Env.TileMap.getTileAt(playerTile.x - 1, playerTile.y);
        this.Directions[Pacman.RIGHT] = this.Env.TileMap.getTileAt(playerTile.x + 1, playerTile.y);
        this.Directions[Pacman.UP] = this.Env.TileMap.getTileAt(playerTile.x, playerTile.y - 1);
        this.Directions[Pacman.DOWN] = this.Env.TileMap.getTileAt(playerTile.x, playerTile.y + 1);
    }

    public automaticMove(target: PacmanCharacter) {
        if (this.Turning != Pacman.NONE) {
            return;
        }
        var bestMove = Pacman.NONE;
        var bestSquareDistance = 1000000000;

        for (var i = 0; i < this.Directions.length; ++i) {
            if (this.Directions[i] !== null && this.Directions[i].index === 7 && i != this.Opposites[this.Current] && i != this.Current) {
                if (bestMove == Pacman.NONE) {
                    bestMove = i;
                    bestSquareDistance = Phaser.Math.Distance.Squared(this.Directions[i].x * 32,  
                        this.Directions[i].y * 32, target.Sprite.x, target.Sprite.y);
                }
                else {             
                    var SquareDistance = Phaser.Math.Distance.Squared(this.Directions[i].x * 32,  
                    this.Directions[i].y * 32, target.Sprite.x, target.Sprite.y);
                    
                    if (SquareDistance < bestSquareDistance) {
                        bestSquareDistance = SquareDistance;
                        bestMove = i;
                    }
                }

            }
        }
        if (bestMove == Pacman.NONE) {
            this.Turning = Pacman.NONE;
        } 
        else {
            var turnPoint = new Phaser.Math.Vector2(this.Marker.x * 32 + 16, this.Marker.y * 32 + 16);
            if (turnPoint.x == this.PrevTurnPoint.x && turnPoint.y == this.PrevTurnPoint.y) {
                this.Turning = Pacman.NONE;
            } else {
                this.Turning = bestMove;
                this.TurnPoint.x = turnPoint.x;
                this.TurnPoint.y = turnPoint.y;
                this.PrevTurnPoint = this.TurnPoint;
            }

        }
    }
}

export class Pacman extends Phaser.Scene {

    static NONE = 0;
    static LEFT = 1;
    static RIGHT = 2;
    static UP = 3;
    static DOWN = 4;

    STAR_NB = 4;

    ScaleRatio!: number;
    Character: string;
    TileMap!: Phaser.Tilemaps.Tilemap;
    Player!: PacmanCharacter;
    Boss!: PacmanCharacter;
    Stars!: Phaser.Physics.Arcade.Group;
    RemainingStarCount: number;
    gameEnded: boolean;
    GameState: State;
    Config:any;
    private Button 		 : Phaser.GameObjects.Sprite
    private Dialogs	: DialogTree;

    StartDialog	 : DialogBox = null;


    // Player movement
    Cursors!: Phaser.Input.Keyboard.CursorKeys;
    Swipe!: string;
    Threshold!: number;

    hud: HudScene;

    constructor() {
        super({ key: 'Pacman', active:false});
    }

    preload(){}

    public init() {
        this.hud = <HudScene>this.scene.get("HudScene");
        this.hud.setRemainingTime(Config.Pacman.time, false);
        this.gameEnded = false;
    }

    public create() {
	
        this.Character = this.registry.get('character');
        var games = this.cache.json.get('Games'); 
        this.Config = games.Pacman[this.Character];
        if (!this.Config){
            throw new TypeError("Invalid config");
        }
        this.GameState = State.Paused;
        this.StartDialog = new DialogBox(this, this.Config.instruction, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Button = this.StartDialog.addArrowButton();
        this.Button.on('pointerup', this.startPacman, this);

    }
    startPacman() {
        // This avoid starting the game multiple times
        if (this.GameState != State.Paused){
            return;
        }
        this.StartDialog.destroy();
        this.Button.off("pointerup");

		this.TileMap = this.make.tilemap({ key: 'ClaraPacmanMap' });
        var tiles = this.TileMap.addTilesetImage('OfficeTileset', 'OfficeTileset');
		var layer = this.TileMap.createStaticLayer('layer0', tiles, 0, 0);
		layer.setCollisionByProperty({ collides: true });
		let posX = (Config.Game.width - layer.displayWidth) * 0.5

        var claraAnims = ["", "left", "right", "up", "down" ];
        var bossAnims = ["", "boss_left", "boss_right", "boss_up", "boss_down" ];
        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"left",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"up",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"down",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_char, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_right",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_follower, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_left",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_follower, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_up",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_follower, { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_down",
            frames:this.anims.generateFrameNumbers(this.Config.sprite_follower, { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });

		let bossPos = this.TileMap.tileToWorldXY(4, 2);
        this.Boss = new PacmanCharacter(this, this.Config.sprite_follower, bossPos.x + 16, bossPos.y + 16, bossAnims);
        
        // this.Boss.Sprite.setScale(0.5, 0.5);
        this.physics.add.collider(this.Boss.Sprite, layer);

		let playerPos = this.TileMap.tileToWorldXY(4, 8);
        this.Player = new PacmanCharacter(this, this.Config.sprite_char, playerPos.x + 16, playerPos.y + 16, claraAnims);

        // this.Player.Sprite.setScale(0.5, 0.5);
        this.Threshold = 10;//Math.ceil((32 - this.Player.displayWidth) / 2);
        this.physics.add.collider(this.Player.Sprite, layer);

        this.Cursors = this.input.keyboard.createCursorKeys();

        this.Stars = this.physics.add.group();

        this.Stars.create(this.gridToWorld(1), this.gridToWorld(7), 'star');
        this.Stars.create(this.gridToWorld(6), this.gridToWorld(2), 'star');
        this.Stars.create(this.gridToWorld(8), this.gridToWorld(8), 'star');
        this.Stars.create(this.gridToWorld(1), this.gridToWorld(12), 'star');

        this.RemainingStarCount = 4;
        this.physics.add.overlap(this.Player.Sprite, this.Stars, this.collectStar, null, this);
        this.physics.add.overlap(this.Player.Sprite, this.Boss.Sprite, this.collideBoss, null, this);
        // this.GameState = State.Paused;
        this.startConvwithBoss();

    }
    private startConvwithBoss() {
        var dialogContent:DialogTreeObj;

        if (this.Character == "valentin")
            dialogContent = this.cache.json.get('ClaraBoss');
        else
            dialogContent = this.cache.json.get('ClaraBoss');
        this.Dialogs = new DialogTree(this, dialogContent, false, Anchor.Down, {windowHeight: 500});
        
        console.log("start conv with your boss")
        this.add.existing(this.Dialogs);
        this.Dialogs.on('destroy', () => {
            var res : boolean = this.registry.get('GameOver'); 
            if (res == true) {
                this.scene.start('Result');
            }
            else
                this.beginExplanations();
        });  
    }
    private beginExplanations() {

        if (!this.sys.game.device.os.desktop ) {
			this.StartDialog = new DialogBox(this, this.Config.instruction_details_mobile, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
        }
        else 
            this.StartDialog = new DialogBox(this, this.Config.instruction_details_desktop, false, Anchor.Center, { windowHeight: 300, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Button = this.StartDialog.addArrowButton();
        this.Button.on('pointerup', this.beginGame, this);

    }
    private beginGame() {
        if (this.GameState != State.Paused){
            return;
        }
        this.StartDialog.destroy();
        this.Button.off("pointerup");
        this.hud.startTimer();
        this.Boss.setSpeed(60);
        this.Player.setSpeed(60);
        this.GameState = State.Started;
        var downX: number, upX: number, downY: number, upY: number, Threshold: number = 50;
        this.input.on('pointerdown', function (pointer : Phaser.Input.InputPlugin) {
            downX = pointer.x;
            downY = pointer.y;
        });
        this.input.on('pointerup', (pointer : Phaser.Input.InputPlugin) => {
            upX = pointer.x;
            upY = pointer.y;
            if (upX < downX - Threshold){
                this.Swipe = 'left';
            } else if (upX > downX + Threshold) {
                this.Swipe = 'right';
            } else if (upY < downY - Threshold) {
                this.Swipe = 'up';
            } else if (upY > downY + Threshold) {
                this.Swipe = 'down';
            }
        });     

        this.move(Pacman.RIGHT, this.Player);
        this.move(Pacman.LEFT, this.Boss);
    }
    public update() {

        if (this.GameState != State.Started)
            return;
        this.Player.checkSpaceAround();
        this.Boss.checkSpaceAround();
        this.Boss.automaticMove(this.Player);

        if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == 'right'){
            this.checkDirection(Pacman.RIGHT, this.Player);
        }
        else if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == 'left'){
            this.checkDirection(Pacman.LEFT, this.Player);
        }
        else if (this.Cursors.up != undefined && this.Cursors.up.isDown || this.Swipe == 'up'){
            this.checkDirection(Pacman.UP, this.Player);
        }
        else if (this.Cursors.down != undefined && this.Cursors.down.isDown || this.Swipe == 'down'){
            this.checkDirection(Pacman.DOWN, this.Player);
        }
        this.Swipe = '';

        if (this.Player.Turning != this.Player.Current && this.Player.Turning !== Pacman.NONE) {
            this.turn(this.Player);
        }
        if (this.Boss.Turning != this.Boss.Current && this.Boss.Turning !== Pacman.NONE) {
            this.turn(this.Boss);
        }

        if (this.hud.getRemainingTime() <= 0 || this.RemainingStarCount <= 0){
            this.gameEnded = true;
        }
        // var character: string = this.registry.get('character');
        if (this.gameEnded){
            this.scene.start('Result');
        }

    }

    private move(direction: number, character: PacmanCharacter)
    {
        if (direction === Pacman.LEFT) {
            character.Sprite.setVelocityX(-character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('left')) {
                character.Sprite.anims.play(character.Animations[Pacman.LEFT], true);
            }
        } else if (direction === Pacman.RIGHT) {
            character.Sprite.setVelocityX(character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('right')) {
                character.Sprite.anims.play(character.Animations[Pacman.RIGHT], true);
            }
        } else if (direction === Pacman.UP) {
            character.Sprite.setVelocityY(-character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('up')) {
                character.Sprite.anims.play(character.Animations[Pacman.UP], true);
            }
        } else {
            character.Sprite.setVelocityY(character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('down')) {
                character.Sprite.anims.play(character.Animations[Pacman.DOWN], true);
            }
        }
        character.Current = direction;
        
    }

    private turn(character: PacmanCharacter)
    {
        var cx = Math.floor(character.Sprite.x);
        var cy = Math.floor(character.Sprite.y);

		if (character.Directions[character.Turning] === null || character.Directions[character.Turning].index != 7) {
			character.Turning = Pacman.NONE;
			return false;
		}

        if (!Phaser.Math.Fuzzy.Equal(cx, character.TurnPoint.x, this.Threshold)
            || !Phaser.Math.Fuzzy.Equal(cy, character.TurnPoint.y, this.Threshold)) {
            return false;
        }

        character.Sprite.x = character.TurnPoint.x;
        character.Sprite.y = character.TurnPoint.y;

        character.Sprite.body.reset(character.TurnPoint.x, character.TurnPoint.y);
        this.move(character.Turning, character);
		character.Turning = Pacman.NONE;
		
        return true;
    }
    
    private checkDirection(direction: number, character: PacmanCharacter) {
        if (character.Turning === direction || character.Directions[direction] === null || character.Directions[direction].index != 7) {
			return;
        }

        if (character.Current === character.Opposites[direction]) {
            this.move(direction, character);
        } else {
            character.Turning = direction;

            character.TurnPoint.x = character.Marker.x * 32 + 16;
            character.TurnPoint.y = character.Marker.y * 32 + 16;
        }
    }

    private gridToWorld(pos: number) {
        return (pos * 32 + 16);
    }

    private collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
        star.disableBody(true, true);
        this.RemainingStarCount -= 1;
        this.registry.values.starCount += 1;
    }
    private collideBoss(player: Phaser.Physics.Arcade.Sprite, boss: Phaser.Physics.Arcade.Sprite) {
        player.disableBody(true, true);
        this.gameEnded = true;
    }
    private getStarCount(): number {
		if (this.registry.has('starCount')) {
			return (this.registry.get('starCount'));
		} else {
			console.warn("The starCount value should be initialized in the registry before this call.");
			return (0);
		}
	}
}
