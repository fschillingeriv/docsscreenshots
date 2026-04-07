import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './screenshots',
  outputDir: './output',

  use: {
    // Screenshots are taken manually in each spec via page.screenshot()
    screenshot: 'off',
    // Wait for network to settle before specs start
    waitUntil: 'networkidle',
  },

  projects: [
    {
      name: 'web',
      testDir: './screenshots/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_APP_URL || 'https://vault.bitwarden.com',
        viewport: { width: 1280, height: 800 },
      },
    },

    // Future clients — uncomment and configure as needed:
    // {
    //   name: 'browser-extension',
    //   testDir: './screenshots/extension',
    //   use: { ... },
    // },
    // {
    //   name: 'desktop',
    //   testDir: './screenshots/desktop',
    //   use: { ... },
    // },
  ],
});
