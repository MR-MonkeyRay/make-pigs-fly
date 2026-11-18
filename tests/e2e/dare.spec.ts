import { expect, test } from '@playwright/test';
import en from '../../src/i18n/locales/en';

test('fly shows verdict and unlocked count', async ({ page }) => {
  await page.goto('/');
  await page.locator('.dare-fly').click();
  const after = page.locator('.dare-after');
  await expect(after).toBeVisible();
  await expect(after).toContainText(en['dare.verdict']);
  await expect(page.locator('.dare-unlocked')).toContainText(/\d+\/\d+/);
});

test('"Another excuse" hides the verdict again', async ({ page }) => {
  await page.goto('/');
  await page.locator('.dare-fly').click();
  await expect(page.locator('.dare-after')).toBeVisible();
  await page.getByRole('button', { name: en['dare.another'] }).click();
  await expect(page.locator('.dare-after')).toBeHidden();
});

test('composer renders hostile input as text only', async ({ browser }) => {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const payload = '<img src=x onerror="window.__pwned=1">';
  await page.goto('/');
  // "Write my own" is offered after the first flight (laugh first, then participate).
  await page.locator('.dare-fly').click();
  await expect(page.locator('.dare-after')).toBeVisible();
  await page.getByRole('button', { name: en['dare.write'] }).click();
  await page.locator('#compose-input').fill(payload);
  await page.getByRole('button', { name: en['dare.compose.make'] }).click();

  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#/?d=');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const url = copied.match(/https?:\/\/\S+/)?.[0];
  expect(url).toBeTruthy();

  const friend = await context.newPage();
  await friend.goto(url!);
  await expect(friend.locator('.dare-quote')).toBeVisible();
  expect(await friend.locator('.dare-quote').textContent()).toContain('<img src=x');
  await expect(friend.locator('.dare-line img')).toHaveCount(0);
  expect(await friend.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();

  await friend.getByRole('button', { name: en['dare.friend.check'] }).click();
  await expect(friend.locator('.dare-after')).toBeVisible();
  await expect(friend.locator('.dare-line img')).toHaveCount(0);
  expect(await friend.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
  await context.close();
});

test('invalid friend link falls back to the normal home', async ({ page }) => {
  await page.goto('/#/?d=%%%');
  await expect(page.locator('.dare-fly')).toHaveText(en['dare.fly']);
  await expect(page.locator('.dare-quote')).toHaveCount(0);
  await expect(page.locator('.dare-promise')).toBeVisible();
});
