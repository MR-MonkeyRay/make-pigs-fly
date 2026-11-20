import { SECTIONS, SECTION_INDEX } from './specs';
import { frame, getSections, isLocked, markUserMoved, maxScroll, onMeasured, setSectionJumper } from './scroll';
import { store } from './store';

/**
 * Paged navigation. One wheel notch / trackpad flick / swipe / arrow key moves
 * exactly one "floor"; the page then glides there on its own (eased rAF tween).
 * Every scroll-linked animation keeps working because we still move the real
 * scroll position — we just decide where it stops.
 *
 * Direction follows the site's joke: scrolling UP (wheel up, finger dragging
 * down, ↑) climbs; the opposite descends.
 *
 * Autoplay: climbing into a section with a `play` spec hands the controls to
 * the page for a moment. It steps through that section's stops by itself, so
 * the scroll-driven scene plays like a short film, then cues the reader to keep
 * climbing. Any input from the reader takes over immediately.
 */

interface Stop {
  y: number;
  sec: number;
}

let stops: Stop[] = [];
let target = -1; // index of the stop we are travelling to / resting at
let busy = false;
let queued = 0;
let tweenRaf = 0;
let snapTimer = 0;
let lastProgrammatic = 0;
/** the running tween was started by autoplay (the reader may cut in) */
let autoTween = false;
/** section that is currently playing itself, -1 = none */
let playSec = -1;
let playTimer = 0;
let cueTimer = 0;
/** time-based scene animations still running, per section */
const holds = new Map<number, number>();

// wheel gesture tracking
let acc = 0;
let lastWheelT = 0;
let lastAbs = 0;
let cooling = false;

// touch tracking
let touchY0 = 0;
let touchX0 = 0;
let touchT0 = 0;
let touching = false;

const listeners = new Set<(i: number, n: number) => void>();

