import { Config } from "./Config";

class Generator 
{
    DEPTH: { floor: number };
    Cols: number;
    Rows: number;
    Env: CarGame;
    Layers: { floor: Array<Array<Phaser.GameObjects.Sprite>>, walls: Array<any>, monsters: Array<any>, pickups: Array<any>, turrets:Array<any>, overlay:boolean };

    constructor (Env) {
        
        // trucs qui sont init // this.CONFIG =ctx.CONFIG;
        this.Env = Env;
        this.DEPTH = Env.DEPTH;
        
        this.Cols = 12;
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

                if (tx != 3 && tx != 8)
                    spr = this.Env.add.sprite(x, y, 'road');
                else    
                    spr = this.Env.add.sprite(x, y, 'road_line');
                spr.setOrigin(0);
                spr.setDepth(this.DEPTH.floor)
                floor[ty][tx] = spr;
            }
        }
        // save floor array in generators layers
        this.Layers.floor = floor;

    }
    scrollFloor() {
        // console.log(this.Layers.floor);
        let ty = this.Layers.floor.length;
        let offset = this.Env.cameras.main.scrollY - this.Layers.floor[ty - 1][0].y;
        // console.log(this.Env.cameras.main.scrollY + "; " + this.Layers.floor[ty - 1][0].y + ";" + offset)
        if (offset <= -640)  { // this.config.tile
            this.appendFloorRow();
            this.destroyFloorRow();
            
        }
    }
    destroyFloorRow() {
        let ty = this.Layers.floor.length;
        for (let tx = 0;tx > this.Layers.floor[0].length; tx++) {
            this.Layers.floor[ty - 1][tx].destroy();
        }
        this.Layers.floor.splice(ty - 1,1);
    }
    appendFloorRow() {
        let x;
        let spr;
        let empty: number[] = []

        /// ligne à la fin, right below camera edge
        let ty = this.Layers.floor.length;
        // let y = this.Layers.floor[ty - 1][0].y + 32; // this.CONFIG.tile
        let y = this.Layers.floor[0][0].y - 32;
        // console.log(y);

        // ajout d'une ligne vide
        this.Layers.floor.unshift(new Array<Phaser.GameObjects.Sprite>());

        for (let tx = 0; tx < this.Cols; tx++) {
        
            x = (tx * 32) // this CONFIG TILE + this CONFIG MAP offset
            // spr = this.Env.add.tileSpr0ite(x, y, 32, 32,'mapTiles', 2);
            if (tx != 3 && tx != 8)
                spr = this.Env.add.sprite(x, y, 'road');
            else    
                spr = this.Env.add.sprite(x, y, 'road_line');
        
            spr.setOrigin(0);
            spr.setDepth(this.DEPTH.floor);
            this.Layers.floor[0][tx] = spr;
        }
    }

}


export class CarGame extends Phaser.Scene {
    static NONE = 0;
    static LEFT = 1;
    static RIGHT = 2;

    Generator!: Generator;
    DEPTH!: { floor: number };
    cam_speed!: { base:number, current:number, max:number};
    player!: Entity;
    playerSpeed:number = 120;
    targetPos:number;
    Corridor:number = 64;

