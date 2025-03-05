let canvas, ctx, currentLevel, shipImage, alienImage; 
let currentScore = 0;
let currentLevelNum = 0;
// Deze variabelen slaan het canvas, de tekencontext, het huidige niveau, de afbeelding van het schip en de afbeelding van de alien op
// Slaat de huidige score van de speler op
// Houdt het huidige niveaunummer bij

// Deze functie laadt de afbeeldingen die in het spel worden gebruikt
function loadImages() {
    return new Promise((resolve) => {
        shipImage = new Image(); // Maakt een nieuw afbeeldingsobject voor het ruimteschip
        shipImage.src = '/static/images/spaceship.svg';// Stelt de bron van de ruimteschip-afbeelding in

        alienImage = new Image(); // Maakt een nieuw afbeeldingsobject voor de alien
        alienImage.src = '/static/images/alien.svg';// Stelt de bron van de alien-afbeelding in

        // Maakt een belofte die wordt opgelost wanneer de ruimteschipafbeelding en alienafbeelding wordt geladen
        Promise.all([
            new Promise(r => shipImage.onload = r), 
            new Promise(r => alienImage.onload = r)
        ]).then(() => resolve());
    });//Wanneer beide beloften zijn opgelost, runt de functie
}
// Deze functie laadt en toont de hoogste scores voor elk level
async function loadHighScores() {
    for (let level of [1, 2]) { // Herhaalt over de twee levels
        const response = await fetch(`/api/highscores/${level}`); // Haalt de hoogste scores op voor het huidige niveau
        const scores = await response.json(); // Parseert het antwoord als JSON om de hoogste score te krijgen
        const scoreList = document.getElementById(`level${level}-scores`);// Haalt het HTML-element op dat de hoogste scores weergeeft
        scoreList.innerHTML = scores.map(score => 
            `<li class="text-success">${score.player_name}: ${score.score}</li>`
        ).join(''); // Voegt de lijstitems samen tot één enkele string en stelt deze in als de interne HTML van het scorelijstelement
    }
}

async function submitScore() { // Deze functie stuurt de score van de speler naar de server
    const playerName = document.getElementById('player-name').value.trim();// Haalt de naam van de speler op uit het invoerveld
    if (!playerName) { //Controleert of de spelersnaam leeg is anders melding
        alert('Please enter your name!');
        return;
    }

    const response = await fetch('/api/save_score', { // Stuurt een POST-verzoek naar de server om de score op te slaan
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Stelt het inhoudstype van de aanvraag in op JSON
        },
        body: JSON.stringify({ // Stringifies the score data into JSON format inclusief speler naam, score en level nummer
            player_name: playerName,
            score: currentScore,
            level: currentLevelNum
        })
    });

    if (response.ok) { // Controleert of het verzoek succesvol was
        document.getElementById('score-submit').classList.add('d-none'); // Verbergt de knop voor het indienen van de score en laad de highschores
        loadHighScores();
    }
}

async function init() { // Deze functie initialiseert het spel, klrijgt het canvas van html en 2d context van canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // laad afbeeldingen voor het starten
    await loadImages();

    // maakt level instanties
    window.level1 = new Level1(canvas, ctx, shipImage);
    window.level2 = new Level2(canvas, ctx, shipImage, alienImage);

    // Laad high scores
    await loadHighScores();

    
}

function showWinScreen(level, score) { // Deze functie geeft het winscherm weer
    const messages = { // Definieert een object dat de winberichten voor elk niveau bevat
        1: "You've successfully navigated through the asteroid field! Ready for the alien invasion?",
        2: "Outstanding work! You've defeated the alien invasion and saved Earth!"
    };

    currentScore = score;
    currentLevelNum = level;
    // Zet het win message on  screen, verbergt game canvas
    document.getElementById('win-message').textContent = messages[level]; 
    document.getElementById('score-message').textContent = `Your Score: ${score}`;
    document.getElementById('score-submit').classList.remove('d-none');
    document.getElementById('win-screen').classList.remove('d-none');
    document.getElementById('gameCanvas').classList.add('d-none');

    soundManager.stopBackgroundMusic();// stot achtergrond geluid dat speelde
    soundManager.playBackgroundMusic('menu'); //speelt hoofdmenu muziekje
}

function showMenu() { // deze functie laat het hoofdmenu zien, verbergt winscherm en verbergt game canvas, instructies voor level 1 en 2 
    document.getElementById('menu').classList.remove('d-none');
    document.getElementById('win-screen').classList.add('d-none');
    document.getElementById('gameCanvas').classList.add('d-none');
    document.getElementById('level1-instructions').classList.add('d-none');
    document.getElementById('level2-instructions').classList.add('d-none');
    
    // If loadHighScores function bestaat, roep het
    if (typeof loadHighScores === 'function') {
        loadHighScores();
    }

    // Als soundManager bestaat, speel dan menumuziek af
    if (typeof soundManager !== 'undefined' && soundManager) {
        try {
            soundManager.playBackgroundMusic('menu');
        } catch (e) {
            console.log("Could not play menu music:", e);
        }
    }
}

// Voeg een globale sleutelluisteraar toe voor 'M' om terug te keren naar het menu
document.addEventListener('keydown', function(event) {
    // Check of 'M' key pressed (keyCode 77)
    if (event.keyCode === 77 || event.key === 'm' || event.key === 'M') {
        // Als de game actief (canvas zichtbaar), return naar hoofdscherm
        if (!document.getElementById('gameCanvas').classList.contains('d-none')) {
            console.log("M key pressed - returning to menu");
            showMenu();
            
            // Als we een object op het huidige niveau hebben en het heeft een opschoonmethode, roep het dan aan
            if (currentLevel && typeof currentLevel.cleanup === 'function') {
                currentLevel.cleanup(); // Roept de opschoonmethode van het huidige niveau aan
            }
        }
    }
});

function startLevel(levelNum) { // Deze functie start het opgegeven niveau, VERBERGT MENU, VERBERGT WINSCHER, en laat game canvas zichtbaar
    document.getElementById('menu').classList.add('d-none');
    document.getElementById('win-screen').classList.add('d-none');
    document.getElementById('gameCanvas').classList.remove('d-none');

    // laat instructions zien
    document.getElementById('level1-instructions').classList.toggle('d-none', levelNum !== 1);
    document.getElementById('level2-instructions').classList.toggle('d-none', levelNum !== 2);

    // Stop stopt elk level en muziek
    if (currentLevel) {
        currentLevel.isActive = false;
    }
    soundManager.stopBackgroundMusic();

    // Start gekozen level met bijbehorende liedje
    currentLevel = levelNum === 1 ? window.level1 : window.level2;
    soundManager.playBackgroundMusic(`level${levelNum}`);
    currentLevel.start();
}

// Initialiseer het spel wanneer de pagina wordt geladen
window.addEventListener('load', init);