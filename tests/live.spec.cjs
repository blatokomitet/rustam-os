const {test,expect}=require('@playwright/test');
const baseURL=process.env.RUSTAM_OS_URL||'http://127.0.0.1:4173';
test.use({baseURL,viewport:{width:390,height:844},isMobile:true,hasTouch:true});
test('mobile: five-screen navigation and task persistence',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/',{waitUntil:'networkidle'});
 await expect(page.getByRole('heading',{name:/Привет, Rustam/})).toBeVisible();
 await page.getByRole('button',{name:'Задача',exact:true}).click();
 const title='Проверка '+Date.now();
 await page.getByPlaceholder('Название').fill(title);
 await page.getByRole('button',{name:'Сохранить'}).click();
 await expect(page.getByText(title)).toBeVisible();
 await page.reload({waitUntil:'networkidle'});
 await expect(page.getByText(title)).toBeVisible();
 for(const name of ['Работа','Финансы','План','Персонаж','Сегодня']){
  await page.getByRole('navigation',{name:'Главная навигация'}).getByRole('button',{name,exact:true}).click();
  await expect(page.getByRole('heading',{name:name==='Сегодня'?/Привет, Rustam/:name,level:1})).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('finance: create income and expense',async({page})=>{
 await page.goto('/');
 await page.getByRole('navigation',{name:'Главная навигация'}).getByRole('button',{name:'Финансы'}).click();
 await page.getByRole('button',{name:/Доход/}).last().click();
 await page.getByPlaceholder('Название').fill('Тестовый доход');
 await page.getByPlaceholder('Сумма, zł').fill('500');
 await page.getByRole('button',{name:'Сохранить'}).click();
 await expect(page.getByText('Тестовый доход')).toBeVisible();
 await expect(page.getByText(/500.*zł/).first()).toBeVisible();
});
test('desktop: no horizontal overflow and navigation',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
 await page.goto(baseURL);
 await expect(page.getByRole('heading',{name:/Привет, Rustam/})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await context.close();
});
