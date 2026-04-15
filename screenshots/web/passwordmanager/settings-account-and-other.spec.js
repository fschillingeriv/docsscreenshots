/**
 * settings-account-and-other.spec.js
 *
 * Captures full-page screenshots of Settings > Account and other settings pages:
 *   - settings-account.png           — My account
 *   - settings-appearance.png        — Appearance
 *   - settings-domain-rules.png      — Domain rules
 *   - settings-emergency-access.png  — Emergency access
 *   - settings-data-recovery.png     — Data recovery
 *   - settings-sponsored-families.png  — Free Bitwarden Families
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

test('settings account and other pages', async ({ page }) => {
  await login(page);

  // My account
  await page.goto(`${baseURL}/#/settings/account`);
  await page.waitForSelector('app-profile', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-account.png');

  // Appearance
  await page.goto(`${baseURL}/#/settings/appearance`);
  await page.waitForSelector('bit-select', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-appearance.png');

  // Domain rules
  await page.goto(`${baseURL}/#/settings/domain-rules`);
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-table, button:has-text("New custom domain")', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-domain-rules.png');

  // Emergency access
  await page.goto(`${baseURL}/#/settings/emergency-access`);
  await page.waitForSelector('bit-icon[name="bwi-spinner"]', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-emergency-access.png');

  // Data recovery
  await page.goto(`${baseURL}/#/settings/data-recovery`);
  await page.waitForSelector('button:has-text("Run diagnostics")', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-data-recovery.png');

  // Free Bitwarden Families
  await page.goto(`${baseURL}/#/settings/sponsored-families`);
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-sponsored-families.png');
});
