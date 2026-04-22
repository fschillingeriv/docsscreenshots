/**
 * send.spec.js
 *
 * Captures screenshots of the desktop Send feature:
 *
 *   - desktop-send.png                 — Send list view
 *   - desktop-send-copy-link.png       — Send options menu open
 *   - desktop-send-delete.png          — Send delete confirmation dialog
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - At least one Send item in the account
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { launchAndLogin, closeApp } from './helpers/launch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/desktop');

async function takeScreenshot(page, filename) {
  await page.screenshot({ path: resolve(outputDir, filename), fullPage: false });
  console.log(`Screenshot saved: ${filename}`);
}

test('desktop send', async () => {
  test.setTimeout(120000);

  const { electronApp, page } = await launchAndLogin();

  try {
    // Navigate to Send via sidebar
    const sendNav = page.locator('bit-nav-group:has-text("Send")').first();
    await sendNav.waitFor({ state: 'visible', timeout: 10000 });
    await sendNav.click({ force: true });

    // Wait for the send table to render
    await page.waitForSelector('tools-send-list', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);

    // ── Send view ─────────────────────────────────────────────────────────
    await takeScreenshot(page, 'desktop-send.png');

    // ── Send options menu (copy link + delete) ────────────────────────────
    // Send rows are plain <tr> elements inside tools-send-table
    const firstSendRow = page.locator('tools-send-table tr[bitrow], tools-send-table tbody tr').first();
    if (await firstSendRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      // The options button uses bitIconButton with label="Options" → aria-label="Options"
      const optionsBtn = firstSendRow.locator('button[aria-label="Options"]').first();
      await optionsBtn.waitFor({ state: 'visible', timeout: 5000 });
      await optionsBtn.click({ force: true });
      await page.waitForSelector('.cdk-overlay-pane', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);

      // ── Copy send link ──────────────────────────────────────────────────
      await takeScreenshot(page, 'desktop-send-copy-link.png');

      // ── Delete send ─────────────────────────────────────────────────────
      // Click Delete from the open menu
      const deleteBtn = page.locator('.cdk-overlay-container button:has-text("Delete")').first();
      if (await deleteBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await deleteBtn.click({ force: true });
        // Wait for the confirmation dialog overlay to appear
        await page.waitForSelector('.cdk-overlay-backdrop-showing', {
          state: 'visible',
          timeout: 5000,
        });
        await page.waitForTimeout(500);
        await takeScreenshot(page, 'desktop-send-delete.png');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        console.log('Skipped: desktop-send-delete.png — Delete menu item not found');
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('Skipped: send item screenshots — no sends found in account');
    }

  } finally {
    await closeApp(electronApp);
  }
});
