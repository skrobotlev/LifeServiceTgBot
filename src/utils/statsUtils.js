const { db } = require('../config/firebaseConfig');
const { doc, getDoc } = require('firebase/firestore');
const { PARTNERS } = require('../config/partners');

async function getReferralStats(username) {
    try {
        let statsMessage = '📊 *Статистика рефералов*\n\n';

        // Определяем, какие реферальные ссылки доступны пользователю
        const userRefs = PARTNERS[username] || [];
        const isAdmin = username === 'usr149049'; // Дополнительная проверка на главного админа

        // Если это не админ и у пользователя нет доступных рефералок
        if (!isAdmin && userRefs.length === 0) {
            return '⛔️ У вас нет доступа к статистике';
        }

        let totalUsers = 0;
        const processedRefs = [];

        // Для каждой доступной реферальной ссылки получаем статистику
        for (const refId of isAdmin ? ['lvmnaboutAi'] : userRefs) {
            const refDoc = await getDoc(doc(db, 'referrals', refId));

            if (!refDoc.exists()) {
                console.log(`Документ с реферальной ссылкой ${refId} не найден`);
                continue;
            }

            const data = refDoc.data();
            const users = [];

            // Собираем всех пользователей из полей документа
            for (const key in data) {
                if (key.startsWith('user_')) {
                    users.push(data[key]);
                }
            }

            if (users.length > 0) {
                processedRefs.push({
                    id: refId,
                    users: users
                });
                totalUsers += users.length;
            }
        }

        // Если нет данных
        if (processedRefs.length === 0) {
            return 'Статистика пуста. Нет данных о переходах.';
        }

        statsMessage += `*Всего переходов:* ${totalUsers}\n\n`;

        // Выводим статистику по каждой доступной реферальной ссылке
        for (const ref of processedRefs) {
            statsMessage += `🔸 *Реферальная ссылка:* ${ref.id}\n`;
            statsMessage += `*Количество переходов:* ${ref.users.length}\n\n`;
            statsMessage += '*Пользователи:*\n';

            // Сортируем пользователей по дате (новые первыми)
            const sortedUsers = [...ref.users].sort((a, b) =>
                b.timestamp.seconds - a.timestamp.seconds
            );

            sortedUsers.forEach(user => {
                const username = user.username ? `@${user.username}` : 'без username';
                const name = user.firstName || 'Без имени';
                const date = user.timestamp ? new Date(user.timestamp.seconds * 1000).toLocaleString() : 'время не указано';
                statsMessage += `- ${name} (${username}) - ${date}\n`;
            });
            statsMessage += '\n';
        }

        return statsMessage;
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        console.error('Stack trace:', error.stack);
        return '❌ Произошла ошибка при получении статистики';
    }
}

module.exports = {
    getReferralStats
}; 