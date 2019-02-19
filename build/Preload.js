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
define(["require", "exports", "./config"], function (require, exports, config_1) {
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
            config_1.Config.Game.tile;
        };
        Preload.prototype.create = function () {
            this.scene.start('Menu');
        };
        Preload.prototype.update = function () {
        };
        return Preload;
    }(Phaser.Scene));
    exports.Preload = Preload;
});
//# sourceMappingURL=Preload.js.map