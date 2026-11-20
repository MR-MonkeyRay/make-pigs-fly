import { SECTIONS, altitudeAt } from './specs';

/**
 * One rAF loop drives everything that reacts to scrolling. It never touches
 * React state: it writes CSS custom properties on sections and hands a shared
 * `Frame` object to subscribers (pig, altimeter, sky, scene scripts).
 */

export interface Frame {
  t: number;
  /** seconds since last frame (clamped) */
  dt: number;
  y: number;
  vh: number;
  vw: number;
  max: number;
  /** smoothed climb speed in px/ms, positive = scrolling up = pig rising */
  climb: number;
  /** derivative of climb, px/ms² */
  accel: number;
  /** section under the viewport centre */
  idx: number;
  /** progress through that section, 0 = its bottom edge, 1 = its top edge */
  p: number;
  alt: number;
  /** 0 at the bottom of the page, 1 at the top */
  progress: number;
  narrow: boolean;
}

interface Sec {
  el: HTMLElement;
  top: number;
  h: number;
  q: number;
  pp: number;
  inview: boolean;
}

type Sub = (f: Frame) => void;
type SecSub = (q: number, pp: number, inview: boolean) => void;

export const frame: Frame = {
  t: 0,
  dt: 0.016,
  y: 0,
  vh: 800,
  vw: 1200,
  max: 0,
  climb: 0,
  accel: 0,
  idx: 0,
  p: 0,
  alt: 0,
  progress: 0,
  narrow: false,
};

const subs = new Set<Sub>();
const secSubs = new Map<number, Set<SecSub>>();
let secs: Sec[] = [];
let lastY = -1;
let lastT = 0;
let prevClimb = 0;
let raf = 0;
let started = false;
let locked = false;
let userMoved = false;
let measureQueued = false;
const measuredHooks = new Set<() => void>();

/** called after every re-measure (resize, fonts, layout shifts) */
export function onMeasured(fn: () => void): () => void {
  measuredHooks.add(fn);
  return () => measuredHooks.delete(fn);
}

/** read-only geometry of the sections in document coordinates */
export function getSections(): ReadonlyArray<{ top: number; h: number }> {
  return secs;
}

export function markUserMoved(): void {
  userMoved = true;
}

export function hasUserMoved(): boolean {
  return userMoved;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function subscribe(fn: Sub): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function subscribeSection(index: number, fn: SecSub): () => void {
  let set = secSubs.get(index);
  if (!set) {
    set = new Set();
    secSubs.set(index, set);
  }
  set.add(fn);
  const s = secs[index];
  if (s) fn(Math.max(0, s.q), Math.max(0, s.pp), s.inview);
  return () => set!.delete(fn);
}

export function measure(): void {
  const sy = window.scrollY;
  frame.vh = window.innerHeight;
  frame.vw = window.innerWidth;
  frame.narrow = frame.vw < 760 || frame.vw / frame.vh < 0.8;
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-sec]'));
  els.sort((a, b) => Number(a.dataset.sec) - Number(b.dataset.sec));
  secs = els.map((el) => {
    const r = el.getBoundingClientRect();
    const old = secs.find((s) => s.el === el);
    return { el, top: r.top + sy, h: r.height, q: old?.q ?? -1, pp: old?.pp ?? -1, inview: old?.inview ?? false };
  });
  frame.max = Math.max(0, document.documentElement.scrollHeight - frame.vh);
}

function queueMeasure() {
  if (measureQueued) return;
  measureQueued = true;
  requestAnimationFrame(() => {
    measureQueued = false;
    const atBottom = frame.max - window.scrollY < 4;
    measure();
    if (!locked && (!userMoved || atBottom)) scrollToBottom();
    measuredHooks.forEach((fn) => fn());
  });
}

export function maxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

export function scrollToBottom(): void {
  window.scrollTo({ top: maxScroll(), left: 0, behavior: 'instant' as ScrollBehavior });
}

/** align a section's bottom edge with the viewport bottom (its "start") */
export function sectionStartY(index: number): number {
  const s = secs[index];
  if (!s) return 0;
  if (index === 0) return maxScroll();
  return Math.max(0, Math.min(maxScroll(), s.top + s.h - frame.vh));
}