/** journey index changes (0 = mud … n-1 = deep space) */
export function onStop(fn: (i: number, n: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function computeStops(): void {
  const secs = getSections();
  const vh = frame.vh;
  const max = maxScroll();
  const out: Stop[] = [];
  secs.forEach((s, i) => {
    const spec = SECTIONS[i];
    if (!spec) return;
    const list = (frame.narrow ? spec.stopsM : undefined) ?? spec.stops;
    const yA = s.top + s.h - vh; // section bottom on viewport bottom
    const yB = s.top; // section top on viewport top
    for (const pp of list) {
      let y = s.h <= vh + 2 ? yB : yA - pp * (yA - yB);
      if (i === 0) y = max;
      y = Math.round(Math.max(0, Math.min(max, y)));
      const prev = out[out.length - 1];
      if (prev && Math.abs(prev.y - y) < 12) continue;
      out.push({ y, sec: i });
    }
  });
  stops = out;
}

function nearest(y: number): number {
  let best = 0;
  let bd = Infinity;
  stops.forEach((s, i) => {
    const d = Math.abs(s.y - y);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

function emit() {
  listeners.forEach((fn) => fn(target, stops.length));
}

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
/** autoplay glides: slower and softer, like a camera dolly */
const easeSoft = (u: number) => (1 - Math.cos(Math.PI * u)) / 2;

interface TweenOpts {
  instant?: boolean;
  /** started by autoplay: keep playing on arrival */
  auto?: boolean;
  /** a climb by the reader: arriving at a section's first stop starts its autoplay */
  play?: boolean;
  dur?: number;
}

function tweenTo(index: number, opts: TweenOpts = {}) {
  if (!stops.length) computeStops();
  index = Math.max(0, Math.min(stops.length - 1, index));
  target = index;
  emit();
  hideCue();
  const y1 = stops[index].y;
  const y0 = window.scrollY;
  cancelAnimationFrame(tweenRaf);
  lastProgrammatic = performance.now();
  const dist = Math.abs(y1 - y0);
  if (opts.instant || store.get().reduced || dist < 2) {
    window.scrollTo({ top: y1, left: 0, behavior: 'instant' as ScrollBehavior });
    busy = false;
    autoTween = false;
    cooling = true;
    settle(index, opts);
    return;
  }
  busy = true;
  autoTween = !!opts.auto;
  // ~1 s for one screen, longer jumps stretch but stay snappy
  const dur = opts.dur ?? Math.min(2200, 620 + Math.sqrt(dist) * 16);
  const curve = opts.auto ? easeSoft : ease;
  const t0 = performance.now();
  const step = (now: number) => {
    const u = Math.min(1, (now - t0) / dur);
    lastProgrammatic = now;
    window.scrollTo({ top: Math.round(y0 + (y1 - y0) * curve(u)), left: 0, behavior: 'instant' as ScrollBehavior });
    if (u < 1) {
      tweenRaf = requestAnimationFrame(step);
      return;
    }
    busy = false;
    autoTween = false;
    cooling = true;
    if (queued) {
      const q = queued;
      queued = 0;
      go(q);
      return;
    }
    settle(index, opts);
  };
  tweenRaf = requestAnimationFrame(step);
}

// ───────────────────────── autoplay ─────────────────────────

/**
 * A time-based scene animation (typewriter, split-flap…) has started in this
 * section. Autoplay won't move on, and the "keep climbing" cue won't show,
 * until every hold is released. Returns the release function.
 */
export function holdPlayback(id: string): () => void {
  const sec = SECTION_INDEX[id];
  holds.set(sec, (holds.get(sec) ?? 0) + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds.set(sec, Math.max(0, (holds.get(sec) ?? 1) - 1));
  };
}

const held = (sec: number) => (holds.get(sec) ?? 0) > 0;
const firstOfSection = (i: number) => i === 0 || stops[i - 1].sec !== stops[i].sec;
const lastOfSection = (i: number) => i === stops.length - 1 || stops[i + 1].sec !== stops[i].sec;

function settle(index: number, opts: TweenOpts) {
  if (opts.auto && playSec >= 0) {
    playStep();
    return;
  }
  if (opts.play && startPlay(index)) return;
  scheduleCue();
}

function startPlay(i: number): boolean {
  const s = stops[i];
  const spec = s && SECTIONS[s.sec]?.play;
  if (!spec || !firstOfSection(i) || store.get().reduced || isLocked()) return false;
  playSec = s.sec;
  store.set({ playing: true });
  playStep();
  return true;
}

/** linger on the current stop, then glide to the next one (or finish) */
function playStep() {
  const sec = playSec;
  const spec = SECTIONS[sec]?.play;
  if (!spec) return;
  const t0 = performance.now();
  window.clearTimeout(playTimer);
  const tick = () => {
    if (playSec !== sec) return;
    const i = target;
    if (isLocked() || store.get().falling || stops[i]?.sec !== sec) {
      stopPlay();
      return;
    }
    const last = lastOfSection(i);
    const linger = last ? Math.min(900, spec.hold) : spec.hold;
    if (performance.now() - t0 < linger || held(sec)) {
      playTimer = window.setTimeout(tick, 120);
      return;
    }
    if (last) {
      stopPlay();
      scheduleCue(0);
      return;
    }
    const dist = Math.abs(stops[i + 1].y - window.scrollY);
    tweenTo(i + 1, { auto: true, dur: Math.min(4200, Math.max(800, dist / spec.speed)) });
  };
  playTimer = window.setTimeout(tick, 120);
}

function stopPlay() {
  window.clearTimeout(playTimer);
  if (playSec < 0) return;
  playSec = -1;
  store.set({ playing: false });
}

/** the reader takes the controls back: freeze an autoplay glide where it is */
export function stopAutoplay(): void {
  if (busy && autoTween) {
    cancelAnimationFrame(tweenRaf);
    busy = false;
    autoTween = false;
  }
  if (playSec >= 0) {
    stopPlay();
    scheduleCue();
  }
}

function hideCue() {
  window.clearTimeout(cueTimer);
  if (store.get().cue) store.set({ cue: false });
}

/** once the page is at rest and the scene has finished, cue the next climb */
function scheduleCue(delay = 500) {
  window.clearTimeout(cueTimer);
  const t0 = performance.now();
  const check = () => {
    if (busy || playSec >= 0) return;
    const s = stops[target];
    if (!s) return;
    const st = store.get();
    if (isLocked() || st.booting || st.falling || held(s.sec) || performance.now() - t0 < delay) {
      cueTimer = window.setTimeout(check, 150);
      return;
    }
    // the mud has its own big hint; the top of the sky has nowhere left to go
    const show = s.sec > 0 && target < stops.length - 1;
    if (st.cue !== show) store.set({ cue: show });
  };
  cueTimer = window.setTimeout(check, 60);
}

/** +1 = climb one floor, -1 = descend one floor */
export function go(dir: 1 | -1 | number): void {
  if (isLocked() || store.get().booting) return;
  markUserMoved();
  stopAutoplay();
  if (busy) {
    queued = dir > 0 ? 1 : -1;
    return;
  }
  if (!stops.length) computeStops();
  const y = window.scrollY;
  let i = nearest(y);
  const off = y - stops[i].y; // >0 means we are below stop i
  // stops are ordered bottom → top, so climbing (smaller y) means a higher index.
  // If we are resting between floors, the nearest one in that direction counts.
  if (dir > 0) {
    const next = off > 6 ? i : i + 1;
    tweenTo(Math.min(stops.length - 1, next), { play: true });
  } else {
    const next = off < -6 ? i : i - 1;
    tweenTo(Math.max(0, next));
  }
}

export function goToSection(sec: number): void {
  if (isLocked()) return;
  if (!stops.length) computeStops();
  const i = stops.findIndex((s) => s.sec === sec);
  if (i >= 0) {
    markUserMoved();
    stopAutoplay();
    queued = 0;
    tweenTo(i, { play: true });
  }
}

export function goToEnd(top: boolean): void {
  if (isLocked()) return;
  markUserMoved();
  stopAutoplay();
  tweenTo(top ? stops.length - 1 : 0);
}

/** after the fall director (or anything else) moves the page itself */
export function resync(): void {
  if (!stops.length) computeStops();
  stopPlay();
  target = nearest(window.scrollY);
  emit();
  scheduleCue();
}

// ───────────────────────── input ─────────────────────────

function wheelPx(e: WheelEvent): number {
  if (e.deltaMode === 1) return e.deltaY * 16;
  if (e.deltaMode === 2) return e.deltaY * frame.vh;
  return e.deltaY;
}

/** popovers (language menu) keep their own native scrolling */
function ownScroll(t: EventTarget | null): boolean {
  return t instanceof Element && !!t.closest('[data-own-scroll]');
}

function onWheel(e: WheelEvent) {
  if (e.ctrlKey) return; // pinch-zoom on trackpads
  if (ownScroll(e.target)) return;
  e.preventDefault();
  if (isLocked() || store.get().booting) return;
  const now = performance.now();
  const d = wheelPx(e);
  const abs = Math.abs(d);
  const gap = now - lastWheelT;
  lastWheelT = now;
  if (abs < 0.5) return;

  // a fresh gesture: a pause, or a clear burst on top of a decaying inertia tail
  const fresh = gap > 160 || abs > lastAbs * 1.6 + 6;
  lastAbs = abs;

  if (busy) {
    // a fresh flick cuts into an autoplay glide right away; during the
    // reader's own glide it is queued as the next move
    if (fresh) {
      if (autoTween) go(d < 0 ? 1 : -1);
      else queued = d < 0 ? 1 : -1;
    }
    return;
  }
  if (cooling && !fresh) return; // swallow the momentum tail of the last flick
  cooling = false;
  if (gap > 260) acc = 0;
  acc += d;
  if (Math.abs(acc) >= 14) {
    const dir = acc < 0 ? 1 : -1;
    acc = 0;
    go(dir);
  }
}

const KEYS_UP = new Set(['ArrowUp', 'PageUp']);
const KEYS_DOWN = new Set(['ArrowDown', 'PageDown']);

function editable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || !!el.closest('[data-own-keys]');
}

function onKey(e: KeyboardEvent) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (editable(e.target)) return;
  let dir = 0;
  if (KEYS_UP.has(e.key)) dir = 1;
  else if (KEYS_DOWN.has(e.key)) dir = -1;
  else if (e.key === ' ') {
    if (e.target instanceof HTMLElement && /^(BUTTON|A)$/.test(e.target.tagName)) return;
    dir = e.shiftKey ? -1 : 1;
  } else if (e.key === 'Home' || e.key === 'End') {
    e.preventDefault();
    goToEnd(e.key === 'Home');
    return;
  } else return;
  e.preventDefault();
  if (e.repeat && busy) return;
  go(dir);
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1 || ownScroll(e.target)) {
    touching = false;
    return;
  }
  touching = true;
  touchY0 = e.touches[0].clientY;
  touchX0 = e.touches[0].clientX;
  touchT0 = performance.now();
}

function onTouchMove(e: TouchEvent) {
  // single-finger drags never scroll natively; pinch-zoom still works
  if (ownScroll(e.target)) return;
  if (e.touches.length === 1 && e.cancelable) e.preventDefault();
}

function onTouchEnd(e: TouchEvent) {
  if (!touching) return;
  touching = false;
  const t = e.changedTouches[0];
  if (!t) return;
  const dy = t.clientY - touchY0;
  const dx = t.clientX - touchX0;
  const dt = performance.now() - touchT0;
  if (Math.abs(dy) < 28 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
  if (dt > 1200 && Math.abs(dy) < 80) return;
  // finger moves DOWN → content moves down → we climb
  go(dy > 0 ? 1 : -1);
}

/** native scrolls we did not cause (scrollbar drag, find-in-page, focus): settle on the nearest floor */
function onScroll() {
  if (busy || isLocked()) return;
  if (performance.now() - lastProgrammatic < 120) return;
  window.clearTimeout(snapTimer);
  snapTimer = window.setTimeout(() => {
    if (busy || isLocked() || touching) return;
    if (editable(document.activeElement)) return;
    stopAutoplay();
    const i = nearest(window.scrollY);
    if (Math.abs(stops[i].y - window.scrollY) > 2) tweenTo(i);
    else {
      target = i;
      emit();
    }
  }, 220);
}

export function startPager(): () => void {
  computeStops();
  target = nearest(window.scrollY);
  setSectionJumper(goToSection);
  const offMeasured = onMeasured(() => {
    const was = target;
    computeStops();
    if (busy || isLocked()) return;
    // the stop list may have changed shape (phone ↔ desktop): don't play on from a stale floor
    if (playSec >= 0 && stops[was]?.sec !== playSec) stopPlay();
    // keep the reader on the same floor after a resize / reflow
    if (was >= 0 && was < stops.length) tweenTo(was, { instant: true });
    else resync();
  });
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  emit();
  scheduleCue();
  return () => {
    offMeasured();
    cancelAnimationFrame(tweenRaf);
    stopPlay();
    window.clearTimeout(cueTimer);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('scroll', onScroll);
  };
}
