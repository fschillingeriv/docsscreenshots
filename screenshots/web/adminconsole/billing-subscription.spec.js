/**
 * billing-subscription.spec.js
 *
 * Captures a full-page screenshot of the Billing > Subscription page.
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
const outputPath = resolve(__dirname, '../../output/web/adminconsole/billing-subscription.png');

const orgId = process.env.ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';

test('billing subscription - full page screenshot', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');

  await login(page);

  await page.goto(`${baseURL}/#/organizations/${orgId}/billing/subscription`);

  // Wait for the subscription status component — specific to this page and
  // only renders once the organization subscription data has fully loaded.
  // Note: bit-table also exists on other pages so is not a reliable wait target here.
  await page.waitForSelector('app-subscription-status', { state: 'visible', timeout: 15000 });

  await page.screenshot({
    path: outputPath,
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });

  console.log(`Screenshot saved to: ${outputPath}`);
});
