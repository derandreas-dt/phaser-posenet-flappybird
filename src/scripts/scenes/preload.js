import { loadVideo } from '../webcam/init'
import { setup } from '../posenet/init'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'preload'
    })
  }

  preload() {
    this.loadAssets(this.cache.json.get('assets'));
    this.createProgressbar(this.centerX(), this.centerY() + 200);
  }

  centerX() {
    return this.sys.game.config.width / 2;
  }
  centerY() {
    return this.sys.game.config.height / 2;
  }

  createProgressbar(x, y) {
    // size & position
    let width = 400;
    let height = 20;
    let xStart = x - width / 2;
    let yStart = y - height / 2;

    // border size
    let borderOffset = 2;

    let borderRect = new Phaser.Geom.Rectangle(
      xStart - borderOffset,
      yStart - borderOffset,
      width + borderOffset * 2,
      height + borderOffset * 2);

    let border = this.add.graphics({
      lineStyle: {
        width: 5,
        color: 0xaaaaaa
      }
    });
    border.strokeRectShape(borderRect);

    let progressbar = this.add.graphics();

    /**
     * Updates the progress bar.
     *
     * @param {number} percentage
     */
    let updateProgressbar = function (percentage) {
      progressbar.clear();
      progressbar.fillStyle(0xffffff, 1);
      progressbar.fillRect(xStart, yStart, percentage * width, height);
    };

    this.load.on('progress', updateProgressbar);

    this.load.once('complete', async() => {
      const videoElement = document.querySelector('video')

      this.game.videoSrc = await loadVideo(videoElement, this.cameras.main.width, this.cameras.main.height)
      await setup(this.game.videoSrc)

      this.load.off('progress', updateProgressbar);
      this.scene.start('menu');
      // this.scene.start('game');

    }, this);
  }


  loadAssets(json) {
    Object.keys(json).forEach(function (group) {
      Object.keys(json[group]).forEach(function (key) {
        let value = json[group][key];

        if (group === 'atlas' ||
          group === 'unityAtlas' ||
          group === 'bitmapFont' ||
          group === 'spritesheet' ||
          group === 'multiatlas') {

          // atlas:ƒ       (key, textureURL,  atlasURL,  textureXhrSettings, atlasXhrSettings)
          // unityAtlas:ƒ  (key, textureURL,  atlasURL,  textureXhrSettings, atlasXhrSettings)
          // bitmapFont ƒ  (key, textureURL,  xmlURL,    textureXhrSettings, xmlXhrSettings)
          // spritesheet:ƒ (key, url,         config,    xhrSettings)
          // multiatlas:ƒ  (key, textureURLs, atlasURLs, textureXhrSettings, atlasXhrSettings)
          this.load[group](key, value[0], value[1]);

        } else if (group === 'audio') {

          // do not add mp3 unless, you bought a license ;)
          // opus, webm and ogg are way better than mp3
          if (value.hasOwnProperty('opus') && this.sys.game.device.audio.opus) {
            this.load[group](key, value['opus']);

          } else if (value.hasOwnProperty('webm') && this.sys.game.device.audio.webm) {
            this.load[group](key, value['webm']);

          } else if (value.hasOwnProperty('ogg') && this.sys.game.device.audio.ogg) {
            this.load[group](key, value['ogg']);

          } else if (value.hasOwnProperty('wav') && this.sys.game.device.audio.wav) {
            this.load[group](key, value['wav']);
          }
        } else if (group === 'html') {
          // html:ƒ (key, url, width, height, xhrSettings)
          this.load[group](key, value[0], value[1], value[2]);
        } else {
          // animation:ƒ (key, url, xhrSettings)
          // binary:ƒ (key, url, xhrSettings)
          // glsl:ƒ (key, url, xhrSettings)
          // image:ƒ (key, url, xhrSettings)
          // image:ƒ (key, [url, normal-url], xhrSettings)
          // json:ƒ (key, url, xhrSettings)
          // plugin:ƒ (key, url, xhrSettings)
          // script:ƒ (key, url, xhrSettings)
          // svg:ƒ (key, url, xhrSettings)
          // text:ƒ (key, url, xhrSettings)
          // tilemapCSV:ƒ (key, url, xhrSettings)
          // tilemapTiledJSON:ƒ (key, url, xhrSettings)
          // tilemapWeltmeister:ƒ (key, url, xhrSettings)
          // xml:ƒ (key, url, xhrSettings)
          this.load[group](key, value);
        }
      }, this);
    }, this);
  }

}
