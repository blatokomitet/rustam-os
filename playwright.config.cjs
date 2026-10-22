module.exports = {
  testDir: './tests',
  testMatch: '**/*.spec.cjs',
  timeout: 60000,
  retries: 1,
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' }
};
