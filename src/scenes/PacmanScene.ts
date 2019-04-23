import { Config } from "../Config";
import { HudScene } from "./HudScene";
import { DialogBox, Anchor } from "../utils/DialogBox";
import { DialogTree, DialogTreeObj } from "../utils/DialogTree";

enum State {
    Paused,
    Started,
    Ended
}

enum Direction {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    UP = 3,
    DOWN = 4
}

namespace Direction {
    export function fromString(s: string): Direction {
        switch(s) {
            case "L":
                return Direction.LEFT;
            case "R":
                return Direction.RIGHT;
            case "D":
            return Direction.DOWN;
            case "U":
                return Direction.UP;
            default:
                return Direction.NONE;
         }
    }

    export function toString(direction: Direction): string {
        switch(direction) {
            case Direction.NONE:
                return "NONE";
            case Direction.LEFT:
                return "LEFT";
            case Direction.RIGHT:
                return "RIGHT";
            case Direction.UP:
                return "UP";
            case Direction.DOWN:
                return "DOWN";
        }
    }

    export function toVector(direction: Direction): Phaser.Math.Vector2 {
        switch(direction) {
            case Direction.NONE:
                return new Phaser.Math.Vector2(0, 0);
            case Direction.LEFT:
                return new Phaser.Math.Vector2(-1, 0);
            case Direction.RIGHT:
                return new Phaser.Math.Vector2(1, 0);
            case Direction.UP:
                return new Phaser.Math.Vector2(0, -1);
            case Direction.DOWN:
                return new Phaser.Math.Vector2(0, 1);
        }
    }
}


class PacmanCharacter {

    Sprite: Phaser.Physics.Arcade.Sprite;
    Env: Pacman;
    Speed: number;
    Animations: Array<string>;
    DirectionToAnimation: {[key: string]: string}

    Marker!: Phaser.Math.Vector2;
    Current!: number;
    Turning!: number;

    PrevTurnPoint = new Phaser.Math.Vector2(-1, -1);
    TurnPoint = new Phaser.Math.Vector2();
    Directions: Array<Phaser.Tilemaps.Tile> = [ null, null, null, null, null ];
    Opposites: Array<number> = [ Pacman.NONE, Pacman.RIGHT, Pacman.LEFT, Pacman.DOWN, Pacman.UP ];

    TargetPosition: Phaser.Math.Vector2;
    CurrentDirection: Direction;

    constructor(env: Pacman, spriteName: string, spawnX: number, spawnY: number, animations: Array<string>) {
        this.Env = env;
        this.Sprite = this.Env.physics.add.sprite(spawnX, spawnY, spriteName);
        this.Speed = 10;
        this.Turning = Pacman.NONE;
        this.Animations = animations;
        this.DirectionToAnimation = {
            "NONE": animations[0],
            "LEFT": animations[1],
            "RIGHT": animations[2],
            "UP": animations[3],
            "DOWN": animations[4]
        }
    }

    public setSpeed(speed: number) {
        this.Speed = speed;
    }

    public checkSpaceAround(): void {
        this.Marker = new Phaser.Math.Vector2();
        var playerTile = this.Env.TileMap.getTileAtWorldXY(this.Sprite.x, this.Sprite.y);
        this.Marker.x = playerTile.x;
        this.Marker.y = playerTile.y;
        this.Directions[Pacman.LEFT] = this.Env.TileMap.getTileAt(playerTile.x - 1, playerTile.y);
        this.Directions[Pacman.RIGHT] = this.Env.TileMap.getTileAt(playerTile.x + 1, playerTile.y);
        this.Directions[Pacman.UP] = this.Env.TileMap.getTileAt(playerTile.x, playerTile.y - 1);
        this.Directions[Pacman.DOWN] = this.Env.TileMap.getTileAt(playerTile.x, playerTile.y + 1);
    }

    /**
     * Move character to the next tile in the chosen direction. Once final position is reached, it stops.
     * To do that, character.checkPosition() has to be called in scene update method
     */
    public moveTo(scene: Pacman, direction: Direction){
        if (this.CurrentDirection != direction){
            this.Sprite.play(this.DirectionToAnimation[Direction.toString(direction)]);
        }
        let currentTile = scene.TileMap.worldToTileXY(this.Sprite.x, this.Sprite.y);
        let delta = Direction.toVector(direction);
        let target = scene.TileMap.tileToWorldXY(currentTile.x + delta.x, currentTile.y + delta.y);
        // TargetPosition will be used for stopping
        this.TargetPosition = new Phaser.Math.Vector2(target.x + 16, target.y + 16);

        scene.physics.moveTo(this.Sprite, this.TargetPosition.x, this.TargetPosition.y, this.Speed);
    }

