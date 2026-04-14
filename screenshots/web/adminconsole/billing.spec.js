/**
 * billing.spec.js
 *
 * Captures full-page screenshots of all Billing pages:
 *   - billing-subscription.png    — Subscription
 *   - billing-payment-details.png — Payment details
 *   - billing-history.png         — Billing history
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

test('billing pages', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  await login(page);

  // Subscription
  await page.goto(`${baseURL}/#/organizations/${orgId}/billing/subscription`);
  await page.waitForSelector('app-subscription-status', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'billing-subscription.png');

  // Payment details
  await page.goto(`${baseURL}/#/organizations/${orgId}/billing/payment-details`);
  await page.waitForSelector('app-display-payment-method', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'billing-payment-details.png');

  // Billing history
  await page.goto(`${baseURL}/#/organizations/${orgId}/billing/history`);
  await page.waitForSelector('app-billing-history', { state: 'visible', timeout: 15000 });
  await takeScreenshot(page, 'billing-history.png');
});
