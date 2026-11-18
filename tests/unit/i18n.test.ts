import { describe, expect, it } from 'vitest';
import { detectLocale, LOCALES, matchLocale } from '../../src/i18n/detect';
import { formatValuation, interpolate } from '../../src/i18n/format';
import en from '../../src/i18n/locales/en';
import zhCN from '../../src/i18n/locales/zh-CN';
import de from '../../src/i18n/locales/de';
import fr from '../../src/i18n/locales/fr';
import es from '../../src/i18n/locales/es';
import ja from '../../src/i18n/locales/ja';

describe('locale negotiation', () => {
  it.each([
    ['en-US', 'en'],
    ['zh-CN', 'zh-CN'],
    ['zh-TW', 'zh-CN'],
    ['zh-Hant-HK', 'zh-CN'],
    ['zh', 'zh-CN'],
    ['de-AT', 'de'],
    ['fr-CA', 'fr'],
    ['es-419', 'es'],
    ['ja-JP', 'ja'],
    ['pt-BR', null],
    ['', null],
  ])('matchLocale(%s) → %s', (tag, expected) => {
    expect(matchLocale(tag)).toBe(expected);
  });

  it('walks navigator.languages in order and falls back to en', () => {
    expect(detectLocale({ languages: ['pt-BR', 'de-CH', 'en'] })).toBe('de');
    expect(detectLocale({ languages: ['pt-BR', 'ko'] })).toBe('en');
    expect(detectLocale({ languages: [] })).toBe('en');
  });

  it('?lang= beats the stored choice, which beats the browser', () => {
    expect(detectLocale({ query: 'fr', stored: 'ja', languages: ['de'] })).toBe('fr');
    expect(detectLocale({ query: 'xx', stored: 'ja', languages: ['de'] })).toBe('ja');
    expect(detectLocale({ query: null, stored: null, languages: ['es-MX'] })).toBe('es');
  });
});

describe('formatting', () => {
  it('interpolates known placeholders only', () => {
    expect(interpolate('{n}/{total} {x}', { n: 2, total: 6 })).toBe('2/6 {x}');
  });
  it('formats fictional valuations per locale', () => {
    expect(formatValuation('zh-CN', 8e9)).toContain('亿');
    expect(formatValuation('en', 8e9)).toMatch(/\$8(\.0)?B/);
  });
});

// Runtime guard on translations (types already guarantee the key set).
const all = { en, 'zh-CN': zhCN, de, fr, es, ja } as const;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('translations', () => {
  it('cover every supported locale', () => {
    expect(Object.keys(all).sort()).toEqual([...LOCALES].sort());
  });

  for (const [code, dict] of Object.entries(all)) {
    describe(code, () => {
      it('has exactly the source keys', () => {
        expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
      });
      it('keeps every placeholder and list length', () => {
        for (const [key, source] of Object.entries(en)) {
          const value = (dict as Record<string, unknown>)[key];
          if (Array.isArray(source)) {
            expect(Array.isArray(value), key).toBe(true);
            expect((value as string[]).length, key).toBe(source.length);
            (value as string[]).forEach((v) => expect(v.trim().length, key).toBeGreaterThan(0));
          } else {
            expect(typeof value, key).toBe('string');
            expect(placeholders(value as string), key).toEqual(placeholders(source));
            expect((value as string).trim().length, key).toBeGreaterThan(0);
          }
        }
      });
      it('uses a known idiom animation', () => {
        expect(['sun-west', 'hen-teeth', 'cow-fly', 'hell-freezes', 'pigs-literal']).toContain(dict['skit.idiom.kind']);
      });
    });
  }
});
