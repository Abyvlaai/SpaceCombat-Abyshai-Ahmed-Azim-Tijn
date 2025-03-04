let canvas, ctx, currentLevel, shipImage;

function loadImages() {
    return new Promise((resolve) => {
        shipImage = new Image();
        shipImage.src = '/static/images/spaceship.svg';
        shipImage.onload = () => resolve();
    });
}

async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Load images before starting
    await loadImages();

    // Create level instances
    window.level1 = new Level1(canvas, ctx, shipImage);
    window.level2 = new Level2(canvas, ctx, shipImage);
}

function showMenu() {
    document.getElementById('menu').classList.remove('d-none');
    document.getElementById('gameCanvas').classList.add('d-none');
    document.getElementById('level1-instructions').classList.add('d-none');
    document.getElementById('level2-instructions').classList.add('d-none');
}

function startLevel(levelNum) {
    document.getElementById('menu').classList.add('d-none');
    document.getElementById('gameCanvas').classList.remove('d-none');

    // Show appropriate instructions
    document.getElementById('level1-instructions').classList.toggle('d-none', levelNum !== 1);
    document.getElementById('level2-instructions').classList.toggle('d-none', levelNum !== 2);

    // Start the selected level
    if (currentLevel) {
        currentLevel.isActive = false;
    }

    currentLevel = levelNum === 1 ? window.level1 : window.level2;
    currentLevel.start();
}

// Initialize game when the page loads
window.addEventListener('load', init);