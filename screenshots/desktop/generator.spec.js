/**
 * generator.spec.js
 *
 * Captures screenshots of the desktop Generator feature:
 *
 *   - desktop-generator-password.png   — Password generator view
 *   - desktop-generator-username.png   — Username generator view
 *   - desktop-generator-history.png    — Generator history dialog
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - Milestone 3 + Milestone 4 feature flags enabled
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { launchAndLogin, closeApp, dismissOverlay } from './helpers/launch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/desktop');

async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: false,
  });
  console.log(`Screenshot saved: ${filename}`);
}

test('desktop generator', async () => {
  test.setTimeout(120000);

  const { electronApp, page } = await launchAndLogin();

  try {
    // Wait for the vault to be ready (need to be authenticated)
    await page.waitForSelector('app-vault-v3', { state: 'visible', timeout: 15000 });

    // ── Open Generator dialog ─────────────────────────────────────────────
    // The Generator nav item in the sidebar opens a dialog
    const genNavItem = page.locator('bit-nav-item:has-text("Generator")').first();
    await genNavItem.waitFor({ state: 'visible', timeout: 5000 });
    await genNavItem.click({ force: true });

    // Wait for the generator dialog to appear
    await page.waitForSelector('credential-generator, bit-dialog', {
      state: 'visible',
      timeout: 10000,
    });
    await page.waitForTimeout(500);

    // ── Password Generator ────────────────────────────────────────────────
    // The generator dialog defaults to password mode.
    // The generator component has tabs or a dropdown for password/passphrase/username.
    // Look for a "Password" option to ensure we're on the right tab.
    await takeScreenshot(page, 'desktop-generator-password.png');

    // ── Username Generator ────────────────────────────────────────────────
    // Switch to username generation. The generator component likely has a
    // dropdown or toggle. Try clicking the type selector.
    const typeSelector = page.locator('credential-generator select, credential-generator bit-select, tools-credential-generator select, tools-credential-generator bit-select').first();
    if (await typeSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeSelector.selectOption({ label: 'Username' });
      await page.waitForTimeout(500);
      await takeScreenshot(page, 'desktop-generator-username.png');
    } else {
      // May use a different UI pattern — try looking for tab-like buttons
      const usernameTab = page.locator('button:has-text("Username"), [role="tab"]:has-text("Username"), label:has-text("Username")').first();
      if (await usernameTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await usernameTab.click({ force: true });
        await page.waitForTimeout(500);
        await takeScreenshot(page, 'desktop-generator-username.png');
      } else {
        // Try the "Email" option as username generators may be labeled differently
        const emailOption = page.locator('button:has-text("Email"), [role="tab"]:has-text("Email")').first();
        if (await emailOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await emailOption.click({ force: true });
          await page.waitForTimeout(500);
          await takeScreenshot(page, 'desktop-generator-username.png');
        } else {
          console.log('Skipped: desktop-generator-username.png — could not find username/email tab');
        }
      }
    }

    // ── Generator History ─────────────────────────────────────────────────
    // The generator dialog has a "Generator history" link that opens a sub-dialog
    const historyLink = page.locator('button:has-text("Generator history"), button:has-text("generator history"), a:has-text("Generator history")').first();
    if (await historyLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await historyLink.click({ force: true });
      await page.waitForTimeout(500);
      await takeScreenshot(page, 'desktop-generator-history.png');
      // Close history dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      console.log('Skipped: desktop-generator-history.png — Generator history link not found');
    }

    // Close the generator dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

  } finally {
    await closeApp(electronApp);
  }
});
