"use strict";
/// <reference path ='phaser/dist/phaser.d.ts'>
var LouiseWeiss;
(function (LouiseWeiss) {
    var InitPhaser = /** @class */ (function () {
        function InitPhaser() {
        }
        InitPhaser.initGame = function () {
            var config = {
                type: Phaser.AUTO,
                width: 480,
                height: 320,
                scene: [],
                banner: true,
                title: 'Louise Weiss',
                url: 'http://localhost:8080',
                version: '1.0.0'
            };
            this.gameRef = new Phaser.Game(config);
        };
        return InitPhaser;
    }());
    LouiseWeiss.InitPhaser = InitPhaser;
})(LouiseWeiss || (LouiseWeiss = {}));
window.onload = function () {
    LouiseWeiss.InitPhaser.initGame();
};
//# sourceMappingURL=LouiseWeiss.js.map