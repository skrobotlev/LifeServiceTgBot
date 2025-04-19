const lasoBrowserService = require('../services/lasoBrowserService');
const referralService = require('../services/referralService');
const { privetstvie } = require('../texts');
const { db } = require('../config/firebaseConfig');
const { doc, getDoc, collection, getDocs } = require('firebase/firestore');
const { PARTNERS, ADMIN_ID } = require('../config/partners');

function formatTransactions(transactions) {
    if (!transactions || transactions.length === 0) return 'История транзакций пуста';

    return transactions.map(t =>
        `📅 ${t.date}\n💬 ${t.description}\n${t.status ? `✅ ${t.status}\n` : ''}💰 ${t.amount}`
    ).join('\n\n');
}

function createTypeSelectionKeyboard(isAdmin) {
    const keyboard = [
        [{ text: "Пополняемые карты", callback_data: "type_popolnyaemye" }],
        [{ text: "Предоплаченные карты", callback_data: "type_ne_popolnyaemye" }],
        [{ text: "Связаться с менеджером", callback_data: "contact_manager" }]
    ];

    // Добавляем кнопку статистики только для админа
    if (isAdmin) {
        keyboard.push([{ text: "📊 Статистика", callback_data: "show_stats" }]);
    }

    return {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        })
    };
}

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

            if (refDoc.exists()) {
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

async function handleMessage(msg, bot) {
    console.log('=== Получено новое сообщение ===');
    console.log('Chat ID:', msg.chat.id);
    console.log('Text:', msg.text);
    console.log('From:', msg.from.username);
    console.log('====================');

    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const username = msg.from.username;
    const isAdmin = userId === ADMIN_ID;

    try {
        // Обработка команды /stats
        if (text === '/stats') {
            // Проверяем, есть ли у пользователя username
            if (!username) {
                await bot.sendMessage(chatId, '⚠️ Для доступа к статистике необходимо установить username в Telegram');
                return;
            }

            const statsMessage = await getReferralStats(username);
            await bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
            return;
        }

        // Обработка команды /start с реферальным кодом
        if (text.startsWith('/start')) {
            let refCode = null;
            console.log('=== Обработка /start ===');
            console.log('Полное сообщение:', text);

            if (text.includes('?start=')) {
                refCode = text.split('?start=')[1];
                console.log('Извлечен код из ?start=:', refCode);
            } else if (text.includes(' ')) {
                refCode = text.split(' ')[1];
                console.log('Извлечен код после пробела:', refCode);
            }

            console.log('Итоговый реферальный код:', refCode);
            console.log('Данные пользователя:', msg.from);

            if (refCode) {
                console.log('Пытаемся сохранить реферал...');
                const saved = await referralService.saveReferral(refCode, msg.from);
                console.log('Результат сохранения реферала:', saved);

                if (saved) {
                    const userInfo = `${msg.from.first_name || ""} ${msg.from.last_name || ""} (@${msg.from.username || "не указан"})`;
                    await bot.sendMessage(
                        ADMIN_ID,
                        `🚀 Новый пользователь по реферальной ссылке: ${refCode}\n👤 ${userInfo}\n🆔 ChatID: ${chatId}`
                    );
                    console.log('Уведомление менеджеру отправлено');
                } else {
                    console.log('Ошибка при сохранении реферала');
                }
            } else {
                console.log('Реферальный код не найден в сообщении');
            }

            await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard(isAdmin));
            return;
        }

        // Обработка остальных команд
        switch (text) {
            case '/start':
                await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard(isAdmin));
                break;
            default:
                await bot.sendMessage(chatId, 'Неизвестная команда. Используйте /start для начала работы.');
        }
    } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
        console.error('Stack trace:', error.stack);
        await bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
}

module.exports = {
    handleMessage,
    getReferralStats
}; 