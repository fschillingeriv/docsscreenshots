/**
 * org-settings.spec.js
 *
 * Captures full-page screenshots of all Organization Settings pages:
 *   - org-settings-account.png             — Account
 *   - org-settings-two-factor.png          — Two-step login
 *   - org-settings-import.png              — Import
 *   - org-settings-export.png              — Export
 *   - org-settings-domain-verification.png — Claimed domains
 *   - org-settings-sso.png                 — Single sign-on
 *   - org-settings-scim.png                — SCIM provisioning
 *   - policies.png                         — Policies
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

test('org settings pages', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  await login(page);

  // Account
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/account`);
  await page.waitForSelector('#orgName', { state: 'visible', timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-settings-account.png');

  // Two-step login
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/two-factor`);
  await page.waitForSelector('bit-item-group', { state: 'visible', timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-settings-two-factor.png');

  // Import
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/tools/import`);
  await page.waitForSelector('tools-import', { state: 'visible', timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-settings-import.png');

  // Export
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/tools/export`);
  await page.waitForSelector('tools-export', { state: 'visible', timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-settings-export.png');

  // Claimed domains
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/domain-verification`);
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-table, bit-no-items', { state: 'visible', timeout: 10000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-settings-domain-verification.png');

  // Single sign-on
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/sso`);
  await page.waitForSelector('#enabled', { state: 'visible', timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-settings-sso.png');

  // SCIM provisioning
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/scim`);
  await page.waitForSelector('input[type="checkbox"]', { state: 'visible', timeout: 15000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'org-settings-scim.png');

  // Policies
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/policies`);
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-section', { state: 'visible', timeout: 10000 });
  await dismissOverlay(page);
  await takeScreenshot(page, 'policies.png');
});
