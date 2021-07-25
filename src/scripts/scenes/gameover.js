
import { ImageButton } from '../objects/button'

export default class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: 'gameover' })
  }

  create() {
    this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background')
    this.bg.setOrigin(0, 0)

    this.soundBtnOver = this.sound.add('btnover')
    this.soundBtnClick = this.sound.add('btnclick')
    this.title = this.add.image(this.cameras.main.centerX, 100, 'gameover')
    this.title.setOrigin(.5)
    this.title.setScale(1.5)

    const restart = new ImageButton(this.cameras.main.centerX, 300, 'menu_buttons', this, {
      up: 'restart_up',
      down: 'restart_down',
      over: 'restart_over',
      out: 'restart_up'
    })
    restart.on('click', this.onRestartClick, this)
    restart.on('over', this.onButtonOver, this)
  }

  onRestartClick() {
    this.sfxPlay(this.soundBtnClick)
    this.time.addEvent({
      delay: 1000,
      callback() {
        // const gameScene = this.game.scene.get('game')
        // console.log(gameScene)
        // gameScene.restart()
        this.scene.start('game')
      },
      callbackScope: this,
      loop: -1
    })
  }

  onButtonOver() {
    this.sfxPlay(this.soundBtnOver)
  }

  sfxPlay(sfx) {
    if(this.registry.get('options-sound')) {
      sfx.play()
    }
  }

  update() {
    this.bg.tilePositionY += .5
  }
}
