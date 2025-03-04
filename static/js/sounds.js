
class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.bgMusic = [];
        this.bgGain = null;
    }

    playBackgroundMusic(musicType) {
        this.stopBackgroundMusic();
        this.bgGain = this.audioContext.createGain();
        this.bgGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        this.bgGain.connect(this.audioContext.destination);

        switch(musicType) {
            case 'menu':
                // Peaceful space theme - major chord arpeggio
                this.createMusicPattern([440, 550, 660], 0.5, 'sine');
                break;
            case 'level1':
                // Tense asteroid music - minor chord pattern
                this.createMusicPattern([330, 392, 494], 1, 'triangle');
                break;
            case 'level2':
                // Action-packed invader music - faster rhythm
                this.createMusicPattern([440, 523, 659], 0.25, 'square');
                break;
        }
    }

    createMusicPattern(frequencies, interval, oscillatorType) {
        let time = this.audioContext.currentTime;

        // Create a repeating pattern
        for (let i = 0; i < 4; i++) {
            frequencies.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                const noteGain = this.audioContext.createGain();

                osc.type = oscillatorType;
                osc.frequency.setValueAtTime(freq, time + (i * frequencies.length + index) * interval);

                noteGain.gain.setValueAtTime(0, time + (i * frequencies.length + index) * interval);
                noteGain.gain.linearRampToValueAtTime(0.1, time + (i * frequencies.length + index) * interval + 0.1);
                noteGain.gain.linearRampToValueAtTime(0, time + (i * frequencies.length + index) * interval + interval);

                osc.connect(noteGain);
                noteGain.connect(this.bgGain);

                osc.start(time + (i * frequencies.length + index) * interval);
                osc.stop(time + (i * frequencies.length + index) * interval + interval + 0.1);

                this.bgMusic.push(osc);
            });
        }

        // Schedule the next pattern
        setTimeout(() => {
            if (this.bgGain) {
                this.playBackgroundMusic(musicType);
            }
        }, (interval * frequencies.length * 4 * 1000));
    }

    stopBackgroundMusic() {
        if (this.bgGain) {
            this.bgGain.disconnect();
            this.bgGain = null;
        }
        this.bgMusic.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // Oscillator might have already stopped
            }
        });
        this.bgMusic = [];
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

    createSound(frequency, duration, soundType = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = soundType;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

// Create a global soundManager instance
const soundManager = new SoundManager();
