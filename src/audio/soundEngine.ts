/**
 * Gentle procedural Web Audio micro-interaction sound effects.
 * Zero external files; politely initializes only on user gesture.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(next: boolean): void {
    this.enabled = next;
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Soft, cheerful pig oink when poking the pig */
  public playOink(pitchShift = 1): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(175 * pitchShift, now);
    osc.frequency.exponentialRampToValueAtTime(290 * pitchShift, now + 0.075);
    osc.frequency.exponentialRampToValueAtTime(150 * pitchShift, now + 0.17);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(32, now);
    modGain.gain.setValueAtTime(18, now);
    mod.connect(modGain);
    modGain.connect(osc.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(640 * pitchShift, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    mod.start(now);
    osc.stop(now + 0.2);
    mod.stop(now + 0.2);
  }

  /** Dreamy ascending chime when triggering a soar or mood shift */
  public playSoarChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.065;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.085, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.58);
    });
  }

  /** Crisp ink-seal stamp sound */
  public playStamp(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }
}

export const soundEngine = new SoundEngine();
