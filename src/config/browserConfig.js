const path = require('path');
const os = require('os');

// Путь к директории с расширением MetaMask в проекте
const METAMASK_EXTENSION_PATH = path.join(__dirname, '../../extensions/metamask');

// Конфигурация для запуска браузера с MetaMask
const getBrowserConfig = (userDataDir) => ({
    headless: false, // Важно для работы с расширениями
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        `--disable-extensions-except=${METAMASK_EXTENSION_PATH}`,
        `--load-extension=${METAMASK_EXTENSION_PATH}`,
        `--user-data-dir=${userDataDir}`
    ],
    defaultViewport: {
        width: 1920,
        height: 1080
    }
});

module.exports = {
    getBrowserConfig,
    METAMASK_EXTENSION_PATH
}; 