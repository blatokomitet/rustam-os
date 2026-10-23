const { test, expect } = require('@playwright/test');

const baseURL = process.env.RUSTAM_OS_URL || 'http://127.0.0.1:4173';

test.use({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test('mobile: welcome, task persistence, and navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /Привет, Rustam/ })).toBeVisible();

  await page.locator('.os3-actions').getByRole('button', { name: /Задача/ }).click();
  const title = 'Проверка ' + Date.now();
  await page.getByPlaceholder('Название').fill(title);
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText(title)).toBeVisible();

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText(title)).toBeVisible();

  for (const name of ['Работа', 'Финансы', 'План', 'Персонаж', 'Сегодня']) {
    const navButton = page.locator('.os3-nav').getByRole('button', { name: new RegExp(name + '$') });
    await expect(navButton).toBeVisible();
    await navButton.click();
    const headingName = name === 'Сегодня' ? /Привет, Rustam/ : name;
    await expect(page.getByRole('heading', { name: headingName, level: 1 })).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test('finance: create income entry', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Главная навигация' }).getByRole('button', { name: 'Финансы' }).click();
  await page.getByRole('button', { name: /Доход/ }).last().click();
  await page.getByPlaceholder('Название').fill('Тестовый доход');
  await page.getByPlaceholder('Сумма, zł').fill('500');
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Тестовый доход')).toBeVisible();
  await expect(page.getByText(/500.*zł/).first()).toBeVisible();
});

test('desktop: no horizontal overflow and navigation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /Привет, Rustam/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await context.close();
});
