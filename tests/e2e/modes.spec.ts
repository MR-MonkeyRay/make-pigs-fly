import { expect, test } from '@playwright/test';
import en from '../../src/i18n/locales/en';

test('clicking tabs updates aria-current', async ({ page }) => {
  await page.goto('/');
  const dare = page.getByRole('link', { name: en['nav.dare'] });
  const ways = page.getByRole('link', { name: en['nav.ways'] });
  const run = page.getByRole('link', { name: en['nav.run'] });
  await expect(dare).toHaveAttribute('aria-current', 'page');
  await ways.click();
  await expect(ways).toHaveAttribute('aria-current', 'page');
  await expect(dare).not.toHaveAttribute('aria-current', 'page');
  await run.click();
  await expect(run).toHaveAttribute('aria-current', 'page');
  await expect(ways).not.toHaveAttribute('aria-current', 'page');
  await dare.click();
  await expect(dare).toHaveAttribute('aria-current', 'page');
});

test('keys 1/2/3 switch modes', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  await expect(page).toHaveURL(/#\/ways$/);
  await page.keyboard.press('3');
  await expect(page).toHaveURL(/#\/run$/);
  await page.keyboard.press('1');
  await expect(page).toHaveURL(/#\/$/);
});

test('run game pauses when leaving and returning', async ({ page }) => {
  await page.goto('/#/run');
  const box = page.locator('.run-box');
  await expect(box).toHaveAttribute('data-state', 'ready');
  await page.keyboard.press('Space');
  await expect(box).toHaveAttribute('data-state', 'playing');
  // Rocket mode (the console egg) keeps the pig invulnerable for a moment, so it can't crash mid-test.
  await page.evaluate(() => window.makePigs!.fly());
  await page.keyboard.press('1');
  await expect(page).toHaveURL(/#\/$/);
  await page.keyboard.press('3');
  await expect(page).toHaveURL(/#\/run$/);
  await expect(page.locator('.run-box')).toHaveAttribute('data-state', 'paused');
});
