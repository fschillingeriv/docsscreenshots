/**
 * sm-machine-accounts.spec.js
 *
 * Captures screenshots of the Secrets Manager Machine accounts list and detail tabs:
 *   - sm-machine-accounts.png                      — Machine accounts list
 *   - sm-machine-account-projects.png              — Machine account detail > Projects tab
 *   - sm-machine-account-people.png                — Machine account detail > People tab
 *   - sm-machine-account-access-tokens.png         — Machine account detail > Access tokens tab
 *   - sm-machine-account-config.png                — Machine account detail > Config tab
 *   - sm-machine-account-event-logs.png            — Machine account detail > Event logs tab
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - SM_ORG_ID set in .env (the org GUID in the SM URL)
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 *   - At least one machine account must exist in the SM org
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import { login, dismissOverlay } from '../adminconsole/helpers/login.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../../output/web/secretsmanager');

const smOrgId = process.env.SM_ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const smBase = `${baseURL}/#/sm/${smOrgId}`;

async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });
  console.log(`Screenshot saved: ${filename}`);
}

test('sm machine accounts list and detail tabs', async ({ page }) => {
  await login(page);

  // Machine accounts list
  await page.goto(`${smBase}/machine-accounts`);
  await page.waitForSelector('tbody tr', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-machine-accounts.png');

  // Grab the href of the first machine account's link to extract the machine account ID
  const firstMachineAccountLink = page.locator('tbody tr').first().locator('a').first();
  await firstMachineAccountLink.waitFor({ state: 'visible', timeout: 10000 });
  const machineAccountHref = await firstMachineAccountLink.getAttribute('href');
  // href is like "#/sm/{orgId}/machine-accounts/{machineAccountId}" — extract the ID
  const machineAccountId = machineAccountHref.split('/machine-accounts/')[1];

  const machineAccountBase = `${smBase}/machine-accounts/${machineAccountId}`;

  // Projects tab
  await page.goto(`${machineAccountBase}/projects`);
  await page.waitForSelector('nav[aria-label="Main"], navigation, tbody, bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-machine-account-projects.png');

  // People tab
  await page.goto(`${machineAccountBase}/people`);
  await page.waitForSelector('nav[aria-label="Main"], navigation, tbody, bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-machine-account-people.png');

  // Access tokens tab
  await page.goto(`${machineAccountBase}/access`);
  await page.waitForSelector('nav[aria-label="Main"], navigation, tbody, bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-machine-account-access-tokens.png');

  // Config tab — page renders environment variables, no table or bit-section
  await page.goto(`${machineAccountBase}/config`);
  await page.waitForSelector('h2', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-machine-account-config.png');

  // Event logs tab
  await page.goto(`${machineAccountBase}/events`);
  await page.waitForSelector('h1, h2, tbody, bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(600); // event logs may take a moment to load
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-machine-account-event-logs.png');
});
