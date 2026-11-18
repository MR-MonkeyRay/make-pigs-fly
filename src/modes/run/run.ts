import '../../styles/run.css';
import { h } from '../../lib/dom';
import { load, save } from '../../lib/storage';
import { randomSeed } from '../../lib/rng';
import { hashUrl, shareLink } from '../../lib/share';
import { prefersReducedMotion } from '../../lib/motion';
import { loadPigImage } from '../../pig/pig';
import { num, t, type StringKey } from '../../i18n';
import { FLY_EVENT, type Mode, type ModeContext, type Route } from '../types';
import { Game, STEP, type GameState } from './game';
import { readPalette, Renderer } from './render';
import { parseChallenge, percentile } from './score';

// The game survives mode switches: leaving pauses it, coming back resumes where you were.
let shared: Game | null = null;

export function createMode(): Mode {
  let setChallenge: (n: number | null) => void = () => {};
  return {
    mount(ctx: ModeContext) {
      setChallenge = mountRun(ctx);
    },
    update(route: Route) {
      setChallenge(parseChallenge(route.query.get('s')));
      return true;
    },
    unmount() {
      shared?.pause();
    },
  };
}

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName));

function mountRun({ root, route, signal }: ModeContext): (n: number | null) => void {
  const game = (shared ??= new Game(randomSeed()));
  let best = Number(load('run.best')) || 0;
  let overAt = 0;
  let newBest = false;

  // ── DOM ─────────────────────────────────────────────────
  const canvas = h('canvas', { class: 'run-canvas', role: 'img', 'aria-label': t('run.canvasLabel') });
  const hudDist = h('span', { class: 'hud-pill hud-dist' });
  const hudBoost = h('span', { class: 'hud-pill hud-boost', text: t('run.boost'), hidden: true });
  const hudBest = h('span', { class: 'hud-pill hud-best' });
  const hud = h('div', { class: 'run-hud', 'aria-hidden': 'true' }, hudDist, hudBoost, hudBest);

  const challengeLine = h('p', { class: 'run-challenge', hidden: true });
  const startBtn = h('button', { class: 'btn btn-primary', type: 'button', text: t('run.start') });
  const ready = h(
    'div',
    { class: 'run-overlay' },
    h(
      'div',
      { class: 'run-panel card' },
      h('span', { class: 'run-badge', 'aria-hidden': 'true', text: 'SORTIE // READY FOR TAKEOFF' }),
      h('h2', { text: t('run.title') }),
      challengeLine,
      startBtn,
      h('p', { class: 'run-hint', text: t('run.controls') }),
    ),
  );

  const resumeBtn = h('button', { class: 'btn btn-primary', type: 'button', text: t('run.resume') });
  const paused = h(
    'div',
    { class: 'run-overlay' },
    h(
      'div',
      { class: 'run-panel card' },
      h('span', { class: 'run-badge', 'aria-hidden': 'true', text: 'HOLDING PATTERN // PAUSED' }),
      h('h2', { text: t('run.paused') }),
      resumeBtn,
    ),
  );

  const overCause = h('p', { class: 'run-cause' });
  const overDist = h('p', { class: 'run-distance' });
  const overPct = h('p', { class: 'run-pct' });
  const overBest = h('p', { class: 'run-newbest', text: t('run.over.newBest') });
  const againBtn = h('button', { class: 'btn btn-primary', type: 'button', text: t('run.again') });
  const challengeBtn = h('button', { class: 'btn btn-small btn-accent', type: 'button', text: t('run.challenge') });
  const over = h(
    'div',
    { class: 'run-overlay' },
    h(
      'div',
      { class: 'run-panel card' },
      h('span', { class: 'run-badge', 'aria-hidden': 'true', text: 'FLIGHT RECORDER // TELEMETRY' }),
      h('h2', { text: t('run.over.title') }),
      overCause,
      h('div', { class: 'run-score-box' }, overDist, overBest, overPct),
      h('div', { class: 'run-row' }, againBtn, challengeBtn),
    ),
  );

  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  const box = h('div', { class: 'run-box' }, canvas, hud, ready, paused, over);
  root.append(
    h(
      'section',
      { class: 'run' },
      h('h1', { class: 'visually-hidden', text: t('run.title') }),
      box,
      h('p', { class: 'run-controls', text: t('run.controls') }),
      live,
    ),
  );

  // ── Rendering ───────────────────────────────────────────
  const renderer = new Renderer(canvas);
  let palette = readPalette(box);
  loadPigImage(2)
    .then((img) => (renderer.pigImg = img))
    .catch(() => {});

  const resize = () => {
    const r = box.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) game.setWorldWidth(renderer.resize(r.width, r.height));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(box);
  resize();

  const refreshPalette = () => {
    palette = readPalette(box);
    renderer.invalidatePalette();
  };
  const mo = new MutationObserver(refreshPalette);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', refreshPalette, { signal });

  // ── State → overlays ────────────────────────────────────
  let shownState: GameState | null = null;
  let shownMeters = -1;

  function syncOverlays(): void {
    const s = game.state;
    ready.hidden = s !== 'ready';
    paused.hidden = s !== 'paused';
    over.hidden = s !== 'over';
    box.dataset.state = s;
    if (s === 'over') {
      const m = game.meters;
      overAt = performance.now();
      newBest = m > best;
      if (newBest) {
        best = m;
        save('run.best', String(best));
      }
      overCause.textContent = t(`run.cause.${game.cause ?? 'ground'}` as StringKey);
      overDist.textContent = t('run.over.distance', { d: num(m) });
      overPct.textContent = t('run.over.percentile', { p: percentile(m) });
      overBest.hidden = !newBest;
      live.textContent = `${t('run.over.title')} ${overDist.textContent}`;
      hudBest.textContent = t('run.best', { d: num(best) });
      againBtn.focus({ preventScroll: true });
    }
    shownState = s;
  }

  function syncHud(): void {
    const m = game.meters;
    if (m === shownMeters) return;
    shownMeters = m;
    hudDist.textContent = t('run.distance', { d: num(m) });
  }
  hudBest.textContent = t('run.best', { d: num(best) });

  // ── Loop ────────────────────────────────────────────────
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  const frame = (now: number) => {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      game.update(STEP);
      acc -= STEP;
    }
    renderer.draw(game, palette);
    syncHud();
    if (game.state !== shownState) syncOverlays();
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  signal.addEventListener('abort', () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    mo.disconnect();
  });

  // ── Input ───────────────────────────────────────────────
  function restart(): void {
    game.reset(randomSeed());
    game.press();
  }

  function act(): void {
    if (game.state === 'over') {
      if (performance.now() - overAt > 450) restart();
      return;
    }
    if (game.state === 'crashing') return;
    game.press();
  }

  window.addEventListener(
    'keydown',
    (e) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!e.repeat) act();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        game.dive = true;
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        game.togglePause();
      }
    },
    { signal },
  );
  window.addEventListener(
    'keyup',
    (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') game.dive = false;
    },
    { signal },
  );

  let downY = 0;
  let downT = 0;
  let pointer: number | null = null;
  let swiped = false;
  box.addEventListener(
    'pointerdown',
    (e) => {
      if ((e.target as Element).closest('button, a')) return;
      e.preventDefault();
      pointer = e.pointerId;
      game.dive = false;
      swiped = false;
      try {
        box.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      downY = e.clientY;
      downT = performance.now();
      act();
    },
    { signal },
  );
  box.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerId !== pointer || swiped) return;
      if (e.clientY - downY > 26 && performance.now() - downT < 350) {
        swiped = true;
        game.swipeDive(); // overrides the tap's flap and survives lifting the finger
        game.dive = true;
      }
    },
    { signal },
  );
  const lift = (e: PointerEvent) => {
    if (e.pointerId !== pointer) return;
    pointer = null;
    game.dive = false;
  };
  box.addEventListener('pointerup', lift, { signal });
  box.addEventListener('pointercancel', lift, { signal });
  box.addEventListener('lostpointercapture', lift, { signal });

  startBtn.addEventListener('click', () => game.press(), { signal });
  resumeBtn.addEventListener('click', () => game.press(), { signal });
  againBtn.addEventListener('click', restart, { signal });
  challengeBtn.addEventListener(
    'click',
    () => void shareLink(hashUrl(`#/run?s=${game.meters}`), t('run.shareText', { d: num(game.meters) })),
    { signal },
  );

  document.addEventListener('visibilitychange', () => document.hidden && game.pause(), { signal });
  window.addEventListener('blur', () => game.pause(), { signal });

  let boostTimer = 0;
  window.addEventListener(
    FLY_EVENT,
    () => {
      if (game.state === 'over' || game.state === 'crashing') restart();
      game.boost();
      hudBoost.hidden = false;
      window.clearTimeout(boostTimer);
      boostTimer = window.setTimeout(() => (hudBoost.hidden = true), 1800);
      if (!prefersReducedMotion()) {
        box.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'none' }], {
          duration: 200,
        });
      }
    },
    { signal },
  );

  // ── Challenge links ─────────────────────────────────────
  const setChallenge = (n: number | null) => {
    challengeLine.hidden = n === null;
    if (n !== null) challengeLine.textContent = t('run.challenged', { d: num(n) });
  };
  setChallenge(parseChallenge(route.query.get('s')));
  syncOverlays();
  return setChallenge;
}
