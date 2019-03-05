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
define(["require", "exports", "./Config"], function (require, exports, Config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Generator = /** @class */ (function () {
        function Generator(Env) {
            // trucs qui sont init // this.CONFIG =ctx.CONFIG;
            this.Env = Env;
            this.DEPTH = Env.DEPTH;
            this.Cols = 12;
            this.Rows = 20;
            this.Layers = {
                floor: [],
                walls: [],
                monsters: [],
                pickups: [],
                turrets: [],
                overlay: false
            };
        }
        Generator.prototype.setup = function () {
            this.createFloor();
        };
        Generator.prototype.update = function () {
            this.scrollFloor();
        };
        Generator.prototype.createFloor = function () {
            var x;
            var y;
            var spr;
            var cols = this.Cols;
            var rows = this.Rows + 1;
            var floor = [];
            for (var ty = 0; ty < rows; ty++) {
                floor[ty] = [];
                for (var tx = 0; tx < cols; tx++) {
                    x = (tx * 32); // ou à la place de 32 this.CONFIG.tile
                    y = (ty * 32); // ou à la place de 32 this.CONFIG.tile
                    if (tx != 3 && tx != 8)
                        spr = this.Env.add.sprite(x, y, 'road');
                    else
                        spr = this.Env.add.sprite(x, y, 'road_line');
                    spr.setOrigin(0);
                    spr.setDepth(this.DEPTH.floor);
                    floor[ty][tx] = spr;
                }
            }
            // save floor array in generators layers
            this.Layers.floor = floor;
        };
        Generator.prototype.scrollFloor = function () {
            // console.log(this.Layers.floor);
            var ty = this.Layers.floor.length;
            var offset = this.Env.cameras.main.scrollY - this.Layers.floor[ty - 1][0].y;
            // console.log(this.Env.cameras.main.scrollY + "; " + this.Layers.floor[ty - 1][0].y + ";" + offset)
            if (offset <= -640) { // this.config.tile
                this.appendFloorRow();
                this.destroyFloorRow();
            }
        };
        Generator.prototype.destroyFloorRow = function () {
            var ty = this.Layers.floor.length;
            for (var tx = 0; tx > this.Layers.floor[0].length; tx++) {
                this.Layers.floor[ty - 1][tx].destroy();
            }
            this.Layers.floor.splice(ty - 1, 1);
        };
        Generator.prototype.appendFloorRow = function () {
            var x;
            var spr;
            var empty = [];
            /// ligne à la fin, right below camera edge
            var ty = this.Layers.floor.length;
            // let y = this.Layers.floor[ty - 1][0].y + 32; // this.CONFIG.tile
            var y = this.Layers.floor[0][0].y - 32;
            // console.log(y);
            // ajout d'une ligne vide
            this.Layers.floor.unshift(new Array());
            for (var tx = 0; tx < this.Cols; tx++) {
                x = (tx * 32); // this CONFIG TILE + this CONFIG MAP offset
                // spr = this.Env.add.tileSpr0ite(x, y, 32, 32,'mapTiles', 2);
                if (tx != 3 && tx != 8)
                    spr = this.Env.add.sprite(x, y, 'road');
                else
                    spr = this.Env.add.sprite(x, y, 'road_line');
                spr.setOrigin(0);
                spr.setDepth(this.DEPTH.floor);
                this.Layers.floor[0][tx] = spr;
            }
        };
        return Generator;
    }());
    var CarGame = /** @class */ (function (_super) {
        __extends(CarGame, _super);
        function CarGame() {
            var _this = _super.call(this, { key: 'CarGame', active: false }) || this;
            _this.playerSpeed = 120;
            _this.Corridor = 64;
            _this.targetPos = Config_1.Config.Game.centerX;
            return _this;
        }
        CarGame.prototype.init = function () {
            // this.CONFIG = this.sys.game.CONFIG
            this.DEPTH = {
                floor: 0
            };
            this.Generator = new Generator(this);
            //this.allow_input = false;
            // this.is_pause = false;
            // this.is_gameover = false
            this.cam_speed = {
                base: -3,
                current: -3,
                max: -3
            };
        };
        CarGame.prototype.preload = function () {
            // this.load.spritesheet('tileset', 'assets/tilesets/PacmanMap.png', { frameWidth:32, frameHeight:32, margin:1, spacing:2});
        };
        CarGame.prototype.create = function () {
            var _this = this;
            // Create floor 
            this.Generator.setup();
            // Create Player
            this.createPlayer(claraAnims);
            this.player.spr.setScale(2, 2);
            this.player.spr.setOrigin(0.5, 0.5);
            this.player.setPosition(this.player.x, this.player.y - 1);
            var claraAnims = ["", "left", "right"];
            this.anims.create({
                key: "right",
                frames: this.anims.generateFrameNumbers('voiture', { start: 1, end: 6 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: "left",
                frames: this.anims.generateFrameNumbers('voiture', { start: 7, end: 13 }),
                frameRate: 10,
                repeat: -1
            });
            this.Threshold = 1;
            this.Cursors = this.input.keyboard.createCursorKeys();
            var downX, upX, Threshold = 50;
            this.input.on('pointerdown', function (pointer) {
                downX = pointer.x;
            });
            this.input.on('pointerup', function (pointer) {
                upX = pointer.x;
                if (upX < downX - Threshold) {
                    _this.Swipe = 'left';
                }
                else if (upX > downX + Threshold) {
                    _this.Swipe = 'right';
                }
                console.log(_this.Swipe);
            });
            console.log(this.Swipe);
        };
        CarGame.prototype.update = function () {
            this.updateCamera();
            this.Generator.update();
            this.player.setPositionY(this.player.y + this.cam_speed.current);
            if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == "left") {
                console.log(this.Swipe);
                this.moveTo(this.player.x - this.Corridor);
                this.Swipe = "";
            }
            else if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == "right") {
                console.log(this.Swipe);
                this.moveTo(this.player.x + this.Corridor);
                this.Swipe = "";
            }
            this.move();
        };
        CarGame.prototype.createPlayer = function (claraAnims) {
            this.player = new Entity(this, Config_1.Config.Game.centerX, Config_1.Config.Game.centerY / 2 * 3, 'voiture', claraAnims);
        };
        CarGame.prototype.moveTo = function (x) {
            if (x > Config_1.Config.Game.width || x < 0) {
                return;
            }
            this.targetPos = x;
            if (x - this.player.x < 0)
                this.player.setVelocityX(-this.playerSpeed);
            else
                this.player.setVelocityX(this.playerSpeed);
        };
        CarGame.prototype.move = function () {
            console.log(this.targetPos, this.player.x);
            if (Phaser.Math.Fuzzy.Equal(this.player.spr.x, this.targetPos, this.Threshold)) {
                this.player.setVelocityX(0);
                this.player.setPositionX(this.targetPos);
            }
        };
        CarGame.prototype.updateCamera = function () {
            // Scroll camera
            this.cameras.main.setScroll(0, this.cameras.main.scrollY + this.cam_speed.current);
        };
        CarGame.prototype.setCamSpeed = function (speed) {
            this.cam_speed.base = speed;
            this.cam_speed.current = speed;
            this.cam_speed.current = Math.min(this.cam_speed.current, this.cam_speed.max);
            this.cam_speed.current = Math.max(this.cam_speed.current, 0);
        };
        CarGame.NONE = 0;
        CarGame.LEFT = 1;
        CarGame.RIGHT = 2;
        return CarGame;
    }(Phaser.Scene));
    exports.CarGame = CarGame;
    var Entity = /** @class */ (function () {
        // constructor(ctx, x, y, key) {
        function Entity(ctx, x, y, key, animations) {
            // this.MAP_OFFSET = ctx.CONFIG.map_offset
            this.TILE_SIZE = Config_1.Config.Game.tile;
            // this.helper = new Helper();
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            this.width = 32;
            this.height = 32;
            this.depth = 1000;
            this.key = key;
            this.frames = {
                idle: 0,
                hurt: 3
            };
            this.direction = {
                last: false,
                current: 'down'
            };
            this.states = {
                idle: true,
                walk: false,
                hurt: false,
                dead: false,
                last: false
            };
            this.speed = {
                base: 0,
                current: 0,
                max: 0
            };
            this.Animations = animations;
            this.createSprite();
        }
        Entity.prototype.createSprite = function () {
            if (this.spr) {
                this.spr.destroy();
            }
            this.spr = this.ctx.physics.add.sprite(this.x, this.y, this.key);
            this.spr.setOrigin(0.5);
            this.spr.setDepth(this.depth);
        };
        Entity.prototype.destroy = function () {
            if (this.spr) {
                this.spr.destroy();
            }
            // this.spr = false;
        };
        Entity.prototype.setPosition = function (x, y) {
            this.spr.setPosition(x, y);
            this.x = x;
            this.y = y;
        };
        Entity.prototype.setPositionX = function (x) {
            this.spr.x = x;
            this.x = x;
        };
        Entity.prototype.setPositionY = function (y) {
            this.spr.y = y;
            this.y = y;
        };
        Entity.prototype.setVelocityX = function (speed) {
            console.log(speed);
            this.spr.setVelocityX(speed);
        };
        return Entity;
    }());
    exports.Entity = Entity;
});
//# sourceMappingURL=CarScene.js.map