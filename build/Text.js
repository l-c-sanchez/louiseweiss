define(["require", "exports", "./Config"], function (require, exports, Config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Text = /** @class */ (function () {
        function Text(env, x, y, content) {
            var defaultStyle = {
                fontFamily: Config_1.Config.Game.fontName,
                fontSize: 16,
                color: '0xFFFFFF',
                aligne: 'center'
            };
            this.Env = env;
            this.PhaserText = this.Env.add.text(x, y, content, defaultStyle);
        }
        Text.prototype.setOrigin = function (x, y) {
            this.PhaserText.setOrigin(x, y);
        };
        return Text;
    }());
    exports.Text = Text;
});
//# sourceMappingURL=Text.js.map