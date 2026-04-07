/**
 * access-intelligence.spec.js
 *
 * Captures a full-page screenshot of the Access Intelligence page.
 *
 * Requires:
 *   - A valid session in auth/storageState.json (run: npm run auth)
 *   - ORG_ID set in .env (or falls back to empty string)
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 */

import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../../output/web/access-intelligence.png');

test('access intelligence - full page screenshot', async ({ page, baseURL, orgId }) => {
  // Fail early with a clear message if ORG_ID isn't set
  if (!orgId) {
    throw new Error('ORG_ID is not set. Add it to your .env file and re-run.');
  }

  // Navigate to the Access Intelligence page
  await page.goto(`${baseURL}/#/organizations/${orgId}/access-intelligence`);

  // Wait for the main content to be visible before capturing
  // This targets the page heading — adjust the selector if needed
  await page.waitForSelector('h1', { state: 'visible', timeout: 15000 });

  // Take a full-page screenshot, masking the account avatar in the top-right
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    mask: [page.locator('app-account-menu')],
  });

  console.log(`Screenshot saved to: ${outputPath}`);
});
