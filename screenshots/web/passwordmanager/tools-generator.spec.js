/**
 * tools-generator.spec.js
 *
 * Captures screenshots of the Tools > Generator page for all three views:
 *   - tools-generator-password.png    — Password view (default)
 *   - tools-generator-passphrase.png  — Passphrase view
 *   - tools-generator-username.png    — Username view
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import { login } from '../adminconsole/helpers/login.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../../output/web/passwordmanager');

const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';

async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });
  console.log(`Screenshot saved: ${filename}`);
}

// Dismiss any lingering CDK overlay (tooltip, dropdown, popover) by pressing Escape
async function dismissOverlay(page) {
  const backdrop = page.locator('.cdk-overlay-backdrop');
  if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await backdrop.waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
  }
}

test('tools generator - all views', async ({ page }) => {
  await login(page);
  await page.goto(`${baseURL}/#/tools/generator`);

  // Wait for the generator to fully render
  await page.waitForSelector('tools-credential-generator', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('tools-password-settings', { state: 'visible', timeout: 10000 });

  // Password view (default)
  await takeScreenshot(page, 'tools-generator-password.png');

  // Passphrase view
  await dismissOverlay(page);
  await page.locator('label', { hasText: 'Passphrase' }).click();
  await page.waitForSelector('tools-passphrase-settings', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'tools-generator-passphrase.png');

  // Username view
  await dismissOverlay(page);
  await page.locator('label', { hasText: 'Username' }).click();
  await page.waitForSelector('bit-select[data-testid="username-type"]', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'tools-generator-username.png');
});
