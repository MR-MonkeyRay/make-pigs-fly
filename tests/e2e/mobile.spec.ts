import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

for (const route of ['#/', '#/ways', '#/run']) {
  test(`no horizontal overflow and fixed nav on ${route}`, async ({ page }) => {
    await page.goto(`/${route}`);
    await expect(page.locator('#stage > :not(.boot)').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(overflow).toBe(true);
    await expect(page.locator('.mode-nav')).toHaveCSS('position', 'fixed');
  });
}
