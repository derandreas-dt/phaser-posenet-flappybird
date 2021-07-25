import {
  ImageButton
} from '../objects/button'
export default class HowtoScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'howto'
    })

  }

  create() {
    const centerX = this.cameras.main.centerX

    this.sound.setVolume(this.registry.get('master-sound-volume'))
    this.soundBtnOver = this.sound.add('btnover')
    this.soundBtnClick = this.sound.add('btnclick')

    this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background')
    this.bg.setOrigin(0, 0)

    const howto = this.add.image(centerX, 50, 'howto')
    howto.setOrigin(0.5, 0)

    const goback = new ImageButton(centerX, 500, 'menu_buttons', this, {
      up: 'goback_up',
      down: 'goback_down',
      over: 'goback_over',
      out: 'goback_up'
    })
    goback.on('click', this.onGoBack, this)
    goback.on('over', this.onButtonOver, this)

  }
  sfxPlay(sfx) {
    if(this.registry.get('options-sound')) {
      sfx.play()
    }
  }

  onMusicChanged(btn, value) {
    this.registry.set('options-music', value)
    this.sfxPlay(this.soundBtnClick)
  }
  onSoundChanged(btn, value) {
    this.registry.set('options-sound', value)
    this.sfxPlay(this.soundBtnClick)
  }

  onButtonOver() {
    this.sfxPlay(this.soundBtnOver)
  }

  onGoBack() {
    this.sfxPlay(this.soundBtnClick)
    this.scene.start('menu')
  }

  update() {
    this.bg.tilePositionY -= .5
  }
}
