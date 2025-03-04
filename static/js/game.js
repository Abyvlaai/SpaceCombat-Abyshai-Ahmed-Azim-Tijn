let canvas, ctx, currentLevel, shipImage, alienImage;

function loadImages() {
    return new Promise((resolve) => {
        shipImage = new Image();
        shipImage.src = '/static/images/spaceship.svg';

        alienImage = new Image();
        alienImage.src = '/static/images/alien.svg';

        Promise.all([
            new Promise(r => shipImage.onload = r),
            new Promise(r => alienImage.onload = r)
        ]).then(() => resolve());
    });
}

async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Load images before starting
    await loadImages();

    // Create level instances
    window.level1 = new Level1(canvas, ctx, shipImage);
    window.level2 = new Level2(canvas, ctx, shipImage, alienImage);

    // Start menu music
    soundManager.playBackgroundMusic('menu');
}

function showWinScreen(level) {
    const messages = {
        1: "You've successfully navigated through the asteroid field! Ready for the alien invasion?",
        2: "Outstanding work! You've defeated the alien invasion and saved Earth!"
    };

    document.getElementById('win-message').textContent = messages[level];
    document.getElementById('win-screen').classList.remove('d-none');
    document.getElementById('gameCanvas').classList.add('d-none');

    soundManager.stopBackgroundMusic();
    soundManager.playBackgroundMusic('menu');
}

function showMenu() {
    document.getElementById('menu').classList.remove('d-none');
    document.getElementById('win-screen').classList.add('d-none');
    document.getElementById('gameCanvas').classList.add('d-none');
    document.getElementById('level1-instructions').classList.add('d-none');
    document.getElementById('level2-instructions').classList.add('d-none');

    soundManager.playBackgroundMusic('menu');
}

function startLevel(levelNum) {
    document.getElementById('menu').classList.add('d-none');
    document.getElementById('win-screen').classList.add('d-none');
    document.getElementById('gameCanvas').classList.remove('d-none');

    // Show appropriate instructions
    document.getElementById('level1-instructions').classList.toggle('d-none', levelNum !== 1);
    document.getElementById('level2-instructions').classList.toggle('d-none', levelNum !== 2);

    // Stop any existing level and music
    if (currentLevel) {
        currentLevel.isActive = false;
    }
    soundManager.stopBackgroundMusic();

    // Start the selected level with appropriate music
    currentLevel = levelNum === 1 ? window.level1 : window.level2;
    soundManager.playBackgroundMusic(`level${levelNum}`);
    currentLevel.start();
}

// Initialize game when the page loads
window.addEventListener('load', init);