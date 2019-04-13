
export class ClaraTown extends Phaser.Scene {
    TileMap: Phaser.Tilemaps.Tilemap;

    constructor() {
        super({ key: 'ClaraTown', active: false });
    }

    init() {
	}

	preload() {

	}

	create() {
        // Getting the town tileset
        console.log('in claratown - create');

        this.TileMap = this.make.tilemap({ key: 'claratown' });
        var tiles = this.TileMap.addTilesetImage('galletcity', 'galletcity');
		var layer = this.TileMap.createStaticLayer('Tile Layer 1', tiles, 0, 0);

        // this.TileMap = this.make.tilemap({ key: 'ClaraTown'});
        // var tiles = this.TileMap.addTilesetImage('galletcity', 'galletcity');
		// var layer = this.TileMap.createStaticLayer('MainLayer', tiles, 0, 0);

        // let tiles = this.TileMap.addTilesetImage('galletcity', 'galletcity');
		// this.TileMap.createStaticLayer('MainLayer', 'galletcity', 0, 0);

	}


    update() {

    }
}
