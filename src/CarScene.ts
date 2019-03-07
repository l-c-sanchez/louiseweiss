import { Config } from "./Config";
import { NONE } from "phaser";

/**
 * TODO: there should be only one group of stars shared between all layers.
 * --> each layer contains only an array with its star(s)
 */
class Layer {
    floor: Phaser.GameObjects.Group
    layerSprites: Array<Phaser.GameObjects.Sprite>
    starGroup: Phaser.Physics.Arcade.Group
    rockGroup: Phaser.Physics.Arcade.Group
    
    y: number
    Cols: number
    DEPTH!: { floor: number };
    Env: CarGame

    constructor (
        Env: CarGame,
        starGroup: Phaser.Physics.Arcade.Group,
        rockGroup: Phaser.Physics.Arcade.Group,
        y: number) 
        {
        this.Env = Env;
        this.Cols = 12;
        this.DEPTH = Env.DEPTH;
        this.y = y;

        this.layerSprites = [];
        this.starGroup = starGroup;
        this.rockGroup = rockGroup;
        this.createLayer();
    }

    createLayer() {
        var cols = this.Cols;

        this.floor = this.Env.add.group();

        for (let tx = 0; tx < this.Cols; tx++) {
            var x = (tx * 32) // ou à la place de 32 this.CONFIG.tile
            if (tx != 3 && tx != 8) {
                this.floor.create(x, this.y, 'road');
            } else {
                this.floor.create(x, this.y, 'road_line');
            }
            this.floor.setDepth(this.DEPTH.floor, 0);
        }

        var starProba = 0.2;
        if (Math.random() < starProba){
            var x = Phaser.Math.Between(0, cols * 32);
            var star: Phaser.Physics.Arcade.Sprite = this.starGroup.create(x, this.y, 'star');
            this.layerSprites.push(star);
        }
        var rockProba = 0.1;
        if (Math.random() < rockProba){
            var x = Phaser.Math.Between(0, cols * 32);
            var rock: Phaser.Physics.Arcade.Sprite = this.rockGroup.create(x, this.y, 'rock');
            this.layerSprites.push(rock);
        }

    }

    destroy() {
        this.floor.destroy();
        for (var i=0; i<this.layerSprites.length; i++){
            this.starGroup.remove(this.layerSprites[i], true, true);
            this.rockGroup.remove(this.layerSprites[i], true, true);
        }
    }

}


class Generator 
{
    DEPTH: { floor: number };
    Cols: number;
    Rows: number;
    Env: CarGame;
    Layers: Array<Layer>
    starGroup: Phaser.Physics.Arcade.Group
    rockGroup: Phaser.Physics.Arcade.Group

    constructor (Env) {
        
        // trucs qui sont init // this.CONFIG =ctx.CONFIG;
        this.Env = Env;
        this.DEPTH = Env.DEPTH;
        
        this.Cols = 12;
        this.Rows = 20;
        this.Layers = [];

        this.starGroup = this.Env.physics.add.group();
        this.starGroup.setDepth(1, 0);
        this.rockGroup = this.Env.physics.add.group();
        this.rockGroup.setDepth(1, 0);
    }

    setup() {
        this.createLayers();
    }
    update() {
        this.scrollLayers();
    }

    createLayers() {
        let y;
        let rows = this.Rows + 1;

        this.Layers = [];

        for (let ty = 0; ty < rows; ty++){
            y = (ty * 32) // ou à la place de 32 this.CONFIG.tile
            this.Layers.push(new Layer(this.Env, this.starGroup, this.rockGroup, y));
        }
    }

    scrollLayers() {
        let ty = this.Layers.length;
        let offset = this.Env.cameras.main.scrollY - this.Layers[ty - 1].y;
        if (offset <= -640)  { // this.config.tile
            this.appendLayer();
            this.destroyLastLayer();
        }
    }

    destroyLastLayer() {
        let ty = this.Layers.length;
        this.Layers[ty-1].destroy();
        this.Layers.splice(ty - 1, 1);
    }
    appendLayer() {
        let y = this.Layers[0].y - 32;
        this.Layers.unshift(new Layer(this.Env, this.starGroup, this.rockGroup, y));
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
    wall!: Entity;
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
        }); 

        // Collision with objects
        this.physics.add.overlap(this.player.spr, this.Generator.starGroup, this.collectStar, null, this);
        this.physics.add.overlap(this.player.spr, this.Generator.rockGroup, this.collideRock, null, this);
    }

    collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
        star.disableBody(true, true);
    }

    collideRock(player: Phaser.Physics.Arcade.Sprite, rock: Phaser.Physics.Arcade.Sprite) {
        player.disableBody(true, true);
        // // There are some error when start another scene after CarScene. To investigate.
        // this.scene.start('GameOverScene')
    }

    update() {
        this.updateCamera();
        this.Generator.update();
        this.player.setPositionY(this.player.y + this.cam_speed.current);
        
        if (this.Cursors.left != undefined && this.Cursors.left.isDown || this.Swipe == "left" ){
            this.moveTo(this.player.x - this.Corridor);
            this.Swipe = "";      
        }
        else if (this.Cursors.right != undefined && this.Cursors.right.isDown || this.Swipe == "right") {
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
        var speedX = this.player.getVelocityX();
        if ((speedX > 0 && this.player.spr.x >= this.targetPos) ||
            (speedX < 0 && this.player.spr.x <= this.targetPos)) {
                this.player.setVelocityX(0);
                this.player.setPositionX(this.targetPos);
        }

        //// The problem of this method below is that if we miss the point where x = targetPos, 
        //// then we will keep on changing x for an undetermined time
        // if (Phaser.Math.Fuzzy.Equal(this.player.spr.x, this.targetPos, this.Threshold)){
        //     this.player.setVelocityX(0);
        //     this.player.setPositionX(this.targetPos);
        // }
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
        this.spr.setVelocityX(speed);
    }

    getVelocityX(): number {
        return this.spr.body.velocity.x;
    }


    // createShadow() {
    //     this.shadow = this.ctx.add.graphics({ x:this.x, y:this.y});
    //     let alpha = 0.1
    // }
   
}
