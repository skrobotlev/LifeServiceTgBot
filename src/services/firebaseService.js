const { db } = require('../config/firebase');
const { doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');

class FirebaseService {
    async saveUserData(telegramId, walletAddress, cookies) {
        try {
            const userRef = doc(db, 'users', telegramId.toString());
            await setDoc(userRef, {
                telegramId,
                walletAddress,
                cookies,
                createdAt: new Date(),
                lastUpdated: new Date()
            });
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных пользователя:', error);
            throw error;
        }
    }

    async getUserData(telegramId) {
        try {
            const userRef = doc(db, 'users', telegramId.toString());
            const userDoc = await getDoc(userRef);
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
            throw error;
        }
    }

    async updateUserBalance(telegramId, balance) {
        try {
            const userRef = doc(db, 'users', telegramId.toString());
            await updateDoc(userRef, {
                balance,
                lastUpdated: new Date()
            });
            return true;
        } catch (error) {
            console.error('Ошибка обновления баланса:', error);
            throw error;
        }
    }

    async saveUserPrivateKey(telegramId, privateKey) {
        try {
            const userRef = doc(db, 'users', telegramId.toString());
            await updateDoc(userRef, {
                privateKey,
                lastUpdated: new Date()
            });
            return true;
        } catch (error) {
            console.error('Ошибка сохранения приватного ключа:', error);
            throw error;
        }
    }

    async getUserPrivateKey(telegramId) {
        try {
            const userData = await this.getUserData(telegramId);
            return userData?.privateKey || null;
        } catch (error) {
            console.error('Ошибка получения приватного ключа:', error);
            throw error;
        }
    }
}

module.exports = new FirebaseService(); 