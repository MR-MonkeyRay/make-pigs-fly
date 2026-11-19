import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { en } from './locales/en';
import { zh } from './locales/zh';
import { ja } from './locales/ja';
import { es } from './locales/es';
import type { Locale, TranslationSchema } from './types';

export const LOCALES: Record<Locale, TranslationSchema> = {
  en,
  zh,
  ja,
  es,
};

export const SUPPORTED_LOCALES: Locale[] = ['en', 'zh', 'ja', 'es'];

const STORAGE_KEY = 'makepigs_fly_locale';

function normalizeLocale(raw: string | null | undefined): Locale | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('en')) return 'en';
  return null;
}

function detectInitialLocale(): Locale {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = normalizeLocale(params.get('lang'));
    if (fromUrl) return fromUrl;

    const fromStorage = normalizeLocale(localStorage.getItem(STORAGE_KEY));
    if (fromStorage) return fromStorage;

    const browserLangs = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const lang of browserLangs) {
      const normalized = normalizeLocale(lang);
      if (normalized) return normalized;
    }
  } catch {
    // Ignore storage/URL access errors
  }
  return 'en';
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: TranslationSchema;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale());

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore private browsing errors
    }
  };

  useEffect(() => {
    const schema = LOCALES[locale];
    document.title = schema.meta.title;
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: LOCALES[locale],
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
