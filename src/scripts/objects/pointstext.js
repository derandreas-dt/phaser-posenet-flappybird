class PointsText extends Phaser.GameObjects.Text {
  constructor(scene, x, y) {
    super(scene, x, y, '', { color: 'white', fontSize: '16px' })
    scene.add.existing(this)
    this.setOrigin(0)
  }

  update() {
    this.setText(`Points: ${Math.floor(this.scene.registry.get('player-points'))}`)
  }
}

export {
  PointsText
}
