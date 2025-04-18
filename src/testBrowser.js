const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');

async function testBrowser() {
    const userDataDir = path.join(os.tmpdir(), 'puppeteer-test-profile');
    const metamaskPath = path.join(__dirname, '../extensions/metamask');

    console.log('Запускаем браузер с MetaMask...');
    console.log('Путь к MetaMask:', metamaskPath);

    try {
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
                `--disable-extensions-except=${metamaskPath}`,
                `--load-extension=${metamaskPath}`,
                `--user-data-dir=${userDataDir}`,
                '--remote-debugging-port=9222'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });

        console.log('Браузер запущен');
        console.log('Открываем новую страницу...');

        const pages = await browser.pages();
        const page = pages[0] || await browser.newPage();

        await page.goto('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html');
        console.log('Открыта страница MetaMask');

        // Ждем 30 секунд для проверки
        console.log('Ожидаем 30 секунд...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        console.log('Закрываем браузер...');
        await browser.close();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

testBrowser(); 