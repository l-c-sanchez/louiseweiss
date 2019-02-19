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
    var Menu = /** @class */ (function (_super) {
        __extends(Menu, _super);
        function Menu() {
            return _super.call(this, { key: 'Menu', active: false }) || this;
        }
        Menu.prototype.init = function () {
        };
        Menu.prototype.preload = function () {
            this.load.image("MartaSmiley", "assets/smiley.png");
        };
        Menu.prototype.create = function () {
            var _this = this;
            console.log(this);
            var text = this.add.text(0, 0, "Hello world", { fontSize: "20px", align: 'center', fill: "#FFFFFF" });
            Phaser.Display.Align.In.Center(text, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 4, this.sys.canvas.width, this.sys.canvas.height));
            var picture = this.add.image(0, 0, "MartaSmiley");
            picture.setInteractive().on('pointerup', function () {
                picture.setVisible(false);
                text.setVisible(false);
                // this.scene.add('ChooseCharacter', new ChooseCharacter(), true)
                // this.scene.add('Pacman', new Pacman(), true)
                _this.scene.start('CarGame');
                // this.scene.start(new ChooseCharacter())
            });
            Phaser.Display.Align.In.Center(picture, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 1.8, this.sys.canvas.width, this.sys.canvas.height));
        };
        Menu.prototype.update = function () {
        };
        return Menu;
    }(Phaser.Scene));
    exports.Menu = Menu;
});
//# sourceMappingURL=Menu.js.map