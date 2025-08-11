import { test, expect } from '@playwright/test';

test.describe.skip('Happy path', () => {
  test('login → deck → review', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/O-Level Trainer/);
  });
});


