class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.bgMusic = null;
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

    playBackgroundMusic(type) {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
        this.bgMusic = new Audio();
        this.bgMusic.loop = true;

        switch(type) {
            case 'menu':
                // Peaceful space ambiance
                this.createOscillatorLoop(220, 0.05, 'sine');
                break;
            case 'level1':
                // Tense asteroid music
                this.createOscillatorLoop(330, 0.08, 'sawtooth');
                break;
            case 'level2':
                // Action-packed invader music
                this.createOscillatorLoop(440, 0.1, 'square');
                break;
        }
    }

    createOscillatorLoop(baseFreq, volume, type) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);

        gain.gain.setValueAtTime(volume, this.audioContext.currentTime);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        this.bgMusic = osc;
    }

    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgMusic = null;
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
}

const soundManager = new SoundManager();