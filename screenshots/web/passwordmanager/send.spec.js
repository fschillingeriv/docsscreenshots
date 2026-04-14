/**
 * send.spec.js
 *
 * Captures screenshots of the Send page and its two "New" dialogs:
 *   - send.png            — base Send page
 *   - send-new-text.png   — New > Text Send dialog
 *   - send-new-file.png   — New > File Send dialog
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
import { login } from '../adminconsole/helpers/login.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/web/passwordmanager');

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

async function openNewSendMenu(page, itemLabel) {
  await page.click('button:has-text("New")');
  await page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });
  await page.click(`[role="menuitem"]:has-text("${itemLabel}")`);
}

async function waitForSendDialog(page) {
  await page.waitForSelector('tools-send-details', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
}

async function closeDialog(page) {
  await page.keyboard.press('Escape');
  await page.waitForSelector('bit-dialog', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
}

test('send - base page and new send dialogs', async ({ page }) => {
  await login(page);
  await page.goto(`${baseURL}/#/sends`);
  await page.waitForSelector('tools-send-list', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);

  // Base Send page
  await takeScreenshot(page, 'send.png');

  // New Text Send dialog
  await openNewSendMenu(page, 'Text');
  await waitForSendDialog(page);
  await takeScreenshot(page, 'send-new-text.png');
  await closeDialog(page);

  // New File Send dialog
  await openNewSendMenu(page, 'File');
  await waitForSendDialog(page);
  await takeScreenshot(page, 'send-new-file.png');
  await closeDialog(page);
});
