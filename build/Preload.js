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
define(["require", "exports", "./Config", "./GameText"], function (require, exports, Config_1, GameText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Preload = /** @class */ (function (_super) {
        __extends(Preload, _super);
        function Preload() {
            return _super.call(this, { key: 'Preload', active: false }) || this;
        }
        Preload.prototype.init = function () {
        };
        Preload.prototype.preload = function () {
            var title = new GameText_1.GameText(this, Config_1.Config.Game.centerX, Config_1.Config.Game.centerY * 0.30, "Élections Européennes");
            title.setOrigin(0.5, 0.5);
            title.setSize(40);
            this.createLoadingBar();
            // this.load.setPath(Config.Phaser.url + 'assets/');
            this.load.setPath('assets/');
            // Main Menu
            this.load.image('EuropeanFlag', 'sprites/EuropeanFlag.png');
            // Pacman
            this.load.image('mapTiles', 'tilesets/PacmanMap.png');
            this.load.spritesheet('boss', 'sprites/Boss32.png', { frameWidth: 32, frameHeight: 32 });
            this.load.spritesheet('clara', 'sprites/Clara32.png', { frameWidth: 32, frameHeight: 32 });
            this.load.image('star', 'sprites/star.png');
            this.load.on('progress', this.onProgress, this);
            this.load.on('complete', this.onComplete, this);
        };
        Preload.prototype.create = function () {
        };
        Preload.prototype.update = function () {
        };
        Preload.prototype.createLoadingBar = function () {
            var x = 30;
            var y = Config_1.Config.Game.centerY;
            this.BarWidth = 360.0 - 2.0 * x;
            this.BarHeight = 30;
            this.ProgressBar = this.add.graphics({ x: x, y: y });
            this.ProgressText = new GameText_1.GameText(this, Config_1.Config.Game.centerX, Config_1.Config.Game.centerY, "0%");
            this.ProgressText.setOrigin(0.5, 0);
            this.ProgressText.setSize(30);
            this.ProgressText.setColor('#000000');
        };
        Preload.prototype.onProgress = function (progress) {
            this.ProgressBar.clear();
            this.ProgressBar.fillStyle(0xFFFFFF, 1);
            this.ProgressBar.fillRect(0, 0, this.BarWidth * progress, this.BarHeight);
            this.ProgressText.setText(Math.round(progress * 100) + '%');
        };
        Preload.prototype.onComplete = function () {
            var _this = this;
            this.time.addEvent({
                delay: 500,
                callback: function () { _this.scene.start('Menu'); },
                callbackScope: this
            });
        };
        return Preload;
    }(Phaser.Scene));
    exports.Preload = Preload;
});
//# sourceMappingURL=Preload.js.map