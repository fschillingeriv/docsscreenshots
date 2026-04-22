/**
 * pre-login.spec.js
 *
 * Captures screenshots of the desktop app's pre-login screen:
 *
 *   - desktop-server-selector.png     — Login screen with region dropdown open
 *   - desktop-self-hosted-dialog.png  — Self-hosted server URL dialog
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - WEB_APP_URL set to a self-hosted URL (so the flow triggers)
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { launchToLoginScreen, closeApp } from './helpers/launch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/desktop');

async function takeScreenshot(page, filename) {
  await page.screenshot({ path: resolve(outputDir, filename), fullPage: false });
  console.log(`Screenshot saved: ${filename}`);
}

test('desktop pre-login server selector', async () => {
  test.setTimeout(60000);

  const { electronApp, page, serverUrl } = await launchToLoginScreen();

  try {
    if (!serverUrl) {
      console.log('Skipped: pre-login screenshots — WEB_APP_URL not set');
      return;
    }

    // ── Region selector dropdown open ─────────────────────────────────────
    const regionBtn = page.locator('environment-selector button').first();
    await regionBtn.waitFor({ state: 'visible', timeout: 10000 });
    await regionBtn.click();
    await page.waitForTimeout(300);
    await takeScreenshot(page, 'desktop-server-selector.png');

    // ── Self-hosted dialog ────────────────────────────────────────────────
    await page.locator('.cdk-overlay-container button:has-text("self-hosted")').click({ force: true });
    await page.waitForSelector('#self_hosted_env_settings_form_input_base_url', { state: 'visible', timeout: 5000 });
    await page.waitForTimeout(300);
    await takeScreenshot(page, 'desktop-self-hosted-dialog.png');

    // Close the dialog without saving
    await page.click('button:has-text("Cancel")');
    await page.waitForSelector('bit-dialog', { state: 'detached', timeout: 5000 }).catch(() => {});

  } finally {
    await closeApp(electronApp);
  }
});
