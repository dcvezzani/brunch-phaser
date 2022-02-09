var CONST = require('data/const');

var player;
var stars;
var bombs;
var platforms;
var cursors;
var gameOver = false;
var scoreText;

module.exports = {

  key: 'default',

  init: function (data) {
    console.debug('init', this.scene.key, data, this);
    
    this.events.once('shutdown', this.shutdown, this);
    
    this.score = 0;
  },

  xcreate: function () {
    this.add.image(400, 300, 'sky');

    // var logo = this.physics.add.image(400, 100, 'logo');
    // logo.setVelocity(100, 200);
    // logo.setBounce(1, 1);
    // logo.setCollideWorldBounds(true);
    
    // Add 
    this.music = this.sound.add('music');
    this.jump = this.sound.add('jump');
    this.pickup = this.sound.add('pickup');
    
    this.music.play({
        loop: true
    });
    
    this.add.text(10, 580, '(Q) Quit (R) Restart', {
      fill: CONST.colors.yellow,
      fontFamily: CONST.fonts.default,
      fontSize: 16
    });

    this.input.keyboard.once('keydown_Q', this.quit, this);
    this.input.keyboard.once('keydown_R', this.restart, this);
  },

  create: function () {
    this.add.image(400, 300, 'sky');

    // var logo = this.physics.add.image(400, 100, 'logo');
    // logo.setVelocity(100, 200);
    // logo.setBounce(1, 1);
    // logo.setCollideWorldBounds(true);
    
    // Add 
    this.music = this.sound.add('music');
    this.jump = this.sound.add('jump');
    this.pickup = this.sound.add('pickup');

    this.music.play({
        loop: true
    });
    
    this.playerJump = playerJump.bind(this);
    this.clearText = clearText.bind(this);
    this.setTextValue = setTextValue.bind(this);
    this.createBomb = createBomb.bind(this);
    
    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keydown_B', () => this.createBomb());

  
  //   this.keyboard = {
  //     b: this.input.keyboard.addKey('b'),
  //   }
  //   console.log(">>>this.keyboard.b", this.keyboard.b) //.on('down', event => {});

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.text = this.add.bitmapText(400, 100, 'atari-classic', '', 30)
        .setOrigin(0.5);

    if(this.sound.locked)
    {
        this.setTextValue('xxx');
        this.setTextValue('Tap to unlock\nand play music');

        this.sound.once('unlocked', function (soundManager)
        {
            this.clearText()
            // setupSceneInput.call(this, this.text, dog);

        }, this);
    }
    
    this.add.text(10, 580, '(Q) Quit (R) Restart', {
      fill: CONST.colors.yellow,
      fontFamily: CONST.fonts.default,
      fontSize: 16
    });

    this.input.keyboard.once('keydown_Q', this.quit, this);
    this.input.keyboard.once('keydown_R', this.restart, this);
  },

  xupdate: function () {
    this.score += 1;

  },

  update: function () {
    if (gameOver)
    {
        this.music.stop();
        setTimeout(() => {
            gameOver = false;
            this.quit();
        }, 2000)

        // setTimeout(() => {
        //     this.registry.destroy(); // destroy registry
        //     this.events.off(); // disable all active events
        //     this.scene.restart(); // restart current scene
        // }, 3000)
        
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        this.playerJump();
    }
  },

  extend: {

    score: 0,

    quit: function () {
      this.scene.start('menu');
    },

    restart: function () {
      this.music.stop();
      this.scene.restart();
    },

    shutdown: function () {
      this.music.stop();
      this.registry.set('score', this.score);
    }

  }

};

function playerJump ()
{
    this.clearText()
    player.setVelocityY(-330);
    this.jump.play();
}

function clearText ()
{
    if ((this.text.getData('text') || '').length > 0) {
        this.setTextValue('')
    }
}

function setTextValue (value)
{
    this.text.setData({text: value});
    this.text.setText(value)
}

function collectStar (player, star)
{
    star.disableBody(true, true);
    this.pickup.play();

    //  Add and update the score
    this.score += 10;
    scoreText.setText('Score: ' + this.score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        this.createBomb()
    }
}

function createBomb ()
{
    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