    // Player movement
    Cursors!: Phaser.Input.Keyboard.CursorKeys;
    Swipe!: string;
    Threshold!: number;

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
            base:-3, 
            current:-3,
            max:-3
        }
    }

    constructor() {
        super({ key: 'CarGame', active:false });
        this.targetPos = Config.Game.centerX;
    }

    preload(){
        // this.load.spritesheet('tileset', 'assets/tilesets/PacmanMap.png', { frameWidth:32, frameHeight:32, margin:1, spacing:2});
    }

    create() {
        // Create floor 
        this.Generator.setup();

        // Create Player
        this.createPlayer(claraAnims);
        this.player.spr.setScale(2, 2);
        this.player.spr.setOrigin(0.5, 0.5);
        this.player.setPosition(this.player.x, this.player.y - 1);

        var claraAnims = ["", "left", "right"];
        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers('voiture', { start: 1, end:6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key:"left",
            frames:this.anims.generateFrameNumbers('voiture', { start: 7, end:13 }),
            frameRate: 10,
            repeat: -1
        });
        this.Threshold = 1;
        this.Cursors = this.input.keyboard.createCursorKeys();
        var downX: number, upX: number, Threshold: number = 50;
        this.input.on('pointerdown', function (pointer : Phaser.Input.InputPlugin) {
            downX = pointer.x;
        });

        this.input.on('pointerup', (pointer : Phaser.Input.InputPlugin) => {
            upX = pointer.x;
            if (upX < downX - Threshold){
                this.Swipe = 'left';
            } else if (upX > downX + Threshold) {
                this.Swipe = 'right';
            } 
            console.log(this.Swipe)
        }); 
        console.log(this.Swipe)
    }

    update() {
        this.updateCamera();
        this.Generator.update();
        this.player.setPositionY(this.player.y + this.cam_speed.current);
    
        
        if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == "left" ){
            console.log(this.Swipe)
            this.moveTo(this.player.x - this.Corridor);
            this.Swipe = "";      
        }
        else if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == "right") {
            console.log(this.Swipe)
            this.moveTo(this.player.x + this.Corridor);
            this.Swipe = "";
        }
        this.move();
    }

    createPlayer (claraAnims) {
        this.player = new Entity(this, Config.Game.centerX, Config.Game.centerY / 2 * 3, 'voiture', claraAnims);
        
    }

    moveTo(x:number){
        if (x > Config.Game.width || x < 0) {
            return;
        }
        this.targetPos = x;
        if (x - this.player.x < 0)
            this.player.setVelocityX(-this.playerSpeed);
        else
            this.player.setVelocityX(this.playerSpeed);

        

    }

    

    move() {
        console.log(this.targetPos, this.player.x)
        if (Phaser.Math.Fuzzy.Equal(this.player.spr.x, this.targetPos, this.Threshold)){
            this.player.setVelocityX(0);
            this.player.setPositionX(this.targetPos);
        }
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

export class Entity 
{


    MAP_OFFSET: number;
    TILE_SIZE: number;
    width: number;
    height: number;
    depth:number;
    ctx: Phaser.Scene;
    x:number;
    y:number;
    key:string;
    frames: { idle: number, hurt:number };
    direction:{ last:boolean, current:string};
    states: { idle:boolean, walk:boolean, hurt: boolean, dead:boolean, last:false};
    speed: { base:number, current:number, max:0};
    spr: Phaser.Physics.Arcade.Sprite;
    shadow:Phaser.GameObjects.Graphics;
    
    Animations: Array<string>



    // constructor(ctx, x, y, key) {
    constructor(ctx: CarGame, x: number, y: number, key: string, animations: Array<string>){
        // this.MAP_OFFSET = ctx.CONFIG.map_offset

        this.TILE_SIZE = Config.Game.tile;

        // this.helper = new Helper();
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.depth = 1000;
    

        this.key = key;
        this.frames = {
            idle:0,
            hurt:3
        }
        this.direction	= {
            last: false,
            current: 'down'
        };
        this.states = {
            idle:true,
            walk:false,
            hurt:false,
            dead:false,
            last:false
        };

        this.speed = {
            base:0,
            current:0,
            max:0
        };
        this.Animations = animations;
        this.createSprite();
    }


    createSprite () {
        if (this.spr) {
            this.spr.destroy();
        }

        this.spr = this.ctx.physics.add.sprite(this.x, this.y, this.key);
        this.spr.setOrigin(0.5);
        this.spr.setDepth(this.depth);
    }

    destroy () {
        if (this.spr) {
            this.spr.destroy();
        }
        // this.spr = false;
    }
    

    setPosition(x:number, y:number) {
        this.spr.setPosition(x, y);
        this.x = x;
        this.y = y;

    }

    setPositionX(x:number){
        this.spr.x = x;
        this.x = x;
    }

    setPositionY(y:number) {
        this.spr.y = y;
        this.y = y;
    }
    
    setVelocityX(speed:number){
        console.log(speed)
        this.spr.setVelocityX(speed);
    }


    // createShadow() {
    //     this.shadow = this.ctx.add.graphics({ x:this.x, y:this.y});
    //     let alpha = 0.1
    // }
   
}
