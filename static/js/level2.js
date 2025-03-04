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
        this.setupAliens();
        this.gameLoop();
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
                    return false;
                }
                return true;
            });
        });

        // Check ship-alien collisions
        for (let alien of this.aliens) {
            if (this.checkCollision(this.ship, alien)) {
                soundManager.playExplosion();
                this.lives--;
                if (this.lives <= 0) {
                    this.isActive = false;
                    showMenu();
                    return;
                }
                this.setupAliens();
                break;
            }
        }

        // Check win condition
        if (this.aliens.length === 0) {
            soundManager.playWin();
            this.isActive = false;
            showWinScreen(2);
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw lives counter
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Orbitron';
        this.ctx.fillText(`Lives: ${this.lives}`, 20, 30);

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
    }

    gameLoop() {
        if (!this.isActive) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}