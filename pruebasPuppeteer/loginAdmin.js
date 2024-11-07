import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/login');

    await page.waitForSelector('#email');

    await page.type('#email', 'admin@gmail.com');
    await page.type('#password', 'admin123');

    await page.screenshot({ path: 'formularioLoginRellenado.png' });

    await page.click('button[type="submit"]');
    console.log('Formulario de inicio de sesión enviado y captura tomada');

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.screenshot({ path: 'paginaPostLogin.png' });
    console.log('Captura de pantalla de la página redirigida después de iniciar sesión');

    await browser.close();
})();
