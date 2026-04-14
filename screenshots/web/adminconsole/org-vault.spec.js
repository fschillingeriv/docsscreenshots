/**
 * org-vault.spec.js
 *
 * Captures a full-page screenshot of the organization vault page.
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
const outputPath = resolve(__dirname, '../../../output/web/adminconsole/org-vault.png');

const orgId = process.env.ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';

test('org vault - full page screenshot', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');

  // Step 1: Log in
  await login(page);

  // Step 2: Navigate to the org vault page
  await page.goto(`${baseURL}/#/organizations/${orgId}/vault`);

  // Step 2: Wait for the org vault header and items to fully render
  // app-org-vault-header is specific to the org vault and won't match the personal vault
  await page.waitForSelector('app-org-vault-header', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('app-vault-items', { state: 'visible', timeout: 15000 });

  // Step 3: Take a full-page screenshot, masking the account avatar
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });

  console.log(`Screenshot saved to: ${outputPath}`);
});
