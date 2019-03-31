// This was copied from https://gist.github.com/PaNaVTEC/ef18d2bee239514515e91d6c50012825

// Original imp: https://github.com/jdnichollsc/Phaser-Kinetic-Scrolling-Plugin
// Adapted to phaser 3 By Christian Panadero

export interface KineticScrollSettings {
  kineticMovement: boolean;
  timeConstantScroll: number;
  horizontalScroll: boolean;
  verticalScroll: boolean;
  bounds: {left: number, top: number, bottom: number, right: number}
}

export class KineticScroll {
  private pointerId: number;
  private startX: number;
  private startY: number;

  private screenX: number;
  private screenY: number;

  private pressedDown
  private timestamp: number;
  private beginTime: number;
  private velocityY: number;
  private velocityX: number;
  private amplitudeY: number;
  private amplitudeX: number;

  // from move function
  private now: number;
  private thresholdOfTapTime: number;
  private thresholdOfTapDistance: number;
  private settings: KineticScrollSettings;

  // from end
  private autoScrollX: boolean;
  private autoScrollY: boolean;
  private targetX: number;
  private targetY: number;

  // from update
  private elapsed: number;

  // private boolean for end mode
  private enterInBeginMove : boolean = false;

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, settings?: KineticScrollSettings) {
    this.scene = scene;
    if (settings === undefined){
      this.settings = {
        kineticMovement: true,
        timeConstantScroll: 325,
        horizontalScroll: true,
        verticalScroll: true,
        bounds: {left: 0, top: 0, bottom: 800, right: 900}
      };
    } else {
      this.settings = settings;
    }
  }
  
	public setBottom(bottom: number) {
		this.settings.bounds.bottom = bottom;
	}

  beginMove(pointer) {
    this.pointerId = pointer.id;
    this.startX = this.scene.input.x;
    this.startY = this.scene.input.y;
    this.screenX = pointer.screenX;
    this.screenY = pointer.screenY;

    this.pressedDown = true;

    this.timestamp = Date.now();

    // the time of press down
    this.beginTime = this.timestamp;
    this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0;
    this.enterInBeginMove = true;
  }

  move (pointer) {
    let x = this.scene.input.x;
    let y = this.scene.input.y;

    if (!this.pressedDown) return;

    // If it is not the current pointer
    if (this.pointerId !== pointer.id) return;

    this.now = Date.now();
    const elapsed = this.now - this.timestamp;
    this.timestamp = this.now;

    let deltaX = 0;
    let deltaY = 0;

    // It`s a fast tap not move
    if (
      this.now - this.beginTime < this.thresholdOfTapTime
        && Math.abs(pointer.screenY - this.screenY) < this.thresholdOfTapDistance
        && Math.abs(pointer.screenX - this.screenX) < this.thresholdOfTapDistance
    ) return;

    const cam = this.scene.cameras.main;
    if (this.settings.horizontalScroll) {
      deltaX = x - this.startX;
      this.startX = x;
      this.velocityX = 0.8 * (1000 * deltaX / (1 + elapsed)) + 0.2 * this.velocityX;
      cam.setScroll(cam.scrollX - deltaX, cam.scrollY);
    }

    if (this.settings.verticalScroll) {
      deltaY = y - this.startY;
      this.startY = y;
      this.velocityY = 0.8 * (1000 * deltaY / (1 + elapsed)) + 0.2 * this.velocityY;
      cam.setScroll(cam.scrollX, cam.scrollY - deltaY);
    }
  }

  public endMove() {
    if (this.enterInBeginMove) {
      this.pointerId = null;
      this.pressedDown = false;
      this.autoScrollX = false;
      this.autoScrollY = false;
  
      if (!this.settings.kineticMovement) return;
  
      this.now = Date.now();
  
      const cam = this.scene.cameras.main;
      const bounds = this.settings.bounds;
      const maxAmplitude = 300;  // we need to cap the amplitude

      this.targetX = this.getTarget(cam.scrollX, this.velocityX, maxAmplitude, bounds.left, bounds.right - cam.width);
      this.amplitudeX = cam.scrollX - this.targetX;
      
      this.targetY = this.getTarget(cam.scrollY, this.velocityY, maxAmplitude, bounds.top, bounds.bottom - cam.height);
      this.amplitudeY = cam.scrollY - this.targetY;

      this.autoScrollX = true;
      this.autoScrollY = true;
    }
  }

  private getTarget(currentScroll, velocity, maxAmplitude, minScroll, maxScroll){
    let amplitude = this.constrain(0.8 * velocity, -maxAmplitude, maxAmplitude);
    let target = Math.round(currentScroll - amplitude);
    target = this.constrain(target, minScroll, maxScroll);
    return target;
  }

  private constrain(value: number, min: number, max: number){
    if (value <= min){
      return min;
    } else if (value >= max){
      return max;
    } else {
      return value;
    }
  }

  public update() {
    this.elapsed = Date.now() - this.timestamp;
    let delta: number = 0;
    const cam = this.scene.cameras.main;
    if (this.autoScrollX && this.amplitudeX !== 0) {

      delta = -this.amplitudeX * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
      if (delta > 0.5 || delta < -0.5) {
        cam.setScroll(this.targetX - delta, cam.scrollY);
      } else {
        this.autoScrollX = false;
        cam.setScroll(this.targetX, cam.scrollY);
      }
    }

    if (this.autoScrollY && this.amplitudeY !== 0) {

      delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
      if (delta > 0.5 || delta < -0.5) {
        cam.setScroll(cam.scrollX, this.targetY - delta);
      } else {
        this.autoScrollY = false;
        cam.setScroll(cam.scrollX, this.targetY);
      }
    }
  }
}
  