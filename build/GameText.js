define(["require", "exports", "./Config"], function (require, exports, Config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameText = /** @class */ (function () {
        function GameText(env, x, y, content) {
            var defaultStyle = {
                fontFamily: Config_1.Config.Game.fontName,
                fontSize: 20,
                color: '#FFFFFF',
                align: 'center',
                wordWrap: { width: Config_1.Config.Game.width, useAdvancedWrap: true }
            };
            this.Env = env;
            this.PhaserText = this.Env.add.text(x, y, content, defaultStyle);
        }
        GameText.prototype.setText = function (content) {
            this.PhaserText.setText(content);
        };
        GameText.prototype.setOrigin = function (x, y) {
            this.PhaserText.setOrigin(x, y);
        };
        GameText.prototype.setSize = function (size) {
            this.PhaserText.setFontSize(size);
        };
        GameText.prototype.setColor = function (color) {
            this.PhaserText.setColor(color);
        };
        GameText.prototype.setAlpha = function (alpha) {
            this.PhaserText.setAlpha(alpha);
        };
        GameText.prototype.getAlpha = function () {
            return this.PhaserText.alpha;
        };
        return GameText;
    }());
    exports.GameText = GameText;
});
//# sourceMappingURL=GameText.js.map