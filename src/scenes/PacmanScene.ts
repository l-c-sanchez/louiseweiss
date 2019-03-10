import { Config } from "../Config";
import { HudScene } from "./HudScene";


class PacmanCharacter {

    sprite: Phaser.Physics.Arcade.Sprite;
    env: Pacman;
    speed: number;
    animations: Array<string>;

    marker!: Phaser.Math.Vector2;
    current!: number;
    turning!: number;


    prevTurnPoint = new Phaser.Math.Vector2(-1, -1);
    turnPoint = new Phaser.Math.Vector2();
    directions: Array<Phaser.Tilemaps.Tile> = [ null, null, null, null, null ];
    opposites: Array<number> = [ Pacman.NONE, Pacman.RIGHT, Pacman.LEFT, Pacman.DOWN, Pacman.UP ];

    constructor(env: Pacman, spriteName: string, spawnX: number, spawnY: number, animations: Array<string>) {
        this.env = env;
        this.sprite = this.env.physics.add.sprite(spawnX, spawnY, spriteName);
        this.speed = 10;
        this.turning = Pacman.NONE;
        this.animations = animations;
    }

    public setSpeed(speed: number) {
        this.speed = speed;
    }

    public checkSpaceAround() {
        this.marker = new Phaser.Math.Vector2();
        var playerTile = this.env.tileMap.getTileAtWorldXY(this.sprite.x, this.sprite.y);
        this.marker.x = playerTile.x;
        this.marker.y = playerTile.y;
        this.directions[Pacman.LEFT] = this.env.tileMap.getTileAt(playerTile.x - 1, playerTile.y);
        this.directions[Pacman.RIGHT] = this.env.tileMap.getTileAt(playerTile.x + 1, playerTile.y);
        this.directions[Pacman.UP] = this.env.tileMap.getTileAt(playerTile.x, playerTile.y - 1);
        this.directions[Pacman.DOWN] = this.env.tileMap.getTileAt(playerTile.x, playerTile.y + 1);
    }

