import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/');

    await page.waitForSelector('#nav-pagos');
    
    await page.click('#nav-pagos');

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'navPagos.png' });

    console.log('Captura de pantalla tomada después de hacer clic en el enlace');
    
    await browser.close();
})();
