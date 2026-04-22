const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        let errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(`[Console Error]: ${msg.text()}`);
            }
        });
        page.on('pageerror', error => {
            errors.push(`[Page Error]: ${error.message}`);
        });

        await page.goto('http://localhost:5173/user', { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Take a screenshot of what's rendered
        await page.screenshot({ path: 'dashboard.png', fullPage: true });

        console.log("ERRORS_FOUND:");
        errors.forEach(e => console.log(e));
        if (errors.length === 0) console.log("None");

        await browser.close();
    } catch (err) {
        console.error("Puppeteer Script Error:", err);
    }
})();