    public automaticMove(target: PacmanCharacter) {
        if (this.turning != Pacman.NONE) {
            return;
        }
        var bestMove = Pacman.NONE;
        var bestSquareDistance = 1000000000;

        for (var i = 0; i < this.directions.length; ++i) {
            if (this.directions[i] !== null && this.directions[i].index === 17 && i != this.opposites[this.current] && i != this.current) {
                if (bestMove == Pacman.NONE) {
                    bestMove = i;
                    bestSquareDistance = Phaser.Math.Distance.Squared(this.directions[i].x * 32,  
                        this.directions[i].y * 32, target.sprite.x, target.sprite.y);
                }
                else {             
                    var SquareDistance = Phaser.Math.Distance.Squared(this.directions[i].x * 32,  
                    this.directions[i].y * 32, target.sprite.x, target.sprite.y);
                    
                    if (SquareDistance < bestSquareDistance) {
                        bestSquareDistance = SquareDistance;
                        bestMove = i;
                    }
                }

            }
        }
        if (bestMove == Pacman.NONE) {
            this.turning = Pacman.NONE;
        } 
        else {
            var turnPoint = new Phaser.Math.Vector2(this.marker.x * 32 + 16, this.marker.y * 32 + 16);
            if (turnPoint.x == this.prevTurnPoint.x && turnPoint.y == this.prevTurnPoint.y) {
                this.turning = Pacman.NONE;
            } else {
                this.turning = bestMove;
                this.turnPoint.x = turnPoint.x;
                this.turnPoint.y = turnPoint.y;
                this.prevTurnPoint = this.turnPoint;
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

    scaleRatio!: number;
    tileMap!: Phaser.Tilemaps.Tilemap;
    player!: PacmanCharacter;
    boss!: PacmanCharacter;
    stars!: Phaser.Physics.Arcade.Group;
    gameEnded: boolean;

    // Player movement
    cursors!: Phaser.Input.Keyboard.CursorKeys;
    swipe!: string;
    threshold!: number;

    hud: HudScene;

    constructor() {
        super({ key: 'Pacman', active:false });
    }

    preload(){}

    public init() {
        this.hud = <HudScene>this.scene.get("HudScene");
        this.hud.setRemainingTime(Config.Pacman.time);
        this.gameEnded = false;
    }

    public create() {
        var level = [
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
            [16, 17, 17, 17, 17, 17, 17, 17, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 17, 17, 17, 17, 17, 17, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 16, 16, 16, 17, 16, 16, 17, 18],
            [16, 17, 17, 17, 17, 17, 17, 17, 17, 18],
            [32, 33, 33, 33, 33, 33, 33, 33, 33, 34]
        ];

        this.tileMap = this.make.tilemap({ data: level, tileWidth: 32, tileHeight: 32 });
        var tiles = this.tileMap.addTilesetImage('mapTiles');
        var layer = this.tileMap.createDynamicLayer(0, tiles, 0, 0);
        layer.setCollisionBetween(0, 2);
        layer.setCollision(16);
        layer.setCollision(18);
        layer.setCollisionBetween(32, 34);
        var widthRatio = this.sys.canvas.width / (layer.displayWidth);
		var heightRatio = this.sys.canvas.height / (layer.displayWidth);

		var camX = -(this.sys.canvas.width - layer.displayWidth) / 4;
		var camY = -(this.sys.canvas.height - layer.displayHeight) / 2;
		this.cameras.main.setScroll(camX, camY);
		this.cameras.main.zoom = widthRatio > heightRatio ? heightRatio : widthRatio;
		this.scaleRatio = 1;


        const debugGraphics = this.add.graphics().setAlpha(0.75);
        layer.renderDebug(debugGraphics, {
          tileColor: null, // Color of non-colliding tiles
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
          faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });

        var claraAnims = ["", "left", "right", "up", "down" ];
        var bossAnims = ["", "boss_left", "boss_right", "boss_up", "boss_down" ];
        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers('clara', { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"left",
            frames:this.anims.generateFrameNumbers('clara', { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"up",
            frames:this.anims.generateFrameNumbers('clara', { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"down",
            frames:this.anims.generateFrameNumbers('clara', { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_right",
            frames:this.anims.generateFrameNumbers('boss', { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_left",
            frames:this.anims.generateFrameNumbers('boss', { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_up",
            frames:this.anims.generateFrameNumbers('boss', { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"boss_down",
            frames:this.anims.generateFrameNumbers('boss', { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });

        this.boss = new PacmanCharacter(this, 'boss', 272, 240, bossAnims);
        this.boss.setSpeed(60);
        // this.Boss.Sprite.setScale(0.5, 0.5);
        this.physics.add.collider(this.boss.sprite, layer);

        this.player = new PacmanCharacter(this, 'clara', 48, 48, claraAnims);
        this.player.setSpeed(60);
        // this.Player.Sprite.setScale(0.5, 0.5);
        this.threshold = 10;//Math.ceil((32 - this.Player.displayWidth) / 2);
        this.physics.add.collider(this.player.sprite, layer);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group();

        this.stars.create(this.gridToWorld(2), this.gridToWorld(7), 'star');
        this.stars.create(this.gridToWorld(6), this.gridToWorld(1), 'star');
        this.stars.create(this.gridToWorld(8), this.gridToWorld(8), 'star');
        this.stars.create(this.gridToWorld(1), this.gridToWorld(12), 'star');

        this.physics.add.overlap(this.player.sprite, this.stars, this.collectStar, null, this);
        this.physics.add.overlap(this.player.sprite, this.boss.sprite, this.collideBoss, null, this);


        var downX: number, upX: number, downY: number, upY: number, Threshold: number = 50;
        this.input.on('pointerdown', function (pointer : Phaser.Input.InputPlugin) {
            downX = pointer.x;
            downY = pointer.y;
        });
        this.input.on('pointerup', (pointer : Phaser.Input.InputPlugin) => {
            upX = pointer.x;
            upY = pointer.y;
            if (upX < downX - Threshold){
                this.swipe = 'left';
            } else if (upX > downX + Threshold) {
                this.swipe = 'right';
            } else if (upY < downY - Threshold) {
                this.swipe = 'up';
            } else if (upY > downY + Threshold) {
                this.swipe = 'down';
            }
        });     

        this.move(Pacman.RIGHT, this.player);
        this.move(Pacman.LEFT, this.boss);
    }

    public update() {
        this.player.checkSpaceAround();
        this.boss.checkSpaceAround();
        this.boss.automaticMove(this.player);

        if (this.cursors.right != undefined && this.cursors.right.isDown || this.swipe == 'right'){
            this.checkDirection(Pacman.RIGHT, this.player);
        }
        else if (this.cursors.left != undefined && this.cursors.left.isDown || this.swipe == 'left'){
            this.checkDirection(Pacman.LEFT, this.player);
        }
        else if (this.cursors.up != undefined && this.cursors.up.isDown || this.swipe == 'up'){
            this.checkDirection(Pacman.UP, this.player);
        }
        else if (this.cursors.down != undefined && this.cursors.down.isDown || this.swipe == 'down'){
            this.checkDirection(Pacman.DOWN, this.player);
        }
        this.swipe = '';

        if (this.player.turning != this.player.current && this.player.turning !== Pacman.NONE) {
            this.turn(this.player);
        }
        if (this.boss.turning != this.boss.current && this.boss.turning !== Pacman.NONE) {
            this.turn(this.boss);
        }

        if (this.hud.getRemainingTime() <= 0){
            this.gameEnded = true;
        }
        if (this.gameEnded){
            this.scene.start('CarGame');
        }

    }

    private move(direction: number, character: PacmanCharacter)
    {
        if (direction === Pacman.LEFT) {
            character.sprite.setVelocityX(-character.speed);
            if (character.sprite.anims.currentAnim !== this.anims.get('left')) {
                character.sprite.anims.play(character.animations[Pacman.LEFT], true);
            }
        } else if (direction === Pacman.RIGHT) {
            character.sprite.setVelocityX(character.speed);
            if (character.sprite.anims.currentAnim !== this.anims.get('right')) {
                character.sprite.anims.play(character.animations[Pacman.RIGHT], true);
            }
        } else if (direction === Pacman.UP) {
            character.sprite.setVelocityY(-character.speed);
            if (character.sprite.anims.currentAnim !== this.anims.get('up')) {
                character.sprite.anims.play(character.animations[Pacman.UP], true);
            }
        } else {
            character.sprite.setVelocityY(character.speed);
            if (character.sprite.anims.currentAnim !== this.anims.get('down')) {
                character.sprite.anims.play(character.animations[Pacman.DOWN], true);
            }
        }
        character.current = direction;
        
    }

    private turn(character: PacmanCharacter)
    {
        var cx = Math.floor(character.sprite.x);
        var cy = Math.floor(character.sprite.y);

		if (character.directions[character.turning] === null || character.directions[character.turning].index != 17) {
			character.turning = Pacman.NONE;
			return false;
		}

        if (!Phaser.Math.Fuzzy.Equal(cx, character.turnPoint.x, this.threshold)
            || !Phaser.Math.Fuzzy.Equal(cy, character.turnPoint.y, this.threshold)) {
            return false;
        }

        character.sprite.x = character.turnPoint.x;
        character.sprite.y = character.turnPoint.y;

        character.sprite.body.reset(character.turnPoint.x, character.turnPoint.y);
        this.move(character.turning, character);
		character.turning = Pacman.NONE;
		
        return true;
    }
    
    private checkDirection(direction: number, character: PacmanCharacter) {
        if (character.turning === direction || character.directions[direction] === null || character.directions[direction].index != 17) {
            return;
        }

        if (character.current === character.opposites[direction]) {
            this.move(direction, character);
        } else {
            character.turning = direction;

            character.turnPoint.x = character.marker.x * 32 + 16;
            character.turnPoint.y = character.marker.y * 32 + 16;
        }
    }

    private gridToWorld(pos: number) {
        return (pos * 32 + 16);
    }

    private collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
        star.disableBody(true, true);
        this.registry.values.starCount += 1;
    }
    private collideBoss(player: Phaser.Physics.Arcade.Sprite, boss: Phaser.Physics.Arcade.Sprite) {
        player.disableBody(true, true);
        this.gameEnded = true;
    }
}