    /**
     * This will stop the Sprite when it reaches the TargetPosition
     */
    public checkTargetPosition(): boolean {
        if (!this.TargetPosition){
            return;
        }
        let threshold = 2;
        if (Phaser.Math.Fuzzy.Equal(this.TargetPosition.x, this.Sprite.x, threshold) &&
            Phaser.Math.Fuzzy.Equal(this.TargetPosition.y, this.Sprite.y, threshold)
        ){
            // Stop the movement and put sprite exactly to TargetPos
            this.Sprite.setVelocity(0);
            this.Sprite.x = this.TargetPosition.x;
            this.Sprite.y = this.TargetPosition.y;

            return true;
        } else {
            return false;
        }
    }
}

export class Pacman extends Phaser.Scene {

    static NONE = 0;
    static LEFT = 1;
    static RIGHT = 2;
    static UP = 3;
    static DOWN = 4;

    STAR_NB: number = 4;

    ScaleRatio!: number;
    Character: string;
    TileMap!: Phaser.Tilemaps.Tilemap;
    Player!: PacmanCharacter;

    Boss!: PacmanCharacter;

    Stars!: Phaser.Physics.Arcade.Group;
    RemainingStarCount: number;
    GameEnded: boolean;
    GameState: State;
    Config:any;
    private Button 		 : Phaser.GameObjects.Sprite
    private Dialogs	: DialogTree;

    StartDialog	 : DialogBox = null;

    OptimalDirections: {[key: string]: string}

    // Player movement
    Cursors!: Phaser.Input.Keyboard.CursorKeys;
    Swipe!: string;
    Threshold!: number;

    Hud: HudScene;

    constructor() {
        super({ key: 'Pacman', active:false});
    }

    preload(){}

    public init() {
        this.Hud = <HudScene>this.scene.get("HudScene");
        this.Hud.setRemainingTime(Config.Pacman.time, false);
        this.GameEnded = false;
    }

