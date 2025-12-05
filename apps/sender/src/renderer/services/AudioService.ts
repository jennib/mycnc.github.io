import { useSettingsStore } from '../stores/settingsStore';

class AudioService {
    private audioContext: AudioContext | null = null;
    private bufferCache: Map<string, AudioBuffer> = new Map();

    constructor() {
        this.initAudioContext();
        this.addInteractionListeners();
    }

    private initAudioContext() {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
        }
    }

    private addInteractionListeners() {
        const resumeAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        };

        window.addEventListener('click', resumeAudio);
        window.addEventListener('keydown', resumeAudio);
        window.addEventListener('touchstart', resumeAudio);
    }

    public async playCompletionSound() {
        // Check setting first
        const { playCompletionSound } = useSettingsStore.getState();
        if (!playCompletionSound) {
            return;
        }

        if (!this.audioContext) {
            console.warn('AudioContext not supported');
            return;
        }

        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.warn('Could not resume AudioContext:', e);
            }
        }

        const soundUrl = '/completion-sound.mp3';

        try {
            let buffer = this.bufferCache.get(soundUrl);

            if (!buffer) {
                const response = await fetch(soundUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                buffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.bufferCache.set(soundUrl, buffer);
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);

        } catch (error) {
            console.error('Failed to play completion sound:', error);
            this.playFallbackBeep();
        }
    }

    private playFallbackBeep() {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
            oscillator.connect(this.audioContext.destination);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.error('Fallback beep failed:', e);
        }
    }
}

export const audioService = new AudioService();
