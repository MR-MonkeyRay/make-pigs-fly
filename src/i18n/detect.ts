// Pure locale negotiation — no DOM access, so it is unit-testable.
export const LOCALES = ['en', 'zh-CN', 'de', 'fr', 'es', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const FALLBACK_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ja: '日本語',
};

/** Match one BCP 47 tag to a supported locale: exact match first, then primary language. */
export function matchLocale(tag: string | null | undefined): Locale | null {
  if (!tag) return null;
  const clean = tag.trim().replace(/_/g, '-').toLowerCase();
  if (!clean) return null;
  const exact = LOCALES.find((l) => l.toLowerCase() === clean);
  if (exact) return exact;
  const primary = clean.split('-')[0];
  if (primary === 'zh') return 'zh-CN'; // zh-TW / zh-HK fall back to Simplified for v1
  return LOCALES.find((l) => l.toLowerCase() === primary) ?? null;
}

export interface DetectInput {
  /** ?lang= from the URL — wins over everything. */
  query?: string | null;
  /** A choice the visitor made earlier with the language picker. */
  stored?: string | null;
  /** navigator.languages, in preference order. */
  languages: readonly string[];
}

export function detectLocale({ query, stored, languages }: DetectInput): Locale {
  return (
    matchLocale(query) ??
    matchLocale(stored) ??
    languages.map((l) => matchLocale(l)).find((l): l is Locale => l !== null) ??
    FALLBACK_LOCALE
  );
}
