/**
 * reporting-reports.spec.js
 *
 * Captures screenshots of all five standard report pages:
 *   - Exposed passwords (reporting-exposed-passwords.png)
 *   - Inactive two-factor (reporting-inactive-two-factor.png)
 *   - Reused passwords (reporting-reused-passwords.png)
 *   - Unsecured websites (reporting-unsecured-websites.png)
 *   - Weak passwords (reporting-weak-passwords.png)
 *
 * All five reports auto-load on navigation and show either a success callout
 * (no issues found) or a danger callout with results. We wait for whichever
 * callout appears as our signal that the page is fully rendered.
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
import { login } from './helpers/login.js';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/web/adminconsole');

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

// All five reports render a bit-callout once loaded (success or danger)
async function waitForReport(page) {
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-callout', { state: 'visible', timeout: 15000 });
}

test.beforeEach(async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  await login(page);
});

test('reporting - exposed passwords report', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/exposed-passwords-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-exposed-passwords.png');
});

test('reporting - inactive two-factor report', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/inactive-two-factor-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-inactive-two-factor.png');
});

test('reporting - reused passwords report', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/reused-passwords-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-reused-passwords.png');
});

test('reporting - unsecured websites report', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/unsecured-websites-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-unsecured-websites.png');
});

test('reporting - weak passwords report', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/weak-passwords-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-weak-passwords.png');
});
