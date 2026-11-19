import '../../styles/ways.css';
import { fromMarkup, h } from '../../lib/dom';
import { hashUrl, shareLink } from '../../lib/share';
import { burstConfetti } from '../../lib/confetti';
import { playClick, playFanfare } from '../../lib/sound';
import { t } from '../../i18n';
import { FLY_EVENT, type Mode, type ModeContext, type Route } from '../types';
import { createStage } from './stage';
import { methodNumber, SKIT_IDS, SKITS, skitById } from './registry';
import { loadUnlocked, unlock } from './progress';
import { nextSkitId } from './shuffle';

const SKIT_ICONS: Record<string, string> = {
  'hype-fan': `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 12c-2-4 1-7 3.5-5S14 11 12 12z"/><path d="M12 12c4-1 5.5 2.5 2.5 4.5S11 14 12 12z"/><path d="M12 12c-2 4-5.5 3.5-5.5 0S10 10 12 12z"/></svg>`,
  'paperwork-wings': `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>`,
  'ground-falls': `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="17" r="4"/><path d="M6 10l4 4M18 10l-4 4"/></svg>`,
  'mock-pig': `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 10l3 2.5L8 15M13 15h3"/></svg>`,
  'impossible-idiom': `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg>`,
  'pudding-ballast': `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="9" rx="5.5" ry="6.5"/><path d="M12 15.5V21M9.5 15.5L12 18l2.5-2.5"/></svg>`,
};

const LOCK_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

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
  const meterFill = h('div', { class: 'ways-meter-fill' });
  const meter = h('div', { class: 'ways-meter', 'aria-hidden': 'true' }, meterFill);
  const progressWrap = h('div', { class: 'ways-progress-wrap' }, progress, meter);

  const randomBtn = h('button', { class: 'btn btn-primary', type: 'button', text: t('ways.random') });
  const label = h('p', { class: 'ways-method', 'aria-live': 'polite' });
  const replayBtn = h('button', { class: 'btn btn-small', type: 'button', text: t('ways.replay'), hidden: true });
  const shareBtn = h('button', { class: 'btn btn-small btn-accent', type: 'button', text: t('ways.shareMethod'), hidden: true });
  const grid = h('ol', { class: 'ways-grid' });
  const allDone = h('p', { class: 'ways-done', hidden: true });

  root.append(
    h(
      'section',
      { class: 'ways' },
      h(
        'header',
        { class: 'ways-head' },
        h('h1', { text: t('ways.title') }),
        h('p', { class: 'ways-sub', text: t('ways.subtitle') }),
        progressWrap,
      ),
      h(
        'div',
        { class: 'ways-player card' },
        stage.wrap,
        h('div', { class: 'ways-controls' }, randomBtn, label, h('div', { class: 'ways-row' }, replayBtn, shareBtn)),
      ),
      grid,
      allDone,
    ),
  );

  function renderGrid(): void {
    const focusedId = grid.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.skit : undefined;
    const unlocked = loadUnlocked(SKIT_IDS);
    const pct = Math.round((unlocked.size / SKITS.length) * 100);
    progress.textContent = t('ways.unlocked', { n: unlocked.size, total: SKITS.length });
    meterFill.style.width = `${pct}%`;
    allDone.hidden = unlocked.size < SKITS.length;
    allDone.textContent = t('ways.allDone', { total: SKITS.length });
    grid.replaceChildren(
      ...SKITS.map((skit) => {
        const open = unlocked.has(skit.id);
        const iconSvg = open ? (SKIT_ICONS[skit.id] ?? LOCK_ICON) : LOCK_ICON;
        const btn = h(
          'button',
          {
            class: `way-card${open ? '' : ' is-locked'}${skit.id === current ? ' is-current' : ''}`,
            type: 'button',
            'aria-disabled': open ? null : 'true',
            'data-skit': skit.id,
            title: open ? null : t('ways.lockedHint'),
          },
          h(
            'span',
            { class: 'way-card-top' },
            h('span', { class: 'way-num', text: `#${methodNumber(skit.id)}` }),
            h('span', { class: 'way-icon', 'aria-hidden': 'true' }, fromMarkup(iconSvg)),
          ),
          h('span', { class: 'way-name', text: open ? t(skit.nameKey) : t('ways.locked') }),
        );
        btn.addEventListener(
          'click',
          () => {
            playClick();
            if (open) go(skit.id);
            else randomBtn.focus();
          },
          { signal },
        );
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
    label.classList.remove('is-visible');
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
    const wasUnlocked = loadUnlocked(SKIT_IDS).has(id);
    current = id;
    const unlockedAfter = unlock(id, SKIT_IDS);
    renderGrid();
    label.textContent = t('skit.method', { n: methodNumber(id), name: t(skit.nameKey) });
    label.classList.add('is-visible');
    replayBtn.hidden = true;
    shareBtn.hidden = true;
    randomBtn.disabled = true;
    stage.reset();
    const completed = await stage.play(skit);
    if (signal.aborted || mine !== token) return;
    randomBtn.disabled = false;
    replayBtn.hidden = false;
    shareBtn.hidden = false;
    if (completed && !wasUnlocked) {
      playFanfare();
      burstConfetti({ count: unlockedAfter.size >= SKITS.length ? 84 : 44 });
    }
  }

  randomBtn.addEventListener('click', () => go(nextSkitId(SKIT_IDS, loadUnlocked(SKIT_IDS), current)), { signal });
  replayBtn.addEventListener(
    'click',
    () => {
      playClick();
      if (current) void playId(current);
    },
    { signal },
  );
  shareBtn.addEventListener(
    'click',
    () => {
      playClick();
      const skit = skitById(current);
      if (skit) void shareLink(hashUrl(`#/ways/${skit.id}`), t('skit.method', { n: methodNumber(skit.id), name: t(skit.nameKey) }));
    },
    { signal },
  );
  window.addEventListener(FLY_EVENT, () => go(nextSkitId(SKIT_IDS, loadUnlocked(SKIT_IDS), current)), { signal });

  renderGrid();
  return { play: (id) => void playId(id), idle };
}
