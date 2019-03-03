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
    var CustomText = /** @class */ (function (_super) {
        __extends(CustomText, _super);
        function CustomText(env, x, y, content) {
            var _this = this;
            return _this;
        }
        CustomText.prototype.initStyle = function () {
            var defaultStyle = {
                fontFamily: Config_1.Config.Game.fontName,
                fontSize: 16,
                color: '0xFFFFFF',
                aligne: 'center'
            };
        };
        return CustomText;
    }(Phaser.GameObjects.Text));
    exports.CustomText = CustomText;
});
//# sourceMappingURL=CustomText.js.map