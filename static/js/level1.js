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
        if (this.keys['ArrowLeft']) this.ship.x -= this.ship.speed;
        if (this.keys['ArrowRight']) this.ship.x += this.ship.speed;
        if (this.keys['ArrowUp']) this.ship.y -= this.ship.speed;
        if (this.keys['ArrowDown']) this.ship.y += this.ship.speed;

        //Handle 'M' key for returning to homescreen
        if (this.keys['m'] || this.keys['M']) {
            this.cleanup();
            showMenu(); // Use the correct function name
            return;
        }


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
            }
        });

        // Check win condition
        if (this.ship.y <= 50) {
            soundManager.playWin();
            this.isActive = false;
            showWinScreen(1);
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

        // Draw ship using image
        this.ctx.drawImage(this.shipImage, this.ship.x, this.ship.y, this.ship.width, this.ship.height);

        // Draw detailed asteroids
        this.asteroids.forEach(asteroid => {
            // Create a more detailed asteroid with craters and texture
            const centerX = asteroid.x + asteroid.width/2;
            const centerY = asteroid.y + asteroid.height/2;
            const radius = asteroid.width/2;
            
            // Base asteroid shape - slightly irregular
            this.ctx.beginPath();
            this.ctx.fillStyle = '#808080'; // Base gray color
            
            // Create an irregular shape with 8 points
            const points = 8;
            const irregularity = 0.2; // How irregular the shape is
            
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const randomRadius = radius * (1 - irregularity + Math.random() * irregularity);
                const x = centerX + Math.cos(angle) * randomRadius;
                const y = centerY + Math.sin(angle) * randomRadius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add craters
            const craterCount = 3 + Math.floor(Math.random() * 3);
            this.ctx.fillStyle = '#606060'; // Darker gray for craters
            
            for (let i = 0; i < craterCount; i++) {
                const craterRadius = radius * (0.2 + Math.random() * 0.2);
                const angle = Math.random() * Math.PI * 2;
                const distance = radius * 0.4 * Math.random();
                const craterX = centerX + Math.cos(angle) * distance;
                const craterY = centerY + Math.sin(angle) * distance;
                
                this.ctx.beginPath();
                this.ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Add highlights for 3D effect
            this.ctx.strokeStyle = '#a0a0a0'; // Lighter gray for highlights
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(centerX - radius/3, centerY - radius/3, radius * 0.6, 0, Math.PI * 0.5);
            this.ctx.stroke();
        });
    }

    gameLoop() {
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop()); //Store animationFrameId
        if (!this.isActive) return;
        this.update();
        this.draw();
    }

    // Method to clean up resources when leaving the level
    cleanup() {
        // Clear any running timers or animations
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Remove any event listeners if necessary

        console.log("Level 1 cleanup complete");
        this.isActive = false; // added to ensure gameloop stops
    }
}