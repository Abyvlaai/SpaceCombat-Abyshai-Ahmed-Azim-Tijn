class Level1 {
    constructor(canvas, context, shipImage) {
        this.canvas = canvas;
        this.ctx = context;
        this.shipImage = shipImage;
        this.ship = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 30,
            height: 30,
            speed: 3
        };
        this.asteroids = [];
        this.isActive = false;
        this.keys = {};
        this.safeZoneHeight = 100;
        this.startTime = 0;
        this.hits = 0;
        this.lives = 3;
        this.score = 0;
        this.topReached = false;

        this.bindKeys();
    }

    bindKeys() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    start() {
        this.isActive = true;
        this.ship.y = this.canvas.height - 50;
        this.asteroids = [];
        this.startTime = Date.now();
        this.hits = 0;
        this.lives = 3;
        this.score = 0;
        this.topReached = false;
        this.gameLoop();
    }

    calculateScore() {
        const timeBonus = Math.max(0, 10000 - (Date.now() - this.startTime));
        const hitPenalty = this.hits * 500;
        let totalScore = Math.max(0, timeBonus - hitPenalty) + this.score;
        if (this.topReached) {
            totalScore += 1000; // Bonus for reaching the top
        }
        return totalScore;
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
        if (this.keys['ArrowLeft']) this.ship.x -= this.ship.speed;
        if (this.keys['ArrowRight']) this.ship.x += this.ship.speed;
        if (this.keys['ArrowUp']) this.ship.y -= this.ship.speed;
        if (this.keys['ArrowDown']) this.ship.y += this.ship.speed;

        // Keep ship in bounds
        this.ship.x = Math.max(0, Math.min(this.canvas.width - this.ship.width, this.ship.x));
        this.ship.y = Math.max(0, Math.min(this.canvas.height - this.ship.height, this.ship.y));

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
                this.ship.y = this.canvas.height - 50;
                this.hits++;
                this.lives--;

                if (this.lives <= 0) {
                    this.isActive = false;
                    showWinScreen(1, this.calculateScore());
                    return;
                }
            }
        });

        // Check win condition
        if (this.ship.y <= 50 && !this.topReached) {
            this.topReached = true;
            this.score += 1000;
            soundManager.playWin();
            this.isActive = false;
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

        // Draw game stats
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Orbitron';
        this.ctx.fillText(`Lives: ${this.lives}`, 20, 30);
        this.ctx.fillText(`Score: ${this.calculateScore()}`, 20, 60);
        this.ctx.fillText(`Hits: ${this.hits}`, 20, 90);

        // Draw ship using image
        this.ctx.drawImage(this.shipImage, this.ship.x, this.ship.y, this.ship.width, this.ship.height);

        // Draw asteroids
        this.ctx.fillStyle = '#888888';
        this.asteroids.forEach(asteroid => {
            this.ctx.beginPath();
            this.ctx.arc(asteroid.x + asteroid.width/2, asteroid.y + asteroid.height/2, 
                        asteroid.width/2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    gameLoop() {
        if (!this.isActive) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}