const axios = require('axios');

class LasoService {
    constructor() {
        this.baseURL = 'https://laso.finance/api';
        this.token = null;
    }

    async authenticate(walletAddress) {
        try {
            const response = await axios.post(`${this.baseURL}/auth`, {
                walletAddress,
                signature: await this.getSignature(walletAddress)
            });
            this.token = response.data.token;
            return response.data;
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            throw error;
        }
    }

    async getBalance() {
        if (!this.token) {
            throw new Error('Не авторизован');
        }

        try {
            const response = await axios.get(`${this.baseURL}/balance`, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка получения баланса:', error);
            throw error;
        }
    }

    async getSignature(walletAddress) {
        // Здесь должна быть реализация подписи сообщения через MetaMask
        // Это заглушка, которую нужно будет заменить на реальную реализацию
        return 'dummy_signature';
    }
}

module.exports = new LasoService(); 