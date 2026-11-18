import type { Locale } from './detect';

/** Replace {name} placeholders. Unknown placeholders are left untouched. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
  );
}

const CURRENCY: Record<Locale, string> = {
  en: 'USD',
  'zh-CN': 'CNY',
  ja: 'JPY',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
};

export function formatNumber(locale: Locale, n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, opts).format(n);
}

/** Fictional valuations: compact currency, e.g. "$8B", "¥80亿", "8 Mrd. €". */
export function formatValuation(locale: Locale, n: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY[locale],
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}
