const { ethers } = require('ethers');
const axios = require('axios');
const puppeteer = require('puppeteer');
require('dotenv').config();

class LasoBrowserService {
    constructor() {
        // Кэш для хранения токенов авторизации по адресам
        this.tokenCache = new Map();
        // Кэш для хранения данных карт
        this.cardCache = new Map();
        // Время жизни кэша (1 час)
        this.cacheTTL = 60 * 60 * 1000;
        
        this.browser = null;
        console.log('Сервис инициализирован');
    }

    // Получаем данные из кэша
    getCachedData(address) {
        const cached = this.cardCache.get(address);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }
        return null;
    }

    // Сохраняем данные в кэш
    setCachedData(address, data) {
        this.cardCache.set(address, {
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

    async init(privateKey) {
        try {
            if (!privateKey) {
                throw new Error('Приватный ключ не предоставлен');
            }

            const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
            const address = wallet.address.toLowerCase();

            // Проверяем кэш токена
            const cachedToken = this.getCachedToken(address);
            if (cachedToken) {
                console.log('Используем кэшированный токен для адреса:', address);
                return { token: cachedToken };
            }

            console.log('Начинаем авторизацию для адреса:', address);
            
            // 1. Получаем nonce для подписи
            const nonceResponse = await axios.post('https://us-central1-kyc-ts.cloudfunctions.net/getNonceToSign', {
                data: {
                    address: address
                }
            }, {
                headers: {
                    'Origin': 'https://laso.finance',
                    'Referer': 'https://laso.finance/',
                    'Content-Type': 'application/json'
                }
            });
            
            const messageToSign = nonceResponse.data.result.nonce;
            console.log('Получили сообщение для подписи:', messageToSign);

            // 2. Подписываем сообщение
            const signature = await wallet.signMessage(messageToSign);
            console.log('Сообщение подписано');

            // 3. Верифицируем подпись
            const verifyResponse = await axios.post('https://us-central1-kyc-ts.cloudfunctions.net/verifySignedMessage', {
                data: {
                    address: address,
                    signature: signature
                }
            }, {
                headers: {
                    'Origin': 'https://laso.finance',
                    'Referer': 'https://laso.finance/',
                    'Content-Type': 'application/json'
                }
            });

            if (verifyResponse.data.data && verifyResponse.data.data.token) {
                const token = verifyResponse.data.data.token;
                // Сохраняем токен в кэш
                this.setCachedToken(address, token);
                console.log('Токен получен и сохранен в кэш');
                return { token };
            } else {
                throw new Error('Токен не найден в ответе');
            }

        } catch (error) {
            console.error('Ошибка при авторизации:', error.response?.data || error.message);
            throw error;
        }
    }

    async getBalance(privateKey) {
        try {
            if (!privateKey) {
                throw new Error('Приватный ключ не предоставлен');
            }

            const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
            const address = wallet.address.toLowerCase();

            // Проверяем кэш данных карты
            const cachedData = this.getCachedData(address);
            if (cachedData) {
                console.log('Используем кэшированные данные для адреса:', address);
                return cachedData;
            }

            // Получаем токен авторизации
            const authResult = await this.init(privateKey);
            const token = authResult.token;

            if (!this.browser) {
                console.log('Запускаем браузер');
                this.browser = await puppeteer.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--window-size=1920,1080'
                    ],
                    defaultViewport: {
                        width: 1920,
                        height: 1080
                    }
                });
            }

            console.log('Открываем новую страницу');
            const page = await this.browser.newPage();

            try {
                // Эмулируем MetaMask
                await page.evaluateOnNewDocument((address) => {
                    const ethereum = {
                        isMetaMask: true,
                        networkVersion: '1',
                        chainId: '0x1',
                        selectedAddress: address,
                        isConnected: () => true,
                        request: async ({ method, params }) => {
                            switch (method) {
                                case 'eth_requestAccounts':
                                case 'eth_accounts':
                                    return [address];
                                case 'eth_chainId':
                                    return '0x1';
                                case 'eth_getBalance':
                                    return '0x0';
                                case 'personal_sign':
                                case 'eth_sign':
                                    return '0x0';
                                default:
                                    return null;
                            }
                        },
                        on: () => {},
                        removeListener: () => {},
                        _metamask: {
                            isUnlocked: () => true
                        }
                    };

                    Object.defineProperty(window, 'ethereum', {
                        value: ethereum,
                        writable: false
                    });

                    window.web3 = {
                        currentProvider: ethereum
                    };
                }, address);

                // Устанавливаем токен в localStorage
                await page.evaluateOnNewDocument((token) => {
                    localStorage.setItem('auth._token.local', `Bearer ${token}`);
                }, token);

                // Переходим на страницу
                await page.goto('https://laso.finance/international/rel', {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });

                // Ждем и получаем данные из localStorage
                const cardData = await page.evaluate(() => {
                    return new Promise((resolve) => {
                        const checkData = () => {
                            const data = localStorage.getItem('card');
                            if (data) {
                                resolve(JSON.parse(data));
                            } else {
                                setTimeout(checkData, 1000);
                            }
                        };
                        checkData();
                    });
                });

                if (!cardData) {
                    throw new Error('Данные карты не найдены');
                }

                // Сохраняем данные в кэш
                this.setCachedData(address, cardData);

                return cardData;

            } finally {
                await page.close();
            }
            
        } catch (error) {
            console.error('Ошибка при получении баланса:', error.message);
            throw error;
        }
    }

    async setupPaymentMethod(privateKey, paymentType) {
        try {
            if (!privateKey) {
                throw new Error('Приватный ключ не предоставлен');
            }

            if (!['apple', 'google'].includes(paymentType)) {
                throw new Error('Неверный тип платежной системы. Используйте "apple" или "google"');
            }

            const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
            const address = wallet.address.toLowerCase();

            // Получаем токен авторизации
            const authResult = await this.init(privateKey);
            const token = authResult.token;

            // Открываем браузер в видимом режиме для взаимодействия с платежной системой
            const browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--window-size=1920,1080'
                ],
                defaultViewport: {
                    width: 1920,
                    height: 1080
                }
            });

            try {
                console.log('Открываем страницу для настройки платежной системы');
                const page = await browser.newPage();

                // Эмулируем MetaMask
                await page.evaluateOnNewDocument((address) => {
                    const ethereum = {
                        isMetaMask: true,
                        networkVersion: '1',
                        chainId: '0x1',
                        selectedAddress: address,
                        isConnected: () => true,
                        request: async ({ method, params }) => {
                            switch (method) {
                                case 'eth_requestAccounts':
                                case 'eth_accounts':
                                    return [address];
                                case 'eth_chainId':
                                    return '0x1';
                                case 'eth_getBalance':
                                    return '0x0';
                                case 'personal_sign':
                                case 'eth_sign':
                                    return '0x0';
                                default:
                                    return null;
                            }
                        },
                        on: () => {},
                        removeListener: () => {},
                        _metamask: {
                            isUnlocked: () => true
                        }
                    };

                    Object.defineProperty(window, 'ethereum', {
                        value: ethereum,
                        writable: false
                    });

                    window.web3 = {
                        currentProvider: ethereum
                    };
                }, address);

                // Устанавливаем токен в localStorage
                await page.evaluateOnNewDocument((token) => {
                    localStorage.setItem('auth._token.local', `Bearer ${token}`);
                }, token);

                // Переходим на страницу настроек карты
                await page.goto('https://laso.finance/international/rel', {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });

                // Ждем загрузки данных карты
                await page.waitForFunction(() => {
                    return localStorage.getItem('card') !== null;
                }, { timeout: 30000 });

                // Находим и кликаем на кнопку настройки платежной системы
                if (paymentType === 'apple') {
                    console.log('Ожидаем появления кнопки Apple Pay');
                    await page.waitForSelector('button[data-testid="apple-pay-button"]');
                    await page.click('button[data-testid="apple-pay-button"]');
                } else {
                    console.log('Ожидаем появления кнопки Google Pay');
                    await page.waitForSelector('button[data-testid="google-pay-button"]');
                    await page.click('button[data-testid="google-pay-button"]');
                }

                // Ждем завершения настройки от пользователя
                console.log('Ожидаем действий пользователя...');
                await page.waitForFunction(() => {
                    const cardData = JSON.parse(localStorage.getItem('card') || '{}');
                    return cardData.paymentMethods && cardData.paymentMethods.length > 0;
                }, { timeout: 300000 }); // 5 минут на настройку

                console.log('Платежная система успешно настроена');

                // Очищаем кэш для обновления данных
                this.clearCache(address);

                return true;

            } finally {
                await browser.close();
            }

        } catch (error) {
            console.error('Ошибка при настройке платежной системы:', error.message);
            throw error;
        }
    }

    // Метод для очистки кэша
    clearCache(address) {
        if (address) {
            this.tokenCache.delete(address);
            this.cardCache.delete(address);
        } else {
            this.tokenCache.clear();
            this.cardCache.clear();
        }
    }

    // Метод для закрытия браузера
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

module.exports = new LasoBrowserService(); 