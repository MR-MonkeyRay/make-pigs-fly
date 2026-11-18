import '../../styles/ways.css';
import { h } from '../../lib/dom';
import { hashUrl, shareLink } from '../../lib/share';
import { t } from '../../i18n';
import { FLY_EVENT, type Mode, type ModeContext, type Route } from '../types';
import { createStage } from './stage';
import { methodNumber, SKIT_IDS, SKITS, skitById } from './registry';
import { loadUnlocked, unlock } from './progress';
import { nextSkitId } from './shuffle';

export function createMode(): Mode {
  let ctl: WaysControl | null = null;

  return {
    mount(ctx: ModeContext) {
      ctl = mountWays(ctx);
      const first = skitById(ctx.route.path[0]);
      if (first) ctl.play(first.id);
    },
    update(route: Route) {
      const skit = skitById(route.path[0]);
      if (skit) ctl?.play(skit.id);
      else ctl?.idle(); // e.g. Back to #/ways
      return true;
    },
  };
}

interface WaysControl {
  play(id: string): void;
  idle(): void;
}

function mountWays({ root, signal }: ModeContext): WaysControl {
  const stage = createStage(signal);
  let current: string | null = null;
  let token = 0;

  const progress = h('p', { class: 'ways-progress' });
  const randomBtn = h('button', { class: 'btn btn-primary', type: 'button', text: t('ways.random') });
  const label = h('p', { class: 'ways-method', 'aria-live': 'polite' });
  const replayBtn = h('button', { class: 'btn btn-small', type: 'button', text: t('ways.replay'), hidden: true });
  const shareBtn = h('button', { class: 'btn btn-small', type: 'button', text: t('ways.shareMethod'), hidden: true });
  const grid = h('ol', { class: 'ways-grid' });
  const allDone = h('p', { class: 'ways-done', hidden: true });

  root.append(
    h(
      'section',
      { class: 'ways' },
      h('header', { class: 'ways-head' }, h('h1', { text: t('ways.title') }), h('p', { class: 'ways-sub', text: t('ways.subtitle') }), progress),
      h('div', { class: 'ways-player card' }, stage.wrap, h('div', { class: 'ways-controls' }, randomBtn, label, h('div', { class: 'ways-row' }, replayBtn, shareBtn))),
      grid,
      allDone,
    ),
  );

  function renderGrid(): void {
    const focusedId = grid.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.skit : undefined;
    const unlocked = loadUnlocked(SKIT_IDS);
    progress.textContent = t('ways.unlocked', { n: unlocked.size, total: SKITS.length });
    allDone.hidden = unlocked.size < SKITS.length;
    allDone.textContent = t('ways.allDone', { total: SKITS.length });
    grid.replaceChildren(
      ...SKITS.map((skit) => {
        const open = unlocked.has(skit.id);
        const btn = h(
          'button',
          {
            class: `way-card${open ? '' : ' is-locked'}${skit.id === current ? ' is-current' : ''}`,
            type: 'button',
            'aria-disabled': open ? null : 'true',
            'data-skit': skit.id,
            title: open ? null : t('ways.lockedHint'),
          },
          h('span', { class: 'way-num', text: `#${methodNumber(skit.id)}` }),
          h('span', { class: 'way-name', text: open ? t(skit.nameKey) : t('ways.locked') }),
        );
        btn.addEventListener('click', () => (open ? go(skit.id) : randomBtn.focus()), { signal });
        return h('li', {}, btn);
      }),
    );
    if (focusedId) grid.querySelector<HTMLElement>(`[data-skit="${focusedId}"]`)?.focus({ preventScroll: true });
  }

  function idle(): void {
    token++;
    current = null;
    stage.reset();
    label.textContent = '';
    replayBtn.hidden = true;
    shareBtn.hidden = true;
    randomBtn.disabled = false;
    renderGrid();
  }

  /** Route through the hash so every method has a shareable deep link. */
  function go(id: string): void {
    const target = `#/ways/${id}`;
    if (window.location.hash === target) void playId(id);
    else window.location.hash = target;
  }

  async function playId(id: string): Promise<void> {
    const skit = skitById(id);
    if (!skit) return;
    const mine = ++token;
    current = id;
    unlock(id, SKIT_IDS);
    renderGrid();
    label.textContent = t('skit.method', { n: methodNumber(id), name: t(skit.nameKey) });
    replayBtn.hidden = true;
    shareBtn.hidden = true;
    randomBtn.disabled = true;
    stage.reset();
    await stage.play(skit);
    if (signal.aborted || mine !== token) return;
    randomBtn.disabled = false;
    replayBtn.hidden = false;
    shareBtn.hidden = false;
  }

  randomBtn.addEventListener('click', () => go(nextSkitId(SKIT_IDS, loadUnlocked(SKIT_IDS), current)), { signal });
  replayBtn.addEventListener('click', () => current && void playId(current), { signal });
  shareBtn.addEventListener(
    'click',
    () => {
      const skit = skitById(current);
      if (skit) void shareLink(hashUrl(`#/ways/${skit.id}`), t('skit.method', { n: methodNumber(skit.id), name: t(skit.nameKey) }));
    },
    { signal },
  );
  window.addEventListener(FLY_EVENT, () => go(nextSkitId(SKIT_IDS, loadUnlocked(SKIT_IDS), current)), { signal });

  renderGrid();
  return { play: (id) => void playId(id), idle };
}
