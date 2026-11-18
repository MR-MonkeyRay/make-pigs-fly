import './styles/tokens.css';
import './styles/base.css';
import './styles/stage.css';
import { applyI18n, detectLocale, getLocale, isLocale, LOCALE_NAMES, LOCALES, setLocale, t } from './i18n';
import { load, remove, save } from './lib/storage';
import { prefetchMode, startRouter, type Router } from './router';
import { installConsoleEgg } from './egg/console';
import { CSS_PIG, pigMarkup } from './pig/pig';
import type { ModeId } from './modes/types';

type ThemeChoice = 'auto' | 'light' | 'dark';
const THEMES: ThemeChoice[] = ['auto', 'light', 'dark'];
const MODE_ORDER: ModeId[] = ['dare', 'ways', 'run'];

function currentTheme(): ThemeChoice {
  const v = load('theme');
  return v === 'light' || v === 'dark' ? v : 'auto';
}

function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'auto') {
    delete root.dataset.theme;
    remove('theme');
  } else {
    root.dataset.theme = choice;
    save('theme', choice);
  }
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.dataset.themeState = choice;
    const label = t(choice === 'auto' ? 'ui.theme.auto' : choice === 'light' ? 'ui.theme.light' : 'ui.theme.dark');
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }
}

function setActiveTab(id: ModeId): void {
  document.querySelectorAll<HTMLAnchorElement>('.mode-tab').forEach((a) => {
    if (a.dataset.mode === id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.body.dataset.mode = id;
}

function renderShell(): void {
  applyI18n(document);
  applyTheme(currentTheme());
}

function wireShell(getRouter: () => Router | null): void {
  const select = document.getElementById('lang-select') as HTMLSelectElement;
  select.replaceChildren(
    ...LOCALES.map((l) => {
      const o = document.createElement('option');
      o.value = l;
      o.lang = l;
      o.textContent = LOCALE_NAMES[l];
      return o;
    }),
  );
  select.value = getLocale();
  select.addEventListener('change', async () => {
    const next = select.value;
    if (!isLocale(next)) return;
    const applied = await setLocale(next);
    if (applied === null) return; // a newer choice is on its way
    select.value = applied;
    if (applied !== next) return; // download failed: stay on the current language
    save('lang', applied);
    // A manual choice beats ?lang=, so drop it from the address bar.
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    }
    renderShell();
    await getRouter()?.refresh();
  });

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length] ?? 'auto';
    applyTheme(next);
  });

  document.querySelectorAll<HTMLAnchorElement>('.mode-tab').forEach((a) => {
    const id = a.dataset.mode as ModeId;
    const warm = () => prefetchMode(id);
    a.addEventListener('pointerenter', warm, { once: true });
    a.addEventListener('focus', warm, { once: true });
  });

  // 1 / 2 / 3 switch modes (ignored while typing or with modifiers).
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    const idx = ['1', '2', '3'].indexOf(e.key);
    const mode = MODE_ORDER[idx];
    if (mode) {
      window.location.hash = mode === 'dare' ? '#/' : `#/${mode}`;
    }
  });
}

async function boot(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const locale = detectLocale({
    query: params.get('lang'),
    stored: load('lang'),
    languages: navigator.languages?.length ? navigator.languages : [navigator.language],
  });
  await setLocale(locale);
  const mark = document.querySelector('.brand-mark');
  if (mark) mark.innerHTML = pigMarkup(CSS_PIG); // static, trusted art
  renderShell();

  let router: Router | null = null;
  wireShell(() => router);
  router = startRouter(document.getElementById('stage') as HTMLElement, setActiveTab);
  installConsoleEgg();

  // Warm the other modes once the page is idle.
  const idle = (cb: () => void) =>
    typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb, { timeout: 4000 }) : setTimeout(cb, 2500);
  idle(() => MODE_ORDER.forEach(prefetchMode));
}

void boot();
