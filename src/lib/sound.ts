// Playful Web Audio soundscape — zero external assets, instant tactile delight.
// Respects mute state stored in localStorage ('mpf.sound') and safely no-ops if Web Audio is unavailable.
import { load, save } from './storage';

let ctx: AudioContext | null = null;
let enabled: boolean = load('sound') !== 'off';

function getCtx(): AudioContext | null {
  if (!enabled) return null;
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    if (!ctx) ctx = new Ctor();
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
    return ctx;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(next: boolean): void {
  enabled = next;
  save('sound', next ? 'on' : 'off');
  if (next) playClick();
}

export function toggleSound(): boolean {
  setSoundEnabled(!enabled);
  return enabled;
}

function tone(
  ac: AudioContext,
  type: OscillatorType,
  f0: number,
  f1: number,
  dur: number,
  gainPeak: number,
  delay = 0,
): void {
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t0);
  if (f1 !== f0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(gainPeak, t0 + Math.min(0.018, dur * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Soft tactile wooden-pop click for UI tabs and switches. */
export function playClick(): void {
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 'sine', 620, 920, 0.065, 0.055);
}

/** Cute cheeky dual-chirp pig oink when poking the pig! */
export function playOink(): void {
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 'triangle', 260, 440, 0.09, 0.085, 0);
  tone(ac, 'sine', 340, 560, 0.11, 0.075, 0.075);
}

/** Dreamy ascending chime-whoosh on takeoff. */
export function playLaunch(): void {
  const ac = getCtx();
  if (!ac) return;
  const notes = [392, 493.88, 587.33, 783.99];
  notes.forEach((n, i) => tone(ac, 'sine', n, n * 1.03, 0.18, 0.055, i * 0.055));
}

/** Sparkly major-9th celebration fanfare when a pig flies or unlocks a method! */
export function playFanfare(): void {
  const ac = getCtx();
  if (!ac) return;
  const chord = [523.25, 659.25, 783.99, 987.77, 1174.66];
  chord.forEach((n, i) => {
    tone(ac, 'triangle', n, n, 0.36, 0.06, i * 0.065);
    tone(ac, 'sine', n * 2, n * 2, 0.24, 0.02, i * 0.065 + 0.02);
  });
}

/** Airy wing-flap whoosh for Hog Wild. */
export function playFlap(): void {
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 'sine', 290, 540, 0.09, 0.06);
  tone(ac, 'triangle', 190, 320, 0.07, 0.03, 0.01);
}

/** Supersonic synth shimmer for Rocket Mode! */
export function playBoost(): void {
  const ac = getCtx();
  if (!ac) return;
  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.5];
  notes.forEach((n, i) => tone(ac, 'sawtooth', n * 0.9, n, 0.22, 0.03, i * 0.04));
}

/** Comical descending cartoon boing on landing/crash in Hog Wild. */
export function playCrash(): void {
  const ac = getCtx();
  if (!ac) return;
  tone(ac, 'triangle', 320, 110, 0.26, 0.09, 0);
  tone(ac, 'sine', 180, 75, 0.3, 0.07, 0.08);
}
