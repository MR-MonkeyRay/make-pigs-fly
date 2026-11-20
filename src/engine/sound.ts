import { store } from './store';

/**
 * Tiny WebAudio synth. No audio files: every sound is generated on the fly.
 * Muted by default; the context is created lazily on the first unmuted sound
 * (which always follows a user gesture, satisfying autoplay policies).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function ac(): AudioContext | null {
  if (store.get().muted) return null;
  try {
    if (!ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      const len = ctx.sampleRate * 1;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function env(g: GainNode, t: number, a: number, peak: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function noise(c: AudioContext, t: number, dur: number, type: BiquadFilterType, freq: number, q: number, peak: number) {
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  env(g, t, 0.005, peak, dur);
  src.connect(f).connect(g).connect(master!);
  src.start(t);
  src.stop(t + dur + 0.05);
  return { f, g };
}

export const sound = {
  oink(pitch = 1) {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    for (const [off, len] of [
      [0, 0.16],
      [0.19, 0.12],
    ]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(260 * pitch, t + off);
      o.frequency.exponentialRampToValueAtTime(150 * pitch, t + off + len);
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 900 * pitch;
      f.Q.value = 3;
      const g = c.createGain();
      env(g, t + off, 0.012, 0.5, len);
      o.connect(f).connect(g).connect(master!);
      o.start(t + off);
      o.stop(t + off + len + 0.05);
      noise(c, t + off, len * 0.8, 'bandpass', 700 * pitch, 2, 0.15);
    }
  },
  clack() {
    const c = ac();
    if (!c) return;
    noise(c, c.currentTime, 0.025, 'highpass', 2400, 0.7, 0.25);
  },
  ding() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    [1318, 988].forEach((fq, i) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = fq;
      const g = c.createGain();
      env(g, t + i * 0.32, 0.01, 0.35, 1.1);
      o.connect(g).connect(master!);
      o.start(t + i * 0.32);
      o.stop(t + i * 0.32 + 1.3);
    });
  },
  thump() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    const g = c.createGain();
    env(g, t, 0.004, 0.8, 0.22);
    o.connect(g).connect(master!);
    o.start(t);
    o.stop(t + 0.3);
    noise(c, t, 0.06, 'lowpass', 1200, 0.7, 0.3);
  },
  whoosh(seconds = 2.6) {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const { f, g } = noise(c, t, seconds, 'bandpass', 300, 1.2, 0.5);
    f.frequency.setValueAtTime(250, t);
    f.frequency.exponentialRampToValueAtTime(2200, t + seconds);
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + seconds * 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds + 0.08);
  },
  pop() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(380, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
    const g = c.createGain();
    env(g, t, 0.005, 0.5, 0.12);
    o.connect(g).connect(master!);
    o.start(t);
    o.stop(t + 0.2);
  },
  splat() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    this.thump();
    const { f } = noise(c, t, 0.35, 'lowpass', 1800, 1, 0.7);
    f.frequency.setValueAtTime(1800, t);
    f.frequency.exponentialRampToValueAtTime(200, t + 0.35);
    window.setTimeout(() => this.oink(0.8), 380);
  },
};
