import { useEffect, useMemo, useState } from 'react';
import { PigArt } from '../art/PigArt';
import { store, useStore } from '../engine/store';
import { sound } from '../engine/sound';
import { useI18n } from '../i18n';
import './fx.css';

/** speed lines + scream while falling */
export function FallFx() {
  const { t } = useI18n();
  const falling = useStore((s) => s.falling);
  return (
    <div className={`fallfx${falling ? ' is-on' : ''}`} aria-hidden="true">
      <div className="fallfx__lines" />
      <div className="fallfx__scream">{t.space.scream}</div>
    </div>
  );
}

const BLOBS = [
  'M50 8 C70 4 92 18 88 40 C96 52 90 74 70 78 C58 96 30 92 24 76 C6 72 2 50 14 38 C10 20 32 4 50 8 Z',
  'M40 6 C60 0 84 12 80 34 C96 44 88 70 64 70 C52 88 22 84 18 66 C2 58 6 30 22 24 C24 12 30 8 40 6 Z',
  'M52 12 C66 6 86 20 82 36 C92 56 74 82 52 76 C34 90 10 74 16 54 C4 38 18 14 38 18 Z',
];

/** mud splatter on landing, then it slowly slides down the glass */
export function Splat() {
  const landed = useStore((s) => s.landed);
  const reduced = useStore((s) => s.reduced);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (landed) setRun((r) => r + 1);
  }, [landed]);

  const blobs = useMemo(() => {
    let seed = 7 + run * 31;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 11 }, (_, i) => ({
      x: rnd() * 100,
      y: 8 + rnd() * 78,
      s: 50 + rnd() * 120,
      r: rnd() * 360,
      d: i * 28 + rnd() * 60,
      p: BLOBS[i % BLOBS.length],
      drip: 30 + rnd() * 90,
    }));
  }, [run]);

  if (!run || reduced) return null;
  return (
    <div className="splat" key={run} aria-hidden="true">
      {blobs.map((b, i) => (
        <svg
          key={i}
          className="splat__blob"
          viewBox="0 0 100 100"
          style={
            {
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.s,
              height: b.s,
              '--r': `${b.r}deg`,
              '--d': `${b.d}ms`,
              '--drip': `${b.drip}px`,
            } as React.CSSProperties
          }
        >
          <path d={b.p} fill="#925f52" opacity="0.92" />
          <path d={b.p} fill="#6e4338" transform="translate(58 58) scale(0.35)" opacity="0.8" />
          <circle cx="78" cy="18" r="6" fill="#925f52" />
          <circle cx="16" cy="86" r="4" fill="#925f52" />
        </svg>
      ))}
    </div>
  );
}

/** easter egg: type "oink" (or triple-click the logo) → a V of pigs migrates past */
export function Flock() {
  const flock = useStore((s) => s.flock);
  const reduced = useStore((s) => s.reduced);

  useEffect(() => {
    let buf = '';
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === 'oink') {
        buf = '';
        store.set({ flock: Date.now() });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!flock) return;
    sound.oink(1.3);
    const a = window.setTimeout(() => sound.oink(1.1), 300);
    const b = window.setTimeout(() => sound.oink(1.5), 520);
    const c = window.setTimeout(() => store.set({ flock: 0 }), 7200);
    return () => [a, b, c].forEach((x) => window.clearTimeout(x));
  }, [flock]);

  if (!flock || reduced) return null;
  const v = [
    [0, 0],
    [-1, -1],
    [-1, 1],
    [-2, -2],
    [-2, 2],
    [-3, -3],
    [-3, 3],
  ];
  return (
    <div className="flock" key={flock} aria-hidden="true">
      {v.map(([dx, dy], i) => (
        <div key={i} className="flock__pig" style={{ '--dx': dx, '--dy': dy, '--i': i } as React.CSSProperties}>
          <PigArt auto mood="thrilled" costume={{ wings: 'feather', scarf: i === 0, goggles: true }} />
        </div>
      ))}
    </div>
  );
}

/** change the tab title when the visitor leaves */
export function TabTitle() {
  const { t } = useI18n();
  useEffect(() => {
    let timer = 0;
    const onVis = () => {
      window.clearTimeout(timer);
      if (document.hidden) {
        document.title = t.ui.tabAway;
      } else {
        document.title = t.ui.tabBack;
        timer = window.setTimeout(() => (document.title = t.meta.title), 2200);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.clearTimeout(timer);
    };
  }, [t]);
  return null;
}
