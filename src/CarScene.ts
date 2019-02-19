class Generator 
{
    DEPTH: { floor: number };
    Cols: number;
    Rows: number;
    Env: CarGame;
    Layers: { floor: Array<Array<Phaser.Tilemaps.Tile>>, walls: Array<any>, monsters: Array<any>, pickups: Array<any>, turrets:Array<any>, overlay:boolean };

    constructor (Env) {
        
        // trucs qui sont init // this.CONFIG =ctx.CONFIG;
        this.Env = Env;
        this.DEPTH = Env.DEPTH;
        
        this.Cols = 11;
        this.Rows = 20;
        this.Layers = {
            floor: [],
            walls: [],
            monsters:[],
            pickups: [],
            turrets: [],
            overlay: false
        };

    }

    setup() {
        this.createFloor();
    }
    update() {
        this.scrollFloor();
    }
    createFloor() {
        let x;
        let y;
        let spr;
        
        let cols = this.Cols;
        let rows = this.Rows + 1;
        let floor = [];

        for (let ty = 0; ty < rows; ty++){
            floor[ty] = [];
            for (let tx = 0; tx < cols; tx++) {
                x = (tx * 32) // ou à la place de 32 this.CONFIG.tile
                y = (ty * 32) // ou à la place de 32 this.CONFIG.tile

                spr = this.Env.add.sprite(x, y, "tileset");
                spr.setOrigin(0);
                spr.setDepth(this.DEPTH.floor)
                floor[ty][tx] = spr;
            }
        }
        // save floor array in generators layers
        this.Layers.floor = floor;

    }
    scrollFloor() {
        let offset = this.Env.cameras.main.scrollY - this.Layers.floor[0][0].y;
        if (offset >= 32)  { // this.config.tile
            this.destroyFloorRow();
            this.appendFloorRow();
        }
    }
    destroyFloorRow() {
        for (let tx = 0;tx > this.Layers.floor[0].length; tx++) {
            this.Layers.floor[0][tx].destroy();
        }

        this.Layers.floor.splice(0,1);
    }
    appendFloorRow() {
        let x;
        let spr;
        let empty: number[] = []

        /// ligne à la fin, right below camera edge
        let ty = this.Layers.floor.length;
        let y = this.Layers.floor[ty - 1][0].y + 32; // this.CONFIG.tile

        // ajout d'une ligne vide
        this.Layers.floor.push(new Array<Phaser.Tilemaps.Tile>());

        for (let tx = 0; tx < this.Cols; tx++) {
            x = (tx * 32) // this CONFIG TILE + this CONFIG MAP offset
            spr = this.Env.add.sprite(x, y, 'tileset');
            spr.setOrigin(0);
            spr.setDepth(this.DEPTH.floor);
            this.Layers.floor[ty][tx] = spr;
        }
    }

}


export class CarGame extends Phaser.Scene {

    Generator!: Generator;
    DEPTH!: { floor: number };
    cam_speed!: { base:number, current:number, max:number}

    init() {
        // this.CONFIG = this.sys.game.CONFIG
        this.DEPTH = {
            floor: 0
        };
        this.Generator = new Generator(this);
            //this.allow_input = false;
            // this.is_pause = false;
            // this.is_gameover = false

        this.cam_speed = {
            base:1, 
            current:1,
            max:1
        }
    }

    constructor() {
        super({ key: 'CarGame', active:false });
    }

    preload(){
        this.load.spritesheet('tileset', 'assets/PacmanMap.png', { frameWidth:32, frameHeight:32, margin:1, spacing:2});
    }

    create() {
        // Create floor 
        this.Generator.setup();

    }

    update() {
        this.updateCamera();
        this.Generator.update();
    }

    updateCamera() {
        // Scroll camera
        this.cameras.main.setScroll(
            0,
            this.cameras.main.scrollY + this.cam_speed.current
        );

    }
    setCamSpeed(speed) {
        this.cam_speed.base = speed;
        this.cam_speed.current = speed;
        this.cam_speed.current = Math.min(
            this.cam_speed.current,
            this.cam_speed.max
        );

        this.cam_speed.current = Math.max(
            this.cam_speed.current,
            0
        );
    }

}
