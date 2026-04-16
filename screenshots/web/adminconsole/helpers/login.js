/**
 * login.js
 *
 * Shared login helper for web vault screenshot specs.
 *
 * Usage:
 *   import { login } from './helpers/login.js';
 *   await login(page);
 */

import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const email = process.env.BW_EMAIL || '';
const password = process.env.BW_PASSWORD || '';

function checkEnv() {
  if (!email) throw new Error('BW_EMAIL is not set in .env');
  if (!password) throw new Error('BW_PASSWORD is not set in .env');
}

/**
 * Dismisses any active CDK overlay backdrop (welcome tour, onboarding prompts, etc.)
 * Tries named dismiss buttons first, falls back to Escape.
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
 * Logs in to the Bitwarden web vault.
 * Navigates to baseURL, fills in credentials, and waits for the vault to load.
 * Dismisses any post-login prompts (browser extension, welcome tour, etc.)
 *
 * @param {import('@playwright/test').Page} page
 */
export async function login(page) {
  checkEnv();

  await page.goto(baseURL);
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Continue")');
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Log in with master password")');

  // After login, either the vault nav or the browser extension prompt appears.
  // Wait for whichever comes first and dismiss the prompt if needed.
  await page.waitForSelector('nav, button:has-text("Add it later")', {
    state: 'visible',
    timeout: 30000,
  });
  const addLaterButton = page.locator('button:has-text("Add it later")');
  if (await addLaterButton.isVisible()) {
    await addLaterButton.click();
    await page.waitForSelector('a:has-text("Skip to web app")', { state: 'visible', timeout: 10000 });
    await page.click('a:has-text("Skip to web app")');
  }

  await page.waitForSelector('nav', { state: 'visible', timeout: 30000 });

  // Dismiss any post-login overlay dialogs (welcome tour, onboarding prompts, etc.)
  await dismissOverlay(page);
}
