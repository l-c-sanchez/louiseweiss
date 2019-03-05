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
define(["require", "exports", "./Config", "./GameText", "./Dialog"], function (require, exports, Config_1, GameText_1, Dialog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Menu = /** @class */ (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            var _this = _super.call(this, { key: 'Menu', active: false }) || this;
            _this.StartDialog = null;
            return _this;
        }
        Menu.prototype.init = function () {
        };
        Menu.prototype.preload = function () {
        };
        Menu.prototype.create = function () {
            if (Config_1.Config.Game.debugMode) {
                console.log(this);
            }
            var picture = this.add.image(Config_1.Config.Game.centerX, Config_1.Config.Game.centerY * 1.1, "EuropeanFlag");
            picture.setOrigin(0.5, 0.5);
            var title = new GameText_1.GameText(this, Config_1.Config.Game.centerX, Config_1.Config.Game.centerY * 0.30, "Élections Européennes");
            title.setOrigin(0.5, 0.5);
            title.setSize(40);
            this.StartText = new GameText_1.GameText(this, Config_1.Config.Game.centerX, Config_1.Config.Game.centerY, "START");
            this.StartText.setSize(40);
            this.StartText.setOrigin(0.5, 0);
            this.time.addEvent({
                delay: 1000,
                callback: this.textBlink,
                callbackScope: this,
                loop: true
            });
            this.input.on('pointerup', this.startGame, this);
            this.input.keyboard.on('keyup', this.onKeyReleased, this);
            var text = this.cache.json.get('StartText');
            this.StartDialog = new Dialog_1.Dialog(this, text, true, Dialog_1.Anchor.Center, 250);
        };
        Menu.prototype.update = function () {
        };
        Menu.prototype.textBlink = function () {
            if (this.StartText.getAlpha() == 1.0) {
                this.StartText.setAlpha(0);
            }
            else {
                this.StartText.setAlpha(1);
            }
        };
        Menu.prototype.startGame = function () {
            // this.scene.start('Pacman')
            // this.scene.start(new ChooseCharacter())
        };
        Menu.prototype.onKeyReleased = function (key) {
            console.log(key);
            switch (key.code) {
                case 'Enter':
                    this.startGame();
                    break;
                case 'Space':
                    this.startGame();
                    break;
                default:
                    break;
            }
        };
        return Menu;
    }(Phaser.Scene));
    exports.Menu = Menu;
});
//# sourceMappingURL=Menu.js.map