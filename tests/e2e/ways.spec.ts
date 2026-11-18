import { expect, test } from '@playwright/test';
import en from '../../src/i18n/locales/en';

test('deep link plays a method and unlocks it', async ({ page }) => {
  await page.goto('/#/ways/hype-fan');
  await expect(page.locator('.ways-method')).toContainText('#01');
  await expect(page.getByRole('button', { name: en['ways.replay'] })).toBeVisible({ timeout: 30_000 });
  const stored = await page.evaluate(() => localStorage.getItem('mpf.unlocked'));
  expect(JSON.parse(stored ?? '[]')).toContain('hype-fan');
});

test('random button navigates to a method', async ({ page }) => {
  await page.goto('/#/ways');
  await page.getByRole('button', { name: en['ways.random'] }).click();
  await expect(page).toHaveURL(/#\/ways\/[a-z-]+$/);
});

test('locked cards carry is-locked', async ({ page }) => {
  await page.goto('/#/ways');
  const cards = page.locator('.way-card');
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);
  await expect(page.locator('.way-card.is-locked')).toHaveCount(total);
  await expect(page.locator('.way-card.is-locked').first()).toHaveAttribute('aria-disabled', 'true');
});
