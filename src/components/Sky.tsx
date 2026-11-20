import { useEffect, useRef, useState } from 'react';
import { subscribe } from '../engine/scroll';
import { onStop, stopAutoplay } from '../engine/pager';
import { PHOTOS, currentPhoto, photoOpacity, photoUrl } from '../engine/photos';
import { useI18n } from '../i18n';
import './sky.css';

/** [altitude m, top colour, bottom colour] — printed paper turning into night */
const STOPS: [number, string, string][] = [
  [0, '#cfe6ef', '#f4eedf'],
  [150, '#a9d6ee', '#e6f1ee'],
  [1500, '#7cc3ea', '#d3ebf3'],
  [8000, '#4a9ad6', '#a8d4ef'],
  [25000, '#22569f', '#5a92cc'],
  [90000, '#14215c', '#2a4583'],
  [600000, '#0c1238', '#141d4c'],
  [5e8, '#080a1e', '#0b0e26'],
];

const U = STOPS.map(([a]) => Math.log10(1 + a));

export function Sky() {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const photos = useRef<(HTMLDivElement | null)[]>([]);
  const stars = useRef<HTMLCanvasElement>(null);
  const dots = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = stars.current!;
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const c = cv.getContext('2d');
      if (!c) return;
      c.scale(dpr, dpr);
      let seed = 1337;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const n = Math.round((w * h) / 2600);
      for (let i = 0; i < n; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const r = rnd() < 0.08 ? 1.6 + rnd() * 1.2 : 0.5 + rnd() * 0.9;
        const pick = rnd();
        c.fillStyle = pick < 0.1 ? '#ff9fd0' : pick < 0.18 ? '#ffe800' : '#f4eedf';
        c.globalAlpha = 0.45 + rnd() * 0.55;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
      }
    };
    draw();
    window.addEventListener('resize', draw);

    // photos load only once the reader asks for a real view (then the neighbours too)
    const root = document.documentElement;
    const loaded: boolean[] = [];
    const load = (i: number) => {
      if (loaded[i] || i < 0 || i >= PHOTOS.length) return;
      const wrap = photos.current[i];
      const img = wrap?.querySelector('img');
      if (!wrap || !img) return;
      loaded[i] = true;
      img.onload = () => wrap.classList.add('is-ready');
      img.src = photoUrl(PHOTOS[i].name);
    };

    const last: number[] = [];
    const lastPh: number[] = [];
    const op: number[] = [];
    let lastStar = -1;
    const unsub = subscribe((f) => {
      const u = Math.log10(1 + f.alt);
      for (let j = 1; j < STOPS.length; j++) {
        const o = Math.min(1, Math.max(0, (u - U[j - 1]) / (U[j] - U[j - 1])));
        const r = Math.round(o * 200) / 200;
        if (last[j] !== r) {
          last[j] = r;
          const el = layers.current[j];
          if (el) el.style.opacity = String(r);
        }
      }

      const x = f.idx + f.p;
      photoOpacity(x, op);
      const gazing = root.classList.contains('is-gazing');
      let cover = 0;
      for (let i = 0; i < PHOTOS.length; i++) {
        if (gazing && Math.abs(x - PHOTOS[i].sec) < 1.6) load(i);
        const r = Math.round(op[i] * 100) / 100;
        if (gazing) cover = Math.max(cover, r);
        if (lastPh[i] !== r) {
          lastPh[i] = r;
          const el = photos.current[i];
          if (el) {
            el.style.opacity = String(r);
            el.style.visibility = r > 0 ? 'visible' : 'hidden';
          }
        }
      }

      const s = Math.min(1, Math.max(0, (u - 4.2) / (5.2 - 4.2)));
      const sr = Math.round(s * (1 - cover * 0.55) * 100) / 100;
      if (sr !== lastStar) {
        lastStar = sr;
        cv.style.opacity = String(sr);
        if (dots.current) dots.current.style.opacity = String(Math.max(0, 1 - s - cover));
      }
    });
    return () => {
      unsub();
      window.removeEventListener('resize', draw);
    };
  }, []);

  return (
    <div className="sky" aria-hidden="true">
      {STOPS.map(([, top, bottom], i) => (
        <div
          key={i}
          className="sky__layer"
          ref={(el) => {
            layers.current[i] = el;
          }}
          style={{ background: `linear-gradient(to bottom, ${top}, ${bottom})`, opacity: i === 0 ? 1 : 0 }}
        />
      ))}
      <div className="sky__dots" ref={dots} />
      <canvas className="sky__stars" ref={stars} style={{ opacity: 0 }} />
      <div className="sky__photos">
      {PHOTOS.map((ph, i) => (
        <div
          key={ph.name}
          className={`sky__photo sky__photo--${ph.tone}`}
          ref={(el) => {
            photos.current[i] = el;
          }}
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <img alt="" decoding="async" style={ph.pos ? { objectPosition: ph.pos } : undefined} />
        </div>
      ))}
      </div>
    </div>
  );
}

/** "Real view" button: hides the words and shows a real photo taken from about this high. */
export function SkyCaption() {
  const { t } = useI18n();
  const [cur, setCur] = useState(-1);
  const [gaze, setGaze] = useState(false);

  useEffect(() => {
    const op: number[] = [];
    let was = -1;
    const unsub = subscribe((f) => {
      const c = currentPhoto(photoOpacity(f.idx + f.p, op));
      if (c !== was) {
        was = c;
        setCur(c);
      }
    });
    // any trip to another floor brings the words back
    const offStop = onStop(() => setGaze(false));
    return () => {
      unsub();
      offStop();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-gazing', gaze);
    if (!gaze) return;
    // looking at the photo: autoplay must not glide away from it
    stopAutoplay();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGaze(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gaze]);

  const ph = cur >= 0 ? PHOTOS[cur] : null;
  // warm the cache on hover so the reveal is instant
  const preload = () => {
    if (ph) new Image().src = photoUrl(ph.name);
  };

  return (
    <aside className={`skycap${ph ? ' is-on' : ''}${gaze ? ' is-gazing' : ''}`} aria-hidden={ph ? undefined : true}>
      {ph && (
        <>
          <button
            type="button"
            className="skycap__btn"
            aria-pressed={gaze}
            title={gaze ? t.ui.gazeOff : t.ui.gaze}
            onPointerEnter={preload}
            onFocus={preload}
            onClick={() => setGaze((g) => !g)}
          >
            <span className="skycap__eye" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18">
                {gaze ? (
                  <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <>
                    <rect x="2.5" y="6" width="19" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 6 L9.5 3.5 H14.5 L16 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
                  </>
                )}
              </svg>
            </span>
            <span className="skycap__label">{gaze ? t.ui.gazeOff : t.ui.realView}</span>
          </button>
          {gaze && (
            <span className="skycap__meta" key={ph.name}>
              <a className="skycap__place" href={ph.url} target="_blank" rel="noopener noreferrer">
                {ph.place}
              </a>
              <span className="skycap__by">
                {t.ui.photo}: {ph.by} · {ph.license}
              </span>
            </span>
          )}
        </>
      )}
    </aside>
  );
}
