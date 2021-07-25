import FpsText from '../objects/fpsText'
import ScoreText from '../objects/scoreText'

import { detectFrame } from '../posenet/init'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'game' })

    this.birdSpeed = 125
    this.birdGravity = 100
    this.birdFlapPower = 100
    this.minPipeHeight = 100
    this.pipeDistance = [ 250, 380 ]
    this.pipeHole = [ 150, 200 ]

  }

  preload() {
    this.game.scene.current = 'game'

    this.sound.setVolume(this.registry.get('master-sound-volume'))
    this.sndPowUp1 = this.sound.add('powup1')
    this.sndPowUp2 = this.sound.add('powup2')
    this.sndPowUp3 = this.sound.add('powup3')
    this.sndHit = this.sound.add('hit')

    this.pipeGroup = this.physics.add.group()
    this.pipePool = []

    for(let i = 0; i < 6; ++i) {
      this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'))
      this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'))
      this.placePipes(false)
    }

    this.pipeGroup.setVelocityX(-this.birdSpeed)

    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNumbers('bird', { frames: [ 'bird-1', 'bird-2' ] }),
      frameRate: 8,
      repeat: -1
    })

    this.fpsText = new FpsText(this)
    this.scoreText = new ScoreText(this)
  }

  create() {
    this.bird = this.physics.add.sprite(80, this.cameras.main.height / 2, 'bird')
    this.bird.setGravityY(this.birdGravity)

    this.input.on('pointerdown', this.flap, this)

    this.score = 0
    this.registry.set('gameover', false)

    detectFrame(this.game.videoSrc, this.game)
  }

  placePipes(addScore) {
    let rightmost = this.getRightmostPipe()
    let pipeHoleHeight = Phaser.Math.Between(...this.pipeHole)
    let pipeHolePosition = Phaser.Math.Between(
      this.minPipeHeight + pipeHoleHeight / 2,
      this.cameras.main.height - this.minPipeHeight - pipeHoleHeight / 2
    )

    this.pipePool[0].x = rightmost + this.pipePool[0].getBounds().width + Phaser.Math.Between(...this.pipeDistance)
    this.pipePool[0].y = pipeHolePosition - pipeHoleHeight / 2
    this.pipePool[0].setOrigin(0, 1)

    this.pipePool[1].x = this.pipePool[0].x
    this.pipePool[1].y = pipeHolePosition + pipeHoleHeight / 2
    this.pipePool[1].setOrigin(0, 0)

    this.pipePool = []

    if(addScore) {
      this.score += 1
      this.sndPowUp1.play()
      // with every pipe passed > 5, the speed increases
      if(this.score > 5) {
        this.pipeGroup.setVelocityX(-this.birdSpeed - this.score * 5)
      }
    }
  }

  wingUp() {
    this.isWingUp = true
  }
  wingDown() {
    if(this.isWingUp) {
      this.flap()
      this.isWingUp = false
    }
  }

  flap() {
    this.bird.setVelocityY(-this.birdFlapPower)
    this.bird.play('flap')
    console.log('YO FLAP')
  }

  getRightmostPipe() {
    let rightmostPipe = 0
    this.pipeGroup.getChildren().forEach((pipe) => {
      rightmostPipe = Math.max(rightmostPipe, pipe.x)
    })

    return rightmostPipe
  }


  update() {
    this.physics.world.collide(this.bird, this.pipeGroup, this.die, null, this)

    if(this.bird.y > this.cameras.main.height || this.bird.y < 0) {
      this.die()
    }

    this.pipeGroup.getChildren().forEach((pipe) => {
      if(pipe.getBounds().right < 0) {
        this.pipePool.push(pipe)
        if(this.pipePool.length === 2) {
          this.placePipes(true)
        }
      }
    })

    this.fpsText.update()
    this.scoreText.update(this.score)
  }

  die() {
    this.sndHit.play()
    this.registry.set('gameover', true)
    this.scene.start('gameover')
  }
}
