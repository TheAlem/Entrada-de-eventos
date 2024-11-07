import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/login');

    await page.waitForSelector('#email');

    await page.type('#email', 'admin@gmail.com');
    await page.type('#password', 'admin123');

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('#btn-edit');
    await page.click('#btn-edit');
    await page.screenshot({ path: 'capturaBotonEdit.png' });
    console.log('Captura de pantalla después de presionar el botón de editar');

    await page.waitForSelector('#edit-nombre');
    await page.type('#edit-nombre', 'Jose');
    await page.type('#edit-profesion', 'licenciado');
    await page.screenshot({ path: 'capturaCamposRellenados.png' });
    console.log('Captura de pantalla después de rellenar los campos de edición');

    await page.click('#btn-confirmar-edit');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'capturaConfirmacionEdit.png' });
    console.log('Captura de pantalla después de presionar el botón de confirmar');

    await browser.close();
})();
