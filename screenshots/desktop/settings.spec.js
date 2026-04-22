/**
 * settings.spec.js
 *
 * Captures screenshots of the desktop app Settings modal:
 *
 *   - desktop-settings-security.png   — Security section showing PIN toggle (#26)
 *   - desktop-settings-app.png        — App settings (all accounts) section (#11)
 *
 * Settings is triggered via ipc.platform.sendMessage({ command: 'openSettings' }),
 * the same mechanism the native Bitwarden menu item uses.
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
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

async function openSettings(page, electronApp) {
  // The 'openSettings' message must come from the main process to the renderer
  // (via win.webContents.send), not from the renderer to main.
  // The Angular app's BroadcasterService subscription in app.component.ts listens
  // for this on the 'messagingService' IPC channel inbound from main.
  await electronApp.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send('messagingService', { command: 'openSettings' });
    }
  });
  // app-settings lives inside a Bootstrap modal (.modal.fade) which starts
  // hidden and transitions in — wait for the modal body to be visible.
  await page.waitForSelector('app-settings .modal-body', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(300);
}

test('desktop settings', async () => {
  test.setTimeout(120000);

  const { electronApp, page } = await launchAndLogin();

  try {
    await openSettings(page, electronApp);

    // ── #26: Security section — PIN toggle ────────────────────────────────
    // Security is expanded by default (showSecurity = true in component).
    // The section is identified by the expandable button with id="app-settings".
    const securityToggle = page.locator('#app-settings').first();
    if (await securityToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await securityToggle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await takeScreenshot(page, 'desktop-settings-security.png');
    } else {
      console.log('Skipped: desktop-settings-security.png — security section not found');
    }

    // ── #11: App settings (all accounts) section ──────────────────────────
    // Find the "App settings" expandable toggle. Its label translates to
    // "appPreferences" = "App settings (all accounts)" on macOS.
    const appPrefsToggle = page.locator('button.box-header-expandable').filter({
      hasText: /app settings|preferences/i,
    }).last();

    if (await appPrefsToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      const expanded = await appPrefsToggle.getAttribute('aria-expanded');
      if (expanded === 'false') {
        await appPrefsToggle.click();
        await page.waitForTimeout(300);
      }
      await appPrefsToggle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await takeScreenshot(page, 'desktop-settings-app.png');
    } else {
      console.log('Skipped: desktop-settings-app.png — app preferences section not found');
    }

  } finally {
    await closeApp(electronApp);
  }
});
