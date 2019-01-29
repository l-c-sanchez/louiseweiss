"use strict";
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
var CharacterSheet = /** @class */ (function () {
    // private Picture: Phaser.GameObjects.Image;
    function CharacterSheet(obj) {
        this.Name = obj.name;
        this.Age = obj.age;
        this.Job = obj.job;
        this.Town = obj.town;
        this.Education = obj.education;
        // this.Picture = obj.picture;
    }
    CharacterSheet.prototype.getName = function () { return this.Name; };
    CharacterSheet.prototype.getAge = function () { return this.Age; };
    CharacterSheet.prototype.getJob = function () { return this.Job; };
    CharacterSheet.prototype.getTown = function () { return this.Town; };
    CharacterSheet.prototype.getEducation = function () { return this.Education; };
    return CharacterSheet;
}());
// {}
var ChooseCharacter = /** @class */ (function (_super) {
    __extends(ChooseCharacter, _super);
    function ChooseCharacter() {
        return _super.call(this, { key: 'ChooseCharacter', active: false }) || this;
    }
    ChooseCharacter.prototype.preload = function () {
        this.load.image("Space", "assets/space3.png");
    };
    ChooseCharacter.prototype.create = function () {
        this.add.image(0, 0, "Space");
    };
    return ChooseCharacter;
}(Phaser.Scene));
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
                // scene: [ ChooseCharacter ],
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
            var _this = this;
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
            picture.setInteractive().on('pointerup', function () {
                console.log("ty as bien cliqué");
                picture.setVisible(false);
                text.setVisible(false);
                // let key = 'ChooseCharacter'
                _this.scene.add('ChooseCharacter', new ChooseCharacter(), true);
                // this.scene.start(new ChooseCharacter())
            });
            // .setScale(scaleRatio, scaleRatio);
            // picture.displayWidth = 0.4 * this.sys.canvas.width;
            // picture.displayHeight = 0.4 * this.sys.canvas.width;
            Phaser.Display.Align.In.Center(picture, this.add.zone(this.sys.canvas.width / 2, this.sys.canvas.height / 1.8, this.sys.canvas.width, this.sys.canvas.height));
        };
        InitPhaser.prototype.update = function () {
            console.log("in update");
        };
        return InitPhaser;
    }());
    LouiseWeiss.InitPhaser = InitPhaser;
})(LouiseWeiss || (LouiseWeiss = {}));
window.onload = function () {
    var game = new LouiseWeiss.InitPhaser();
    // LouiseWeiss.InitPhaser.initGame();
};
//# sourceMappingURL=LouiseWeiss.js.map