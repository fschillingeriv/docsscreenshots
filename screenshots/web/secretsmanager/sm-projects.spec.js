/**
 * sm-projects.spec.js
 *
 * Captures screenshots of the Secrets Manager Projects list and project detail tabs:
 *   - sm-projects.png                          — Projects list
 *   - sm-project-detail-secrets.png            — Project detail > Secrets tab
 *   - sm-project-detail-people.png             — Project detail > People tab
 *   - sm-project-detail-machine-accounts.png   — Project detail > Machine accounts tab
 *
 * Requires:
 *   - BW_EMAIL and BW_PASSWORD set in .env
 *   - SM_ORG_ID set in .env (the org GUID in the SM URL)
 *   - WEB_APP_URL set in .env (or falls back to https://vault.bitwarden.com)
 *   - Email verification disabled on the account
 *   - At least one project must exist in the SM org
 */

import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import { login } from '../adminconsole/helpers/login.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../../output/web/secretsmanager');

const smOrgId = process.env.SM_ORG_ID || '';
const baseURL = process.env.WEB_APP_URL || 'https://vault.bitwarden.com';
const smBase = `${baseURL}/#/sm/${smOrgId}`;

async function takeScreenshot(page, filename) {
  await page.screenshot({
    path: resolve(outputDir, filename),
    fullPage: true,
    mask: [page.locator('app-account-menu')],
    maskColor: '#ffffff',
  });
  console.log(`Screenshot saved: ${filename}`);
}

test('sm projects list and detail tabs', async ({ page }) => {
  await login(page);

  // Projects list
  await page.goto(`${smBase}/projects`);
  await page.waitForSelector('tbody tr', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'sm-projects.png');

  // Grab the href of the first project's link to extract the project ID
  const firstProjectLink = page.locator('tbody tr').first().locator('a').first();
  await firstProjectLink.waitFor({ state: 'visible', timeout: 10000 });
  const projectHref = await firstProjectLink.getAttribute('href');
  // href is like "#/sm/{orgId}/projects/{projectId}" — extract the project ID
  const projectId = projectHref.split('/projects/')[1];

  const projectBase = `${smBase}/projects/${projectId}`;

  // Secrets tab
  await page.goto(`${projectBase}/secrets`);
  await page.waitForSelector('navigation, tbody, bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await takeScreenshot(page, 'sm-project-detail-secrets.png');

  // People tab
  await page.goto(`${projectBase}/people`);
  await page.waitForSelector('navigation, tbody, bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await takeScreenshot(page, 'sm-project-detail-people.png');

  // Machine accounts tab
  await page.goto(`${projectBase}/machine-accounts`);
  await page.waitForSelector('navigation, tbody, bit-section', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await takeScreenshot(page, 'sm-project-detail-machine-accounts.png');
});
