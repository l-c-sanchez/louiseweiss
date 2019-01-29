"use strict";
var CharacterSheet = /** @class */ (function () {
    // private Picture: Phaser.GameObjects.Image;
    function CharacterSheet(obj) {
        this.Name = obj.name;
        this.Age = obj.age;
        this.Job = obj.job;
        this.Town = obj.town;
        // this.Picture = obj.picture;
    }
    CharacterSheet.prototype.getName = function () { return this.Name; };
    CharacterSheet.prototype.getAge = function () { return this.Age; };
    CharacterSheet.prototype.getJob = function () { return this.Job; };
    CharacterSheet.prototype.getTown = function () { return this.Town; };
    return CharacterSheet;
}());
// {}
/// <reference path ='phaser/dist/phaser.d.ts'>
var LouiseWeiss;
(function (LouiseWeiss) {
    var InitPhaser = /** @class */ (function () {
        function InitPhaser() {
            var config = {
                type: Phaser.AUTO,
                width: window.innerWidth,
                //  * window.devicePixelRatio,
                height: window.innerHeight,
                //* window.devicePixelRatio,
                autoResize: true,
                scene: {
                    preload: this.preload,
                    create: this.create,
                    update: this.update
                },
                banner: true,
                title: 'Louise Weiss',
                url: 'http://localhost:8080',
                version: '1.0.0'
            };
            this.gameRef = new Phaser.Game(config);
        }
        InitPhaser.prototype.preload = function () {
            this.load.image("MartaSmiley", "assets/smiley.png");
        };
        InitPhaser.prototype.getCenterX = function () {
            return this.sys.canvas.width / 2;
        };
        InitPhaser.prototype.create = function () {
            // this.add.image(100,100,"MartaSmiley");
            // var graphics = this.add.graphics()
            // let pictures = this.add.group( {classType: Phaser.GameObjects.Image, runChildUpdate: true});
            // let picture = new Phaser.GameObjects.Image(this, 100, 100, "MartaSmiley");
            // picture.setActive(true);
            // pictures.add(picture);
            // let character = new CharacterSheet({
            // 	name:"Marta",
            // 	age:45,
            // 	job:"nurse",
            // 	town:"Tourville-La-Campagne"
            // 	// picture: picture
            // });
            // console.log(character);
            // let scaleRatio = window.devicePixelRatio / 3;
            console.log(this);
            var text = this.add.text(0, 0, "Hello world", { fontSize: "8vw", align: 'center', fill: "#FFFFFF" });
            Phaser.Display.Align.In.Center(text, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 4, this.sys.canvas.width, this.sys.canvas.height));
            var picture = this.add.image(0, 0, "MartaSmiley");
            // .setScale(scaleRatio, scaleRatio);
            // picture.displayWidth = 0.4 * this.sys.canvas.width;
            // picture.displayHeight = 0.4 * this.sys.canvas.width;
            Phaser.Display.Align.In.Center(picture, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 1.8, this.sys.canvas.width, this.sys.canvas.height));
        };
        InitPhaser.prototype.update = function () { };
        return InitPhaser;
    }());
    LouiseWeiss.InitPhaser = InitPhaser;
})(LouiseWeiss || (LouiseWeiss = {}));
window.onload = function () {
    var game = new LouiseWeiss.InitPhaser();
    // LouiseWeiss.InitPhaser.initGame();
};
//# sourceMappingURL=LouiseWeiss.js.map