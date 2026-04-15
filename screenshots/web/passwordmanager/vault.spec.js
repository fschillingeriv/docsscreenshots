/**
 * vault.spec.js
 *
 * Captures screenshots of the Password Manager vault page and all seven
 * "New" item dialogs, plus item and bulk action menus:
 *   - vault.png                     — base vault page
 *   - vault-new-login.png           — New > Login dialog
 *   - vault-new-card.png            — New > Card dialog
 *   - vault-new-identity.png        — New > Identity dialog
 *   - vault-new-note.png            — New > Note dialog
 *   - vault-new-ssh-key.png         — New > SSH key dialog
 *   - vault-new-folder.png          — New > Folder dialog
 *   - vault-new-collection.png      — New > Collection dialog
 *   - vault-item-options-login.png  — Login item ellipsis menu
 *   - vault-bulk-options.png        — Bulk actions ellipsis menu (2 items selected)
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
const outputDir = resolve(__dirname, '../../../output/web/passwordmanager');

const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';

// Shared screenshot helper
async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });
  console.log(`Screenshot saved: ${filename}`);
}

// Navigate to the vault and wait for items to load
async function goToVault(page) {
  await page.goto(baseURL);
  await page.waitForSelector('app-vault-items', { state: 'visible', timeout: 15000 });
  // Dismiss the onboarding checklist if it's visible
  const dismissButton = page.locator('button:has-text("Dismiss")');
  if (await dismissButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dismissButton.click();
    await page.waitForSelector('app-vault-onboarding', { state: 'detached', timeout: 5000 }).catch(() => {});
  }
  await page.waitForTimeout(500);
}

// Open the New menu and click a specific item by label
async function openNewMenu(page, itemLabel) {
  await page.click('button:has-text("New")');
  await page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });
  await page.click(`[role="menuitem"]:has-text("${itemLabel}")`);
}

// Wait for a cipher form dialog to be fully ready
async function waitForCipherDialog(page) {
  await page.waitForSelector('vault-cipher-form', { state: 'visible', timeout: 15000 });
  // Wait for the dialog backdrop to fully render
  await page.waitForTimeout(500);
}

// Wait for a named dialog (folder/collection) by its title text
async function waitForNamedDialog(page, title) {
  await page.waitForSelector(`span[bitdialogtitle]:has-text("${title}")`, { state: 'visible', timeout: 15000 });
  // Wait for the dialog backdrop to fully render
  await page.waitForTimeout(500);
}

// Close any open dialog by pressing Escape
async function closeDialog(page) {
  await page.keyboard.press('Escape');
  await page.waitForSelector('bit-dialog', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
}

test('vault - base page and new item dialogs', async ({ page }) => {
  // Log in once and navigate to the vault
  await login(page);
  await goToVault(page);

  // Base vault page
  await takeScreenshot(page, 'vault.png');

  // Login dialog
  await openNewMenu(page, 'Login');
  await waitForCipherDialog(page);
  await takeScreenshot(page, 'vault-new-login.png');
  await closeDialog(page);

  // Card dialog
  await openNewMenu(page, 'Card');
  await waitForCipherDialog(page);
  await takeScreenshot(page, 'vault-new-card.png');
  await closeDialog(page);

  // Identity dialog
  await openNewMenu(page, 'Identity');
  await waitForCipherDialog(page);
  await takeScreenshot(page, 'vault-new-identity.png');
  await closeDialog(page);

  // Note dialog
  await openNewMenu(page, 'Note');
  await waitForCipherDialog(page);
  await takeScreenshot(page, 'vault-new-note.png');
  await closeDialog(page);

  // SSH key dialog
  await openNewMenu(page, 'SSH key');
  await waitForCipherDialog(page);
  await takeScreenshot(page, 'vault-new-ssh-key.png');
  await closeDialog(page);

  // Folder dialog
  await openNewMenu(page, 'Folder');
  await waitForNamedDialog(page, 'New folder');
  await takeScreenshot(page, 'vault-new-folder.png');
  await closeDialog(page);

  // Collection dialog
  await openNewMenu(page, 'Collection');
  await waitForNamedDialog(page, 'New collection');
  await takeScreenshot(page, 'vault-new-collection.png');
  await closeDialog(page);

  // Login item ellipsis menu — navigate fresh to ensure clean table state
  await goToVault(page);
  const firstItemRow = page.locator('table tbody tr').first();
  await firstItemRow.waitFor({ state: 'visible', timeout: 10000 });
  await firstItemRow.hover();
  await firstItemRow.locator('button[aria-label="Options"]').click();
  await page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(300);
  await takeScreenshot(page, 'vault-item-options-login.png');
  await page.keyboard.press('Escape');

  // Bulk actions ellipsis menu — select first two rows then open header menu
  await goToVault(page);
  const rows = page.locator('table tbody tr');
  await rows.nth(0).locator('input[type="checkbox"]').check();
  await rows.nth(1).locator('input[type="checkbox"]').check();
  await page.waitForTimeout(300);
  await page.locator('table thead button[aria-label="Options"]').click();
  await page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: resolve(outputDir, 'vault-bulk-options.png'),
    fullPage: true,
    mask: [
      page.locator('app-account-menu'),
      page.locator('table thead input[type="checkbox"]'),
    ],
    maskColor: '#ffffff',
  });
  console.log('Screenshot saved: vault-bulk-options.png');
  await page.keyboard.press('Escape');
});
