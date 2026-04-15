/**
 * reports.spec.js
 *
 * Captures full-page screenshots of all Password Manager Reports pages:
 *   - reports-home.png               — Reports home
 *   - reports-breach.png             — Data breach report (base state, form unfilled)
 *   - reports-exposed-passwords.png  — Exposed passwords report
 *   - reports-reused-passwords.png   — Reused passwords report
 *   - reports-unsecured-websites.png — Unsecured websites report
 *   - reports-weak-passwords.png     — Weak passwords report
 *   - reports-inactive-two-factor.png — Inactive two-factor report
 *
 * Notes:
 *   - The breach report requires submitting an email — we screenshot the base
 *     state only (form visible, no results).
 *   - The exposed passwords report requires clicking "Check exposed passwords"
 *     to load results. We screenshot the base state only.
 *   - The remaining five reports auto-load on navigation.
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

// Wait for a report that auto-loads on navigation
async function waitForAutoLoadReport(page) {
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-callout', { state: 'visible', timeout: 15000 });
}

test('reports pages', async ({ page }) => {
  await login(page);

  // Reports home
  await page.goto(`${baseURL}/#/reports`);
  await page.waitForSelector('app-report-list', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'reports-home.png');

  // Data breach report — screenshot the base form state only
  await page.goto(`${baseURL}/#/reports/breach-report`);
  await page.waitForSelector('input[type="text"]', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'reports-breach.png');

  // Exposed passwords — screenshot the base state only (button visible, no results)
  await page.goto(`${baseURL}/#/reports/exposed-passwords-report`);
  await page.waitForSelector('button:has-text("Check exposed passwords")', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'reports-exposed-passwords.png');

  // Reused passwords
  await page.goto(`${baseURL}/#/reports/reused-passwords-report`);
  await waitForAutoLoadReport(page);
  await takeScreenshot(page, 'reports-reused-passwords.png');

  // Unsecured websites
  await page.goto(`${baseURL}/#/reports/unsecured-websites-report`);
  await waitForAutoLoadReport(page);
  await takeScreenshot(page, 'reports-unsecured-websites.png');

  // Weak passwords
  await page.goto(`${baseURL}/#/reports/weak-passwords-report`);
  await waitForAutoLoadReport(page);
  await takeScreenshot(page, 'reports-weak-passwords.png');

  // Inactive two-factor
  await page.goto(`${baseURL}/#/reports/inactive-two-factor-report`);
  await waitForAutoLoadReport(page);
  await takeScreenshot(page, 'reports-inactive-two-factor.png');
});
