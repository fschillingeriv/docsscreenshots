/**
 * sm-secrets.spec.js
 *
 * Captures screenshots of the Secrets Manager Secrets list and secret dialog tabs:
 *   - sm-secrets.png                        — Secrets list
 *   - sm-secret-dialog-details.png          — Secret dialog > Name/Value pair tab
 *   - sm-secret-dialog-people.png           — Secret dialog > People tab
 *   - sm-secret-dialog-machine-accounts.png — Secret dialog > Machine accounts tab
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - SM_ORG_ID set in .env (the org GUID in the SM URL)
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 *   - At least one secret must exist in the SM org
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

// Click a tab by its visible label and wait for it to become active
async function clickTab(page, label) {
  const tab = page.locator(`[role="tab"]:has-text("${label}")`);
  await tab.waitFor({ state: 'visible', timeout: 10000 });
  await tab.click();
  await page.waitForTimeout(400);
}

// Open the secret dialog by clicking the name button in the first row
async function openFirstSecret(page) {
  await dismissOverlay(page);
  // Secrets use a button (not a link) in the name cell to open the dialog
  const firstSecretButton = page.locator('tbody tr').first().locator('button').first();
  await firstSecretButton.waitFor({ state: 'visible', timeout: 10000 });
  await firstSecretButton.click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
}

// Close the dialog by pressing Escape
async function closeDialog(page) {
  await page.keyboard.press('Escape');
  await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
}

test('sm secrets list and dialog tabs', async ({ page }) => {
  await login(page);

  // Secrets list
  await page.goto(`${smBase}/secrets`);
  await page.waitForSelector('tbody tr', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
  await dismissOverlay(page);
  await takeScreenshot(page, 'sm-secrets.png');

  // Open first secret dialog — lands on Name/Value pair tab by default
  await openFirstSecret(page);
  await clickTab(page, 'Name/Value pair');
  await takeScreenshot(page, 'sm-secret-dialog-details.png');

  // People tab
  await clickTab(page, 'People');
  await takeScreenshot(page, 'sm-secret-dialog-people.png');

  // Machine accounts tab
  await clickTab(page, 'Machine accounts');
  await takeScreenshot(page, 'sm-secret-dialog-machine-accounts.png');

  await closeDialog(page);
});
