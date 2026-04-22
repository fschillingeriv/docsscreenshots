/**
 * launch.js
 *
 * Shared launch helper for desktop screenshot specs.
 *
 * Each launch uses a clean, isolated app data directory (BITWARDEN_APPDATA_DIR),
 * which forces a full login flow every time. This guarantees fresh auth tokens
 * and a clean sync on startup — no stale cached vault data.
 *
 * Usage:
 *   import { launchAndLogin, closeApp, dismissOverlay } from './helpers/launch.js';
 *
 *   test('my test', async () => {
 *     const { electronApp, page } = await launchAndLogin();
 *     // ... take screenshots ...
 *     await closeApp(electronApp);
 *   });
 */

import { _electron as electron } from '@playwright/test';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const DESKTOP_DIR = resolve(process.env.HOME, 'dev/clients/apps/desktop');
const MONOREPO_DIR = resolve(process.env.HOME, 'dev/clients');

// Isolated app data directory — wiped before each launch so the app always
// starts fresh, logs in from scratch, and syncs on first load.
// Gitignored via .desktop-app-data/ entry in .gitignore.
const APP_DATA_DIR = resolve(
  dirname(new URL(import.meta.url).pathname),
  '../../../.desktop-app-data'
);

const email = process.env.BW_EMAIL || '';
const password = process.env.BW_PASSWORD || '';
const serverUrl = process.env.BW_SERVER_URL || process.env.WEB_APP_URL || '';

function checkEnv() {
  if (!email) throw new Error('BW_EMAIL is not set in .env');
  if (!password) throw new Error('BW_PASSWORD is not set in .env');
}

// Resolve the Electron binary from the monorepo's hoisted node_modules.
function resolveElectronPath() {
  const pathTxt = resolve(MONOREPO_DIR, 'node_modules/electron/path.txt');
  if (existsSync(pathTxt)) {
    const relative = readFileSync(pathTxt, 'utf8').trim();
    return resolve(MONOREPO_DIR, 'node_modules/electron/dist', relative);
  }
  return resolve(DESKTOP_DIR, 'node_modules/.bin/electron');
}

// Resolve the npm binary for Node 22 via nvm.
function resolveNpmBin() {
  const nvmDir = process.env.NVM_DIR || resolve(process.env.HOME, '.nvm');
  const v22Dir = resolve(nvmDir, 'versions/node');
  if (existsSync(v22Dir)) {
    try {
      const versions = execSync(`ls "${v22Dir}"`, { encoding: 'utf8' })
        .split('\n')
        .filter((v) => v.startsWith('v22.'))
        .sort()
        .reverse();
      if (versions.length > 0) {
        const npmBin = resolve(v22Dir, versions[0], 'bin/npm');
        if (existsSync(npmBin)) return npmBin;
      }
    } catch { /* fall through */ }
  }
  return 'npm';
}

/**
 * Launches the Bitwarden desktop app to the login screen without logging in.
 * Returns the app, page, and configured serverUrl so the caller can take
 * pre-login screenshots before proceeding.
 *
 * @returns {{ electronApp, page, serverUrl }}
 */
export async function launchToLoginScreen() {
  checkEnv();

  if (existsSync(APP_DATA_DIR)) {
    rmSync(APP_DATA_DIR, { recursive: true, force: true });
  }
  mkdirSync(APP_DATA_DIR, { recursive: true });

  const seedData = {
    'global_desktopSettings_preventScreenshots': false,
    'global_theming_selection': 'light',
  };
  const { writeFileSync } = await import('fs');
  writeFileSync(resolve(APP_DATA_DIR, 'data.json'), JSON.stringify(seedData));

  console.log(`[desktop] Using fresh app data dir: ${APP_DATA_DIR}`);

  const electronPath = resolveElectronPath();
  const npmBin = resolveNpmBin();
  const nodeBin = existsSync(npmBin) ? resolve(dirname(npmBin), 'node') : process.execPath;

  console.log(`[desktop] Launching via npm start (${electronPath})`);

  const electronApp = await electron.launch({
    executablePath: electronPath,
    args: [resolve(DESKTOP_DIR, 'build')],
    cwd: DESKTOP_DIR,
    env: {
      ...process.env,
      PATH: `${dirname(nodeBin)}:${process.env.PATH}`,
      ELECTRON_IS_DEV: '0',
      ELECTRON_NO_UPDATER: '1',
      BITWARDEN_APPDATA_DIR: APP_DATA_DIR,
    },
  });

  const page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('app-root', { state: 'attached', timeout: 30000 });

  // Close DevTools immediately — dev builds open it automatically but it
  // shrinks the app window and would appear in pre-login screenshots.
  // Poll until it stays closed, since loadURL().then() may reopen it.
  for (let i = 0; i < 20; i++) {
    const isOpen = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win && win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
        return true;
      }
      return false;
    });
    if (!isOpen) break;
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(300);

  await page.waitForSelector('auth-anon-layout', { state: 'visible', timeout: 30000 });

  return { electronApp, page, serverUrl };
}

/**
 * Launches the Bitwarden desktop app against a clean, isolated data directory
 * and performs a full login, ensuring fresh tokens and a clean sync.
 *
 * @returns {{ electronApp: import('@playwright/test').ElectronApplication, page: import('@playwright/test').Page }}
 */
