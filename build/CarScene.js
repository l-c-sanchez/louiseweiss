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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Generator = /** @class */ (function () {
        function Generator(Env) {
            // trucs qui sont init // this.CONFIG =ctx.CONFIG;
            this.Env = Env;
            this.DEPTH = Env.DEPTH;
            this.Cols = 11;
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
                    spr = this.Env.add.sprite(x, y, "tileset");
                    spr.setOrigin(0);
                    spr.setDepth(this.DEPTH.floor);
                }
            }
            // save floor array in generators layers
            this.Layers.floor = floor;
        };
        Generator.prototype.scrollFloor = function () {
            var offset = this.Env.cameras.main.scrollY - this.Layers.floor[0][0].y;
            if (offset >= 32) { // this.config.tile
                this.destroyFloorRow();
                this.appendFloorRow();
            }
        };
        Generator.prototype.destroyFloorRow = function () {
            console.log(this.Layers[0]);
            for (var tx = 0; tx > this.Layers.floor[0].length; tx++) {
                this.Layers.floor[0][tx].destroy();
            }
            this.Layers.floor.splice(0, 1);
        };
        Generator.prototype.appendFloorRow = function () {
            var x;
            var spr;
            var empty = [];
            /// ligne à la fin, right below camera edge
            var ty = this.Layers.floor.length;
            var y = this.Layers.floor[ty - 1][0].y + 32; // this.CONFIG.tile
            // ajout d'une ligne vide
            this.Layers.floor.push(empty);
            for (var tx = 0; tx < this.Cols; tx++) {
                x = (tx * 32); // this CONFIG TILE + this CONFIG MAP offset
                spr = this.Env.add.sprite(x, y, 'tileset');
                spr.setOrigin(0);
                spr.setDepth(this.DEPTH.floor);
                this.Layers.floor[ty][tx] = spr;
            }
        };
        return Generator;
    }());
    var CarGame = /** @class */ (function (_super) {
        __extends(CarGame, _super);
        function CarGame() {
            return _super.call(this, { key: 'CarGame', active: false }) || this;
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
                base: 1,
                current: 1,
                max: 1
            };
        };
        CarGame.prototype.preload = function () {
            this.load.spritesheet('tileset', 'assets/PacmanMap.png', { frameWidth: 32, frameHeight: 32, margin: 1, spacing: 2 });
        };
        CarGame.prototype.create = function () {
            // Create floor 
            this.Generator.setup();
        };
        CarGame.prototype.update = function () {
            this.updateCamera();
            this.Generator.update();
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
        return CarGame;
    }(Phaser.Scene));
    exports.CarGame = CarGame;
});
//# sourceMappingURL=CarScene.js.map