/**
 * settings-subscription.spec.js
 *
 * Captures full-page screenshots of all Settings > Subscription pages:
 *   - settings-subscription.png         — Premium membership / subscription
 *   - settings-payment-details.png      — Payment details
 *   - settings-billing-history.png      — Billing history
 *
 * TODO: These pages require a personal premium subscription to render.
 * The current test account (playwright@bitwarden.com) does not have premium,
 * so navigating to /#/settings/subscription/* redirects to the vault.
 * To complete these specs, either:
 *   a) Upgrade the playwright account to premium, or
 *   b) Create a second account with premium and add its credentials to .env
 *      (e.g. BW_EMAIL_PREMIUM / BW_PASSWORD_PREMIUM) and update the login
 *      helper call here accordingly.
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env (account with personal premium)
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 */

// import { test } from '@playwright/test';
// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';
// import dotenv from 'dotenv';
// import { login } from '../adminconsole/helpers/login.js';
//
// dotenv.config();
//
// const __dirname = dirname(fileURLToPath(import.meta.url));
// const outputDir = resolve(__dirname, '../../../output/web/passwordmanager');
//
// const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
//
// async function takeScreenshot(page, filename) {
//   await page.screenshot({
//     path: resolve(outputDir, filename),
//     fullPage: true,
//     mask: [page.locator('app-account-menu')],
//     maskColor: '#ffffff',
//   });
//   console.log(`Screenshot saved: ${filename}`);
// }
//
// test('settings subscription pages', async ({ page }) => {
//   await login(page);
//
//   // Premium membership / subscription
//   await page.goto(`${baseURL}/#/settings/subscription/user-subscription`);
//   await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
//   await page.waitForSelector('billing-subscription-card', { state: 'visible', timeout: 15000 });
//   await takeScreenshot(page, 'settings-subscription.png');
//
//   // Payment details
//   await page.goto(`${baseURL}/#/settings/subscription/payment-details`);
//   await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
//   await page.waitForSelector('app-display-payment-method', { state: 'visible', timeout: 15000 });
//   await takeScreenshot(page, 'settings-payment-details.png');
//
//   // Billing history
//   await page.goto(`${baseURL}/#/settings/subscription/billing-history`);
//   await page.waitForSelector('.bwi-spinner', { state: 'detached', timeout: 15000 });
//   await page.waitForSelector('app-billing-history', { state: 'visible', timeout: 15000 });
//   await takeScreenshot(page, 'settings-billing-history.png');
// });
