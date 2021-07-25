import 'phaser'

class ImageButton extends Phaser.GameObjects.Image {

  constructor(x, y, key, scene, frames) {

    if(!frames) {
      frames = {
         up: 0,
         down: 2,
         over: 1,
         out: 0
      }
    }

    super(scene, x, y, key, frames.up)

    this._frames = frames

    this.setInteractive({ useHandCursor: true });

    this.on('pointerup', () => {
      this.setFrame(this._frames.up);
      this.emit('click', this)
    }, this)

    this.on('pointerdown', () => {
      this.setFrame(this._frames.down)
    }, this);

    this.on('pointerover', () => {
      this.setFrame(this._frames.over);
      this.emit('over')
    }, this);

    this.on('pointerout', () => {
      this.setFrame(this._frames.out);
    }, this);

    scene.add.existing(this);
  }
}

class ToggleButton extends Phaser.GameObjects.Image {

  constructor(x, y, key, scene, frames, initialValue) {
    if(!frames) {
      frames = {
        on: 0,
        off: 1
      }
    }

    super(scene, x, y, key, frames.on)

    if(initialValue === undefined) {
      this.value = false
    } else {
      this.value = initialValue
    }
    this._frames = frames
    this.setValueFrame()

    this.setInteractive({ useHandCursor: true });

    this.on('pointerup', () => {
      this.value = !this.value
      this.setValueFrame()
      this.emit('changed', this, this.value )
    }, this)

    this.on('pointerover', () => {
      this.emit('over')
      this.setTint(0x0000ff)
    }, this)

    this.on('pointerout', () => {
      this.clearTint()
    }, this)

    scene.add.existing(this);
  }

  setValueFrame() {
    this.setFrame(this.value ? this._frames.on : this._frames.off)
  }

}

export {
  ImageButton,
  ToggleButton
}
