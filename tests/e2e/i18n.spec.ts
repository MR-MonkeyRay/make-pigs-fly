import { expect, test } from '@playwright/test';
import en from '../../src/i18n/locales/en';
import zhCN from '../../src/i18n/locales/zh-CN';
import de from '../../src/i18n/locales/de';
import fr from '../../src/i18n/locales/fr';
import es from '../../src/i18n/locales/es';
import ja from '../../src/i18n/locales/ja';

const cases: [string, string, { 'site.title': string }][] = [
  ['en-US', 'en', en],
  ['zh-CN', 'zh-CN', zhCN],
  ['zh-TW', 'zh-CN', zhCN],
  ['de-DE', 'de', de],
  ['fr-FR', 'fr', fr],
  ['es-ES', 'es', es],
  ['ja-JP', 'ja', ja],
  ['pt-BR', 'en', en],
];

for (const [locale, lang, messages] of cases) {
  test(`browser locale ${locale} -> ${lang}`, async ({ browser }) => {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect.poll(() => page.title()).toBe(messages['site.title']);
    await context.close();
  });
}

test('?lang=fr overrides an en-US browser', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  await page.goto('/?lang=fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect.poll(() => page.title()).toBe(fr['site.title']);
  await context.close();
});

test('language choice persists across reload', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('#lang-select').selectOption('de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('#lang-select')).toHaveValue('de');
  await expect.poll(() => page.title()).toBe(de['site.title']);
  await context.close();
});
