/**
 * access-intelligence.spec.js
 *
 * Captures screenshots of all three tabs on the Access Intelligence page:
 *   - Activity (access-intelligence-activity.png)
 *   - All applications (access-intelligence-all.png)
 *   - Critical applications (access-intelligence-critical.png)
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - ORG_ID set in .env
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 */

import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/web/adminconsole');

const orgId = process.env.ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const email = process.env.BW_EMAIL || '';
const password = process.env.BW_PASSWORD || '';

// Shared screenshot helper — masks avatar, applies white mask color
async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: false,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });
  console.log(`Screenshot saved: ${filename}`);
}

// Shared wait helper — waits for the page content to fully load and animate in
async function waitForPageLoad(page) {
  await page.waitForSelector('dirt-report-loading', { state: 'detached', timeout: 30000 });
  await page.waitForSelector('bit-tab-group, empty-state-card', { state: 'visible', timeout: 10000 });
  // Wait for the fadeIn animation to complete (300ms + 100ms delay per the component)
  await page.waitForTimeout(500);
}

// Log in and navigate to the Access Intelligence page before each test
test.beforeEach(async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  if (!email) throw new Error('BW_EMAIL is not set in .env');
  if (!password) throw new Error('BW_PASSWORD is not set in .env');

  // Log in
  await page.goto(baseURL);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Continue")');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Log in with master password")');
  await page.waitForSelector('nav', { state: 'visible', timeout: 30000 });

  // Navigate to Access Intelligence
  await page.goto(`${baseURL}/#/organizations/${orgId}/access-intelligence`);
  await waitForPageLoad(page);
});

test('access intelligence - activity tab', async ({ page }) => {
  // Activity is the default tab — no click needed
  await takeScreenshot(page, 'access-intelligence-activity.png');
});

test('access intelligence - all applications tab', async ({ page }) => {
  await page.click('button[role="tab"]:has-text("All applications")');
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'access-intelligence-all.png');
});

test('access intelligence - critical applications tab', async ({ page }) => {
  await page.click('button[role="tab"]:has-text("Critical applications")');
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'access-intelligence-critical.png');
});
