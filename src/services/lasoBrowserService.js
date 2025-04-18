const { ethers } = require('ethers');
const axios = require('axios');
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const { getBrowserConfig } = require('../config/browserConfig');
require('dotenv').config();
const fs = require('fs');

class LasoBrowserService {
    constructor() {
        this.browser = null;
        this.context = null;
        this.tokenCache = new Map();
        this.dataCache = new Map();
        this.userDataDir = path.join(os.tmpdir(), 'playwright-profile');
        this.metamaskPath = path.join(__dirname, '../../extensions/metamask');
        this.isServer = process.env.NODE_ENV === 'production';
        console.log('Сервис инициализирован');
    }

    // Получаем данные из кэша
    getCachedData(address) {
        const cached = this.dataCache.get(address);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }
        return null;
    }

    // Сохраняем данные в кэш
    setCachedData(address, data) {
        this.dataCache.set(address, {
            data,
            timestamp: Date.now()
        });
    }

    // Получаем токен из кэша
    getCachedToken(address) {
        const cached = this.tokenCache.get(address);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.token;
        }
        return null;
    }

    // Сохраняем токен в кэш
    setCachedToken(address, token) {
        this.tokenCache.set(address, {
            token,
            timestamp: Date.now()
        });
    }

    async getBrowser() {
        try {
            if (this.browser) return this.browser;

            console.log('Запуск браузера...');
            console.log('Путь к профилю:', this.userDataDir);

            this.browser = await chromium.launchPersistentContext(this.userDataDir, {
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ],
                viewport: { width: 1280, height: 720 },
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ignoreHTTPSErrors: true
            });

            console.log('Браузер запущен');
            return this.browser;
        } catch (error) {
            console.error('Ошибка при запуске браузера:', error);
            throw error;
        }
    }

    async getToken(privateKey) {
        try {
            console.log('Получение токена...');
            const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
            const address = wallet.address.toLowerCase();
            console.log('Адрес кошелька:', address);

            console.log('Получаем nonce...');
            const nonceResponse = await axios.post('https://us-central1-kyc-ts.cloudfunctions.net/getNonceToSign', {
                data: { address }
            });
            console.log('Nonce получен');

            console.log('Подписываем сообщение...');
            const signature = await wallet.signMessage(nonceResponse.data.result.nonce);
            console.log('Сообщение подписано');

            console.log('Верифицируем подпись...');
            const verifyResponse = await axios.post('https://us-central1-kyc-ts.cloudfunctions.net/verifySignedMessage', {
                data: { address, signature }
            });
            console.log('Подпись верифицирована');

            const token = verifyResponse.data.data.token;
            console.log('Токен получен успешно');
            return token;
        } catch (error) {
            console.error('Ошибка при получении токена:', error.response?.data || error.message);
            throw error;
        }
    }

    async getBalance(privateKey) {
        let page = null;
        try {
            // Получаем токен
            const token = await this.getToken(privateKey);

            // Открываем страницу и получаем данные
            console.log('Открываем страницу...');
            const browser = await this.getBrowser();
            page = await browser.newPage();

            // Устанавливаем таймауты
            page.setDefaultTimeout(60000);
            page.setDefaultNavigationTimeout(60000);

            // Открываем страницу и ждем загрузки
            console.log('Переходим на страницу...');
            await page.goto('https://laso.finance/international/rel', {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            // Ждем появления кнопки Connect Wallet
            console.log('Ожидаем появления кнопки Connect Wallet...');
            await page.waitForSelector('button:has-text("Connect Wallet")', { timeout: 30000 });
            console.log('Кнопка Connect Wallet найдена');

            // Нажимаем на кнопку
            console.log('Нажимаем на кнопку Connect Wallet...');
            await page.click('button:has-text("Connect Wallet")');
            console.log('Кнопка нажата');

            // Ждем появления MetaMask
            console.log('Ожидаем появления MetaMask...');
            await page.waitForTimeout(2000); // Даем время на появление MetaMask

            // Проверяем, что страница загрузилась
            await page.waitForLoadState('networkidle');
            console.log('Страница загружена');

            // Устанавливаем токен
            console.log('Устанавливаем токен...');
            await page.evaluate((t) => {
                localStorage.setItem('authToken', t);
                console.log('Токен установлен в localStorage');
            }, token);

            // Проверяем, что токен установлен
            const tokenInStorage = await page.evaluate(() => {
                return localStorage.getItem('authToken');
            });
            console.log('Токен в localStorage:', tokenInStorage ? 'установлен' : 'отсутствует');

            // Перезагружаем страницу
            console.log('Перезагружаем страницу...');
            await page.reload({ waitUntil: 'networkidle' });
            console.log('Страница перезагружена');

            // Ждем загрузки данных
            console.log('Ожидаем загрузку данных...');
            await page.waitForFunction(() => {
                const data = localStorage.getItem('intlCardsViteV2');
                return data && JSON.parse(data).length > 0;
            }, { timeout: 60000 });

            // Получаем данные
            console.log('Получаем данные...');
            const data = await page.evaluate(() => {
                const raw = localStorage.getItem('intlCardsViteV2');
                return raw ? JSON.parse(raw) : null;
            });

            if (!data || !data.length) {
                console.error('Данные не найдены в localStorage');
                throw new Error('Нет данных');
            }

            return {
                lastFour: data[0].lastFourDigits,
                balance: data[0].balance,
                status: data[0].status
            };

        } catch (error) {
            console.error('Критическая ошибка:', error.message);
            if (page) {
                try {
                    await page.screenshot({ path: 'error.png' });
                    console.log('Скриншот ошибки сохранен в error.png');
                } catch (e) {
                    console.error('Не удалось сделать скриншот:', e);
                }
                await page.close();
            }
            throw error;
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

module.exports = new LasoBrowserService(); 