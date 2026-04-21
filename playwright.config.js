import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './screenshots',
  outputDir: './output',
  workers: 1, // Run specs sequentially to avoid concurrent login rate limiting
  timeout: 60000, // 60s per test to accommodate rate limiting during login

  // Always write output to last-run.log in addition to the terminal
  reporter: [
    ['list'],
  ],

  use: {
    // Screenshots are taken manually in each spec via page.screenshot()
    screenshot: 'off',
    // Ignore HTTPS errors for local development environments with self-signed certificates
    ignoreHTTPSErrors: true,
    // Wait for network to settle before specs start
    waitUntil: 'networkidle',
  },

  projects: [
    {
      name: 'web-adminconsole',
      testDir: './screenshots/web/adminconsole',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_APP_URL || 'https://vault.bitwarden.com',
        viewport: { width: 1280, height: 1100 },
      },
    },
    {
      name: 'web-passwordmanager',
      testDir: './screenshots/web/passwordmanager',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_APP_URL || 'https://vault.bitwarden.com',
        viewport: { width: 1280, height: 1100 },
      },
    },
    {
      name: 'web-secretsmanager',
      testDir: './screenshots/web/secretsmanager',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_APP_URL || 'https://vault.bitwarden.com',
        viewport: { width: 1280, height: 1100 },
      },
    },

    // Future clients — uncomment and configure as needed:
    // {
    //   name: 'browser-extension',
    //   testDir: './screenshots/extension',
    //   use: { ... },
    // },

    {
      name: 'desktop',
      testDir: './screenshots/desktop',
      use: {
        // Electron apps are driven via _electron.launch() in each spec,
        // not via a browser — no browser context is created here.
        viewport: { width: 1280, height: 900 },
      },
      dependencies: ['desktop-setup'],
    },

    {
      name: 'desktop-setup',
      testDir: './screenshots/desktop',
      testMatch: 'setup.js',
      use: {},
    },
  ],
});
