/**
 * policies.spec.js
 *
 * Captures a full-page screenshot of the Policies settings page.
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
const outputPath = resolve(__dirname, '../../output/web/adminconsole/policies.png');

const orgId = process.env.ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const email = process.env.BW_EMAIL || '';
const password = process.env.BW_PASSWORD || '';

test('policies - full page screenshot', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  if (!email) throw new Error('BW_EMAIL is not set in .env');
  if (!password) throw new Error('BW_PASSWORD is not set in .env');

  // Step 1: Log in
  await page.goto(baseURL);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Continue")');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Log in with master password")');
  await page.waitForSelector('nav', { state: 'visible', timeout: 30000 });

  // Step 2: Navigate to the Policies page
  await page.goto(`${baseURL}/#/organizations/${orgId}/settings/policies`);

  // Step 3: Wait for the loading spinner to detach and policy sections to render
  await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('bit-section', { state: 'visible', timeout: 10000 });

  // Step 4: Take a full-page screenshot, masking the account avatar
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });

  console.log(`Screenshot saved to: ${outputPath}`);
});
