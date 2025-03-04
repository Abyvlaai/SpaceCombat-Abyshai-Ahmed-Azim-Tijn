class Level2 {
    constructor(canvas, context, shipImage, alienImage) {
        this.canvas = canvas;
        this.ctx = context;
        this.shipImage = shipImage;
        this.alienImage = alienImage;
        this.ship = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 40,
            height: 30,
            speed: 5
        };
        this.bullets = [];
        this.aliens = [];
        this.lives = 3;
        this.isActive = false;
        this.keys = {};
        this.score = 0;
        this.aliensDestroyed = 0;
        this._showMessage = false; // Flag for showing messages
        this._messageText = '';   // Text for the message
        this._messageTimeout = null; // Timeout for message

        this.bindKeys();
    }

    bindKeys() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.code === 'Space' && this.isActive) {
                this.shoot();
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    setupAliens() {
        this.aliens = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 8; j++) {
                this.aliens.push({
                    x: j * 60 + 100,
                    y: i * 60 + 50,
                    width: 40,
                    height: 40,
                    direction: 1
                });
            }
        }
    }

    start() {
        this.isActive = true;
        this.lives = 3;
        this.bullets = [];
        this.score = 0;
        this.aliensDestroyed = 0;
        this.setupAliens();
        this.gameLoop();
    }

    calculateScore() {
        const score = (this.aliensDestroyed * 100) + (this.lives * 500);
        return Math.min(score, 999999); // Cap score at 999,999
    }

    shoot() {
        soundManager.playShoot();
        this.bullets.push({
            x: this.ship.x + this.ship.width/2 - 2,
            y: this.ship.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }

    update() {
        if (!this.isActive) return;
        
        // Check if max score reached
        const currentScore = this.calculateScore();
        if (currentScore >= 999999) {
            this.score = 999999;
            this.isActive = false;
            this.showMaxScoreScreen();
            return;
        }

        // Ship movement
        if (this.keys['ArrowLeft']) this.ship.x -= this.ship.speed;
        if (this.keys['ArrowRight']) this.ship.x += this.ship.speed;

        // Keep ship in bounds
        this.ship.x = Math.max(0, Math.min(this.canvas.width - this.ship.width, this.ship.x));

        // Update bullets
        this.bullets.forEach(bullet => bullet.y -= bullet.speed);
        this.bullets = this.bullets.filter(bullet => bullet.y > 0);

        // Update aliens
        let needsDirectionChange = false;
        this.aliens.forEach(alien => {
            alien.x += alien.direction * 2;
            if (alien.x <= 0 || alien.x >= this.canvas.width - alien.width) {
                needsDirectionChange = true;
            }
        });

        if (needsDirectionChange) {
            this.aliens.forEach(alien => {
                alien.direction *= -1;
                alien.y += 20;
            });
        }

        // Check bullet-alien collisions
        this.bullets.forEach(bullet => {
            this.aliens = this.aliens.filter(alien => {
                if (this.checkCollision(bullet, alien)) {
                    soundManager.playExplosion();
                    this.aliensDestroyed++;
                    this.score = this.calculateScore();
                    return false;
                }
                return true;
            });
        });

        // Check ship-alien collisions
        for (let alien of this.aliens) {
            if (this.checkCollision(this.ship, alien)) {
                this.lives--;
                if (this.lives <= 0) {
                    this.isActive = false;
                    this.showLoseScreen();
                    return;
                } else {
                    // Reset aliens when player still has lives
                    soundManager.playExplosion();
                    this.setupAliens();
                    this.ship.x = this.canvas.width / 2;
                    this.showMessage(`Hit! ${this.lives} lives remaining`); // Show message
                    return;
                }
            }
        }

        // Check win condition - if all aliens destroyed
        if (this.aliens.length === 0) {
            // Reset aliens and continue if player still has lives
            if (this.lives > 0) {
                this.setupAliens();
                this.showMessage("Level cleared! Next wave incoming!");
                // Increase difficulty slightly with each wave
                this.aliensDestroyed += 8; // Bonus for clearing a wave
                this.score = this.calculateScore();
                
                // Check if max score reached after adding bonus
                if (this.score >= 999999) {
                    this.score = 999999;
                    this.isActive = false;
                    this.showMaxScoreScreen();
                }
            } else {
                soundManager.playWin();
                this.isActive = false;
                showWinScreen(2, this.calculateScore());
            }
        }
    }
    
    showMaxScoreScreen() {
        soundManager.playWin();
        
        // Create a special max score message
        const maxScoreMessage = "MAXIMUM SCORE REACHED! You've achieved legendary status with 999,999 points!";
        
        // Use the existing win screen with our custom message
        document.getElementById('win-message').textContent = maxScoreMessage;
        document.getElementById('score-message').textContent = "Your Score: 999,999";
        document.getElementById('score-submit').classList.remove('d-none');
        document.getElementById('win-screen').classList.remove('d-none');
        document.getElementById('gameCanvas').classList.add('d-none');
        
        // Stop game music and play menu music
        soundManager.stopBackgroundMusic();
        soundManager.playBackgroundMusic('menu');
    }
    
    showLoseScreen() {
        // Play a defeat sound if available, otherwise use explosion
        soundManager.playExplosion();
        
        // Display the final score
        document.getElementById('lose-score-message').textContent = `Final Score: ${this.calculateScore()}`;
        
        // Show the lose screen and hide the game canvas
        document.getElementById('lose-screen').classList.remove('d-none');
        document.getElementById('gameCanvas').classList.add('d-none');
        
        // Stop game music and play menu music
        soundManager.stopBackgroundMusic();
        soundManager.playBackgroundMusic('menu');
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    showMessage(message) {
        this._showMessage = true;
        this._messageText = message;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw lives counter and score
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Orbitron';
        this.ctx.fillText(`Lives: ${this.lives}`, 20, 30);
        this.ctx.fillText(`Score: ${this.score}`, 20, 60);
        this.ctx.fillText(`Aliens Destroyed: ${this.aliensDestroyed}`, 20, 90);

        // Draw ship using image
        this.ctx.drawImage(this.shipImage, this.ship.x, this.ship.y, this.ship.width, this.ship.height);

        // Draw bullets
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw aliens using alien image
        this.aliens.forEach(alien => {
            this.ctx.drawImage(this.alienImage, alien.x, alien.y, alien.width, alien.height);
        });

        // Draw level message if needed
        if (this._showMessage) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.canvas.width/2 - 150, this.canvas.height/2 - 40, 300, 80);

            this.ctx.fillStyle = '#ff0';
            this.ctx.font = '24px VT323, monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this._messageText, this.canvas.width/2, this.canvas.height/2);
            this.ctx.textAlign = 'left';

            // Reset message after a delay
            if (!this._messageTimeout) {
                this._messageTimeout = setTimeout(() => {
                    this._showMessage = false;
                    this._messageTimeout = null;
                }, 1500);
            }
        }
    }

    gameLoop() {
        if (!this.isActive) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}