/**
 * Audio Music Service
 * Provides background music and sound effects for Math-Whiz
 * Age-appropriate, celebratory, and toggleable
 */

interface MusicSettings {
  enabled: boolean;
  volume: number; // 0-1
}

class MusicService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private settings: MusicSettings = {
    enabled: true,
    volume: 0.5
  };

  /**
   * Initialize Web Audio API
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.isInitialized = true;
      }
    } catch (error) {
      console.warn('[Music] Web Audio API not available:', error);
    }
  }

  /**
   * Generate a cheerful beep sound
   */
  playCheerfulChime(): void {
    if (!this.settings.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      
      // Create oscillator for celebratory chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      
      gain.gain.setValueAtTime(this.settings.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (error) {
      console.warn('[Music] Error playing chime:', error);
    }
  }

  /**
   * Generate achievement fanfare (ascending notes)
   */
  playAchievementFanfare(): void {
    if (!this.settings.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C, E, G (uplifting notes)
      const duration = 0.15;

      notes.forEach((freq, index) => {
        const noteStart = now + index * duration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(this.settings.volume * 0.2, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + duration);

        osc.start(noteStart);
        osc.stop(noteStart + duration);
      });
    } catch (error) {
      console.warn('[Music] Error playing fanfare:', error);
    }
  }

  /**
   * Generate sad sound (for wrong answer - gentle)
   */
  playSadSound(): void {
    if (!this.settings.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

      gain.gain.setValueAtTime(this.settings.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (error) {
      console.warn('[Music] Error playing sad sound:', error);
    }
  }

  /**
   * Set music enabled/disabled
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current settings
   */
  getSettings(): MusicSettings {
    return { ...this.settings };
  }
}

// Export singleton instance
export const musicService = new MusicService();

// Initialize on first use
export const initializeMusic = async (): Promise<void> => {
  await musicService.initialize();
};

export default musicService;
