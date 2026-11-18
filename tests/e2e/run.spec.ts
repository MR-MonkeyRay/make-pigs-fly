import { expect, test } from '@playwright/test';
import en from '../../src/i18n/locales/en';

test('idle pig falls and the game ends', async ({ page }) => {
  await page.goto('/#/run');
  const box = page.locator('.run-box');
  await expect(box).toHaveAttribute('data-state', 'ready'); // mode chunk mounted, keys are live
  await page.keyboard.press('Space');
  await expect(box).toHaveAttribute('data-state', 'playing');
  await expect(box).toHaveAttribute('data-state', 'over', { timeout: 10_000 });
  await expect(page.locator('.run-distance')).toHaveText(/Flew\s+[\d,]+\s*m/);
});

test('"Fly again" restarts the game', async ({ page }) => {
  await page.goto('/#/run');
  const box = page.locator('.run-box');
  await expect(box).toHaveAttribute('data-state', 'ready'); // mode chunk mounted, keys are live
  await page.keyboard.press('Space');
  await expect(box).toHaveAttribute('data-state', 'over', { timeout: 10_000 });
  await page.getByRole('button', { name: en['run.again'] }).click();
  await expect(box).toHaveAttribute('data-state', 'playing');
});

test('challenge link shows the friend distance', async ({ page }) => {
  await page.goto('/#/run?s=1234');
  await expect(page.locator('.run-challenge')).toBeVisible();
  await expect(page.locator('.run-challenge')).toContainText('1,234');
});

test('fresh visit shows only the start overlay (no stale game-over panel)', async ({ page }) => {
  await page.goto('/#/run');
  const box = page.locator('.run-box');
  await expect(box).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.run-overlay:visible')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: en['run.over.title'] })).toBeHidden();
});
