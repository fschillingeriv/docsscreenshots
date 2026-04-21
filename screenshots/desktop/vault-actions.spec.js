/**
 * vault-actions.spec.js
 *
 * Captures screenshots of vault actions beyond basic item creation:
 *
 *   - desktop-filtering.png            — Sidebar with Login filter active
 *   - desktop-trash.png                — Trash view
 *   - desktop-archive.png              — Archive view
 *   - desktop-edit-folder.png          — Edit folder dialog
 *   - desktop-share.png                — Assign to collections dialog
 *   - desktop-item-options.png         — Item right-click/options menu
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - At least one Login item in the vault
 *   - At least one folder in the vault
 *   - Milestone 3 + Milestone 4 feature flags enabled
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

async function waitForVault(page) {
  await page.waitForSelector('app-vault-v3', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
}

// Open the options menu on a vault cipher row by hovering and clicking the
// ellipsis button. BitIconButtonComponent renders aria-label from the label input.
async function openRowOptionsMenu(page, row) {
  await row.hover();
  await page.waitForTimeout(300);
  const optionsBtn = row.locator('button[aria-label="Options"]').first();
  await optionsBtn.waitFor({ state: 'visible', timeout: 5000 });
  await optionsBtn.click({ force: true });
  await page.waitForSelector('.cdk-overlay-container bit-menu-item, .cdk-overlay-pane', {
    state: 'visible',
    timeout: 5000,
  });
  await page.waitForTimeout(300);
}

test('desktop vault actions', async () => {
  test.setTimeout(120000);

  const { electronApp, page } = await launchAndLogin();

  try {
    await waitForVault(page);

    // ── Filtering on desktop ──────────────────────────────────────────────
    const loginFilter = page.locator('bit-nav-item:has-text("Login")').first();
    await loginFilter.waitFor({ state: 'visible', timeout: 5000 });
    await loginFilter.click({ force: true });
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'desktop-filtering.png');

    // ── Trash in the desktop app ──────────────────────────────────────────
    const trashFilter = page.locator('bit-nav-item:has-text("Trash")').first();
    await trashFilter.waitFor({ state: 'visible', timeout: 5000 });
    await trashFilter.click({ force: true });
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'desktop-trash.png');

    // ── Archive view ──────────────────────────────────────────────────────
    const archiveFilter = page.locator('bit-nav-item:has-text("Archive")').first();
    await archiveFilter.waitFor({ state: 'visible', timeout: 5000 });
    await archiveFilter.click({ force: true });
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'desktop-archive.png');

    // ── Reset to All items ────────────────────────────────────────────────
    const allItems = page.locator('bit-nav-group:has-text("All items")').first();
    await allItems.click({ force: true });
    await page.waitForTimeout(500);

    // ── Item options menu ─────────────────────────────────────────────────
    const firstRow = page.locator('tr[appvaultcipherrow]').first();
    await firstRow.waitFor({ state: 'visible', timeout: 10000 });
    await openRowOptionsMenu(page, firstRow);
    await takeScreenshot(page, 'desktop-item-options.png');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // ── Edit a folder on desktop ──────────────────────────────────────────
    // The Folders nav group is the last bit-nav-group in app-vault-filter.
    // Use data-testid on the collapse arrow rather than aria-label, which may
    // vary. Folders is always the last group in the vault filter sidebar.
    const allCollapseArrows = page.locator('app-vault-filter button[data-testid="nav-group-collapse-arrow"]');
    const foldersToggle = allCollapseArrows.last();
    if (await foldersToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      const expanded = await foldersToggle.getAttribute('aria-expanded');
      if (expanded === 'false') {
        await foldersToggle.click({ force: true });
        await page.waitForTimeout(300);
      }
      // Folder items are now in the DOM — hover the first to reveal the edit button
      const firstFolder = page.locator('app-folder-filter').first();
      if (await firstFolder.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstFolder.hover();
        await page.waitForTimeout(300);
        const editBtn = firstFolder.locator('button[aria-label="Edit folder"]').first();
        if (await editBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await editBtn.click({ force: true });
          await page.waitForSelector('vault-add-edit-folder-dialog', {
            state: 'visible',
            timeout: 5000,
          });
          await page.waitForTimeout(300);
          await takeScreenshot(page, 'desktop-edit-folder.png');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        } else {
          console.log('Skipped: desktop-edit-folder.png — edit button not found on folder');
        }
      } else {
        console.log('Skipped: desktop-edit-folder.png — no folder items visible after expanding');
      }
    } else {
      console.log('Skipped: desktop-edit-folder.png — Folders toggle button not found');
    }

    // ── Share from desktop (Assign to collections) ────────────────────────
    // Scope "All items" to app-type-filter to avoid matching stale elements
    await page.waitForSelector('.cdk-overlay-backdrop-showing', { state: 'detached', timeout: 5000 }).catch(() => {});
    await page.locator('app-type-filter bit-nav-group').first().click({ force: true });
    await page.waitForTimeout(500);

    const shareRow = page.locator('tr[appvaultcipherrow]').first();
    await shareRow.waitFor({ state: 'visible', timeout: 10000 });
    await openRowOptionsMenu(page, shareRow);

    const assignBtn = page.locator('.cdk-overlay-container button:has-text("Assign to collections")').first();
    if (await assignBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await assignBtn.click({ force: true });
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'desktop-share.png');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      console.log('Skipped: desktop-share.png — Assign to collections not available');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

  } finally {
    await closeApp(electronApp);
  }
});
