class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.bgMusic = null;
        this.bgGain = null;
    }

    playBackgroundMusic(type) {
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgGain.disconnect();
        }

        this.bgMusic = this.audioContext.createOscillator();
        this.bgGain = this.audioContext.createGain();

        // Set different patterns for different screens
        switch(type) {
            case 'menu':
                this.bgMusic.type = 'sine';
                this.bgMusic.frequency.setValueAtTime(220, this.audioContext.currentTime);
                this.bgGain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
                break;
            case 'level1':
                this.bgMusic.type = 'sawtooth';
                this.bgMusic.frequency.setValueAtTime(165, this.audioContext.currentTime);
                this.bgGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
                break;
            case 'level2':
                this.bgMusic.type = 'square';
                this.bgMusic.frequency.setValueAtTime(196, this.audioContext.currentTime);
                this.bgGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
                break;
        }

        this.bgMusic.connect(this.bgGain);
        this.bgGain.connect(this.audioContext.destination);
        this.bgMusic.start();
    }

    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgGain.disconnect();
            this.bgMusic = null;
            this.bgGain = null;
        }
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