import * as posenet from '@tensorflow-models/posenet'
import '@tensorflow/tfjs-backend-webgl'
import { DepthwiseConv2dNativeBackpropFilter } from '@tensorflow/tfjs-core'

const wristsNames = ['leftWrist', 'rightWrist']
const shoulderNames = ['leftShoulder', 'rightShoulder']
let line = new Phaser.Geom.Line(1, 1, 2, 2)
let circle = new Phaser.Geom.Circle(1, 1, 1)
let graphics = false
let skGraphics = false
let shGraphics = false
let ptGraphics = false
let lines = []

const start = async (game) => {
  net = await posenet.load()
  try {
    video = await loadVideo(videoElement, videoWidth, videoHeight)
  } catch (error) {
    console.error(error)
  }

  const ctx = output.getContext('2d')
  output.width = videoWidth
  output.height = videoHeight
  detectFrame(video, net, ctx, game)
}

const setup = async () => {
  await posenet.load()
}

const detectFrame = async (videoSrc, game, net, ctx) => {
  if(!net) {
    net = await posenet.load()
  }

  if(game.registry.get('gameover')) {
    skGraphics = false
    shGraphics = false
    ptGraphics = false
    return
  }

  const gameWidth = getGameScene(game).cameras.main.width
  const gameHeight = getGameScene(game).cameras.main.height

  if(!ctx) {
    const canvas = document.querySelector('#output')
    canvas.width = gameWidth
    canvas.height = gameHeight
    ctx = canvas.getContext('2d')
  }

  const minPoseConfidence = 0.5
  const minPartConfidence = 0.5
  const imageScaleFactor = 1
  const outputStride = 16
  const flipPoseHorizontal = true
  const pose = await net.estimateSinglePose(
    videoSrc,
    imageScaleFactor,
    flipPoseHorizontal,
    outputStride
  )

  if(ctx && game.registry.get('showVideo')) {
    drawOutput(ctx, videoSrc, gameWidth, gameHeight)
  }

  const score = pose.score
  const keypoints = pose.keypoints

  if(score >= minPoseConfidence) {
    if(game.registry.get('draw-keypoints') && ctx) {
      drawKeypoints(keypoints, minPartConfidence, game)
    }
    if(true || game.registry.get('draw-skeleton')) {
      drawSkeleton(keypoints, minPartConfidence, game)
    }

    if(Array.isArray(keypoints)) {
      const wrists = getWrists(keypoints)
      const shoulders = getShoulders(keypoints)

      drawShoulderLine(shoulders[0], shoulders[1], game)

      if(isAbove(wrists[0], shoulders) && isAbove(wrists[1], shoulders)) {
        gameAction(game, 'up')
      } else if(isBelow(wrists[0], shoulders) && isBelow(wrists[1], shoulders)) {
        gameAction(game, 'down')
      }
    }
  }
  requestAnimationFrame(() => detectFrame(videoSrc, game, net, ctx))
}

const isAbove = (wrist, shoulders) => {
  let wy = wrist.position.y
  let s0y = shoulders[0].position.y
  let s1y = shoulders[1].position.y

  return wy < s0y && wy < s1y
}

const isBelow = (wrist, shoulders) => {
  let wy = wrist.position.y
  let s0y = shoulders[0].position.y
  let s1y = shoulders[1].position.y

  return wy > s0y && wy > s1y
}

const drawOutput = (ctx, video, width = 640, height = 480) => {
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.scale(1, 1)
  ctx.translate(0, 0)
  ctx.drawImage(video, 0, 0, width, height)
  ctx.restore()
}



const getWrists = (items) => {
  const wrists = items.filter(item => wristsNames.includes(item.part))

  if(wrists.length !== 2) {
    return []
  }

  return wrists[0].part === 'leftWrist' ? [wrists[0], wrists[1]] : [wrists[1], wrists[0]]
}

const getShoulders = (items) => {
  const shoulders = items.filter(item => shoulderNames.includes(item.part))

  if(shoulders.length !== 2) {
    return []
  }

  return shoulders[0].part === 'leftShoulder' ? [shoulders[0], shoulders[1]] : [shoulders[1], shoulders[0]]
}

const gameAction = (game, dir) => {
  const scene = getGameScene(game)
  if(scene) {
    if(dir === 'up') {
      scene.wingUp()
    } else if(dir === 'down') {
      scene.wingDown()
    } else {
      scene.moveStraight()
    }
  }
}

const getGameScene = (game) => {
  if(game.scene.isActive(game.scene.current)) {
    return game.scene.getScene(game.scene.current)
  }

  return false
}




const drawKeypoints = (keypoints, minConfi, ctx, scale = 1) => {
  for(let i = 0, len = keypoints.length; i < len; ++i) {
    let keypoint = keypoints[i]

    if(keypoint.score < minConfi) {
      continue
    }

    let { y, x } = keypoint.position
    drawPoint(ctx, y * scale, x * scale, 5, 'red')
  }
}

const drawSkeleton = (keypoints, minConfi, ctx, scale = 1) => {
  const adjKeypoints = posenet.getAdjacentKeyPoints(keypoints, minConfi)
  lines.forEach(line => line.destroy())
  lines = []
  if(!skGraphics) {
    skGraphics = getGameScene(ctx).add.graphics({ lineStyle: { width: 4, color: 0xff00ff } });
  }
  skGraphics.clear()
  adjKeypoints.forEach(keypoint => {
    drawLine(
      skGraphics,
      toTuple(keypoint[0].position),
      toTuple(keypoint[1].position),
      ctx,
      'green',
      scale
    )
  })
}

const drawShoulderLine = (left, right, ctx, scale = 1) => {
  return
  if(!shGraphics) {
    shGraphics = getGameScene(ctx).add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });
  }
  drawLine(shGraphics, toTuple(left.position), toTuple(right.position), ctx, 'aqua', scale)
}

const toTuple = ({y, x}) => {
  return [y, x]
}

const drawPoint = (ctx, y, x, r, color) => {

  if(ctx.scene) {
    // seems like phaser
    if(!ptGraphics) {

      ptGraphics = getGameScene(ctx).add.graphics({ fillStyle: { alpha: 1, color: 0xaa00aa } });
    }
    circle.setTo(x, y, r)
    // console.log(Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(ax, ay, bx, by)))
    ptGraphics.clear()
    ptGraphics.fillCircleShape(circle);
  } else {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
  }
}

const drawLine = (graphics, [ay, ax], [by, bx], ctx, color, scale) => {
  if(ctx.scene) {
    // seems like phaser
    // console.log(Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(ax, ay, bx, by)))
    line.setTo(ax, ay, bx, by)
    graphics.defaultStrokeColor = 0xff0000
    graphics.defaultStrokeWidth = 4
    graphics.strokeLineShape(line)
  } else {
    ctx.beginPath()
    ctx.moveTo(ax * scale, ay * scale)
    ctx.lineTo(bx * scale, by * scale)
    ctx.lineWidth = 5
    ctx.strokeStyle = color
    ctx.stroke()
  }
}



export {
  setup,
  detectFrame
}
