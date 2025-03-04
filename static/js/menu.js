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

  // Play menu music when the page loads
  setTimeout(() => {
    if (typeof soundManager !== 'undefined') {
      console.log("Playing menu music");
      soundManager.playBackgroundMusic('menu');
    } else {
      console.error("Sound manager not initialized");
    }
  }, 500); // Small delay to ensure everything is loaded

    // Load high scores when page loads
    loadHighScores();
});