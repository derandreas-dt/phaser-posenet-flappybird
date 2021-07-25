
const setup = async (video, width, height) => {
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('No Media Devices detected')
  }

  video.width = width
  video.height = height

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'environment',
      width: width,
      height: height
    }
  })

  video.srcObject = stream

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video)
    }
  })
}

const loadVideo = async (videoElement, width, height) => {
  const video = await setup(videoElement, width, height)

  return video
}

export {
  loadVideo
}
