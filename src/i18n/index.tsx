import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { en } from './locales/en';
import { zh } from './locales/zh';
import { zhTW } from './locales/zhTW';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { it } from './locales/it';
import { ru } from './locales/ru';
import type { Locale, Messages } from './types';

export const LOCALES: Record<Locale, Messages> = { en, zh, zhTW, ja, ko, es, fr, de, pt, it, ru };
export const LOCALE_ORDER: Locale[] = ['en', 'zh', 'zhTW', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'it', 'ru'];
/** BCP-47 tags: <html lang>, Intl formatting and the ?lang= value we write */
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  zhTW: 'zh-TW',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt-BR',
  it: 'it',
  ru: 'ru',
};
const STORAGE_KEY = 'makepigs.locale';

function normalize(raw: string | null | undefined): Locale | null {
  if (!raw) return null;
  const v = raw.toLowerCase().trim().replace('_', '-');
  if (v === 'zhtw' || /^zh-(tw|hk|mo|hant)/.test(v)) return 'zhTW';
  const base = v.split('-')[0];
  const direct: Record<string, Locale> = { en: 'en', zh: 'zh', ja: 'ja', ko: 'ko', es: 'es', fr: 'fr', de: 'de', pt: 'pt', it: 'it', ru: 'ru' };
  return direct[base] ?? null;
}

function detect(): Locale {
  try {
    const fromUrl = normalize(new URLSearchParams(window.location.search).get('lang'));
    if (fromUrl) return fromUrl;
    const stored = normalize(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const l of langs) {
      const n = normalize(l);
      if (n) return n;
    }
  } catch {
    /* ignore */
  }
  return 'en';
}

interface Ctx {
  locale: Locale;
  t: Messages;
  /** BCP-47 tag for Intl APIs */
  tag: string;
  setLocale: (next: Locale, origin?: { x: number; y: number }) => void;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detect);

  const setLocale = useCallback(
    (next: Locale, origin?: { x: number; y: number }) => {
      if (next === locale) return;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      const root = document.documentElement;
      if (origin) {
        root.style.setProperty('--vt-x', `${origin.x}px`);
        root.style.setProperty('--vt-y', `${origin.y}px`);
      }
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      if (doc.startViewTransition && !reduced) {
        doc.startViewTransition(() => {
          flushSync(() => setLocaleState(next));
        });
      } else {
        setLocaleState(next);
      }
    },
    [locale]
  );

  useEffect(() => {
    const t = LOCALES[locale];
    document.documentElement.lang = LOCALE_TAG[locale];
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', LOCALE_TAG[locale]);
        window.history.replaceState(null, '', url.toString());
      }
    } catch {
      /* ignore */
    }
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({ locale, t: LOCALES[locale], tag: LOCALE_TAG[locale], setLocale }),
    [locale, setLocale]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
