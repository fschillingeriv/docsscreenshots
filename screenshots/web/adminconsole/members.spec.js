/**
 * members.spec.js
 *
 * Captures a full-page screenshot of the Members page.
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
const outputPath = resolve(__dirname, '../../output/web/adminconsole/members.png');

const orgId = process.env.ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';

test('members - full page screenshot', async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');

  await login(page);

  await page.goto(`${baseURL}/#/organizations/${orgId}/members`);

  // The members page has a two-stage load: first the org loads (showing the toggle group
  // and header), then the member data loads (showing the table rows).
  // We wait for the toggle group first, then poll until the spinner is gone.
  await page.waitForSelector('bit-toggle-group', { state: 'visible', timeout: 15000 });
  await page.waitForFunction(() => {
    const spinner = document.querySelector('main i.bwi-spinner');
    return !spinner;
  }, { timeout: 15000 });

  await page.screenshot({
    path: outputPath,
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });

  console.log(`Screenshot saved to: ${outputPath}`);
});
