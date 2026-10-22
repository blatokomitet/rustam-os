const { test, expect } = require('@playwright/test');
const baseURL = process.env.RUSTAM_OS_URL || 'http://127.0.0.1:4173';
test.use({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
test('live mobile: navigation, tasks, persistence, deletion and console', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Моя система развития' })).toBeVisible();
  await page.locator('aside nav').getByRole('button', { name: 'Задачи', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Задачи', level: 1 })).toBeVisible();
  const title = 'Playwright проверка ' + Date.now();
  await page.getByRole('textbox', { name: 'Название новой задачи' }).fill(title);
  await page.locator('.card .add').getByRole('button', { name: 'Добавить' }).click();
  const row = page.locator('.task').filter({ hasText: title });
  await expect(row).toBeVisible();
  await row.getByRole('checkbox').check();
  await expect(row.getByRole('checkbox')).toBeChecked();
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('aside nav').getByRole('button', { name: 'Задачи', exact: true }).click();
  const persisted = page.locator('.task').filter({ hasText: title });
  await expect(persisted.getByRole('checkbox')).toBeChecked();
  await persisted.getByRole('button', { name: 'Удалить ' + title }).click();
  await expect(page.locator('.task').filter({ hasText: title })).toHaveCount(0);
  for (const tab of ['Направления','Работа','Финансы','Проекты','Календарь','Настройки','Обзор']) {
    await page.locator('aside nav').getByRole('button', { name: tab, exact: true }).click();
    await expect(page.getByRole('heading', { name: tab === 'Обзор' ? 'Моя система развития' : tab, level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});


test('desktop: main sections, finance and viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Моя система развития' })).toBeVisible();
  await expect(page.getByText('ПЕРСОНАЛЬНЫЙ ПРОГРЕСС')).toBeVisible();
  await page.locator('aside nav').getByRole('button', { name: 'Финансы', exact: true }).click();
  await expect(page.getByText('Баланс: 2 550 zł')).toBeVisible();
  await page.locator('aside nav').getByRole('button', { name: 'Направления', exact: true }).click();
  await expect(page.locator('.directions > div')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await context.close();
});

test('mobile habits: create, complete, persist and delete', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const habitsTab = page.locator('aside nav').getByRole('button', { name: 'Привычки', exact: true });
  if (await habitsTab.count() === 0) {
    throw new Error('DEPLOYMENT MISMATCH: опубликованный Cloudflare не содержит вкладку «Привычки», которая есть в src/main.tsx ветки main. Проверьте Cloudflare Workers → rustam-os → Deployments и опубликуйте актуальный main.');
  }
  await expect(habitsTab).toBeVisible({ timeout: 12000 });
  await page.locator('aside nav').getByRole('button', { name: 'Привычки', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Привычки · сегодня' })).toBeVisible();
  const name = 'Привычка Playwright ' + Date.now();
  await page.getByRole('textbox', { name: 'Название новой привычки' }).fill(name);
  await page.locator('.card .add').getByRole('button', { name: 'Добавить' }).click();
  const row = page.locator('.task').filter({ hasText: name });
  await row.getByRole('checkbox').check();
  await page.reload({ waitUntil: 'networkidle' });
  await await expect(page.locator('aside nav').getByRole('button', { name: 'Привычки', exact: true })).toBeVisible({ timeout: 12000 });
  await page.locator('aside nav').getByRole('button', { name: 'Привычки', exact: true }).click();
  await expect(page.locator('.task').filter({ hasText: name }).getByRole('checkbox')).toBeChecked();
  await page.getByRole('button', { name: 'Удалить привычку ' + name }).click();
  await expect(page.locator('.task').filter({ hasText: name })).toHaveCount(0);
});
