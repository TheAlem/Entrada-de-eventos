import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/personal-data');

    await page.waitForSelector('select#academicLevel'); 

    await page.select('select#academicLevel', 'Professional'); 
    await page.type('#firstName', 'Fulanito');
    await page.type('#lastName', 'Navarro');
    await page.type('#birthDate', '01-09-2001');
    await page.select('#country', 'Bolivia');
    await page.type('#companyName', 'Univalle');
    await page.type('#profession', 'Ingeniero');
    await page.type('#email', 'fulanito@gmail.com');
    await page.type('#phone', '123456789');

    await page.screenshot({ path: 'formularioRellenado.png' });

    await page.click('button[type="submit"]');
    console.log('Formulario enviado y captura de pantalla tomada');

    await page.waitForFunction(() => window.location.href.includes('/payment'), { timeout: 60000 });
    await page.screenshot({ path: 'pantallaGenerandoQr.png' });
    console.log('Captura de pantalla de la fase de generación de QR tomada');

    try {
        await new Promise(resolve => setTimeout(resolve, 60000));

        await page.waitForSelector('img[src*="QR"]', { timeout: 60000 });
        await page.screenshot({ path: 'pantallaCodigoQr.png' });
        console.log('Captura de pantalla de la página con el código QR tomada');
    } catch (error) {
        console.error('Error esperando al código QR:', error);
        await page.screenshot({ path: 'errorPantalla.png' });
    }

    await browser.close();
})();
