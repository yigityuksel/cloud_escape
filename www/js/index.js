document.addEventListener('deviceready', function () {

  var config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.DOM.FIT,
      parent: 'phaser-example',
      width: 800,
      height: 630
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  var game = new Phaser.Game(config);
  var score;
  var scoreText;
  var highscore = localStorage.getItem("HS");
  var highScoreText;
  var gameOverText;
  var flag_jump;
  var flag_left;
  var nametext;

  function preload() {

    this.load.image('sky', 'assets/backg.jpg');
    this.load.image('ground', 'assets/plat.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('red', 'assets/particle.jpg');
    this.load.image('left-arrow', 'assets/left-arrow.png');
    this.load.image('right-arrow', 'assets/right-arrow.png');

    this.load.audio('pop', 'assets/pop.mp3', {
      instances: 1
    });

    this.load.audio('error', 'assets/error.mp3', {
      instances: 1
    });

    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  function create() {
    var this_ = this;
    score = 0;
    bg = this.add.image(400, 300, 'sky').setInteractive();

    bg.on('pointerdown', function (pointer1) {
      flag_jump = true;
    })
    bg.on('pointerup', function (pointer1) {
      flag_jump = false;
    })    
    bg.on('drag', function (pointer1, dragX, dragY) {
      flag_left = true;
    })

    this.sound.add('pop');
    this.sound.add('error');

    platforms = this.physics.add.staticGroup();

    platforms.create(450, 570, 'ground').setScale(1.6).refreshBody();

    platforms.create(0.1, 510, 'ground').setScale(0.7).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 210, 'ground');

    stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    player = this.physics.add.sprite(65, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //Create two bombs and two colliders
    bombs = this.physics.add.group();
    //One to bounce off platforms
    this.physics.add.collider(bombs, platforms);
    //And one to run hitBomb function if collide with player
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    //Create a bomb and add it to the world
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    //Random velocity
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 0.2, end: 0 },
      blendMode: 'ADD'
    });

    emitter.startFollow(bomb);

    nametext = this.add.text(650, 20, 'CLOUD', { fontSize: '32px', fill: '#00008b' });
    nametext = this.add.text(650, 40, '-escape-', { fontSize: '32px', fill: '#00008b' });
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    highScoreText = this.add.text(16, 50, 'High Score: ' + highscore, { fontSize: '32px', fill: '#000' });

    restart_txt = this.add.text(450, 50, 'Restart', { fontSize: '20px', fill: '#000' });
    restart_txt.setInteractive();

    if (!this.sys.game.device.input.touch) {
      this.cursors = this.input.keyboard.createCursorKeys();
    } else {
      buildMobileControls(this);
    }

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    restart_txt.on('pointerdown', function () {
      this_.scene.restart();
    });

  }

  function update() {
    stars.children.iterate(function (child) {
      if (child.body.touching.down) {
        child.setVelocityY(-100);
      };

    });

    if (this.cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (this.cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (this.cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-345);
    }

    if (!this.sys.game.device.input.touch) {
      if (this.cursors.space.isDown && player.body.touching.down)
      {
        this.scene.restart();
      }
    }


    if (flag_jump) {
      player.setVelocityY(-330);
    }

    if (flag_left) {
      player.setVelocityX(-330);
    }
  }

  function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    this.sound.play('pop');

    //If there are no more stars
    if (stars.countActive(true) === 0) {
      //Create more stars to fall
      stars.children.iterate(function (child) {

        child.enableBody(true, child.x, 0, true, true);

      });

      //Get a random x coordinate for the bomb
      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      //Create a bomb and add it to the world
      var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      //Random velocity
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);


      var particles = this.add.particles('red');

      var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 0.2, end: 0 },
        blendMode: 'ADD'
      });

      emitter.startFollow(bomb);

    }
  }

  function hitBomb(player, bomb) {

    var this_ = this;
    //Pause the physics
    this.physics.pause();
    this.sound.play('error');
    //Change colour of player
    player.setTint(0xff0000);
    //Make player face camera
    player.anims.play('turn');
    //Stop game
    if (highscore < score) {
      highscore = score;
      localStorage.setItem("HS", highscore)
      highScoreText.setText(' High Score: ' + highscore);
    }
    gameOverText = this.add.text(200, 270, 'GAME OVER', { fontSize: '64px', fill: '#f00' });
    restartText = this.add.text(220, 350, 'Click here to restart', { fontSize: '20px', fill: '#000' });
    gameOver = true;

    restartText.setInteractive();

    restartText.on('pointerdown', function () {
      this_.scene.restart();
      gameOver = false;
    });

  }

  function buildMobileControls(this_) {

    // Found this helps with multiple buttons being pressed at the same time on mobile
    this_.input.addPointer(2)

    // Only emitting events from the top-most Game Objects in the Display List.
    // Mainly useful if you have "background" button zones and you only want 
    // one to be triggered on a single tap.
    this_.input.topOnly = true

    // Create an object mimicking what the keyboard version would be.
    // We are going to modify this on touch events so we can check in our update() loop
    this_.cursors = {
      'up': {},
      'left': {},
      'right': {},
      'down': {},
      'space': {}
    }

    // keyboard listeners to be user for each key
    const pointerDown = key => {
      // modifies this.cursors with the property that we check in update() method
      if(key == "up"){
        flag_jump = true;
      }

      this_.cursors[key].isDown = true;

    }
    const pointerUp = key => {
      if(key == "up"){
        flag_jump = false;
      }
      this_.cursors[key].isDown = false
    }

    // button sizing
    const WIDTH = 100
    const HEIGHT = 100

    // gutter width between buttons
    const GUTTER = 20

    // Create a button helper
    const createBtn = (key, x, y, width = WIDTH, height = HEIGHT) => {
      // Add a faded out red rectangle for our button

        if(key == "left"){

        this_.add.image(x, y, 'left-arrow')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => pointerDown(key))
        .on('pointerup', () => pointerUp(key));

      }

      if(key == "right"){

        this_.add.image(x, y, 'right-arrow')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => pointerDown(key))
        .on('pointerup', () => pointerUp(key));

      }


    }

    // Y coordinate to place buttons
    const BTN_Y = window.innerHeight + WIDTH + GUTTER * 2

    // create player control buttons
    createBtn('left', GUTTER, BTN_Y)
    createBtn('right', window.innerWidth , BTN_Y)
    //createBtn('up', window.innerWidth - 2 * (WIDTH + GUTTER), BTN_Y)

  }

});

if (!window.cordova) {
  window.dispatchEvent('deviceready');
}