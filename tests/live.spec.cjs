const { test, expect } = require('@playwright/test');
const baseURL = process.env.RUSTAM_OS_URL || 'https://rustam-os.rustam-zhabrailov.workers.dev/';
test.use({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
test('live mobile: navigation, tasks, persistence, deletion and console', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Моя система развития' })).toBeVisible();
  await page.getByRole('button', { name: 'Задачи', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Задачи' })).toBeVisible();
  const title = 'Playwright проверка ' + Date.now();
  await page.getByRole('textbox', { name: 'Название новой задачи' }).fill(title);
  await page.getByRole('button', { name: 'Добавить' }).click();
  const row = page.locator('.task').filter({ hasText: title });
  await expect(row).toBeVisible();
  await row.getByRole('checkbox').check();
  await expect(row.getByRole('checkbox')).toBeChecked();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Задачи', exact: true }).click();
  const persisted = page.locator('.task').filter({ hasText: title });
  await expect(persisted.getByRole('checkbox')).toBeChecked();
  await persisted.getByRole('button', { name: 'Удалить ' + title }).click();
  await expect(page.locator('.task').filter({ hasText: title })).toHaveCount(0);
  for (const tab of ['Направления','Работа','Финансы','Проекты','Календарь','Настройки','Обзор']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await expect(page.getByRole('heading', { name: tab === 'Обзор' ? 'Моя система развития' : tab })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
