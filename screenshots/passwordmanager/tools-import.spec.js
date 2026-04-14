/**
 * tools-import.spec.js
 *
 * Captures a full-page screenshot of the Tools > Import page.
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
import { login } from '../web/helpers/login.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../../output/web/passwordmanager/tools-import.png');

const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';

test('tools import - full page screenshot', async ({ page }) => {
  await login(page);
  await page.goto(`${baseURL}/#/tools/import`);

  // Wait for the import component to render
  await page.waitForSelector('tools-import', { state: 'visible', timeout: 15000 });

  await page.screenshot({
    path: outputPath,
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });

  console.log(`Screenshot saved to: ${outputPath}`);
});
