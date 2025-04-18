const lasoBrowserService = require('../services/lasoBrowserService');
const referralService = require('../services/referralService');
const { privetstvie } = require('../texts');
const { db } = require('../config/firebaseConfig');
const { doc, getDoc } = require('firebase/firestore');

const ADMIN_ID = 197115775; // Ваш ID в Telegram

function formatTransactions(transactions) {
    if (!transactions || transactions.length === 0) return 'История транзакций пуста';

    return transactions.map(t =>
        `📅 ${t.date}\n💬 ${t.description}\n${t.status ? `✅ ${t.status}\n` : ''}💰 ${t.amount}`
    ).join('\n\n');
}

function createTypeSelectionKeyboard() {
    return {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "Пополняемые карты", callback_data: "type_popolnyaemye" }],
                [{ text: "Предоплаченные карты", callback_data: "type_ne_popolnyaemye" }],
                [{ text: "Связаться с менеджером", callback_data: "contact_manager" }],
            ],
        }),
    };
}

async function getReferralStats() {
    try {
        // Получаем документ lvmnaboutAi
        const refDoc = await getDoc(doc(db, 'referrals', 'lvmnaboutAi'));

        let statsMessage = '📊 *Статистика рефералов*\n\n';

        if (!refDoc.exists()) {
            return 'Статистика пуста. Нет данных о рефералах.';
        }

        const data = refDoc.data();
        const users = [];

        // Собираем всех пользователей из полей документа
        for (const key in data) {
            if (key.startsWith('user_')) {
                users.push(data[key]);
            }
        }

        statsMessage += `*Реферальная ссылка:* lvmnaboutAi\n`;
        statsMessage += `*Количество переходов:* ${users.length}\n\n`;

        if (users.length > 0) {
            statsMessage += '*Пользователи:*\n';
            users.forEach(user => {
                const username = user.username ? `@${user.username}` : 'без username';
                const name = user.firstName || 'Без имени';
                const date = user.timestamp ? new Date(user.timestamp.seconds * 1000).toLocaleString() : 'время не указано';
                statsMessage += `- ${name} (${username}) - ${date}\n`;
            });
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

    try {
        // Обработка команды /stats (только для админа)
        if (text === '/stats') {
            if (userId === ADMIN_ID) {
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

            // Извлекаем реферальный код из разных возможных форматов ссылки
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
                // Сохраняем реферала в Firebase
                console.log('Пытаемся сохранить реферал...');
                const saved = await referralService.saveReferral(refCode, msg.from);
                console.log('Результат сохранения реферала:', saved);

                if (saved) {
                    // Отправляем уведомление менеджеру
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

            await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
            return;
        }

        // Обработка остальных команд
        switch (text) {
            case '/start':
                await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
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

module.exports = handleMessage; 