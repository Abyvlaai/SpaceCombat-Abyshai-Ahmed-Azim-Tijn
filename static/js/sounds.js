class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
    }

    async createSound(frequency, duration, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playShoot() {
        this.createSound(440, 0.1, 'square');
    }

    playExplosion() {
        this.createSound(100, 0.3, 'sawtooth');
    }

    playWin() {
        this.createSound(880, 0.5);
        setTimeout(() => this.createSound(1100, 0.5), 200);
    }
}

const soundManager = new SoundManager();
