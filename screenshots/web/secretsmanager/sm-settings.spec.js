/**
 * sm-settings.spec.js
 *
 * Captures screenshots of the Secrets Manager Settings pages:
 *   - sm-settings-import.png  — Settings > Import
 *   - sm-settings-export.png  — Settings > Export
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - SM_ORG_ID set in .env (the org GUID in the SM URL)
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
const outputDir = resolve(__dirname, '../../../output/web/secretsmanager');

const smOrgId = process.env.SM_ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const smBase = `${baseURL}/#/sm/${smOrgId}`;

async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });
  console.log(`Screenshot saved: ${filename}`);
}

test('sm settings import and export', async ({ page }) => {
  await login(page);

  // Import
  await page.goto(`${smBase}/settings/import`);
  await page.waitForSelector('sm-import, bit-section, bit-form', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'sm-settings-import.png');

  // Export
  await page.goto(`${smBase}/settings/export`);
  await page.waitForSelector('sm-export, bit-section, bit-form', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'sm-settings-export.png');
});
