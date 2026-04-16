/**
 * sm-overview.spec.js
 *
 * Captures a screenshot of the Secrets Manager overview/dashboard page:
 *   - sm-overview.png  — SM org landing page
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
import { login, dismissOverlay } from '../adminconsole/helpers/login.js';

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

test('sm overview', async ({ page }) => {
  await login(page);

  await page.goto(smBase);
  await page.waitForSelector('sm-overview, sm-dashboard, [class*="sm-overview"]', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-overview.png');
});
