import { maxScroll, scrollToBottom, setLocked } from './scroll';
import { resync } from './pager';
import { store } from './store';
import { sound } from './sound';

/**
 * "Bring him home": the page free-falls to the mud. Quadratic ease-in for the
 * plunge, a jolt when the underpants open, then a soft cubic ease-out landing.
 */
export function bringHome(landedLine: string): Promise<void> {
  const st = store.get();
  if (st.falling) return Promise.resolve();
  const root = document.documentElement;

  const land = () => {
    root.classList.remove('is-falling');
    setLocked(false);
    resync();
    store.set({ falling: false, chute: false, landed: true, muddy: true, say: null, bubble: landedLine });
    sound.splat();
    window.setTimeout(() => {
      if (store.get().bubble === landedLine) store.set({ bubble: null });
    }, 2600);
  };

  store.set({ falling: true, chute: false, say: null, bubble: null, landed: false });
  root.classList.add('is-falling');
  setLocked(true);

  if (st.reduced) {
    scrollToBottom();
    land();
    return Promise.resolve();
  }

  sound.whoosh(2.5);
  const y0 = window.scrollY;
  const D = maxScroll() - y0;
  const T1 = 2500;
  const T2 = 1400;
  const FRAC = 0.94;
  const start = performance.now();
  let chuted = false;

  return new Promise((resolve) => {
    const step = (now: number) => {
      const t = now - start;
      let s: number;
      if (t < T1) {
        const u = t / T1;
        s = FRAC * u * u;
      } else {
        if (!chuted) {
          chuted = true;
          store.set({ chute: true });
          root.classList.add('is-chute');
          sound.pop();
        }
        const u = Math.min(1, (t - T1) / T2);
        s = FRAC + (1 - FRAC) * (1 - Math.pow(1 - u, 3));
      }
      const target = Math.round(y0 + (maxScroll() - y0) * s);
      window.scrollTo({ top: target, left: 0, behavior: 'instant' as ScrollBehavior });
      if (t < T1 + T2) {
        requestAnimationFrame(step);
      } else {
        root.classList.remove('is-chute');
        scrollToBottom();
        land();
        resolve();
      }
    };
    void D;
    requestAnimationFrame(step);
  });
}
