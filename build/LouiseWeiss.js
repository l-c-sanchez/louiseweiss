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
var PacmanCharacter = /** @class */ (function () {
    function PacmanCharacter(env, spriteName, spawnX, spawnY, animations) {
        this.PrevTurnPoint = new Phaser.Math.Vector2(-1, -1);
        this.TurnPoint = new Phaser.Math.Vector2();
        this.Directions = [null, null, null, null, null];
        this.Opposites = [Pacman.NONE, Pacman.RIGHT, Pacman.LEFT, Pacman.DOWN, Pacman.UP];
        this.Env = env;
        this.Sprite = this.Env.physics.add.sprite(spawnX, spawnY, spriteName);
        this.Speed = 10;
        this.Turning = Pacman.NONE;
        this.Animations = animations;
    }
    PacmanCharacter.prototype.setSpeed = function (speed) {
        this.Speed = speed;
    };
    PacmanCharacter.prototype.checkSpaceAround = function () {
        this.Marker = new Phaser.Math.Vector2();
        // this.Marker.x = Phaser.Math.Snap.Floor(Math.floor(this.Player.x), 32) / 32;
        // this.Marker.y = Phaser.Math.Snap.Floor(Math.floor(this.Player.y), 32) / 32;
        var playerTile = this.Env.TileMap.getTileAtWorldXY(this.Sprite.x, this.Sprite.y);
        this.Marker.x = playerTile.x;
        this.Marker.y = playerTile.y;
        this.Directions[Pacman.LEFT] = this.Env.TileMap.getTileAt(playerTile.x - 1, playerTile.y);
        this.Directions[Pacman.RIGHT] = this.Env.TileMap.getTileAt(playerTile.x + 1, playerTile.y);
        this.Directions[Pacman.UP] = this.Env.TileMap.getTileAt(playerTile.x, playerTile.y - 1);
        this.Directions[Pacman.DOWN] = this.Env.TileMap.getTileAt(playerTile.x, playerTile.y + 1);
    };
    PacmanCharacter.prototype.automaticMove = function (target) {
        if (this.Turning != Pacman.NONE) {
            return;
        }
        var bestMove = Pacman.NONE;
        var bestSquareDistance = 1000000000;
        for (var i = 0; i < this.Directions.length; ++i) {
            if (this.Directions[i] !== null && this.Directions[i].index === 17 && i != this.Opposites[this.Current] && i != this.Current) {
                if (bestMove == Pacman.NONE) {
                    bestMove = i;
                    bestSquareDistance = Phaser.Math.Distance.Squared(this.Directions[i].x * 32, this.Directions[i].y * 32, target.Sprite.x, target.Sprite.y);
                }
                else {
                    // console.log(this.Directions[i].x * 32, this.Directions[i].y * 32)                
                    var SquareDistance = Phaser.Math.Distance.Squared(this.Directions[i].x * 32, this.Directions[i].y * 32, target.Sprite.x, target.Sprite.y);
                    if (SquareDistance < bestSquareDistance) {
                        bestSquareDistance = SquareDistance;
                        bestMove = i;
                    }
                    // console.log(SquareDistance)
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
            }
            else {
                this.Turning = bestMove;
                this.TurnPoint.x = turnPoint.x;
                this.TurnPoint.y = turnPoint.y;
                this.PrevTurnPoint = this.TurnPoint;
            }
        }
    };
    return PacmanCharacter;
}());
var Pacman = /** @class */ (function (_super) {
    __extends(Pacman, _super);
    function Pacman() {
        var _this = _super.call(this, { key: 'Pacman', active: false }) || this;
        _this.STAR_NB = 4;
        return _this;
        // this.Player = new Physics.clara.Sprite();
    }
    Pacman.prototype.preload = function () {
        this.load.spritesheet('boss', 'assets/Boss.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("clara", "assets/Clara.png", { frameWidth: 64, frameHeight: 64 });
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
        var claraAnims = ["", "left", "right", "up", "down"];
        var bossAnims = ["", "boss_left", "boss_right", "boss_up", "boss_down"];
        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers('clara', { start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers('clara', { start: 7, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers('clara', { start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers('clara', { start: 7, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "boss_right",
            frames: this.anims.generateFrameNumbers('boss', { start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "boss_left",
            frames: this.anims.generateFrameNumbers('boss', { start: 7, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "boss_up",
            frames: this.anims.generateFrameNumbers('boss', { start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "boss_down",
            frames: this.anims.generateFrameNumbers('boss', { start: 7, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
        this.Boss = new PacmanCharacter(this, 'boss', 272, 240, bossAnims);
        this.Boss.setSpeed(60);
        this.Boss.Sprite.setScale(0.5, 0.5);
        this.physics.add.collider(this.Boss.Sprite, layer);
        this.Player = new PacmanCharacter(this, 'clara', 48, 48, claraAnims);
        this.Player.setSpeed(60);
        this.Player.Sprite.setScale(0.5, 0.5);
        this.Threshold = 10; //Math.ceil((32 - this.Player.displayWidth) / 2);
        this.physics.add.collider(this.Player.Sprite, layer);
        this.Cursors = this.input.keyboard.createCursorKeys();
        this.Stars = this.physics.add.group();
        this.Stars.create(this.gridToWorld(2), this.gridToWorld(7), 'star');
        this.Stars.create(this.gridToWorld(6), this.gridToWorld(1), 'star');
        this.Stars.create(this.gridToWorld(8), this.gridToWorld(8), 'star');
        this.Stars.create(this.gridToWorld(1), this.gridToWorld(12), 'star');
        this.physics.add.overlap(this.Player.Sprite, this.Stars, this.collectStar, null, this);
        this.physics.add.overlap(this.Player.Sprite, this.Boss.Sprite, this.collideBoss, null, this);
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
        this.move(Pacman.RIGHT, this.Player);
        this.move(Pacman.LEFT, this.Boss);
    };
    Pacman.prototype.update = function () {
        this.Player.checkSpaceAround();
        this.Boss.checkSpaceAround();
        this.Boss.automaticMove(this.Player);
        if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == 'right') {
            this.checkDirection(Pacman.RIGHT, this.Player);
        }
        else if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == 'left') {
            this.checkDirection(Pacman.LEFT, this.Player);
        }
        else if (this.Cursors.up != undefined && this.Cursors.up.isDown || this.Swipe == 'up') {
            this.checkDirection(Pacman.UP, this.Player);
        }
        else if (this.Cursors.down != undefined && this.Cursors.down.isDown || this.Swipe == 'down') {
            this.checkDirection(Pacman.DOWN, this.Player);
        }
        this.Swipe = '';
        if (this.Player.Turning != this.Player.Current && this.Player.Turning !== Pacman.NONE) {
            this.turn(this.Player);
        }
        if (this.Boss.Turning != this.Boss.Current && this.Boss.Turning !== Pacman.NONE) {
            this.turn(this.Boss);
        }
    };
    Pacman.prototype.move = function (direction, character) {
        if (direction === Pacman.LEFT) {
            character.Sprite.setVelocityX(-character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('left')) {
                character.Sprite.anims.play(character.Animations[Pacman.LEFT], true);
            }
        }
        else if (direction === Pacman.RIGHT) {
            character.Sprite.setVelocityX(character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('right')) {
                character.Sprite.anims.play(character.Animations[Pacman.RIGHT], true);
            }
        }
        else if (direction === Pacman.UP) {
            character.Sprite.setVelocityY(-character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('up')) {
                character.Sprite.anims.play(character.Animations[Pacman.UP], true);
            }
        }
        else {
            character.Sprite.setVelocityY(character.Speed);
            if (character.Sprite.anims.currentAnim !== this.anims.get('down')) {
                character.Sprite.anims.play(character.Animations[Pacman.DOWN], true);
            }
        }
        character.Current = direction;
    };
    Pacman.prototype.turn = function (character) {
        var cx = Math.floor(character.Sprite.x);
        var cy = Math.floor(character.Sprite.y);
        if (character.Directions[character.Turning] === null || character.Directions[character.Turning].index != 17) {
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
    };
    Pacman.prototype.isHorizontalAxis = function (direction) {
        return (direction == Pacman.LEFT || direction == Pacman.RIGHT);
    };
    Pacman.prototype.checkDirection = function (direction, character) {
        if (character.Turning === direction || character.Directions[direction] === null || character.Directions[direction].index != 17) {
            return;
        }
        if (character.Current === character.Opposites[direction]) {
            this.move(direction, character);
        }
        else {
            character.Turning = direction;
            character.TurnPoint.x = character.Marker.x * 32 + 16;
            character.TurnPoint.y = character.Marker.y * 32 + 16;
        }
    };
    Pacman.prototype.gridToWorld = function (pos) {
        return (pos * 32 + 16);
    };
    Pacman.prototype.collectStar = function (player, star) {
        star.disableBody(true, true);
    };
    Pacman.prototype.collideBoss = function (player, boss) {
        player.disableBody(true, true);
    };
    Pacman.NONE = 0;
    Pacman.LEFT = 1;
    Pacman.RIGHT = 2;
    Pacman.UP = 3;
    Pacman.DOWN = 4;
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