let sectionJumper: ((index: number) => void) | null = null;

/** the pager registers itself here so jumps animate like every other move */
export function setSectionJumper(fn: (index: number) => void): void {
  sectionJumper = fn;
}

export function scrollToSection(index: number): void {
  userMoved = true;
  if (sectionJumper) sectionJumper(index);
  else window.scrollTo({ top: sectionStartY(index), left: 0, behavior: 'instant' as ScrollBehavior });
}

export function setLocked(v: boolean): void {
  locked = v;
}

export function isLocked(): boolean {
  return locked;
}


function tick(t: number) {
  raf = requestAnimationFrame(tick);
  const y = window.scrollY;
  const dtMs = lastT ? Math.min(64, Math.max(1, t - lastT)) : 16;
  lastT = t;
  if (lastY < 0) lastY = y;
  const raw = (lastY - y) / dtMs;
  lastY = y;

  const k = Math.min(1, dtMs / 110);
  frame.climb += (raw - frame.climb) * k;
  if (Math.abs(frame.climb) < 1e-4) frame.climb = 0;
  frame.accel = (frame.climb - prevClimb) / dtMs;
  prevClimb = frame.climb;

  frame.t = t / 1000;
  frame.dt = dtMs / 1000;
  frame.y = y;
  frame.max = Math.max(1, document.documentElement.scrollHeight - frame.vh);
  frame.progress = clamp01(1 - y / frame.max);

  const vh = frame.vh;
  const cy = y + vh * 0.5;
  let idx = 0;
  for (let i = 0; i < secs.length; i++) {
    const s = secs[i];
    if (cy >= s.top && cy < s.top + s.h) {
      idx = i;
      break;
    }
    if (cy < s.top) idx = Math.max(idx, i);
  }
  const cur = secs[idx];
  frame.idx = idx;
  frame.p = cur ? clamp01((cur.top + cur.h - cy) / cur.h) : 0;
  frame.alt = altitudeAt(Math.min(idx, SECTIONS.length - 1), frame.p);

  for (let i = 0; i < secs.length; i++) {
    const s = secs[i];
    const near = s.top < y + vh * 1.6 && s.top + s.h > y - vh * 0.6;
    const inview = s.top < y + vh && s.top + s.h > y;
    if (inview !== s.inview) {
      s.inview = inview;
      if (inview) s.el.setAttribute('data-inview', '');
      else s.el.removeAttribute('data-inview');
    }
    if (!near) continue;
    const bottom = s.top + s.h;
    const q = clamp01((bottom - y) / (s.h + vh));
    const pp = s.h > vh + 2 ? clamp01((bottom - (y + vh)) / (s.h - vh)) : q;
    if (Math.abs(q - s.q) > 0.0004 || Math.abs(pp - s.pp) > 0.0004) {
      s.q = q;
      s.pp = pp;
      s.el.style.setProperty('--q', q.toFixed(4));
      s.el.style.setProperty('--pp', pp.toFixed(4));
    }
    const set = secSubs.get(i);
    if (set) set.forEach((fn) => fn(q, pp, inview));
  }
  for (let i = 0; i < secs.length; i++) {
    const on = i === idx;
    if (on !== secs[i].el.hasAttribute('data-active')) {
      if (on) secs[i].el.setAttribute('data-active', '');
      else secs[i].el.removeAttribute('data-active');
    }
  }

  subs.forEach((fn) => fn(frame));
}

export function startEngine(): () => void {
  if (started) return () => {};
  started = true;
  measure();

  const hash = decodeURIComponent(window.location.hash.replace('#', ''));
  const target = SECTIONS.findIndex((s) => s.id === hash);
  if (target > 0) {
    userMoved = true;
    window.scrollTo({ top: sectionStartY(target), behavior: 'instant' as ScrollBehavior });
  } else {
    scrollToBottom();
  }

  const ro = new ResizeObserver(queueMeasure);
  ro.observe(document.body);
  window.addEventListener('resize', queueMeasure);
  document.fonts?.ready.then(() => queueMeasure());

  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('resize', queueMeasure);
    started = false;
  };
}
