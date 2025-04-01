const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

class LasoBrowserService {
    constructor() {
        // Получаем приватный ключ из переменных окружения
        const privateKey = process.env.METAMASK_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('METAMASK_PRIVATE_KEY не найден в переменных окружения');
        }
        
        this.privateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        this.wallet = new ethers.Wallet(this.privateKey);
        this.baseUrl = 'https://us-central1-kyc-ts.cloudfunctions.net';
        this.address = this.wallet.address.toLowerCase();
        this.authToken = null;
        
        console.log('Инициализирован сервис для адреса:', this.address);
    }

    async init() {
        try {
            console.log('Начинаем авторизацию для адреса:', this.address);
            
            // 1. Получаем nonce для подписи
            const nonceResponse = await axios.post(`${this.baseUrl}/getNonceToSign`, {
                data: {
                    address: this.address
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
            const signature = await this.wallet.signMessage(messageToSign);
            console.log('Сообщение подписано:', signature);

            // 3. Верифицируем подпись
            const verifyResponse = await axios.post(`${this.baseUrl}/verifySignedMessage`, {
                data: {
                    address: this.address,
                    signature: signature
                }
            }, {
                headers: {
                    'Origin': 'https://laso.finance',
                    'Referer': 'https://laso.finance/',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Ответ верификации:', verifyResponse.data);

            // Сохраняем токен авторизации
            if (verifyResponse.data.data && verifyResponse.data.data.token) {
                this.authToken = verifyResponse.data.data.token;
                console.log('Токен сохранен:', this.authToken);
            } else {
                console.log('Токен не найден в ответе:', verifyResponse.data);
            }

            return verifyResponse.data;

        } catch (error) {
            console.error('Ошибка при авторизации:', error.response?.data || error.message);
            throw error;
        }
    }

    async getBalance() {
        try {
            if (!this.authToken) {
                throw new Error('Не авторизован. Сначала выполните init()');
            }

            console.log('Запрашиваем данные с токеном:', this.authToken);

            // Получаем страницу с данными
            const response = await axios.get('https://laso.finance/international/rel', {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Cookie': `auth._token.local=Bearer%20${this.authToken}`,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            // Ищем данные в HTML
            const html = response.data;
            const dataMatch = html.match(/window\.__NUXT__=(.*?);<\/script>/);
            
            if (!dataMatch) {
                throw new Error('Не удалось найти данные на странице');
            }

            // Извлекаем и парсим данные
            const nuxtData = eval('(' + dataMatch[1] + ')');
            const cardData = nuxtData.state.card.card;

            return {
                balance: cardData.balance || '0',
                transactions: cardData.transactions || []
            };
            
        } catch (error) {
            console.error('Ошибка при получении баланса:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new LasoBrowserService(); 