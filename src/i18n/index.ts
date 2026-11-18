import { LOCALES, type Locale } from './detect';
import { formatNumber, formatValuation, interpolate } from './format';
import type { ListKey, Messages, StringKey } from './messages';
import enMessages from './locales/en';

export { detectLocale, LOCALES, LOCALE_NAMES, matchLocale, type Locale } from './detect';
export type { StringKey, ListKey } from './messages';

// English is bundled so the site can always boot, even if a locale chunk fails to download.
const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => Promise.resolve({ default: enMessages }),
  'zh-CN': () => import('./locales/zh-CN'),
  de: () => import('./locales/de'),
  fr: () => import('./locales/fr'),
  es: () => import('./locales/es'),
  ja: () => import('./locales/ja'),
};

let current: Locale = 'en';
let messages: Messages | null = null;
let request = 0;

/**
 * Switch language. Only the most recent call wins (a slow download can't overwrite a newer choice).
 * Returns the locale actually applied, or null if this call was superseded.
 * If the requested locale fails to load, falls back to the current one (or English on first boot).
 */
export async function setLocale(locale: Locale): Promise<Locale | null> {
  const mine = ++request;
  let next: Messages;
  let applied: Locale = locale;
  try {
    next = (await loaders[locale]()).default;
  } catch (err) {
    console.error(err);
    if (mine !== request) return null;
    if (messages) return current; // keep what we have
    next = enMessages;
    applied = 'en';
  }
  if (mine !== request) return null;
  messages = next;
  current = applied;
  const html = document.documentElement;
  html.lang = applied;
  document.title = t('site.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('site.description'));
  return applied;
}

export function getLocale(): Locale {
  return current;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

function dict(): Messages {
  if (!messages) throw new Error('i18n used before setLocale()');
  return messages;
}

export function t(key: StringKey, vars?: Record<string, string | number>): string {
  return interpolate(dict()[key], vars);
}

export function list(key: ListKey): readonly string[] {
  return dict()[key];
}

export function num(n: number, opts?: Intl.NumberFormatOptions): string {
  return formatNumber(current, n, opts);
}

export function valuation(n: number): string {
  return formatValuation(current, n);
}

/**
 * Fill static markup: data-i18n="key" sets textContent;
 * data-i18n-attr="aria-label:key;title:key" sets attributes.
 */
export function applyI18n(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n as StringKey);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    for (const pair of (el.dataset.i18nAttr ?? '').split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key as StringKey));
    }
  });
}
