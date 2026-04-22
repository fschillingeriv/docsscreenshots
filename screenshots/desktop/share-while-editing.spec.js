/**
 * share-while-editing.spec.js
 *
 * Captures the "Share while editing on desktop" screenshot (#22):
 *
 *   - desktop-share-while-editing.png  — Edit drawer open showing Owner + Collections dropdowns
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - At least one personal (non-org-owned) vault item in the account
 *   - The account must be a member of at least one organization (so Owner dropdown appears)
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { launchAndLogin, closeApp } from './helpers/launch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/desktop');

async function takeScreenshot(page, filename) {
  await page.screenshot({ path: resolve(outputDir, filename), fullPage: false });
  console.log(`Screenshot saved: ${filename}`);
}

test('desktop share while editing', async () => {
  test.setTimeout(120000);

  const { electronApp, page } = await launchAndLogin();

  try {
    // Wait for vault to be fully settled
    await page.waitForSelector('app-vault-v3', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Open the Options menu on the first row and click Edit.
    // This opens the cipher form directly in edit mode, bypassing the view step.
    const firstRow = page.locator('tr[appvaultcipherrow]').first();
    await firstRow.waitFor({ state: 'visible', timeout: 10000 });
    await firstRow.hover();
    await page.waitForTimeout(300);

    const optionsBtn = firstRow.locator('button[aria-label="Options"]').first();
    await optionsBtn.waitFor({ state: 'visible', timeout: 5000 });
    await optionsBtn.click({ force: true });
    await page.waitForSelector('.cdk-overlay-pane', { state: 'visible', timeout: 5000 });
    await page.waitForTimeout(300);

    const editMenuItem = page.locator('.cdk-overlay-container button:has-text("Edit")').first();
    await editMenuItem.waitFor({ state: 'visible', timeout: 5000 });
    await editMenuItem.click({ force: true });

    // Wait for the cipher form in edit mode
    await page.waitForSelector('vault-cipher-form', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);

    // Check that the Owner dropdown is visible (requires org membership)
    const ownerField = page.locator('vault-item-details-section bit-form-field').filter({ hasText: /owner/i }).first();
    if (await ownerField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ownerField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await takeScreenshot(page, 'desktop-share-while-editing.png');
    } else {
      console.log('Skipped: desktop-share-while-editing.png — Owner field not visible (account may not be in an org, or item may already be org-owned)');
    }

  } finally {
    await closeApp(electronApp);
  }
});
