/**
 * integrations.spec.js
 *
 * Captures screenshots of all four tabs on the Integrations page:
 *   - Single sign-on (integrations-sso.png)
 *   - User provisioning (integrations-user-provisioning.png)
 *   - Event management (integrations-event-management.png)
 *   - Device management (integrations-device-management.png)
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - ORG_ID set in .env
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import { login } from './helpers/login.js';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/web/adminconsole');

const orgId = process.env.ORG_ID || '';
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

// Shared wait helper — all four tabs render app-integration-grid once loaded.
// After the grid appears, we wait for all images to finish loading so that
// integration card logos are fully rendered before the screenshot fires.
async function waitForTabContent(page) {
  await page.waitForSelector('app-integration-grid', { state: 'visible', timeout: 15000 });
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Don't block on broken images
        }))
    )
  );
}

test.beforeEach(async ({ page }) => {
  if (!orgId) throw new Error('ORG_ID is not set in .env');
  await login(page);
});

test('integrations - single sign-on tab', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/integrations/single-sign-on`);
  await waitForTabContent(page);
  await takeScreenshot(page, 'integrations-sso.png');
});

test('integrations - user provisioning tab', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/integrations/user-provisioning`);
  await waitForTabContent(page);
  await takeScreenshot(page, 'integrations-user-provisioning.png');
});

test('integrations - event management tab', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/integrations/event-management`);
  await waitForTabContent(page);
  await takeScreenshot(page, 'integrations-event-management.png');
});

test('integrations - device management tab', async ({ page }) => {
  await page.goto(`${baseURL}/#/organizations/${orgId}/integrations/device-management`);
  await waitForTabContent(page);
  await takeScreenshot(page, 'integrations-device-management.png');
});
