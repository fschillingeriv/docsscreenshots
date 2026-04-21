/**
 * vault.spec.js
 *
 * Captures screenshots of the desktop app vault:
 *
 *   - desktop-vault.png                — Vault list (base view)
 *   - desktop-vault-add-item.png       — Add item dialog
 *   - desktop-vault-new-login.png      — New Login cipher form
 *   - desktop-vault-new-card.png       — New Card cipher form
 *   - desktop-vault-new-identity.png   — New Identity cipher form
 *   - desktop-vault-new-note.png       — New Note cipher form
 *   - desktop-vault-new-ssh-key.png    — New SSH key cipher form
 *   - desktop-vault-new-folder.png     — New Folder dialog
 *   - desktop-vault-view-login.png     — View a Login item
 *   - desktop-vault-view-card.png      — View a Card item
 *   - desktop-vault-view-identity.png  — View an Identity item
 *   - desktop-vault-view-note.png      — View a Note item
 *   - desktop-vault-view-ssh-key.png   — View an SSH key item
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - At least one item of each type in the vault
 *   - Milestone 3 + Milestone 4 feature flags enabled on the environment
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { launchAndLogin, closeApp, dismissOverlay } from './helpers/launch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/desktop');

async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: false,
  });
  console.log(`Screenshot saved: ${filename}`);
}

// Wait for the vault list to be settled and ready for interaction
async function waitForVault(page) {
  await page.waitForSelector('app-vault-v3', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
}

// Close any open dialog/drawer by pressing Escape or clicking Close/Cancel
async function closeDialog(page) {
  // Prefer clicking the Close/Cancel button if visible, since drawers may not
  // respond to Escape
  const closeBtn = page.locator('vault-item-dialog button:has-text("Close"), vault-item-dialog button:has-text("Cancel")').first();
  if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeBtn.click({ force: true });
  } else {
    await page.keyboard.press('Escape');
  }
  // Wait for the drawer/dialog and all overlays to fully detach
  await page.waitForSelector('vault-item-dialog', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForSelector('.cdk-overlay-backdrop-showing', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
}

// ---------------------------------------------------------------------------
// New-item helpers
//
// The Milestone 3+ "New" button (#newItemButton) opens an AddItemDialog
// containing a vault-add-item-grid. Each grid item is a <button bit-item-content>
// whose accessible name is "{Type} {Subtitle}" (e.g. "Login Website or app").
//
// We locate grid items by their translated label key, which appears as direct
// text inside the button before the subtitle <div>.
// ---------------------------------------------------------------------------

// Full accessible names for each grid item, derived from the source's
// DIALOG_CIPHER_MENU_ITEMS labelKey + subtitleKey translations.
const ADD_ITEM_NAMES = {
  Login:    'Login Website or app',
  Card:     'Card Credit or debit card',
  Identity: 'Identity Personal info',
  Note:     'Note Important text',
  'SSH key':'SSH key Server login token',
  Folder:   'Folder Organize your items',
};

async function openAddItemDialog(page) {
  // Ensure any previous cipher drawer AND the add-item dialog are fully gone
  await page.waitForSelector('vault-item-dialog', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForSelector('vault-add-item-dialog', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForSelector('.cdk-overlay-backdrop-showing', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.locator('header #newItemButton').click();
  await page.waitForSelector('vault-add-item-dialog', {
    state: 'visible',
    timeout: 5000,
  });
  await page.waitForTimeout(300);
}

async function clickAddItemGridButton(page, typeLabel) {
  const dialog = page.locator('vault-add-item-dialog');
  const fullName = ADD_ITEM_NAMES[typeLabel];
  if (fullName) {
    await dialog.getByRole('button', { name: fullName }).click({ force: true });
  } else {
    await dialog.locator(`button[bit-item-content]:has-text("${typeLabel}")`).first().click({ force: true });
  }
}

// Wait for the cipher form drawer/dialog to appear
async function waitForCipherForm(page) {
  await page.waitForSelector(
    'vault-item-dialog, vault-cipher-form',
    { state: 'visible', timeout: 15000 },
  );
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// View-item helpers
//
// Vault rows use <tr appVaultCipherRow> with a button[bitLink] for the name.
// Clicking it opens the VaultItemDialog drawer in "view" mode.
//
// To filter by type we use the sidebar bit-nav-item elements whose [text]
// attribute matches the type name (e.g. "Login", "Card").
// ---------------------------------------------------------------------------

async function filterByType(page, typeName) {
  // The type filter items are bit-nav-item inside the vault sidebar
  const navItem = page.locator(`bit-nav-item:has-text("${typeName}")`).first();
  await navItem.waitFor({ state: 'visible', timeout: 5000 });
  await navItem.click({ force: true });
  await page.waitForTimeout(500);
}

async function clickFirstVaultItem(page) {
  // Each cipher row has a button[bitLink] that opens the view drawer
  const firstCipherName = page.locator('tr[appvaultcipherrow] button[bitlink], tr[appVaultCipherRow] button[bitLink]').first();
  await firstCipherName.waitFor({ state: 'visible', timeout: 10000 });
  await firstCipherName.click({ force: true });
  await page.waitForSelector(
    'vault-item-dialog, app-cipher-view, vault-cipher-form',
    { state: 'visible', timeout: 15000 },
  );
  await page.waitForTimeout(500);
}

async function resetFilter(page) {
  // Click "All items" in the sidebar to reset the filter
  const allItems = page.locator('bit-nav-group:has-text("All items")').first();
  if (await allItems.isVisible({ timeout: 2000 }).catch(() => false)) {
    await allItems.click({ force: true });
    await page.waitForTimeout(400);
  }
}

// ---------------------------------------------------------------------------
// Main test
// ---------------------------------------------------------------------------

test('desktop vault', async () => {
  test.setTimeout(120000); // 2 minutes for the full suite

  const { electronApp, page } = await launchAndLogin();

  try {
    await waitForVault(page);

    // ── Base vault ────────────────────────────────────────────────────────
    await takeScreenshot(page, 'desktop-vault.png');

    // ── Add item dialog ───────────────────────────────────────────────────
    await openAddItemDialog(page);
    await takeScreenshot(page, 'desktop-vault-add-item.png');

    // ── New Login ─────────────────────────────────────────────────────────
    await clickAddItemGridButton(page, 'Login');
    await waitForCipherForm(page);
    await takeScreenshot(page, 'desktop-vault-new-login.png');
    await closeDialog(page);
    await waitForVault(page);

    // ── New Card ──────────────────────────────────────────────────────────
    await openAddItemDialog(page);
    await clickAddItemGridButton(page, 'Card');
    await waitForCipherForm(page);
    await takeScreenshot(page, 'desktop-vault-new-card.png');
    await closeDialog(page);
    await waitForVault(page);

    // ── New Identity ──────────────────────────────────────────────────────
    await openAddItemDialog(page);
    await clickAddItemGridButton(page, 'Identity');
    await waitForCipherForm(page);
    await takeScreenshot(page, 'desktop-vault-new-identity.png');
    await closeDialog(page);
    await waitForVault(page);

    // ── New Note ──────────────────────────────────────────────────────────
    await openAddItemDialog(page);
    await clickAddItemGridButton(page, 'Note');
    await waitForCipherForm(page);
    await takeScreenshot(page, 'desktop-vault-new-note.png');
    await closeDialog(page);
    await waitForVault(page);

    // ── New SSH key ───────────────────────────────────────────────────────
    await openAddItemDialog(page);
    await clickAddItemGridButton(page, 'SSH key');
    await waitForCipherForm(page);
    // Dismiss the "A new SSH key was generated" toast before screenshotting
    const toast = page.locator('bit-toast');
    if (await toast.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toast.locator('button').click({ force: true });
      await toast.waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
    }
    await takeScreenshot(page, 'desktop-vault-new-ssh-key.png');
    await closeDialog(page);
    await waitForVault(page);

    // ── New Folder ────────────────────────────────────────────────────────
    await openAddItemDialog(page);
    await clickAddItemGridButton(page, 'Folder');
    await page.waitForSelector('vault-add-edit-folder-dialog',
      { state: 'visible', timeout: 10000 },
    );
    await page.waitForTimeout(300);
    await takeScreenshot(page, 'desktop-vault-new-folder.png');
    await closeDialog(page);
    await waitForVault(page);

    // Reset to all items for a clean state
    await resetFilter(page);
  } finally {
    await closeApp(electronApp);
  }
});
