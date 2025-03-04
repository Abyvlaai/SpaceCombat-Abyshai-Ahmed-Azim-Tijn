class Level1 {
    constructor(canvas, ctx, shipImage) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.shipImage = shipImage;
        this.isActive = false;
        this.shipX = canvas.width / 2;
        this.shipY = canvas.height - 50;
        this.shipWidth = 40;
        this.shipHeight = 40;
        this.speed = 5;
        this.asteroids = [];
        this.asteroidSpeed = 3;
        this.asteroidSpawnRate = 30;
        this.frameCount = 0;
        this.lives = 3;
        this.hitCount = 0;
        this.messageTimer = 0;
        this.message = '';
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerActive = false;
    }

    bindKeys() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    start() {
        this.isActive = true;
        this.shipX = this.canvas.width / 2;
        this.shipY = this.canvas.height - 50;
        this.asteroids = [];
        this.frameCount = 0;
        this.lives = 3;
        this.hitCount = 0;
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.timerActive = true;

        this.setupKeyListeners();
        this.gameLoop();
    }

    spawnAsteroid() {
        if (Math.random() < 0.02) {
            const minY = 50;
            const maxY = this.canvas.height - this.safeZoneHeight - 30;
            this.asteroids.push({
                x: -30,
                y: Math.random() * (maxY - minY) + minY,
                width: 30,
                height: 30,
                speed: Math.random() * 1 + 1
            });
        }
    }

    update() {
        if (!this.isActive) return;

        // Ship movement
        if (this.keys['ArrowLeft']) this.shipX -= this.speed;
        if (this.keys['ArrowRight']) this.shipX += this.speed;
        if (this.keys['ArrowUp']) this.shipY -= this.speed;
        if (this.keys['ArrowDown']) this.shipY += this.speed;

        // Keep ship in bounds
        this.shipX = Math.max(0, Math.min(this.canvas.width - this.shipWidth, this.shipX));
        this.shipY = Math.max(0, Math.min(this.canvas.height - this.shipHeight, this.shipY));

        // Spawn and update asteroids
        this.spawnAsteroid();
        this.asteroids.forEach(asteroid => {
            asteroid.x += asteroid.speed;
        });
        this.asteroids = this.asteroids.filter(asteroid => asteroid.x < this.canvas.width);

        // Check collisions
        this.asteroids.forEach(asteroid => {
            if (this.checkCollision(this.ship, asteroid)) {
                soundManager.playExplosion();
                this.shipY = this.canvas.height - 50;
            }
        });

        // Check win condition
        if (this.shipY < 20) {
            this.isActive = false;
            this.timerActive = false;
            soundManager.playWin();
            showWinScreen(1, this.calculateScore());
        }
    }

    checkCollision(a, b) {
        // If ship is in safe zone at the bottom, ignore collisions
        if (a === this.ship && a.y >= this.canvas.height - this.safeZoneHeight) {
            return false;
        }

        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ship
        this.ctx.drawImage(this.shipImage, this.shipX - this.shipWidth / 2, this.shipY - this.shipHeight / 2, this.shipWidth, this.shipHeight);

        // Draw asteroids
        this.asteroids.forEach(asteroid => {
            this.ctx.fillStyle = '#888';
            this.ctx.beginPath();
            this.ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw finish line at top
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, 10);

        // Draw lives and score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Orbitron';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 30);
        this.ctx.fillText(`Score: ${this.calculateScore()}`, this.canvas.width - 150, 30);

        // Draw timer
        if (this.timerActive) {
            const currentTime = Date.now();
            this.elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
            this.ctx.fillText(`Time: ${this.elapsedTime}s`, this.canvas.width / 2 - 50, 30);
        }

        // Draw message if active
        if (this.messageTimer > 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '24px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.message, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        }
    }

    gameLoop() {
        if (!this.isActive) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}