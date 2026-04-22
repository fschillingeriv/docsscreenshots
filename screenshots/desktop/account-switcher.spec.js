/**
 * account-switcher.spec.js
 *
 * Captures screenshots of the desktop account switcher flow:
 *
 *   - desktop-account-switcher.png        — Account switcher dropdown open (for #23, needs 2 accounts)
 *   - desktop-add-account-login.png       — Login screen shown after clicking Add Account (#17)
 *
 * #17 only requires one logged-in account (clicks Add Account to reach the login screen).
 * #23 requires a second account to already be logged in — that screenshot will be skipped
 *     if only one account is present.
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
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

test('desktop account switcher', async () => {
  test.setTimeout(120000);

  const { electronApp, page } = await launchAndLogin();

  try {
    // The account switcher button in the authenticated vault uses the V2 component.
    // Its button has class="account-switcher-v2" and lives inside app-account-switcher-v2.
    const switcherBtn = page.locator('button.account-switcher-v2').first();
    await switcherBtn.waitFor({ state: 'visible', timeout: 10000 });
    await switcherBtn.click();
    await page.waitForTimeout(500);

    // ── #23: Switch accounts on desktop ──────────────────────────────────
    // Only captures if a second account is present in the dropdown.
    const inactiveAccount = page.locator('.account-switcher-dropdown .account').first();
    if (await inactiveAccount.isVisible({ timeout: 1000 }).catch(() => false)) {
      await takeScreenshot(page, 'desktop-switch-accounts.png');
      console.log('Screenshot saved: desktop-switch-accounts.png');
    } else {
      console.log('Skipped: desktop-switch-accounts.png — only one account logged in');
    }

    // ── #17: Desktop Account Switching - Light ────────────────────────────
    // Click Add Account to reach the login screen showing the account switcher context.
    const addAccountBtn = page.locator('.account-switcher-dropdown button.add').first();
    await addAccountBtn.waitFor({ state: 'visible', timeout: 5000 });
    await addAccountBtn.click();

    // Wait for the login screen to appear
    await page.waitForSelector('auth-anon-layout', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'desktop-add-account-login.png');

  } finally {
    await closeApp(electronApp);
  }
});
