import type { Mode, ModeFactory, ModeId } from './modes/types';
import { parseHash } from './route';
import { prefersReducedMotion } from './lib/motion';
import { h } from './lib/dom';
import { t } from './i18n';

const loaders: Record<ModeId, () => Promise<ModeFactory>> = {
  dare: () => import('./modes/dare/dare').then((m) => m.createMode),
  ways: () => import('./modes/ways/ways').then((m) => m.createMode),
  run: () => import('./modes/run/run').then((m) => m.createMode),
};

export function prefetchMode(id: ModeId): void {
  void loaders[id]().catch(() => {});
}

interface Active {
  id: ModeId;
  mode: Mode;
  ctrl: AbortController;
}

export interface Router {
  /** Re-mount the current mode (e.g. after a language change). */
  refresh(): Promise<void>;
}

export function startRouter(root: HTMLElement, onModeChange: (id: ModeId) => void): Router {
  let active: Active | null = null;
  let token = 0;
  let first = true;
  /** Set by refresh() (e.g. language change): the mounted mode is out of date and must not be reused. */
  let stale = false;

  function showLoadError(): void {
    if (active) {
      active.ctrl.abort();
      active.mode.unmount?.();
      active = null;
    }
    const reload = h('button', { class: 'btn btn-primary', type: 'button', text: t('ui.reload') });
    reload.addEventListener('click', () => window.location.reload());
    root.replaceChildren(h('div', { class: 'load-error card', role: 'alert' }, h('p', { text: t('ui.loadFailed') }), reload));
  }

  async function render(force = false): Promise<void> {
    const route = parseHash(window.location.hash);
    onModeChange(route.mode);
    // Claim the navigation first, so a slower in-flight render (still loading its chunk) is invalidated
    // even when this route is handled in place by the current mode.
    const mine = ++token;
    if (!force && !stale && active && active.id === route.mode && active.mode.update?.(route)) {
      root.removeAttribute('aria-busy');
      return;
    }

    root.setAttribute('aria-busy', 'true');
    let factory: ModeFactory;
    try {
      factory = await loaders[route.mode]();
    } catch (err) {
      console.error(err);
      if (mine !== token) return;
      showLoadError();
      root.removeAttribute('aria-busy');
      return;
    }
    if (mine !== token) return; // a newer navigation won

    const swap = async () => {
      if (mine !== token) return; // superseded while the view transition was starting
      if (active) {
        active.ctrl.abort();
        active.mode.unmount?.();
      }
      root.replaceChildren();
      root.dataset.mode = route.mode;
      const ctrl = new AbortController();
      try {
        const mode = factory();
        active = { id: route.mode, mode, ctrl };
        stale = false;
        await mode.mount({ root, route, signal: ctrl.signal });
      } catch (err) {
        // e.g. no canvas 2D context: don't keep a half-mounted mode around as `active`
        console.error(err);
        showLoadError();
      }
    };

    const doc = document as Document & {
      startViewTransition?: (cb: () => Promise<void>) => {
        ready: Promise<void>;
        finished: Promise<void>;
        skipTransition(): void;
      };
    };
    if (!first && !force && doc.startViewTransition && !prefersReducedMotion()) {
      let swapped = false;
      const vt = doc.startViewTransition(async () => {
        swapped = true;
        await swap();
      });
      // If the browser can't capture the old view promptly (GPU trouble, busy compositor), it would hold the
      // swap for up to ~4 s before giving up. Skip the animation instead: the swap then runs right away.
      const watchdog = window.setTimeout(() => {
        if (!swapped) vt.skipTransition();
      }, 400);
      // A skipped transition (newer navigation, watchdog, timeout) still runs the swap; only the animation is lost.
      vt.ready.catch(() => {});
      await vt.finished.catch(() => {});
      window.clearTimeout(watchdog);
    } else {
      await swap();
    }
    if (mine !== token) return;
    root.removeAttribute('aria-busy');
    if (!first && !force) root.focus({ preventScroll: true });
    first = false;
  }

  window.addEventListener('hashchange', () => void render());
  void render();
  return {
    refresh: () => {
      stale = true;
      return render(true);
    },
  };
}