export async function launchAndLogin() {
  checkEnv();

  // Wipe and recreate the app data directory so the app always starts fresh.
  if (existsSync(APP_DATA_DIR)) {
    rmSync(APP_DATA_DIR, { recursive: true, force: true });
  }
  mkdirSync(APP_DATA_DIR, { recursive: true });

  // Pre-seed the storage so the app starts with the right settings:
  // - preventScreenshots=false: allows Playwright to capture the window
  // - theming_selection='light': forces light mode regardless of system theme
  const seedData = {
    'global_desktopSettings_preventScreenshots': false,
    'global_theming_selection': 'light',
  };
  const { writeFileSync } = await import('fs');
  writeFileSync(resolve(APP_DATA_DIR, 'data.json'), JSON.stringify(seedData));

  console.log(`[desktop] Using fresh app data dir: ${APP_DATA_DIR}`);

  const electronPath = resolveElectronPath();
  const npmBin = resolveNpmBin();
  const nodeBin = existsSync(npmBin) ? resolve(dirname(npmBin), 'node') : process.execPath;

  console.log(`[desktop] Launching via npm start (${electronPath})`);

  const electronApp = await electron.launch({
    executablePath: electronPath,
    args: [resolve(DESKTOP_DIR, 'build')],
    cwd: DESKTOP_DIR,
    env: {
      ...process.env,
      PATH: `${dirname(nodeBin)}:${process.env.PATH}`,
      // ELECTRON_IS_DEV=1 prevents the single-instance lock and enables
      // DevTools, but more importantly it causes the production build's
      // isDev() check to still return false (it's compile-time via
      // BIT_ENVIRONMENT). However, the process isolation native module
      // check uses isDev() which IS compile-time — so we need to skip
      // process isolation another way.
      //
      // Setting BITWARDEN_DISABLE_PROCESS_ISOLATION is not supported by
      // the app. Instead, we pass --no-sandbox which prevents the native
      // process isolation from taking effect on macOS.
      ELECTRON_IS_DEV: '0',
      ELECTRON_NO_UPDATER: '1',
      BITWARDEN_APPDATA_DIR: APP_DATA_DIR,
    },
  });

  const page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('app-root', { state: 'attached', timeout: 30000 });

  // With a clean data directory the app always lands on the login screen.
  await page.waitForSelector('auth-anon-layout', { state: 'visible', timeout: 30000 });

  // If a custom server URL is configured, set it before logging in.
  if (serverUrl) {
    // Click the region selector button (shows current domain, e.g. "bitwarden.com")
    const regionBtn = page.locator('environment-selector button').first();
    await regionBtn.waitFor({ state: 'visible', timeout: 10000 });
    await regionBtn.click();
    await page.waitForTimeout(300);

    // Click "self-hosted" from the dropdown menu (renders in CDK overlay)
    await page.locator('.cdk-overlay-container button:has-text("self-hosted")').click({ force: true });

    // Fill in the base URL and save
    await page.waitForSelector('#self_hosted_env_settings_form_input_base_url', { state: 'visible', timeout: 5000 });
    await page.fill('#self_hosted_env_settings_form_input_base_url', serverUrl);
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for the dialog to close and the toast to confirm
    await page.waitForSelector('bit-dialog', { state: 'detached', timeout: 5000 });
    await page.waitForTimeout(500);
    console.log(`[desktop] Server URL configured: ${serverUrl}`);
  }

  // Full login flow — email → continue → master password → log in
  await page.locator('input[type="email"]').fill(email);
  await page.click('button:has-text("Continue")');
  await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 });
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Log in with master password")');

  // Wait for the authenticated layout — login also triggers a full sync
  await page.waitForSelector('bit-layout', { state: 'visible', timeout: 60000 });

  // Wait for the vault to finish its initial load and sync
  await page.waitForSelector('app-vault-v3', { state: 'visible', timeout: 30000 });
  await page.waitForTimeout(2000);

  await dismissOverlay(page);

  // Dev builds auto-open DevTools after loadURL resolves.
  // Close it now that the app is fully loaded, and keep it closed.
  await electronApp.evaluate(({ BrowserWindow }) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      }
    }
  });
  await page.waitForTimeout(500);

  // Disable content protection so Playwright can take screenshots.
  // The new branch may have preventScreenshots enabled by default.
  await electronApp.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.setContentProtection(false);
    }
  });

  return { electronApp, page };
}

/**
 * Dismisses any active CDK overlay backdrop.
 * Safe to call when no overlay is present.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function dismissOverlay(page) {
  for (let i = 0; i < 5; i++) {
    const backdrop = page.locator('.cdk-overlay-backdrop-showing');
    if (!await backdrop.isVisible({ timeout: 1500 }).catch(() => false)) break;

    for (const label of ['Skip', 'Close', 'Dismiss', 'Got it']) {
      const btn = page.locator(`button:has-text("${label}")`);
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        break;
      }
    }

    await backdrop.waitFor({ state: 'detached', timeout: 2000 }).catch(async () => {
      await page.keyboard.press('Escape');
      await backdrop.waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});
    });
  }
}

/**
 * Closes the Electron app.
 *
 * @param {import('@playwright/test').ElectronApplication} electronApp
 */
export async function closeApp(electronApp) {
  await electronApp.close();
}
