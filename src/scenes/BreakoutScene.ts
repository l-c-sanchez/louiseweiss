import { Config } from '../Config';
import { GameText } from '../utils/GameText';

export interface BreakoutConfig {
    ballSize: number;
    paddle: {
        width: number,
        height: number
    };
    brick: {
        width: number,
        height: number
    },
    layout: {
        rows: number,
        cols: number,
        top: number // Distance to top in px
    },
    text: string;
}

export class BreakoutScene extends Phaser.Scene {

    Bricks    : Phaser.Physics.Arcade.Group;
    Ball      : Phaser.Physics.Arcade.Sprite;
    Paddle    : Phaser.Physics.Arcade.Sprite;
    GameEnded : boolean;
    Config    : BreakoutConfig;
    
    /**
     * General questions:
     * - How do we count stars?
     * - Is there a Timer?
     * - Multiple difficulties/level? Different speeds? Different bricks?
     * 
     * TODO:
     * - Better define brick positions
     * - Add a text behind the bricks
     * - Add an explanation before launching the game
     */

    constructor() {
        super({ key: 'BreakoutScene', active: false });
    }

    public create(){

        this.Config = Config.Breakout;

        this.GameEnded = false;

        // Background
        this.cameras.main.setBackgroundColor("#404040");

        new GameText(this, 20, this.Config.layout.top + 20, this.Config.text);

        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.Bricks = this.physics.add.group();
        let marginLeft = (Config.Game.width - this.Config.brick.width * this.Config.layout.cols) / 2;

        for (var row=0; row < this.Config.layout.rows; row++){
            let y = this.Config.layout.top + row * this.Config.brick.height;
            for (var col=0; col < this.Config.layout.cols; col++){
                let x = marginLeft + col * this.Config.brick.width;
                let brick = this.Bricks.create(x, y, 'brick');
                brick.setOrigin(0, 0);
                brick.setDisplaySize(this.Config.brick.width, this.Config.brick.height);
                brick.setImmovable();
            }
        }

        this.Ball = this.physics.add.sprite(400, 500, 'ball').setCollideWorldBounds(true).setBounce(1);
        this.Ball.setData('onPaddle', true);
        this.Ball.setDisplaySize(this.Config.ballSize, this.Config.ballSize);

        this.Paddle = this.physics.add.sprite(400, 550, 'paddle').setImmovable();
        this.Paddle.setDisplaySize(this.Config.paddle.width, this.Config.paddle.height);

        this.physics.add.collider(this.Ball, this.Bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.Ball, this.Paddle, this.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer) {
            //  Keep the paddle within the game
            let paddleWidth = this.Config.paddle.width;
            let gameWidth = Config.Game.width;
            this.Paddle.x = Phaser.Math.Clamp(pointer.x, paddleWidth/2, gameWidth - paddleWidth/2);

            if (this.Ball.getData('onPaddle')){
                this.Ball.x = this.Paddle.x;
            }
        }, this);

        this.input.on('pointerup', function (pointer) {
            if (this.Ball.getData('onPaddle')){
                this.Ball.setVelocity(-75, -300);
                this.Ball.setData('onPaddle', false);
            }

        }, this);

    }

    private hitBrick(ball: Phaser.Physics.Arcade.Sprite, brick: Phaser.Physics.Arcade.Sprite){
        brick.disableBody(true, true);
        if (this.Bricks.countActive() === 0){
            this.GameEnded = true;
        }
    }

    private hitPaddle(ball, paddle){
        var diff = 0;
        if (ball.x < paddle.x){
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        } else if (ball.x > paddle.x){
            //  Ball is on the right-hand side of the paddle
            diff = ball.x -paddle.x;
            ball.setVelocityX(10 * diff);
        } else {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    private resetBall(){
        this.Ball.setVelocity(0);
        this.Ball.setPosition(this.Paddle.x, 500);
        this.Ball.setData('onPaddle', true);
    }

    public update(){
        // Question: do we want to have a limited number of lives?
        // Do we count stars?
        if (this.Ball.y > 600){
            this.resetBall();
        }
    }


}