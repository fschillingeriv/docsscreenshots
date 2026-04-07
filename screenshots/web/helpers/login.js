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

// Credentials and base URL are read directly from process.env so that specs
// don't need to pass them in explicitly.
//
// Alternative: accept { baseURL, email, password } as a parameter instead,
// which would make this helper more flexible if different specs ever need
// different credentials or environments.
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const email = process.env.BW_EMAIL || '';
const password = process.env.BW_PASSWORD || '';

// Prerequisite checks are handled here so specs don't need to repeat them.
//
// Alternative: move these checks into each spec's beforeEach so that specs
// are fully self-contained and explicit about what they require.
function checkEnv() {
  if (!email) throw new Error('BW_EMAIL is not set in .env');
  if (!password) throw new Error('BW_PASSWORD is not set in .env');
}

/**
 * Logs in to the Bitwarden web vault.
 * Navigates to baseURL, fills in credentials, and waits for the vault to load.
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
  await page.waitForSelector('nav', { state: 'visible', timeout: 30000 });
}
