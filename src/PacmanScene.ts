class Pacman extends Phaser.Scene {
    Player!: Phaser.Physics.Arcade.Sprite;
    Cursors!: Phaser.Input.Keyboard.CursorKeys;
    Swipe!: string;
    ScaleRatio!: number;

    constructor() {
        super({ key: 'Pacman', active:false });
        // this.Player = new Physics.Arcade.Sprite();
    }

    preload(){
        this.load.spritesheet("arcade", "assets/arcade2.png", { frameWidth:16, frameHeight:16});
        this.load.image('mapTiles', 'assets/PacmanMap.png');
    }

    create() {
        var level = [
            [0, 1, 1, 1, 1, 1, 1, 1, 2],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 2, 2, 2, 2, 2, 2, 2, 0],
            // [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];

        var map = this.make.tilemap({ data: level, tileWidth: 32, tileHeight: 32 });
        var tiles = map.addTilesetImage('mapTiles');
        var layer = map.createDynamicLayer(0, tiles, 0, 0);
        var widthRatio = this.sys.canvas.width / (map.tileWidth * map.width);
        var heightRatio = this.sys.canvas.height / (map.tileHeight * map.height);
        this.ScaleRatio = widthRatio > heightRatio ? heightRatio : widthRatio;
        layer.setScale(this.ScaleRatio, this.ScaleRatio);

        console.log(this);
        this.Player = this.physics.add.sprite(50,50,"arcade");
        this.Player.setScale(this.ScaleRatio, this.ScaleRatio);
        this.Cursors = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers('arcade', { start: 0, end:1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"left",
            frames:this.anims.generateFrameNumbers('arcade', { start: 2, end:3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"up",
            frames:this.anims.generateFrameNumbers('arcade', { start: 4, end:5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"down",
            frames:this.anims.generateFrameNumbers('arcade', { start: 6, end:7 }),
            frameRate: 10,
            repeat: -1
        });

        var downX: number, upX: number, downY: number, upY: number, threshold: number = 50;
        this.input.on('pointerdown', function (pointer : Phaser.Input.InputPlugin) {
            downX = pointer.x;
            downY = pointer.y;
        });
        this.input.on('pointerup', (pointer : Phaser.Input.InputPlugin) => {
            upX = pointer.x;
            upY = pointer.y;
            if (upX < downX - threshold){
                this.Swipe = 'left';
            } else if (upX > downX + threshold) {
                this.Swipe = 'right';
            } else if (upY < downY - threshold) {
                this.Swipe = 'up';
            } else if (upY > downY + threshold) {
                this.Swipe = 'down';
            }
        });     

    }

    update() {
        if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == 'right'){
            this.Player.setVelocityX(+60 * this.ScaleRatio);
            this.Player.setVelocityY(0);
            this.Player.anims.play('right', true);
        }
        else if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == 'left'){
            this.Player.setVelocityX(-60 * this.ScaleRatio);
            this.Player.setVelocityY(0);
            this.Player.anims.play('left', true);
        }
        else if (this.Cursors.up != undefined && this.Cursors.up.isDown || this.Swipe == 'up'){
            this.Player.setVelocityY(-60 * this.ScaleRatio);
            this.Player.setVelocityX(0);
            this.Player.anims.play('up', true);
        }
        else if (this.Cursors.down != undefined && this.Cursors.down.isDown || this.Swipe == 'down'){
            this.Player.setVelocityY(+60 * this.ScaleRatio);
            this.Player.setVelocityX(0);
            this.Player.anims.play('down', true);
        }
        this.Swipe = '';
        // console.log(this.Cursors)
    }

}