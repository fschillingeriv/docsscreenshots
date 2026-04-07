/**
 * setup-auth.js
 *
 * Run this script once before your first screenshot run, and any time
 * your session expires or you switch target environments.
 *
 * Usage:
 *   npm run auth
 *
 * What it does:
 *   1. Opens a visible Chromium browser and navigates to WEB_APP_URL
 *   2. Waits for you to log in and fully unlock your vault manually
 *   3. Saves the resulting session to auth/storageState.json
 *
 * auth/storageState.json is gitignored and will only ever exist locally.
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const storageStatePath = resolve(__dirname, 'storageState.json');
const url = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';

console.log(`\nOpening browser at: ${url}`);
console.log('Log in and fully unlock your vault, then come back here and press Enter.\n');

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(url);

// Wait for manual login
await new Promise((resolve) => {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.once('data', resolve);
  process.stdout.write('Press Enter when ready... ');
});

process.stdin.setRawMode(false);
process.stdin.pause();

await context.storageState({ path: storageStatePath });
await browser.close();

console.log(`\nSession saved to: ${storageStatePath}`);
console.log('You can now run screenshot specs with: npm run screenshot\n');
