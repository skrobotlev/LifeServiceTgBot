const { doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');
const { db } = require('../config/firebaseConfig');

class ReferralService {
    // Сохранение реферала
    async saveReferral(referralId, userInfo) {
        try {
            console.log('=== Сохранение реферала в Firebase ===');
            console.log('Referral ID:', referralId);
            console.log('User Info:', JSON.stringify(userInfo, null, 2));

            // Получаем документ реферальной ссылки
            const refDocRef = doc(db, 'referrals', referralId);
            console.log('Создана ссылка на документ:', refDocRef.path);

            const refDoc = await getDoc(refDocRef);
            console.log('Документ существует:', refDoc.exists());

            const userData = {
                timestamp: new Date(),
                telegramId: userInfo.id,
                username: userInfo.username || 'не указан',
                firstName: userInfo.first_name || 'не указано',
                lastName: userInfo.last_name || 'не указано'
            };

            console.log('Подготовленные данные:', JSON.stringify(userData, null, 2));

            try {
                if (!refDoc.exists()) {
                    console.log('Создаем новый документ с первым пользователем');
                    const newData = {
                        [`user_${userInfo.id}`]: userData
                    };
                    console.log('Данные для создания:', JSON.stringify(newData, null, 2));
                    await setDoc(refDocRef, newData);
                    console.log('Новый документ успешно создан');
                } else {
                    console.log('Добавляем пользователя в существующий документ');
                    const updateData = {
                        [`user_${userInfo.id}`]: userData
                    };
                    console.log('Данные для обновления:', JSON.stringify(updateData, null, 2));
                    await updateDoc(refDocRef, updateData);
                    console.log('Документ успешно обновлен');
                }
                return true;
            } catch (innerError) {
                console.error('Ошибка при операции с Firebase:', innerError);
                console.error('Stack trace:', innerError.stack);
                return false;
            }
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

            const refDocRef = doc(db, 'referrals', referralId);
            const refDoc = await getDoc(refDocRef);

            if (!refDoc.exists()) {
                console.log('Реферал не найден');
                return [];
            }

            const data = refDoc.data();
            console.log('Получены данные:', JSON.stringify(data, null, 2));

            const users = [];

            // Преобразуем поля пользователей в массив
            for (const key in data) {
                if (key.startsWith('user_')) {
                    users.push(data[key]);
                }
            }

            console.log(`Найдено ${users.length} пользователей для реферала ${referralId}`);
            return users;
        } catch (error) {
            console.error('Ошибка при получении реферала:', error);
            console.error('Stack trace:', error.stack);
            return [];
        }
    }
}

module.exports = new ReferralService(); 