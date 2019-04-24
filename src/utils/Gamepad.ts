/**
 * 
 * This is adapted from Shawn Hymel's virtual Gamepad: 
 * https://github.com/ShawnHymel/phaser-plugin-virtual-gamepad
 *
 */

export class Gamepad {
    scene: Phaser.Scene;

    input: Phaser.Input.InputPlugin;
    joystick: Phaser.GameObjects.Sprite;
    joystickPad: Phaser.GameObjects.Sprite;
    joystickPoint: Phaser.Math.Vector2;
    joystickRadius: number;
    joystickPointer: Phaser.Input.Pointer;

    properties: any;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.input = this.scene.input;
    }

    /**
     * Add a joystick to the screen (only one joystick allowed for now)
     *
     * @method Phaser.Plugin.VirtualGamepad#addJoystick
     * @param {number} x - Position (x-axis) of the joystick on the canvas
     * @param {number} y - Position (y-axis) of the joystick on the canvas
     * @param {number} scale - Size of the sprite. 1.0 is 100x100 pixels
     * @param {String} key - key for the gamepad's spritesheet
     * @param {Phaser.Sprite} The joystick object just created
     */
    public addJoystick(x: number, y: number, scale: number, key: string) {
        // If we already have a joystick, return null
        if (this.joystick) {
            return null;
        }

        // Add the joystick to the game
        this.joystick = this.scene.add.sprite(x, y, key);
        this.joystick.setFrame(2);
        this.joystick.setScrollFactor(0); 
        this.joystick.setScale(scale, scale); 
        this.joystickPad = this.scene.add.sprite(x, y, key);
        this.joystickPad.setFrame(3);
        this.joystickPad.setScrollFactor(0); 
        this.joystickPad.setScale(scale, scale);

        // Remember the coordinates of the joystick
        this.joystickPoint = new Phaser.Math.Vector2(x, y);

        // Set up initial joystick properties
        this.properties = {
            inUse: false,
            x: 0,
            y: 0,
            distance: 0,
            angle: 0,
            rotation: 0
        };

        // Set the touch area as defined by the button's radius
        this.joystickRadius = scale * (this.joystick.width / 2);

        return this.joystick;
    };


    private testDistance(pointer: Phaser.Input.Pointer) {
        var reset = true;
    
        // See if the pointer is over the joystick
        var d = this.joystickPoint.distance(pointer.position);
        if ((pointer.isDown) && ((pointer === this.joystickPointer) || 
            (d < this.joystickRadius))) {
            reset = false;
            this.properties.inUse = true;
            this.joystickPointer = pointer;
            this.moveJoystick(pointer.position);
        }
        
        return reset;
    };

    public update(){
        this.gamepadPoll();
    }

    private gamepadPoll() {        
        var resetJoystick = true;
        
        // See if any pointers are in range of the joystick or buttons
        let pointers = [
            this.input.pointer1,
            this.input.pointer2,
            this.input.pointer3,
            this.input.pointer4,
            this.input.pointer5,
            this.input.pointer6,
            this.input.pointer7,
            this.input.pointer8,
            this.input.pointer9,
            this.input.pointer10
        ]

        pointers.forEach(function(p) {
            if (p){
                resetJoystick = this.testDistance(p);
            }
        }, this);
        
        // See if the mouse pointer is in range of the joystick or buttons
        resetJoystick = this.testDistance(this.input.mousePointer);
        
        // If the pointer is removed, reset the joystick
        if (resetJoystick) {
            if (!this.joystickPointer || !this.joystickPointer.isDown) {
                this.moveJoystick(this.joystickPoint);
                this.properties.inUse = false;
                this.joystickPointer = null;
            }
        }
        
    };

    private moveJoystick(point) {
        
        // Calculate x/y of pointer from joystick center
        var deltaX = point.x - this.joystickPoint.x;
		var deltaY = point.y - this.joystickPoint.y;
        
        // Get the angle (radians) of the pointer on the joystick
        let rotation = new Phaser.Math.Vector2(point).subtract(this.joystickPoint).angle();

        // Set bounds on joystick pad
        if (this.joystickPoint.distance(point) > this.joystickRadius) {
            deltaX = (deltaX === 0) ? 
                0 : Math.cos(rotation) * this.joystickRadius;
            deltaY = (deltaY === 0) ?
                0 : Math.sin(rotation) * this.joystickRadius;
        }
        
        // Normalize x/y
        this.properties.x = (deltaX / this.joystickRadius) * 100;
		this.properties.y = (deltaY / this.joystickRadius) * 100;
        
        // Set polar coordinates
        this.properties.rotation = rotation;
        this.properties.angle = (180 / Math.PI) * rotation;
        this.properties.distance = (this.joystickPoint.distance(point) / this.joystickRadius) * 100;

        // Move joystick pad images
        this.joystickPad.x = this.joystickPoint.x + deltaX;
        this.joystickPad.y = this.joystickPoint.y + deltaY;
    };

}
