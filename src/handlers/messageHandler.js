const lasoBrowserService = require('../services/lasoBrowserService');
const referralService = require('../services/referralService');
const { privetstvie } = require('../texts');
const { db } = require('../config/firebaseConfig');
const { doc, getDoc, collection, getDocs } = require('firebase/firestore');

const ADMIN_ID = 197115775; // Ваш ID в Telegram

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

async function getReferralStats() {
    try {
        // Получаем все документы из коллекции referrals
        const referralsRef = collection(db, 'referrals');
        const snapshot = await getDocs(referralsRef);

        let statsMessage = '📊 *Статистика по всем рефералам*\n\n';
        let totalUsers = 0;

        // Получаем все документы и их данные
        const referrals = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const users = Object.entries(data)
                .filter(([key]) => key.startsWith('user_'))
                .map(([_, userData]) => userData);

            if (users.length > 0) {
                referrals.push({
                    id: doc.id,
                    users: users
                });
                totalUsers += users.length;
            }
        });

        // Сортируем рефералы по количеству пользователей (по убыванию)
        referrals.sort((a, b) => b.users.length - a.users.length);

        statsMessage += `*Всего рефералов:* ${referrals.length}\n`;
        statsMessage += `*Всего переходов:* ${totalUsers}\n\n`;

        // Выводим статистику по каждому рефералу
        for (const referral of referrals) {
            statsMessage += `🔸 *Реферальная ссылка:* ${referral.id}\n`;
            statsMessage += `*Количество переходов:* ${referral.users.length}\n\n`;
            statsMessage += '*Пользователи:*\n';

            // Сортируем пользователей по дате (последние первые)
            const sortedUsers = [...referral.users].sort((a, b) => {
                return b.timestamp.seconds - a.timestamp.seconds;
            });

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
    const isAdmin = userId === ADMIN_ID;

    try {
        // Обработка команды /stats
        if (text === '/stats') {
            if (isAdmin) {
                const statsMessage = await getReferralStats();
                await bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
                return;
            } else {
                await bot.sendMessage(chatId, '⛔️ У вас нет доступа к этой команде');
                return;
            }
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