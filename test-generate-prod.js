const { chromium } = require('playwright');

(async () => {
  console.log('Opening browser...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await (await browser.newContext()).newPage();
  
  page.on('console', msg => console.log('[PAGE]', msg.text()));
  
  await page.goto('https://repurpose-orpin.vercel.app/generate', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  
  if (page.url().includes('/login')) {
    console.log('Please log in... waiting 2 minutes');
    await page.waitForURL('**/generate', { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(5000);
  }
  
  const green = await page.locator('.bg-green-50').count();
  const yellow = await page.locator('.bg-yellow-50').count();
  
  if (green > 0) {
    console.log('SUCCESS: Connected accounts found');
    console.log(await page.locator('.bg-green-50').textContent());
  } else if (yellow > 0) {
    console.log('PROBLEM: No accounts message');
    console.log(await page.locator('.bg-yellow-50').textContent());
  }
  
  await page.screenshot({ path: 'test-result.png', fullPage: true });
  console.log('Screenshot: test-result.png');
  
  await page.waitForTimeout(20000);
  await browser.close();
})();