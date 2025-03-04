
document.addEventListener('DOMContentLoaded', function() {
  // Play menu music when the page loads
  if (typeof soundManager !== 'undefined') {
    soundManager.playBackgroundMusic('menu');
  } else {
    console.error("Sound manager not initialized");
  }
});
