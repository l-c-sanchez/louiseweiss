
class Pacman extends Phaser.Scene {

    // Directions
    NONE = 0;
    LEFT = 1;
    RIGHT = 2;
    UP = 3;
    DOWN = 4;

    PLAYER_SPEED = 60;

    STAR_NB = 4;

    ScaleRatio!: number;
    TileMap!: Phaser.Tilemaps.Tilemap;
    Player!: Phaser.Physics.Arcade.Sprite;
    Stars!: Phaser.Physics.Arcade.Group;


    // Player movement
    Cursors!: Phaser.Input.Keyboard.CursorKeys;
    Swipe!: string;
    Threshold!: number;
    Marker!: Phaser.Math. Vector2;
    Current!: number;
    Turning!: number;

    TurnPoint = new Phaser.Math.Vector2();
    Directions: Array<Phaser.Tilemaps.Tile> = [ null, null, null, null, null ];
    Opposites: Array<number> = [ this.NONE, this.RIGHT, this.LEFT, this.DOWN, this.UP ];

    constructor() {
        super({ key: 'Pacman', active:false });
        // this.Player = new Physics.Arcade.Sprite();
    }

    preload(){
        this.load.spritesheet("arcade", "assets/Clara.png", { frameWidth:64, frameHeight:64});
        this.load.image('mapTiles', 'assets/PacmanMap.png');
        this.load.image('star', 'assets/star.png');
    }

