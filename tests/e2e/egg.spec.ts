import { expect, test } from '@playwright/test';

test('makePigs.fly() returns the pig string', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.dare-fly')).toBeVisible();
  const out = await page.evaluate(() => window.makePigs!.fly());
  expect(out.startsWith('🐖')).toBe(true);
});

test('makePigs.fly() triggers a flight on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.dare-fly')).toBeVisible();
  await page.evaluate(() => window.makePigs!.fly());
  await expect(page.locator('.dare-after')).toBeVisible();
});
