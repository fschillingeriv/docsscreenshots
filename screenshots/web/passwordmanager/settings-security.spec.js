/**
 * settings-security.spec.js
 *
 * Captures full-page screenshots of all Settings > Security pages:
 *   - settings-security-session-timeout.png  — Session timeout
 *   - settings-security-password.png         — Master password
 *   - settings-security-two-factor.png       — Two-step login
 *   - settings-security-keys.png             — Security keys
 *   - settings-security-device-management.png — Device management
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

test('settings security pages', async ({ page }) => {
  await login(page);

  // Session timeout
  await page.goto(`${baseURL}/#/settings/security/session-timeout`);
  await page.waitForSelector('bit-session-timeout-settings', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-security-session-timeout.png');

  // Master password
  await page.goto(`${baseURL}/#/settings/security/password`);
  await page.waitForSelector('auth-change-password', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-security-password.png');

  // Two-step login
  await page.goto(`${baseURL}/#/settings/security/two-factor`);
  await page.waitForSelector('bit-icon[name="bwi-spinner"]', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-item-group', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-security-two-factor.png');

  // Security keys
  await page.goto(`${baseURL}/#/settings/security/security-keys`);
  await page.waitForSelector('button:has-text("View API key")', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-security-keys.png');

  // Device management
  await page.goto(`${baseURL}/#/settings/security/device-management`);
  await page.waitForSelector('auth-device-management-table', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'settings-security-device-management.png');
});