    public create() {
	
        this.Character = this.registry.get('character');
        var games = this.cache.json.get('Games'); 
        this.Config = games.Pacman[this.Character];
        if (!this.Config){
            throw new TypeError("Invalid config");
        }
        this.GameState = State.Paused;

        this.StartDialog = new DialogBox(this, this.Config.instruction, true, Anchor.Center, { fitContent:true, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Button = this.StartDialog.addArrowButton();
		this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.startPacman();
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
    }

    startPacman() {
        if (this.GameState != State.Paused){
            return;
        }
        this.StartDialog.destroy();
        this.Button.off("pointerup");
        this.cameras.main.setBackgroundColor('#000000');
		this.TileMap = this.make.tilemap({ key: 'ClaraPacmanMap' });
        var tiles = this.TileMap.addTilesetImage('OfficeTileset', 'OfficeTileset');
		var layer = this.TileMap.createStaticLayer('layer0', tiles, 0, 0);
		layer.setCollisionByProperty({ collides: true });
		let posX = (Config.Game.width - layer.displayWidth) * 0.5

        var claraAnims = ["", "left", "right", "up", "down" ];
        var bossAnims = ["", "boss_left", "boss_right", "boss_up", "boss_down" ];
		this.anims.remove('right');
		this.anims.remove('left');
		this.anims.remove('up');
		this.anims.remove('down');
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

        let bossPos = this.TileMap.tileToWorldXY(4,6)
        this.Boss = new PacmanCharacter(this, this.Config.sprite_follower, bossPos.x + 16, bossPos.y + 16, bossAnims);
        this.physics.add.collider(this.Boss.Sprite, layer)

		let playerPos = this.TileMap.tileToWorldXY(4, 8);
        this.Player = new PacmanCharacter(this, this.Config.sprite_char, playerPos.x + 16, playerPos.y + 16, claraAnims);

        this.Threshold = 10;
        this.physics.add.collider(this.Player.Sprite, layer);

        this.Cursors = this.input.keyboard.createCursorKeys();

        this.Stars = this.physics.add.group();

        this.Stars.create(this.gridToWorld(1), this.gridToWorld(7), 'star');
        this.Stars.create(this.gridToWorld(6), this.gridToWorld(2), 'star');
        this.Stars.create(this.gridToWorld(8), this.gridToWorld(8), 'star');
        this.Stars.create(this.gridToWorld(1), this.gridToWorld(12), 'star');
        this.Stars.create(this.gridToWorld(8), this.gridToWorld(18), 'star');
        this.Stars.create(this.gridToWorld(4), this.gridToWorld(20), 'star');
        this.Stars.create(this.gridToWorld(7), this.gridToWorld(13), 'star');

        this.RemainingStarCount = 7;
        this.physics.add.overlap(this.Player.Sprite, this.Stars, this.collectStar, null, this);
        this.physics.add.overlap(this.Player.Sprite, this.Boss.Sprite, this.collideBoss, null, this);
        // this.GameState = State.Paused;
        this.startConvwithBoss();
        // this.Player.moveTo(this, direction);

    }

    private startConvwithBoss() {
        var dialogContent:DialogTreeObj;

        dialogContent = this.cache.json.get('ClaraBoss');
        this.Dialogs = new DialogTree(this, dialogContent, true, Anchor.Bottom, { fitContent:true });
        
        this.add.existing(this.Dialogs);
        this.Dialogs.on('destroy', () => {
            var res : boolean = this.registry.get('GameOver'); 
            if (res == true) {
                this.showProcuration(1);
            }
            else
                this.beginExplanations();
        });  
    }

    private showProcuration(from) {
        if (from == 1)
            this.StartDialog = new DialogBox(this, this.Config.result_proc_yes, true, Anchor.Center, { fitContent:true, fontSize: 22 });
        else
            this.StartDialog = new DialogBox(this, this.Config.result_proc_no, true, Anchor.Center, { fitContent:true, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Button = this.StartDialog.addArrowButton();
		this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.scene.start('Result');
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
        
    }

    private beginExplanations() {

        if (!this.sys.game.device.os.desktop ) {
			this.StartDialog = new DialogBox(this, this.Config.instruction_details_mobile, true, Anchor.Center, { windowHeight: 300, fontSize: 22 });
        }
        else 
            this.StartDialog = new DialogBox(this, this.Config.instruction_details_desktop, true, Anchor.Center, { windowHeight: 300, fontSize: 22 });
        this.add.existing(this.StartDialog);
        this.Button = this.StartDialog.addArrowButton();
		this.Button.on('pointerup', () => {
			if (this.StartDialog.isAnimationEnded()) {
				this.beginGame();
			} else {
				this.StartDialog.endAnimation();
			}
		}, this);
    }

    private beginGame() {
        if (this.GameState != State.Paused){
            return;
        }
        this.StartDialog.destroy();
        this.Button.off("pointerup");
        this.Hud.startTimer();
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
    }

    public update() {
        if (this.GameState != State.Started)
            return;
        this.Player.checkSpaceAround();

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

        if (this.Hud.getRemainingTime() <= 0 || this.RemainingStarCount <= 0){
            this.GameEnded = true;
        }
        if (this.GameEnded){
            var result = this.registry.get('GameOver');
            if (result == true)
                this.showProcuration(0);
            else
				this.scene.start('Result');
			this.GameState = State.Ended;
        }

        // Boss logic
        let targetReached = this.Boss.checkTargetPosition()
        if (targetReached || !this.Boss.TargetPosition){
            // do next move
            let direction = this.getBossOptimalDirection();
            this.Boss.moveTo(this, direction);
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

    private turn(character: PacmanCharacter): boolean {
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

    public getBossOptimalDirection(): Direction {
        // Getting coordinates in tiles
        let bossPos = this.TileMap.worldToTileXY(this.Boss.Sprite.x, this.Boss.Sprite.y);
        let playerPos = this.TileMap.worldToTileXY(this.Player.Sprite.x, this.Player.Sprite.y);

        let optimalDirections = this.cache.json.get('directions');
        let key = [bossPos.y, bossPos.x, playerPos.y, playerPos.x].join(',');
        return Direction.fromString(optimalDirections[key]);
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
        this.registry.set('GameOver', true);
        this.GameEnded = true;
    }
}
