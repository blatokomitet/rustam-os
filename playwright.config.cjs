const local = !process.env.RUSTAM_OS_URL;
module.exports = {
  testDir: './tests',
  testMatch: '**/*.spec.cjs',
  timeout: 60000,
  expect: { timeout: 12000 },
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.RUSTAM_OS_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  ...(local ? { webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  } } : {})
};
