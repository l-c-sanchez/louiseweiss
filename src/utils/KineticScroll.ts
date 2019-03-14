// Original imp: https://github.com/jdnichollsc/Phaser-Kinetic-Scrolling-Plugin
// Adapted to phaser 3 By Christian Panadero
export default class KineticScroll {
    private pointerId
    private startX
    private startY
  
    private screenX
    private screenY
  
    private pressedDown
    private timestamp
    private beginTime
    private velocityY
    private velocityX
    private amplitudeY
    private amplitudeX
  
    // from move function
    private now
    private thresholdOfTapTime
    private thresholdOfTapDistance
    private dragging
    private settings
  
    // from end
    private autoScrollX
    private autoScrollY
    private velocityWheelXAbs
    private velocityWheelYAbs
    private targetX
    private targetY
    private velocityWheelX
    private velocityWheelY
  
    // from update
    private elapsed
  
    private scene: Phaser.Scene
    constructor (scene: Phaser.Scene) {
      this.scene = scene
      this.settings = {
        kineticMovement: true,
        timeConstantScroll: 325,
        horizontalScroll: true,
        verticalScroll: true,
        horizontalWheel: true,
        verticalWheel: false,
        deltaWheel: 40,
        onUpdate: null
      }
    }
  
    beginMove (pointer) {
      this.pointerId = pointer.id
      this.startX = this.scene.input.x
      this.startY = this.scene.input.y
  
      this.screenX = pointer.screenX
      this.screenY = pointer.screenY
  
      this.pressedDown = true
  
      this.timestamp = Date.now()
  
      // the time of press down
      this.beginTime = this.timestamp
      this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0
    }
  
    canCameraMoveY () {
      const cam = this.scene.cameras.main
      const camJson = cam.toJSON()
      const camBoundH = camJson['bounds']['height']
      return cam.scrollY > 0 && cam.scrollY + cam.height < camBoundH
    }
  
    canCameraMoveX () {
      const cam = this.scene.cameras.main
      const camJson = cam.toJSON()
      const camBoundW = camJson['bounds']['width']
      const camBoundX = camJson['bounds']['x']
      const camBoundRight = camBoundW + camBoundX
      return cam.scrollX > 0 && cam.scrollX + cam.width < camBoundRight
    }
  
    move (pointer, x, y) {
      if (!this.pressedDown) return
  
      // If it is not the current pointer
      if (this.pointerId !== pointer.id) return
  
      this.now = Date.now()
      const elapsed = this.now - this.timestamp
      this.timestamp = this.now
  
      let deltaX = 0
      let deltaY = 0
  
      // It`s a fast tap not move
      if (
        this.now - this.beginTime < this.thresholdOfTapTime
          && Math.abs(pointer.screenY - this.screenY) < this.thresholdOfTapDistance
          && Math.abs(pointer.screenX - this.screenX) < this.thresholdOfTapDistance
      ) return
  
      const cam = this.scene.cameras.main
      if (this.settings.horizontalScroll) {
        deltaX = x - this.startX
        if (deltaX !== 0) {
          this.dragging = true
        }
        this.startX = x
        this.velocityX = 0.8 * (1000 * deltaX / (1 + elapsed)) + 0.2 * this.velocityX
        cam.setScroll(cam.scrollX - deltaX, cam.scrollY)
      }
  
      if (this.settings.verticalScroll) {
        deltaY = y - this.startY
        if (deltaY !== 0) {
          this.dragging = true
        }
        this.startY = y
        this.velocityY = 0.8 * (1000 * deltaY / (1 + elapsed)) + 0.2 * this.velocityY
        cam.setScroll(cam.scrollX, cam.scrollY - deltaY)
      }
  
      if (typeof this.settings.onUpdate === 'function') {
        let updateX = 0
        if (this.canCameraMoveX()) {
          updateX = deltaX
        }
  
        let updateY = 0
        if (this.canCameraMoveY()) {
          updateY = deltaY
        }
  
        this.settings.onUpdate(updateX, updateY)
      }
    }
  
    endMove () {
      this.pointerId = null
      this.pressedDown = false
      this.autoScrollX = false
      this.autoScrollY = false
  
      if (!this.settings.kineticMovement) return
  
      this.now = Date.now()
  
      const cam = this.scene.cameras.main
      if (this.withinGame()) {
        if (this.velocityX > 10 || this.velocityX < -10) {
          this.amplitudeX = 0.8 * this.velocityX
          this.targetX = Math.round(cam.scrollX - this.amplitudeX)
          this.autoScrollX = true
        }
  
        if (this.velocityY > 10 || this.velocityY < -10) {
          this.amplitudeY = 0.8 * this.velocityY
          this.targetY = Math.round(cam.scrollY - this.amplitudeY)
          this.autoScrollY = true
        }
      }
  
      if (!this.withinGame()) {
        this.velocityWheelXAbs = Math.abs(this.velocityWheelX)
        this.velocityWheelYAbs = Math.abs(this.velocityWheelY)
        if (
          this.settings.horizontalScroll
            && (this.velocityWheelXAbs < 0.1 || !this.withinGame())
        ) {
          this.autoScrollX = true
        }
        if (
          this.settings.verticalScroll
            && (this.velocityWheelYAbs < 0.1 || !this.withinGame())
        ) {
          this.autoScrollY = true
        }
      }
    }
  
    update () {
      this.elapsed = Date.now() - this.timestamp
      this.velocityWheelXAbs = Math.abs(this.velocityWheelX)
      this.velocityWheelYAbs = Math.abs(this.velocityWheelY)
  
      let delta = 0
      const cam = this.scene.cameras.main
      if (this.autoScrollX && this.amplitudeX !== 0) {
  
        delta = -this.amplitudeX * Math.exp(-this.elapsed / this.settings.timeConstantScroll)
        if (this.canCameraMoveX() && (delta > 0.5 || delta < -0.5)) {
          cam.setScroll(this.targetX - delta, cam.scrollY)
        } else {
          this.autoScrollX = false
          cam.setScroll(this.targetX, cam.scrollY)
        }
      }
  
      if (this.autoScrollY && this.amplitudeY !== 0) {
  
        delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll)
        if (this.canCameraMoveY() && (delta > 0.5 || delta < -0.5)) {
          cam.setScroll(cam.scrollX, this.targetY - delta)
        } else {
          this.autoScrollY = false
          cam.setScroll(cam.scrollX, this.targetY)
        }
      }
  
      if (!this.autoScrollX && !this.autoScrollY) {
        this.dragging = false
      }
  
      if (this.settings.horizontalWheel && this.velocityWheelXAbs > 0.1) {
        this.dragging = true
        this.amplitudeX = 0
        this.autoScrollX = false
        cam.setScroll(cam.scrollX - this.velocityWheelX, cam.scrollY)
        this.velocityWheelX *= 0.95
      }
  
      if (this.settings.verticalWheel && this.velocityWheelYAbs > 0.1) {
        this.dragging = true
        this.autoScrollY = false
        cam.setScroll(cam.scrollX, cam.scrollY - this.velocityWheelY)
        this.velocityWheelY *= 0.95
      }
    }
  
    withinGame () {
      return true
    }
  }
  