var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CharacterSheet = /** @class */ (function () {
    // private Picture: Phaser.GameObjects.Image;
    function CharacterSheet(obj) {
        this.Name = obj.name;
        this.Age = obj.age;
        this.Job = obj.job;
        this.Town = obj.town;
        this.Education = obj.education;
        // this.Picture = obj.picture;
    }
    CharacterSheet.prototype.getName = function () { return this.Name; };
    CharacterSheet.prototype.getAge = function () { return this.Age; };
    CharacterSheet.prototype.getJob = function () { return this.Job; };
    CharacterSheet.prototype.getTown = function () { return this.Town; };
    CharacterSheet.prototype.getEducation = function () { return this.Education; };
    return CharacterSheet;
}());
// {}
var ChooseCharacter = /** @class */ (function (_super) {
    __extends(ChooseCharacter, _super);
    function ChooseCharacter() {
        return _super.call(this, { key: 'ChooseCharacter', active: false }) || this;
    }
    ChooseCharacter.prototype.preload = function () {
        this.load.image("Space", "assets/space3.png");
    };
    ChooseCharacter.prototype.create = function () {
        this.add.image(0, 0, "Space");
    };
    return ChooseCharacter;
}(Phaser.Scene));
var Pacman = /** @class */ (function (_super) {
    __extends(Pacman, _super);
    function Pacman() {
        var _this = _super.call(this, { key: 'Pacman', active: false }) || this;
        // Directions
        _this.NONE = 0;
        _this.LEFT = 1;
        _this.RIGHT = 2;
        _this.UP = 3;
        _this.DOWN = 4;
        _this.PLAYER_SPEED = 60;
        _this.STAR_NB = 4;
        _this.TurnPoint = new Phaser.Math.Vector2();
        _this.Directions = [null, null, null, null, null];
        _this.Opposites = [_this.NONE, _this.RIGHT, _this.LEFT, _this.DOWN, _this.UP];
        return _this;
        // this.Player = new Physics.Arcade.Sprite();
    }
    Pacman.prototype.preload = function () {
        this.load.spritesheet("arcade", "assets/Clara.png", { frameWidth: 64, frameHeight: 64 });
        this.load.image('mapTiles', 'assets/PacmanMap.png');
        this.load.image('star', 'assets/star.png');
    };
    Pacman.prototype.create = function () {
        var _this = this;
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
        var widthRatio = this.sys.canvas.width / (layer.displayWidth);
        var heightRatio = this.sys.canvas.height / (layer.displayWidth);
        console.log(this.sys.canvas.width);
        console.log(layer.displayWidth);
        var camX = -(this.sys.canvas.width - layer.displayWidth) / 4;
        var camY = -(this.sys.canvas.height - layer.displayHeight) / 2;
        this.cameras.main.setScroll(camX, camY);
        this.cameras.main.zoom = widthRatio > heightRatio ? heightRatio : widthRatio;
        this.ScaleRatio = 1;
        var debugGraphics = this.add.graphics().setAlpha(0.75);
        layer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        this.Player = this.physics.add.sprite(48, 48, "arcade");
        this.Player.setScale(0.5, 0.5);
        console.log(32 + " - " + this.Player.displayWidth + " / 2");
        this.Threshold = 10; //Math.ceil((32 - this.Player.displayWidth) / 2);
        console.log(this.Threshold);
        this.physics.add.collider(this.Player, layer);
        this.Cursors = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers('arcade', { start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers('arcade', { start: 7, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers('arcade', { start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers('arcade', { start: 7, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
        this.Stars = this.physics.add.group();
        this.Stars.create(this.gridToWorld(2), this.gridToWorld(7), 'star');
        this.Stars.create(this.gridToWorld(6), this.gridToWorld(1), 'star');
        this.Stars.create(this.gridToWorld(8), this.gridToWorld(8), 'star');
        this.Stars.create(this.gridToWorld(1), this.gridToWorld(12), 'star');
        this.physics.add.overlap(this.Player, this.Stars, this.collectStar, null, this);
        var downX, upX, downY, upY, Threshold = 50;
        this.input.on('pointerdown', function (pointer) {
            downX = pointer.x;
            downY = pointer.y;
        });
        this.input.on('pointerup', function (pointer) {
            upX = pointer.x;
            upY = pointer.y;
            if (upX < downX - Threshold) {
                _this.Swipe = 'left';
            }
            else if (upX > downX + Threshold) {
                _this.Swipe = 'right';
            }
            else if (upY < downY - Threshold) {
                _this.Swipe = 'up';
            }
            else if (upY > downY + Threshold) {
                _this.Swipe = 'down';
            }
        });
        this.Turning = this.NONE;
        this.move(this.RIGHT);
    };
    Pacman.prototype.update = function () {
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
        if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == 'right') {
            this.checkDirection(this.RIGHT);
        }
        else if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == 'left') {
            this.checkDirection(this.LEFT);
        }
        else if (this.Cursors.up != undefined && this.Cursors.up.isDown || this.Swipe == 'up') {
            this.checkDirection(this.UP);
        }
        else if (this.Cursors.down != undefined && this.Cursors.down.isDown || this.Swipe == 'down') {
            this.checkDirection(this.DOWN);
        }
        this.Swipe = '';
        if (this.Turning != this.Current && this.Turning !== this.NONE) {
            this.turn();
        }
    };
    Pacman.prototype.move = function (direction) {
        if (direction === this.LEFT) {
            this.Player.setVelocityX(-this.PLAYER_SPEED);
            if (this.Player.anims.currentAnim !== this.anims.get('left')) {
                this.Player.anims.play('left', true);
            }
        }
        else if (direction === this.RIGHT) {
            this.Player.setVelocityX(this.PLAYER_SPEED);
            if (this.Player.anims.currentAnim !== this.anims.get('right')) {
                this.Player.anims.play('right', true);
            }
        }
        else if (direction === this.UP) {
            this.Player.setVelocityY(-this.PLAYER_SPEED);
            if (this.Player.anims.currentAnim !== this.anims.get('up')) {
                this.Player.anims.play('up', true);
            }
        }
        else {
            this.Player.setVelocityY(this.PLAYER_SPEED);
            if (this.Player.anims.currentAnim !== this.anims.get('down')) {
                this.Player.anims.play('down', true);
            }
        }
        this.Current = direction;
    };
    Pacman.prototype.turn = function () {
        var cx = Math.floor(this.Player.x);
        var cy = Math.floor(this.Player.y);
        // var cx = this.Player.x;
        // var cy = this.Player.y;
        if (this.Directions[this.Turning] === null || this.Directions[this.Turning].index != 17) {
            this.Turning = this.NONE;
            return false;
        }
        // if (this.isHorizontalAxis(this.Current)) {
        //     if (this.Current == this.RIGHT && cx > this.TurnPoint.x + this.Threshold) {
        //         this.Turning = this.NONE;
        //         return false;
        //     } else if (cx < this.TurnPoint.x - this.Threshold) {
        //         this.Turning = this.NONE;
        //         return false;
        //     }
        // } else {
        //     if (this.Current == this.DOWN && cy > this.TurnPoint.y + this.Threshold) {
        //         this.Turning = this.NONE;
        //         return false;
        //     } else if (cy < this.TurnPoint.y - this.Threshold) {
        //         console.log(`${cy} < ${this.TurnPoint.y} - ${this.Threshold}`);
        //         this.Turning = this.NONE;
        //         return false;
        //     }
        // }
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
    };
    Pacman.prototype.isHorizontalAxis = function (direction) {
        return (direction == this.LEFT || direction == this.RIGHT);
    };
    Pacman.prototype.checkDirection = function (direction) {
        if (this.Turning === direction || this.Directions[direction] === null || this.Directions[direction].index != 17) {
            return;
        }
        if (this.Current === this.Opposites[direction]) {
            this.move(direction);
        }
        else {
            this.Turning = direction;
            this.TurnPoint.x = this.Marker.x * 32 + 16;
            this.TurnPoint.y = this.Marker.y * 32 + 16;
        }
    };
    Pacman.prototype.gridToWorld = function (pos) {
        return (pos * 32 + 16);
    };
    Pacman.prototype.collectStar = function (player, star) {
        star.disableBody(true, true);
    };
    return Pacman;
}(Phaser.Scene));
/// <reference path ='phaser/dist/phaser.d.ts'>
var LouiseWeiss;
(function (LouiseWeiss) {
    var InitPhaser = /** @class */ (function () {
        function InitPhaser() {
            var config = {
                type: Phaser.AUTO,
                width: 360,
                height: 640,
                parent: 'phaser-app',
                physics: {
                    default: "arcade",
                    arcade: {
                        gravity: { y: 0 },
                        debug: false
                    }
                },
                scene: {
                    preload: this.preload,
                    create: this.create,
                    update: this.update
                },
                // scene: [ ChooseCharacter ],
                banner: true,
                title: 'Louise Weiss',
                url: 'http://localhost:8080',
                version: '1.0.0',
            };
            this.gameRef = new Phaser.Game(config);
        }
        InitPhaser.prototype.preload = function () {
            this.load.image("MartaSmiley", "assets/smiley.png");
        };
        InitPhaser.prototype.getCenterX = function () {
            return this.sys.canvas.width / 2;
        };
        InitPhaser.prototype.create = function () {
            var _this = this;
            console.log(this);
            var text = this.add.text(0, 0, "Hello world", { fontSize: "20px", align: 'center', fill: "#FFFFFF" });
            Phaser.Display.Align.In.Center(text, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 4, this.sys.canvas.width, this.sys.canvas.height));
            var picture = this.add.image(0, 0, "MartaSmiley");
            picture.setInteractive().on('pointerup', function () {
                picture.setVisible(false);
                text.setVisible(false);
                // this.scene.add('ChooseCharacter', new ChooseCharacter(), true)
                _this.scene.add('Pacman', new Pacman(), true);
                // this.scene.start(new ChooseCharacter())
            });
            Phaser.Display.Align.In.Center(picture, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 1.8, this.sys.canvas.width, this.sys.canvas.height));
        };
        InitPhaser.prototype.update = function () {
            // console.log("in update")
        };
        return InitPhaser;
    }());
    LouiseWeiss.InitPhaser = InitPhaser;
})(LouiseWeiss || (LouiseWeiss = {}));
function resizeApp() {
    // Width-height-ratio of game resolution
    var game_ratio = 360 / 640;
    // Make div full height of browser and keep the ratio of game resolution
    var div = document.getElementById('phaser-app');
    div.style.width = (window.innerHeight * game_ratio) + 'px';
    div.style.height = window.innerHeight + 'px';
    // Check if device DPI messes up the width-height-ratio
    var canvas = document.getElementsByTagName('canvas')[0];
    var dpi_w = (parseInt(div.style.width) / canvas.width);
    var dpi_h = (parseInt(div.style.height) / canvas.height);
    var height = window.innerHeight * (dpi_w / dpi_h);
    var width = height * 0.6;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}
window.onload = function () {
    var game = new LouiseWeiss.InitPhaser();
    resizeApp();
    // LouiseWeiss.InitPhaser.initGame();
};
// Add to resize event
window.addEventListener('resize', resizeApp);
// Set correct size when page loads the first time
//# sourceMappingURL=LouiseWeiss.js.map