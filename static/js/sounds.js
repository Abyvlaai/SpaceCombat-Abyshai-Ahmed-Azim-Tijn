class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.bgMusic = null;
        this.currentOscillator = null;
        this.currentGain = null;
    }

    stopCurrentSound() {
        if (this.currentOscillator) {
            this.currentOscillator.stop();
            this.currentOscillator.disconnect();
            this.currentOscillator = null;
        }
        if (this.currentGain) {
            this.currentGain.disconnect();
            this.currentGain = null;
        }
    }

    playBackgroundMusic(type) {
        this.stopCurrentSound();

        this.currentOscillator = this.audioContext.createOscillator();
        this.currentGain = this.audioContext.createGain();

        const settings = {
            menu: { freq: 220, gain: 0.02, type: 'sine' },
            level1: { freq: 330, gain: 0.03, type: 'triangle' },
            level2: { freq: 440, gain: 0.03, type: 'square' }
        };

        const { freq, gain, type } = settings[type] || settings.menu;

        this.currentOscillator.type = type;
        this.currentOscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        this.currentGain.gain.setValueAtTime(gain, this.audioContext.currentTime);

        this.currentOscillator.connect(this.currentGain);
        this.currentGain.connect(this.audioContext.destination);

        this.currentOscillator.start();
    }

    stopBackgroundMusic() {
        this.stopCurrentSound();
    }

    playShoot() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playExplosion() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playWin() {
        this.createSound(880, 0.5);
        setTimeout(() => this.createSound(1100, 0.5), 200);
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
}

const soundManager = new SoundManager();