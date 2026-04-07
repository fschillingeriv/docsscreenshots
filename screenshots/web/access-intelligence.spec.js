/**
 * access-intelligence.spec.js
 *
 * Captures a full-page screenshot of the Access Intelligence page.
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

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../../output/web/access-intelligence.png');

const orgId = process.env.ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const email = process.env.BW_EMAIL || '';
const password = process.env.BW_PASSWORD || '';

test('access intelligence - full page screenshot', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  if (!email) throw new Error('BW_EMAIL is not set in .env');
  if (!password) throw new Error('BW_PASSWORD is not set in .env');

  // Step 1: Navigate to the vault and log in
  await page.goto(baseURL);

  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Continue")');

  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Log in with master password")');

  // Step 2: Wait for the vault to finish loading
  await page.waitForSelector('nav', { state: 'visible', timeout: 30000 });

  // Step 3: Navigate to the Access Intelligence page
  await page.goto(`${baseURL}/#/organizations/${orgId}/access-intelligence`);

  // Step 4: Wait for the page to finish loading
  // The skeleton loader (dirt-report-loading) is shown while data is fetching.
  // Once it's gone, either bit-tab-group (report data) or empty-state-card (no data)
  // will be present — both mean the page is fully rendered.
  await page.waitForSelector('dirt-report-loading', { state: 'detached', timeout: 30000 });
  await page.waitForSelector('bit-tab-group, empty-state-card', { state: 'visible', timeout: 10000 });
  // Wait for the fadeIn animation to complete (300ms + 100ms delay per the component)
  await page.waitForTimeout(500);

  // Step 5: Take a full-page screenshot, masking the account avatar
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    mask: [page.locator('app-account-menu')],
  });

  console.log(`Screenshot saved to: ${outputPath}`);
});
