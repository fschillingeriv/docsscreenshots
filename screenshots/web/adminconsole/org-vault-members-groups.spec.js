/**
 * org-vault-members-groups.spec.js
 *
 * Captures full-page screenshots of:
 *   - org-vault.png    — Organization vault
 *   - members.png      — Members
 *   - groups.png       — Groups
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - ORG_ID set in .env
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import { login, dismissOverlay } from './helpers/login.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../../output/web/adminconsole');

const orgId = process.env.ORG_ID || '';
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

test('org vault, members, groups', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  await login(page);

  // Org vault
  await page.goto(`${baseURL}/#/organizations/${orgId}/vault`);
  await page.waitForSelector('app-org-vault-header', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('app-vault-items', { state: 'visible', timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-vault.png');

  // Members
  await page.goto(`${baseURL}/#/organizations/${orgId}/members`);
  await page.waitForSelector('bit-toggle-group', { state: 'visible', timeout: 15000 });
  await page.waitForFunction(() => !document.querySelector('main i.bwi-spinner'), { timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'members.png');

  // Groups
  await page.goto(`${baseURL}/#/organizations/${orgId}/groups`);
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-table, p', { state: 'visible', timeout: 10000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'groups.png');
});
