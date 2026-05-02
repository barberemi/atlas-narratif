import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  workers: 1,
  reporter: 'list',

  globalSetup: './e2e/global-setup.js',

  use: {
    baseURL: BASE_URL,
    headless: true,
    storageState: 'e2e/.auth/storage.json',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],

  webServer: undefined,
});
