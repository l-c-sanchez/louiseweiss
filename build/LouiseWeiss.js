"use strict";
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
        return _super.call(this, { key: 'Pacman', active: false }) || this;
        // this.Player = new Physics.Arcade.Sprite();
    }
    Pacman.prototype.preload = function () {
        this.load.spritesheet("arcade", "assets/Clara.png", { frameWidth: 64, frameHeight: 64 });
        this.load.image('mapTiles', 'assets/PacmanMap.png');
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
        var map = this.make.tilemap({ data: level, tileWidth: 32, tileHeight: 32 });
        var tiles = map.addTilesetImage('mapTiles');
        var layer = map.createDynamicLayer(0, tiles, 0, 0);
        layer.setCollisionBetween(0, 2);
        layer.setCollision(16);
        layer.setCollision(18);
        layer.setCollisionBetween(32, 34);
        var widthRatio = this.sys.canvas.width / (map.tileWidth * map.width);
        var heightRatio = this.sys.canvas.height / (map.tileHeight * map.height);
        this.ScaleRatio = widthRatio > heightRatio ? heightRatio : widthRatio;
        layer.setScale(this.ScaleRatio, this.ScaleRatio);
        var debugGraphics = this.add.graphics().setAlpha(0.75);
        layer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        console.log(this);
        this.Player = this.physics.add.sprite(100, 100, "arcade");
        this.Player.setScale(this.ScaleRatio * 0.5, this.ScaleRatio * 0.5);
        // this.Player.setCollideWorldBounds(true);
        var test = this.physics.add.collider(this.Player, layer);
        // test.collideCallback()
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
        var downX, upX, downY, upY, threshold = 50;
        this.input.on('pointerdown', function (pointer) {
            downX = pointer.x;
            downY = pointer.y;
        });
        this.input.on('pointerup', function (pointer) {
            upX = pointer.x;
            upY = pointer.y;
            if (upX < downX - threshold) {
                _this.Swipe = 'left';
            }
            else if (upX > downX + threshold) {
                _this.Swipe = 'right';
            }
            else if (upY < downY - threshold) {
                _this.Swipe = 'up';
            }
            else if (upY > downY + threshold) {
                _this.Swipe = 'down';
            }
        });
    };
    Pacman.prototype.update = function () {
        if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == 'right') {
            this.Player.setVelocityX(+60 * this.ScaleRatio);
            // this.Player.setVelocityY(0);
            this.Player.anims.play('right', true);
        }
        else if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == 'left') {
            this.Player.setVelocityX(-60 * this.ScaleRatio);
            // this.Player.setVelocityY(0);
            this.Player.anims.play('left', true);
        }
        else if (this.Cursors.up != undefined && this.Cursors.up.isDown || this.Swipe == 'up') {
            this.Player.setVelocityY(-60 * this.ScaleRatio);
            // this.Player.setVelocityX(0);
            this.Player.anims.play('up', true);
        }
        else if (this.Cursors.down != undefined && this.Cursors.down.isDown || this.Swipe == 'down') {
            this.Player.setVelocityY(+60 * this.ScaleRatio);
            // this.Player.setVelocityX(0);
            this.Player.anims.play('down', true);
        }
        this.Swipe = '';
        // console.log(this.Cursors)
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
                width: window.innerWidth,
                //  * window.devicePixelRatio,
                height: window.innerHeight,
                //* window.devicePixelRatio,
                autoResize: true,
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
                version: '1.0.0'
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
            // this.add.image(100,100,"MartaSmiley");
            // var graphics = this.add.graphics()
            // let pictures = this.add.group( {classType: Phaser.GameObjects.Image, runChildUpdate: true});
            // let picture = new Phaser.GameObjects.Image(this, 100, 100, "MartaSmiley");
            // picture.setActive(true);
            // pictures.add(picture);
            // let character = new CharacterSheet({
            // 	name:"Marta",
            // 	age:45,
            // 	job:"nurse",
            // 	town:"Tourville-La-Campagne"
            // 	// picture: picture
            // });
            // console.log(character);
            // let scaleRatio = window.devicePixelRatio / 3;
            console.log(this);
            var text = this.add.text(0, 0, "Hello world", { fontSize: "8vw", align: 'center', fill: "#FFFFFF" });
            Phaser.Display.Align.In.Center(text, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 4, this.sys.canvas.width, this.sys.canvas.height));
            var picture = this.add.image(0, 0, "MartaSmiley");
            picture.setInteractive().on('pointerup', function () {
                // console.log("ty as bien cliqué");
                picture.setVisible(false);
                text.setVisible(false);
                // let key = 'ChooseCharacter'
                // this.scene.add('ChooseCharacter', new ChooseCharacter(), true)
                _this.scene.add('Pacman', new Pacman(), true);
                // this.scene.start(new ChooseCharacter())
            });
            // .setScale(scaleRatio, scaleRatio);
            // picture.displayWidth = 0.4 * this.sys.canvas.width;
            // picture.displayHeight = 0.4 * this.sys.canvas.width;
            Phaser.Display.Align.In.Center(picture, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 1.8, this.sys.canvas.width, this.sys.canvas.height));
        };
        InitPhaser.prototype.update = function () {
            // console.log("in update")
        };
        return InitPhaser;
    }());
    LouiseWeiss.InitPhaser = InitPhaser;
})(LouiseWeiss || (LouiseWeiss = {}));
window.onload = function () {
    var game = new LouiseWeiss.InitPhaser();
    // LouiseWeiss.InitPhaser.initGame();
};
//# sourceMappingURL=LouiseWeiss.js.map