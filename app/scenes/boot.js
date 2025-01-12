var CONST = require('data/const');

module.exports = {

  key: 'boot',

  preload: function () {
    // this.load.image('sky', 'space3.png');
    this.load.image('logo', 'phaser3-logo.png');
    this.load.on('progress', this.onLoadProgress, this);
    this.load.on('complete', this.onLoadComplete, this);
    this.createProgressBar();

    this.load.audio('music', [
      'audio/DOG.mp3'
    ]);

    this.load.audio('jump', [
      'audio/SoundEffects/key.wav'
    ]);
  
    this.load.audio('pickup', [
      'audio/SoundEffects/p-ping.mp3'
    ]);
    
    this.load.image('sky', 'sky.png');
    this.load.image('ground', 'platform.png');
    this.load.image('star', 'star.png');
    this.load.image('bomb', 'bomb.png');
    this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
    
    this.load.bitmapFont('atari-classic', 'fonts/bitmap/atari-classic.png', 'fonts/bitmap/atari-classic.xml');
  },

  create: function () {
    this.registry.set('score', 0);
    this.scene.start('menu');
  },

  extend: {

    progressBar: null,

    progressCompleteRect: null,

    progressRect: null,

    createProgressBar: function () {
      var Rectangle = Phaser.Geom.Rectangle;
      var main = Rectangle.Clone(this.cameras.main);

      this.progressRect = new Rectangle(0, 0, 0.5 * main.width, 50);
      Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);

      this.progressCompleteRect = Rectangle.Clone(this.progressRect);

      this.progressBar = this.add.graphics();
    },

    onLoadComplete: function (loader, totalComplete, totalFailed) {
      console.debug('complete', totalComplete);
      console.debug('failed', totalFailed);

      this.progressBar.destroy();
    },

    onLoadProgress: function (progress) {
      console.debug('progress', progress);

      this.progressRect.width = progress * this.progressCompleteRect.width;
      
      this.progressBar
        .clear()
        .fillStyle(CONST.hexColors.darkGray)
        .fillRectShape(this.progressCompleteRect)
        .fillStyle(this.load.totalFailed ? CONST.hexColors.red : CONST.hexColors.white)
        .fillRectShape(this.progressRect);
    }

  }

};
