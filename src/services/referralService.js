const { doc, setDoc, getDoc, collection, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebaseConfig');

class ReferralService {
    // Сохранение реферала
    async saveReferral(referralId, userData) {
        try {
            console.log('=== Сохранение реферала ===');
            console.log('Referral ID:', referralId);
            console.log('User Data:', userData);

            // Создаем документ внутри коллекции с именем referralId
            const userDocRef = doc(db, `referrals/${referralId}/users`, userData.id.toString());
            console.log('Document reference created:', userDocRef.path);

            const referralData = {
                ...userData,
                timestamp: new Date(),
                telegramId: userData.id,
                username: userData.username || 'не указан',
                firstName: userData.first_name || 'не указано',
                lastName: userData.last_name || 'не указано'
            };

            console.log('Saving data:', referralData);
            await setDoc(userDocRef, referralData);
            console.log('Реферал успешно сохранен в Firebase');
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении реферала:', error);
            console.error('Stack trace:', error.stack);
            return false;
        }
    }

    // Получение информации о реферале
    async getReferral(referralId) {
        try {
            console.log('=== Получение информации о реферале ===');
            console.log('Referral ID:', referralId);

            // Получаем коллекцию пользователей для данного referralId
            const usersCollectionRef = collection(db, `referrals/${referralId}/users`);
            console.log('Collection reference created:', usersCollectionRef.path);

            const querySnapshot = await getDocs(usersCollectionRef);
            console.log('Query snapshot received');

            if (!querySnapshot.empty) {
                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push(doc.data());
                });
                console.log(`Найдено ${users.length} рефералов:`, users);
                return users;
            } else {
                console.log('Рефералы не найдены');
                return [];
            }
        } catch (error) {
            console.error('Ошибка при получении рефералов:', error);
            console.error('Stack trace:', error.stack);
            return [];
        }
    }
}

module.exports = new ReferralService(); 