define(["require", "exports", "./Config", "./Preload", "./Boot", "./Menu", "./PacmanScene", "./CarScene"], function (require, exports, Config_1, Preload_1, Boot_1, Menu_1, PacmanScene_1, CarScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = /** @class */ (function () {
        function App() {
            this.Scenes = new Array();
            this.Scenes.push(new Boot_1.Boot());
            this.Scenes.push(new Preload_1.Preload);
            this.Scenes.push(new Menu_1.Menu());
            this.Scenes.push(new PacmanScene_1.Pacman());
            this.Scenes.push(new CarScene_1.CarGame());
            Config_1.Config.Phaser.scene = this.Scenes;
            if (Config_1.Config.Game.debugMode) {
                Config_1.Config.Phaser.url = 'http://localhost:8080/';
            }
            this.GameRef = new Phaser.Game(Config_1.Config.Phaser);
        }
        return App;
    }());
    exports.App = App;
    function resizeApp() {
        // Width-height-ratio of game resolution
        var game_ratio = 360.0 / 640.0;
        // Make div full height of browser and keep the ratio of game resolution
        var div = document.getElementById('phaser-app');
        div.style.width = (window.innerHeight * game_ratio) + 'px';
        div.style.height = window.innerHeight + 'px';
        // Check if device DPI messes up the width-height-ratio
        var canvas = document.getElementsByTagName('canvas')[0];
        var dpi_w = (parseInt(div.style.width) / canvas.width);
        var dpi_h = (parseInt(div.style.height) / canvas.height);
        var height = window.innerHeight * (dpi_w / dpi_h);
        var width = height * game_ratio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }
    function start() {
        console.log("here");
        var game = new App();
        resizeApp();
        // window.onload = () => {
        // 	console.log("here2")
        // 	let game = new LouiseWeiss.App();
        // 	resizeApp();
        // // LouiseWeiss.InitPhaser.initGame();
        // };
        window.addEventListener('resize', resizeApp);
    }
    exports.start = start;
});
//# sourceMappingURL=init.js.map