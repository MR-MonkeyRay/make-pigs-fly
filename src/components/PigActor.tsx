import { useEffect, useRef } from 'react';
import { PigArt, type Costume } from '../art/PigArt';
import { SECTIONS, type Mood } from '../engine/specs';
import { subscribe } from '../engine/scroll';
import { store, useStore } from '../engine/store';
import { sound } from '../engine/sound';
import { useI18n } from '../i18n';
import './pig-actor.css';

const BASE = 280;

interface Eye {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/** irises slosh with acceleration but a soft spring keeps them looking forward */
function stepEye(e: Eye, ax: number, ay: number, dt: number, R: number) {
  const K = 700;
  e.vx += (ax - K * e.x) * dt;
  e.vy += (ay - K * e.y) * dt;
  const damp = Math.pow(0.08, dt);
  e.vx *= damp;
  e.vy *= damp;
  e.x += e.vx * dt;
  e.y += e.vy * dt;
  const d = Math.hypot(e.x, e.y);
  if (d > R) {
    const nx = e.x / d;
    const ny = e.y / d;
    e.x = nx * R;
    e.y = ny * R;
    const vn = e.vx * nx + e.vy * ny;
    if (vn > 0) {
      e.vx -= 1.6 * vn * nx;
      e.vy -= 1.6 * vn * ny;
    }
  }
}

function costumeFor(idx: number, p: number, alt: number): Costume {
  const s = store.get();
  const helmet = alt >= 100_000;
  // past the Kármán line the wings retire and the (borrowed) rocket boots take over
  const jet = helmet && !s.chute;
  return {
    wings: jet ? 'none' : idx > 2 || (idx === 2 && p > 0.42) ? 'feather' : 'cardboard',
    jet,
    goggles: idx >= 3,
    scarf: idx >= 4,
    pillow: idx >= 7 && !helmet,
    helmet,
    // brought for the Moon and left there: past it, a flag beside a flying pig just hovers
    flag: idx === 11 && p > 0.3,
    chute: s.chute,
    undies: s.landed && idx === 0,
    mud: s.muddy,
  };
}

const COSTUME_KEYS: (keyof Costume)[] = ['goggles', 'scarf', 'pillow', 'helmet', 'jet', 'flag', 'chute', 'undies', 'mud'];

export function PigActor() {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubble = useStore((s) => s.bubble ?? s.say);
  const hopRef = useRef(0);
  const quipRef = useRef(0);
  /** bubble size and the bottom edge of the fixed chrome, measured when a line is shown */
  const bubbleBox = useRef({ h: 0, w: 0, chrome: 64 });

  useEffect(() => {
    if (!bubble) return;
    const span = bubbleRef.current?.firstElementChild as HTMLElement | null;
    let chrome = 64;
    for (const sel of ['.topbar', window.innerWidth < 900 ? '.alt__read' : '']) {
      const el = sel && document.querySelector(sel);
      if (el) chrome = Math.max(chrome, el.getBoundingClientRect().bottom);
    }
    bubbleBox.current = { h: span?.offsetHeight ?? 0, w: span?.offsetWidth ?? 0, chrome };
  }, [bubble]);

  useEffect(() => {
    const svg = svgRef.current!;
    const wrap = wrapRef.current!;
    const part = (n: string) => svg.querySelector<SVGGElement>(`[data-part="${n}"]`)!;
    const P = {
      wingNear: part('wingNear'),
      wingFar: part('wingFar'),
      tail: part('tail'),
      legBF: part('legBF'),
      legBN: part('legBN'),
      legFF: part('legFF'),
      legFN: part('legFN'),
      earNear: part('earNear'),
      earFar: part('earFar'),
      pupilA: part('pupilA'),
      pupilB: part('pupilB'),
      flames: Array.from(svg.querySelectorAll<SVGGElement>('[data-part="flame"]')),
    };

    const eyes: [Eye, Eye] = [
      { x: 0, y: 0, vx: 0, vy: 0 },
      { x: 0, y: 0, vx: 0, vy: 0 },
    ];
    let flameLen = 0.85;
    let px = -1;
    let py = -1;
    let ps = 1;
    let pvx = 0;
    let pvy = 0;
    let rot = 0;
    let flap = 0;
    let tail = 0;
    let legT = 0;
    let mood: Mood = 'smug';
    let moodSince = 0;
    let hidden = false;
    let costumeSig = '';

    const setMood = (m: Mood, now: number, force = false) => {
      if (m === mood) return;
      if (!force && now - moodSince < 0.35) return;
      mood = m;
      moodSince = now;
      svg.setAttribute('data-mood', m);
    };

    const unsub = subscribe((f) => {
      const st = store.get();
      const dt = Math.min(0.05, f.dt);
      const reduced = st.reduced;
      const spec = SECTIONS[f.idx] ?? SECTIONS[0];
      const pose = f.narrow ? spec.poseM : spec.pose;
      const size = BASE;

      // grounded: 0 on the mud, 1 once we've climbed a little
      const lift = clamp((f.max - f.y) / (f.vh * 0.16), 0, 1);
      const grounded = f.idx === 0 && lift < 0.02 && !st.falling;

      // ── position ──
      // short desktop windows (e.g. 1366×650) get a smaller pig; feet stay on the same line
      const vs = f.narrow ? 1 : clamp(f.vh / 880, 0.72, 1);
      const tx = pose.x * f.vw;
      const ty = pose.y * f.vh + (1 - vs) * size * pose.s * 0.3;
      if (px < 0) {
        px = tx;
        py = ty;
        ps = pose.s * vs;
      }
      const k = 1 - Math.exp(-dt * (st.falling ? 9 : 5));
      const nx = lerp(px, tx, k);
      const ny = lerp(py, ty, k);
      const ax = (nx - px) / dt - pvx;
      pvx = (nx - px) / dt;
      pvy = (ny - py) / dt;
      px = nx;
      py = ny;
      ps = lerp(ps, pose.s * vs, k);

      if (!!pose.hide !== hidden) {
        hidden = !!pose.hide;
        wrap.classList.toggle('is-hidden', hidden);
      }

      // ── mood ──
      let m: Mood = spec.mood;
      if (st.falling) m = st.chute ? 'realize' : 'panic';
      else if (st.landed && f.idx === 0) m = 'dizzy';
      else if (f.climb > 0.9) m = 'thrilled';
      else if (f.climb < -0.7) m = 'panic';
      else if (f.idx === SECTIONS.length - 1 && f.p > 0.6) m = 'realize';
      setMood(m, f.t, st.falling);

      // ── costume ──
      const c = costumeFor(f.idx, f.p, f.alt);
      const sig = `${c.wings}|${COSTUME_KEYS.map((key) => (c[key] ? 1 : 0)).join('')}`;
      if (sig !== costumeSig) {
        const first = costumeSig === '';
        costumeSig = sig;
        svg.setAttribute('data-wings', c.wings ?? 'feather');
        for (const key of COSTUME_KEYS) {
          if (c[key]) svg.setAttribute(`data-${key}`, '');
          else svg.removeAttribute(`data-${key}`);
        }
        if (!first && !st.falling) sound.pop();
      }

      // ── body motion ──
      const climb = f.climb;
      let targetRot = clamp(-climb * 9, -14, 16);
      if (grounded) targetRot = 0;
      if (st.falling && !st.chute) {
        rot += dt * 520;
      } else {
        if (Math.abs(rot) > 180) rot = ((rot % 360) + 540) % 360 - 180;
        const wobble = st.falling ? Math.sin(f.t * 3) * 8 : mood === 'panic' ? Math.sin(f.t * 22) * 6 : 0;
        rot = lerp(rot, targetRot + wobble, 1 - Math.exp(-dt * 6));
      }

      hopRef.current = Math.max(0, hopRef.current - dt * 3.2);
      const hop = Math.sin(hopRef.current * Math.PI) * 26 * (hopRef.current > 0 ? 1 : 0);
      const bobAmp = reduced ? 0 : 6 * lift;
      const bob = Math.sin(f.t * 1.9) * bobAmp - hop;
      const breathe = grounded && !reduced ? 1 + Math.sin(f.t * 2.2) * 0.012 : 1;

      wrap.style.transform = `translate3d(${(px - size / 2).toFixed(1)}px, ${(py - size / 2 + bob).toFixed(1)}px, 0) scale(${(ps * breathe).toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;

      const bub = bubbleRef.current;
      if (bub) {
        // The bubble hangs above his head. When that would push it into the fixed
        // chrome (top bar, the phone altimeter chip), it moves to his left, tail
        // pointing at him; only if that does not fit either does it go underneath.
        const { h, w, chrome } = bubbleBox.current;
        const above = py - size * ps * 0.62 + bob;
        const sideRight = px - size * ps * 0.38;
        const sideW = Math.min(w, 200, f.vw * 0.52);
        const at = above - h >= chrome + 8 ? 'above' : sideRight - sideW >= 12 ? 'side' : 'below';
        let bx: number;
        let by: number;
        if (at === 'side') {
          bx = sideRight;
          by = Math.max(py - size * ps * 0.15 + bob, chrome + 52);
        } else {
          bx = clamp(px + size * ps * 0.18, 12, f.vw - 230);
          by = at === 'above' ? above : py + size * ps * 0.36 + bob;
        }
        // a data attribute, not a class: React rewrites className whenever the line changes
        if (bub.dataset.at !== at) bub.dataset.at = at;
        bub.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`;
      }

      if (reduced) {
        P.wingNear.setAttribute('transform', 'rotate(-6)');
        P.wingFar.setAttribute('transform', 'rotate(-10)');
        return;
      }

      // ── wings ──
      let freq = 2.4 + clamp(Math.abs(climb) * 5, 0, 9);
      let amp = 26;
      if (mood === 'panic') {
        freq = 11;
        amp = 34;
      }
      if (grounded) {
        freq = 0.6;
        amp = 4;
      }
      if (st.falling && st.chute) {
        freq = 1.2;
        amp = 8;
      }
      flap += dt * freq * Math.PI * 2;
      const w = Math.sin(flap) * amp;
      P.wingNear.setAttribute('transform', `rotate(${(w + 2).toFixed(2)})`);
      P.wingFar.setAttribute('transform', `rotate(${(Math.sin(flap - 0.5) * amp * 0.85 - 4).toFixed(2)})`);

      // ── rocket boot flames: longer the harder we climb ──
      if (P.flames.length) {
        const want = st.falling ? 0.15 : grounded ? 0 : 0.85 + clamp(climb * 0.5, -0.3, 0.75);
        flameLen = lerp(flameLen, want, 1 - Math.exp(-dt * 8));
        const tf = `scaleY(${flameLen.toFixed(3)})`;
        for (const fl of P.flames) fl.style.transform = tf;
      }

      // ── tail propeller ──
      const rps = grounded ? 0 : 0.35 + clamp(climb * 3.5, 0, 7) + (mood === 'panic' ? 4 : 0);
      tail = (tail + dt * rps * 360) % 360;
      P.tail.setAttribute('transform', `rotate(${grounded ? Math.sin(f.t * 5) * 12 : tail.toFixed(1)} -10 8)`);

      // ── legs ──
      legT += dt * (mood === 'panic' ? 16 : 2.2);
      const flail = mood === 'panic' ? 34 : 0;
      const tuck = grounded ? 0 : 1;
      const dangle = Math.sin(legT) * (flail || 8 * tuck);
      P.legBF.setAttribute('transform', `rotate(${(22 * tuck + dangle).toFixed(1)})`);
      P.legBN.setAttribute('transform', `rotate(${(18 * tuck - dangle).toFixed(1)})`);
      P.legFF.setAttribute('transform', `rotate(${(-20 * tuck - dangle * 0.8).toFixed(1)})`);
      P.legFN.setAttribute('transform', `rotate(${(-26 * tuck + dangle).toFixed(1)})`);

      // ── ears ──
      const ear = clamp(climb * 14, -20, 30) + Math.sin(f.t * 9) * (2 + Math.abs(climb) * 3);
      P.earNear.setAttribute('transform', `rotate(${(-ear).toFixed(1)})`);
      P.earFar.setAttribute('transform', `rotate(${(-ear * 0.8).toFixed(1)})`);

      // ── googly eyes ──
      const rr = (rot * Math.PI) / 180;
      const g = 180;
      const inertia = clamp(f.accel * 52000, -2600, 2600);
      const bobAcc = Math.sin(f.t * 1.9) * bobAmp * 13;
      const gx = Math.sin(rr) * g - ax * 0.06;
      const gy = Math.cos(rr) * g + inertia + bobAcc - (hopRef.current > 0.7 ? 1400 : 0);
      stepEye(eyes[0], gx, gy, dt, 3.6);
      stepEye(eyes[1], gx * 1.08, gy * 0.94, dt, 3.8);
      P.pupilA.setAttribute('transform', `translate(${eyes[0].x.toFixed(2)} ${eyes[0].y.toFixed(2)})`);
      P.pupilB.setAttribute('transform', `translate(${eyes[1].x.toFixed(2)} ${eyes[1].y.toFixed(2)})`);
      void pvy;
    });
    return unsub;
  }, []);

  const poke = () => {
    if (store.get().falling) return;
    hopRef.current = 1;
    sound.oink(0.9 + Math.random() * 0.3);
    const quips = t.pig.quips;
    quipRef.current = (quipRef.current + 1 + Math.floor(Math.random() * (quips.length - 1))) % quips.length;
    store.set({ bubble: quips[quipRef.current] });
    window.clearTimeout((poke as unknown as { tm?: number }).tm);
    (poke as unknown as { tm?: number }).tm = window.setTimeout(() => store.set({ bubble: null }), 2200);
  };

  return (
    <>
      <div className="pig-actor" ref={wrapRef} style={{ width: BASE, height: BASE }}>
        <div className="pig-actor__body">
          <PigArt svgRef={svgRef} mood="smug" costume={{ wings: 'cardboard' }} wingLabel={t.ground.wingLabel} />
          <button className="pig-actor__hit" type="button" aria-label="Oink" onClick={poke} />
        </div>
      </div>
      <div className={`pig-bubble${bubble ? ' is-on' : ''}`} ref={bubbleRef} aria-live="polite">
        <span>{bubble}</span>
      </div>
    </>
  );
}
