class Level2 {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.ship = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 40,
            height: 30,
            speed: 5
        };
        this.bullets = [];
        this.aliens = [];
        this.isActive = false;
        this.keys = {};
        
        this.bindKeys();
        this.setupAliens();
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
        this.bullets = [];
        this.aliens = [];
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

        // Check collisions
        this.bullets.forEach(bullet => {
            this.aliens = this.aliens.filter(alien => {
                if (this.checkCollision(bullet, alien)) {
                    soundManager.playExplosion();
                    return false;
                }
                return true;
            });
        });

        // Check win condition
        if (this.aliens.length === 0) {
            soundManager.playWin();
            this.isActive = false;
            showMenu();
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

        // Draw ship
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.ship.x, this.ship.y, this.ship.width, this.ship.height);

        // Draw bullets
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw aliens
        this.ctx.fillStyle = '#ff0000';
        this.aliens.forEach(alien => {
            this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        });
    }

    gameLoop() {
        if (!this.isActive) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}