    create() {
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

        this.TileMap = this.make.tilemap({ data: level, tileWidth: 32, tileHeight: 32 });
        var tiles = this.TileMap.addTilesetImage('mapTiles');
        var layer = this.TileMap.createDynamicLayer(0, tiles, 0, 0);
        layer.setCollisionBetween(0, 2);
        layer.setCollision(16);
        layer.setCollision(18);
        layer.setCollisionBetween(32, 34);
        var widthRatio = this.sys.canvas.width / (this.TileMap.tileWidth * this.TileMap.width);
        var heightRatio = this.sys.canvas.height / (this.TileMap.tileHeight * this.TileMap.height);
        this.ScaleRatio = widthRatio > heightRatio ? heightRatio : widthRatio;
        layer.setScale(this.ScaleRatio, this.ScaleRatio);

        const debugGraphics = this.add.graphics().setAlpha(0.75);
        layer.renderDebug(debugGraphics, {
          tileColor: null, // Color of non-colliding tiles
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
          faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });

        this.Player = this.physics.add.sprite(48 * this.ScaleRatio,48 * this.ScaleRatio,"arcade");
        this.Player.setScale(this.ScaleRatio * 0.4, this.ScaleRatio * 0.4);
        console.log(`${32 * this.ScaleRatio} - ${this.Player.displayWidth} / 2`);
        this.Threshold = Math.ceil((32 * this.ScaleRatio - this.Player.displayWidth) / 2);
        console.log(this.Threshold);
        this.physics.add.collider(this.Player, layer);

        this.Cursors = this.input.keyboard.createCursorKeys();

        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers('arcade', { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"left",
            frames:this.anims.generateFrameNumbers('arcade', { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"up",
            frames:this.anims.generateFrameNumbers('arcade', { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"down",
            frames:this.anims.generateFrameNumbers('arcade', { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });

        this.Stars = this.physics.add.group();

        this.Stars.create(this.gridToWorld(2), this.gridToWorld(7), 'star');
        this.Stars.create(this.gridToWorld(6), this.gridToWorld(1), 'star');
        this.Stars.create(this.gridToWorld(8), this.gridToWorld(8), 'star');
        this.Stars.create(this.gridToWorld(1), this.gridToWorld(12), 'star');

        this.physics.add.overlap(this.Player, this.Stars, this.collectStar, null, this);

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

        this.move(this.RIGHT);
    }

    update() {
        this.Marker = new Phaser.Math.Vector2();
        // this.Marker.x = Phaser.Math.Snap.Floor(Math.floor(this.Player.x), 32) / 32;
        // this.Marker.y = Phaser.Math.Snap.Floor(Math.floor(this.Player.y), 32) / 32;

        var playerTile = this.TileMap.getTileAtWorldXY(this.Player.x, this.Player.y);
        this.Marker.x = playerTile.x;
        this.Marker.y = playerTile.y;
        this.Directions[this.LEFT] = this.TileMap.getTileAt(playerTile.x - 1, playerTile.y);
        this.Directions[this.RIGHT] = this.TileMap.getTileAt(playerTile.x + 1, playerTile.y);
        this.Directions[this.UP] = this.TileMap.getTileAt(playerTile.x, playerTile.y - 1);
        this.Directions[this.DOWN] = this.TileMap.getTileAt(playerTile.x, playerTile.y + 1);

        if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == 'right'){
            this.checkDirection(this.RIGHT);
        }
        else if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == 'left'){
            this.checkDirection(this.LEFT);

        }
        else if (this.Cursors.up != undefined && this.Cursors.up.isDown || this.Swipe == 'up'){
            this.checkDirection(this.UP);

        }
        else if (this.Cursors.down != undefined && this.Cursors.down.isDown || this.Swipe == 'down'){
            this.checkDirection(this.DOWN);
        }
        this.Swipe = '';

        if (this.Turning != this.Current && this.Turning !== this.NONE) {
            this.turn();
        }
    }

    move(direction: number)
    {
        if (direction === this.LEFT) {
            this.Player.setVelocityX(-this.PLAYER_SPEED * this.ScaleRatio);
            if (this.Player.anims.currentAnim !== this.anims.get('left')) {
                this.Player.anims.play('left', true);
            }
        } else if (direction === this.RIGHT) {
            this.Player.setVelocityX(this.PLAYER_SPEED * this.ScaleRatio);
            if (this.Player.anims.currentAnim !== this.anims.get('right')) {
                this.Player.anims.play('right', true);
            }
        } else if (direction === this.UP) {
            this.Player.setVelocityY(-this.PLAYER_SPEED * this.ScaleRatio);
            if (this.Player.anims.currentAnim !== this.anims.get('up')) {
                this.Player.anims.play('up', true);
            }
        } else {
            this.Player.setVelocityY(this.PLAYER_SPEED * this.ScaleRatio);
            if (this.Player.anims.currentAnim !== this.anims.get('down')) {
                this.Player.anims.play('down', true);
            }
        }

        this.Current = direction;
    }

    turn()
    {
        var cx = Math.floor(this.Player.x);
        var cy = Math.floor(this.Player.y);
        // var cx = this.Player.x;
        // var cy = this.Player.y;

        if (this.isHorizontalAxis(this.Current)) {
            if (this.Current == this.RIGHT && cx > this.TurnPoint.x + this.Threshold) {
                this.Turning = this.NONE;
                return false;
            } else if (cx < this.TurnPoint.x - this.Threshold) {
                this.Turning = this.NONE;
                return false;
            }
        } else {
            if (this.Current == this.DOWN && cy > this.TurnPoint.y + this.Threshold) {
                this.Turning = this.NONE;
                return false;
            } else if (cy < this.TurnPoint.y - this.Threshold) {
                console.log(`${cy} < ${this.TurnPoint.y} - ${this.Threshold}`);
                this.Turning = this.NONE;
                return false;
            }
        }
        // console.log(`${cy} == ${this.TurnPoint.y} | ${cx} == ${this.TurnPoint.x}`);
        if (!Phaser.Math.Fuzzy.Equal(cx, this.TurnPoint.x, this.Threshold)
            || !Phaser.Math.Fuzzy.Equal(cy, this.TurnPoint.y, this.Threshold)) {
            return false;
        }

        this.Player.x = this.TurnPoint.x;
        this.Player.y = this.TurnPoint.y;

        this.Player.body.reset(this.TurnPoint.x, this.TurnPoint.y);
        this.move(this.Turning);
        this.Turning = this.NONE;

        return true;
    }

    isHorizontalAxis(direction: number)
    {
        return (direction == this.LEFT || direction == this.RIGHT);
    }

    checkDirection(direction: number) {
        if (this.Turning === direction || this.Directions[direction] === null || this.Directions[direction].index != 17) {
            return;
        }

        if (this.Current === this.Opposites[direction]) {
            this.move(direction);
        } else {
            this.Turning = direction;

            this.TurnPoint.x = (this.Marker.x * 32 + 16) * this.ScaleRatio;
            this.TurnPoint.y = (this.Marker.y * 32 + 16) * this.ScaleRatio;
        }
    }

    gridToWorld(pos: number) {
        return ((pos * 32 + 16) * this.ScaleRatio);
    }

    collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
        star.disableBody(true, true);
    }
}