import { Config } from "../Config";

export class ClaraTown extends Phaser.Scene {
    TileMap: Phaser.Tilemaps.Tilemap;
    Car:     Phaser.Physics.Arcade.Sprite;
    Radio:   Phaser.Physics.Arcade.Sprite;

    constructor() {
        super({ key: 'ClaraTown', active: false });
    }

	create() {
        // Town TileMap
        this.TileMap = this.make.tilemap({ key: 'claratown' });
        var tiles = this.TileMap.addTilesetImage('galletcity', 'galletcity');
        var layer = this.TileMap.createStaticLayer('Tile Layer 1', tiles, 0, 0);
        
        this.Car = this.physics.add.sprite(0, 40, 'voiture');
        // Car oriented to right
        this.Car.angle = 90;
        let carY = 43;
        this.Car.setVelocityX(carY);

        let middleX = Config.Game.width / 2;
        let middleY = Config.Game.height / 2;
        this.Radio = this.physics.add.sprite(middleX, middleY + 60, 'radio');
        this.anims.create({
            key: 'blink',
            frames: this.anims.generateFrameNumbers('radio', { start: 0, end: 1}),
            frameRate: 3,
            repeat: -1
        });
        this.Radio.anims.play('blink', true);
	}

    update() {

    }
}
