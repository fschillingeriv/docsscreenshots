/**
 * reporting.spec.js
 *
 * Captures full-page screenshots of all Reporting pages:
 *   - reporting-reports-home.png        — Reports home
 *   - reporting-exposed-passwords.png   — Exposed passwords report
 *   - reporting-inactive-two-factor.png — Inactive two-factor report
 *   - reporting-reused-passwords.png    — Reused passwords report
 *   - reporting-unsecured-websites.png  — Unsecured websites report
 *   - reporting-weak-passwords.png      — Weak passwords report
 *   - reporting-member-access.png       — Member access report
 *   - reporting-events.png              — Event logs
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

async function waitForReport(page) {
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-callout', { state: 'visible', timeout: 15000 });
}

test('reporting pages', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  await login(page);

  // Reports home
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports`);
  await page.waitForSelector('app-report-list', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'reporting-reports-home.png');

  // Exposed passwords
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/exposed-passwords-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-exposed-passwords.png');

  // Inactive two-factor
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/inactive-two-factor-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-inactive-two-factor.png');

  // Reused passwords
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/reused-passwords-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-reused-passwords.png');

  // Unsecured websites
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/unsecured-websites-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-unsecured-websites.png');

  // Weak passwords
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/weak-passwords-report`);
  await waitForReport(page);
  await takeScreenshot(page, 'reporting-weak-passwords.png');

  // Member access
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/reports/member-access-report`);
  await page.waitForSelector('bit-icon[name="bwi-spinner"]', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-table-scroll', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'reporting-member-access.png');

  // Event logs
  await page.goto(`${baseURL}/#/organizations/${orgId}/reporting/events`);
  await page.waitForSelector('input[type="datetime-local"]', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('[data-testid="events-table"], p', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'reporting-events.png');
});
