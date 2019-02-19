define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Config = /** @class */ (function () {
        function Config() {
        }
        Config.Phaser = {
            type: Phaser.AUTO,
            parent: 'phaser-app',
            title: 'Louise Weiss',
            width: 360,
            height: 640,
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [],
            pixelArt: true,
            banner: true,
            url: 'http://localhost:8080',
            version: '1.0.0',
        };
        Config.Game = {
            width: Config.Phaser.width,
            height: Config.Phaser.height,
            centerX: Math.round(0.5 * Config.Phaser.width),
            centerY: Math.round(0.5 * Config.Phaser.height),
            tile: 32,
            fps: 60
        };
        return Config;
    }());
    exports.Config = Config;
});
//# sourceMappingURL=Config.js.map