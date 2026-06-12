const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  await page.waitForSelector('input[type="email"]', { timeout: 5000 }).catch(() => console.log('No email input'));
  
  await page.type('input[type="email"]', 'comdevptba@gmail.com');
  await page.type('input[type="password"]', 'Scd12345!');
  
  await page.click('button[type="submit"]');
  
  console.log('Clicked submit. Waiting 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  if (html.includes('animate-spin')) {
     console.log('SPINNER IS VISIBLE');
  } else {
     console.log('SPINNER NOT VISIBLE');
  }
  
  if (html.includes('SCD Report Login')) {
     console.log('STILL ON LOGIN PAGE');
     const err = await page.evaluate(() => {
        const errEl = document.querySelector('.text-red-700');
        return errEl ? errEl.innerText : null;
     });
     if (err) console.log('ERROR ON PAGE:', err);
  } else {
     console.log('LOGIN SEEMS SUCCESSFUL, NO LOGIN FORM FOUND');
  }
  
  await browser.close();
})();
