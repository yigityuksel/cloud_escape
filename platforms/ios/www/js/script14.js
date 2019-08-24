document.addEventListener('deviceready', function() {

    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 630,
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

    function preload ()
    {

      this.load.image('sky', 'assets/backg.jpg');
      this.load.image('ground', 'assets/plat.png');
      this.load.image('star', 'assets/star.png');
      this.load.image('bomb', 'assets/bomb.png');
      this.load.image('red', 'assets/particle.jpg');

      this.load.spritesheet('dude',
          'assets/dude.png',
          { frameWidth: 32, frameHeight: 48 }
      );
    }

    function create ()
    {
      window.addEventListener('resize', resize);
      resize();

      score = 0;
      bg = this.add.image(400, 300, 'sky').setInteractive();
      
      bg.on('pointerdown',function(pointer1){
        flag_jump = true;
      })
      
      bg.on('pointerup',function(pointer1){
        flag_jump = false;
      })
      
      bg.on('drag',function(pointer1, dragX, dragY){
        flag_left = true;
      })

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

      nametext = this.add.text(650, 20, 'CLOUD' , { fontSize: '32px', fill: '#00008b' });
      nametext = this.add.text(650, 40, '-escape-' , { fontSize: '32px', fill: '#00008b' });
      scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
      highScoreText = this.add.text(16, 50, 'High Score: ' + highscore, { fontSize: '32px', fill: '#000' } );

      //if(this.sys.game.device.input.touch){

      if (!this.sys.game.device.input.touch) {
        this.cursors = this.input.keyboard.createCursorKeys()
      } else {
        this.buildMobileControls()
      }

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


    }

    function update ()
    {
      stars.children.iterate(function (child) {
        if(child.body.touching.down){
          child.setVelocityY(-100);
        };

      });
     
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
          player.setVelocityY(-345);
      }
      if (cursors.space.isDown && player.body.touching.down)
      {
        this.scene.restart();
      }

      if (flag_jump){
        player.setVelocityY(-330);
      }

      if (flag_left){
        player.setVelocityX(-330);
      }
    }

    function collectStar (player, star)
    {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText('Score: ' + score);

        //If there are no more stars
        if (stars.countActive(true) === 0)
        {
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

    function hitBomb (player, bomb)
    {

        //Pause the physics
        this.physics.pause();
        //Change colour of player
        player.setTint(0xff0000);
        //Make player face camera
        player.anims.play('turn');
        //Stop game
        if (highscore < score){
          highscore = score;
          localStorage.setItem("HS", highscore)
          highScoreText.setText(' High Score: ' + highscore);
        }
        gameOverText = this.add.text(200, 270, 'GAME OVER', { fontSize: '64px', fill: '#f00' } );
        restartText = this.add.text(220, 325, '-press space to restart-', { fontSize: '20px', fill: '#000' } );
        gameOver = true;

    }

    function buildMobileControls(){

        // Found this helps with multiple buttons being pressed at the same time on mobile
        this.input.addPointer(2)

        // Only emitting events from the top-most Game Objects in the Display List.
        // Mainly useful if you have "background" button zones and you only want 
        // one to be triggered on a single tap.
        this.input.topOnly = true

        // Create an object mimicking what the keyboard version would be.
        // We are going to modify this on touch events so we can check in our update() loop
        this.cursors = {
          'up': {},
          'left': {},
          'right': {},
          'down': {},
        }

        // keyboard listeners to be user for each key
        const pointerDown = key => {
          // modifies this.cursors with the property that we check in update() method
          this.cursors[key].isDown = true
        }
        const pointerUp = key => {
          this.cursors[key].isDown = false
        }

        // button sizing
        const WIDTH = 167
        const HEIGHT = 153

        // gutter width between buttons
        const GUTTER = 12


        // Create a button helper
        const createBtn = (key, x, y, width=WIDTH, height=HEIGHT) => {
          // Add a faded out red rectangle for our button
          this.add.rectangle(x, y, width, height, 0xff0000, 0.07)
            .setOrigin(0,0)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => pointerDown(key))
            .on('pointerup', () => pointerUp(key))
        }

        // Y coordinate to place buttons
        const BTN_Y = GAME_HEIGHT - HEIGHT - GUTTER

        // create player control buttons
        createBtn('left', GUTTER, BTN_Y)
        createBtn('right', WIDTH + 2*GUTTER, BTN_Y)
        createBtn('up', GAME_WIDTH - 2*(WIDTH + GUTTER), BTN_Y)
        createBtn('down', GAME_WIDTH - WIDTH - GUTTER, BTN_Y)
      
    }

    function resize() {
        var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
        var wratio = width / height, ratio = canvas.width / canvas.height;

        if (wratio < ratio) {
            canvas.style.width = width + "px";
            canvas.style.height = (width / ratio) + "px";
        } else {
            canvas.style.width = (height * ratio) + "px";
            canvas.style.height = height + "px";
        }
    }  

});

if (!window.cordova) {
    window.dispatchEvent('deviceready');
}