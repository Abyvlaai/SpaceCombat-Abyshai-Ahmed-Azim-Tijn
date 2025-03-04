
document.addEventListener('DOMContentLoaded', function() {
  // Make sure the audio context is resumed (browsers require user interaction)
  function resumeAudio() {
    if (soundManager && soundManager.audioContext.state === 'suspended') {
      soundManager.audioContext.resume().then(() => {
        console.log("AudioContext resumed successfully");
      });
    }
    document.removeEventListener('click', resumeAudio);
    document.removeEventListener('keydown', resumeAudio);
  }

  // Add event listeners to resume audio on user interaction
  document.addEventListener('click', resumeAudio);
  document.addEventListener('keydown', resumeAudio);

  // Create and add the moon element
  const moon = document.createElement('div');
  moon.style.position = 'absolute';
  moon.style.top = '20px';
  moon.style.left = '20px';
  moon.style.width = '60px';
  moon.style.height = '60px';
  moon.style.borderRadius = '50%';
  moon.style.background = 'radial-gradient(circle at 40% 40%, #eee, #999)';
  moon.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.7)';
  moon.style.zIndex = '1';
  
  // Create craters on the moon
  const crater1 = document.createElement('div');
  crater1.style.position = 'absolute';
  crater1.style.top = '15px';
  crater1.style.left = '20px';
  crater1.style.width = '12px';
  crater1.style.height = '12px';
  crater1.style.borderRadius = '50%';
  crater1.style.backgroundColor = '#999';
  moon.appendChild(crater1);
  
  const crater2 = document.createElement('div');
  crater2.style.position = 'absolute';
  crater2.style.top = '35px';
  crater2.style.left = '30px';
  crater2.style.width = '8px';
  crater2.style.height = '8px';
  crater2.style.borderRadius = '50%';
  crater2.style.backgroundColor = '#999';
  moon.appendChild(crater2);
  
  // Create and add the spaceship element
  const spaceship = document.createElement('div');
  spaceship.style.position = 'absolute';
  spaceship.style.bottom = '30px';
  spaceship.style.right = '40px';
  spaceship.style.width = '80px';
  spaceship.style.height = '30px';
  spaceship.style.background = 'linear-gradient(to bottom, #777, #444)';
  spaceship.style.borderRadius = '40px 40px 5px 5px';
  spaceship.style.transform = 'rotate(-15deg)';
  spaceship.style.boxShadow = '0 0 15px rgba(100, 200, 255, 0.7)';
  spaceship.style.zIndex = '1';
  
  // Add a window to the spaceship
  const window1 = document.createElement('div');
  window1.style.position = 'absolute';
  window1.style.top = '5px';
  window1.style.left = '15px';
  window1.style.width = '15px';
  window1.style.height = '15px';
  window1.style.borderRadius = '50%';
  window1.style.backgroundColor = '#6af';
  window1.style.boxShadow = 'inset 0 0 5px rgba(255, 255, 255, 0.7)';
  spaceship.appendChild(window1);
  
  // Add engine glow
  const engine = document.createElement('div');
  engine.style.position = 'absolute';
  engine.style.bottom = '-5px';
  engine.style.left = '10px';
  engine.style.width = '20px';
  engine.style.height = '10px';
  engine.style.borderRadius = '50%';
  engine.style.backgroundColor = '#f63';
  engine.style.boxShadow = '0 0 10px #f93';
  spaceship.appendChild(engine);
  
  // Add elements to the page when menu is visible
  function addSpaceElements() {
    const menu = document.getElementById('menu');
    if (menu && !menu.classList.contains('d-none') && !document.getElementById('space-moon')) {
      moon.id = 'space-moon';
      spaceship.id = 'space-ship';
      document.querySelector('.container').appendChild(moon);
      document.querySelector('.container').appendChild(spaceship);
    }
  }
  
  // Remove elements when menu is hidden
  function removeSpaceElements() {
    const moonElement = document.getElementById('space-moon');
    const shipElement = document.getElementById('space-ship');
    if (moonElement) moonElement.remove();
    if (shipElement) shipElement.remove();
  }
  
  // Observe menu visibility changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        const menu = document.getElementById('menu');
        if (menu && !menu.classList.contains('d-none')) {
          addSpaceElements();
        } else {
          removeSpaceElements();
        }
      }
    });
  });
  
  const menu = document.getElementById('menu');
  if (menu) {
    observer.observe(menu, { attributes: true });
    
    // Initial setup
    if (!menu.classList.contains('d-none')) {
      addSpaceElements();
    }
  }

  // Play menu music when the page loads
  setTimeout(() => {
    if (typeof soundManager !== 'undefined') {
      console.log("Playing menu music");
      soundManager.playBackgroundMusic('menu');
    } else {
      console.error("Sound manager not initialized");
    }
  }, 500); // Small delay to ensure everything is loaded
});
