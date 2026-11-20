import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { store } from '../engine/store';
import { fmt, type Personal } from '../engine/params';
import { sound } from '../engine/sound';
import { PigMark } from '../art/PigMark';
import './loader.css';

type Phase = 'run' | 'stuck' | 'push' | 'done' | 'lift' | 'gone';

// The "stuck at 99%" gag plays once per browser, not once per tab: returning
// readers get the quick version. Personal links (?to=…) always get the show.
const SEEN_KEY = 'makepigs.loader';

export function Loader({ personal }: { personal: Personal }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('run');
  const [pct, setPct] = useState(0);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);
  // read before anything is written, so a re-run effect still sees a first visit
  const [quick] = useState(() => {
    try {
      return localStorage.getItem(SEEN_KEY) === '1' && !personal.to;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    const reduced = store.get().reduced;
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

    const runTo = quick || reduced ? 100 : 99;
    const dur = quick || reduced ? 380 : 950;
    const start = performance.now();
    let raf = 0;
    const count = (now: number) => {
      const u = Math.min(1, Math.max(0, (now - start) / dur));
      setPct(Math.round(runTo * (1 - Math.pow(1 - u, 2.2))));
      if (u < 1) raf = requestAnimationFrame(count);
    };
    raf = requestAnimationFrame(count);

    if (quick || reduced) {
      at(dur + 120, () => lift());
    } else {
      at(1000, () => setPhase('stuck'));
      at(1900, () => setPhase('push'));
      at(2250, () => {
        setPct(100);
        setPhase('done');
        sound.oink(1.2);
      });
      at(2900, () => lift());
    }
    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach((x) => window.clearTimeout(x));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function lift() {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach((x) => window.clearTimeout(x));
    setPct(100);
    setPhase('lift');
    store.set({ booting: false });
    timers.current.push(window.setTimeout(() => setPhase('gone'), 900));
  }

  useEffect(() => {
    const onKey = () => lift();
    window.addEventListener('keydown', onKey, { once: true });
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'gone') return null;

  const msg =
    phase === 'run'
      ? personal.to
        ? fmt(t.loader.loadingFor, { to: personal.to })
        : t.loader.loading
      : phase === 'stuck'
        ? t.loader.eta
        : phase === 'push'
          ? t.loader.stuck
          : t.loader.done;

  return (
    <div className={`loader is-${phase}`} onClick={lift} role="status" aria-live="polite">
      <div className="loader__card">
        <p className="loader__brand">
          makepigs<span>.</span>fly
        </p>
        <p className="loader__msg">{msg}</p>
        <div className="loader__barwrap">
          <div className="loader__bar">
            <div className="loader__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="loader__pct">{pct}%</span>
          <div className="loader__snout" aria-hidden="true">
            <PigMark mood="happy" />
          </div>
        </div>
        <p className="loader__skip">{t.loader.skip}</p>
      </div>
    </div>
  );
}
