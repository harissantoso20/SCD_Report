const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Click on Maggot program to trigger it
  try {
    // Need to find the maggot button and click it
    // Wait for the UI to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Evaluate in page to click the Maggot tab
    await page.evaluate(() => {
      // Find buttons containing text 'Maggot'
      const buttons = Array.from(document.querySelectorAll('button, div, a'));
      const maggotBtn = buttons.find(b => b.innerText && b.innerText.toLowerCase().includes('maggot'));
      if (maggotBtn) {
        maggotBtn.click();
      } else {
        console.log('Maggot button not found');
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log('Error clicking:', e);
  }
  
  await browser.close();
})();
