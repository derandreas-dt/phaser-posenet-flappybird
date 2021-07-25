export default class ScoreText extends Phaser.GameObjects.Text {
  constructor(scene) {
    super(scene, scene.cameras.main.width - 100, 10, '', { color: 'white', fontSize: '16px' })
    scene.add.existing(this)
    this.setOrigin(1, 0)
  }

  update(score=0) {
    this.setText(`Score: ${score}`)
  }
}
