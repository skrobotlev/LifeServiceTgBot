const lasoBrowserService = require('../services/lasoBrowserService');
const referralService = require('../services/referralService');
const { privetstvie } = require('../texts');

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

async function handleMessage(msg, bot) {
    console.log('=== Получено новое сообщение ===');
    console.log('Chat ID:', msg.chat.id);
    console.log('Text:', msg.text);
    console.log('From:', msg.from.username);
    console.log('====================');

    const chatId = msg.chat.id;
    const text = msg.text;

    try {
        // Обработка команды /start с реферальным кодом
        if (text.startsWith('/start')) {
            let refCode = null;

            // Пробуем разные форматы реферальных ссылок
            if (text.includes('?start=')) {
                refCode = text.split('?start=')[1];
            } else if (text.includes(' ')) {
                refCode = text.split(' ')[1];
            }

            console.log('Извлеченный реферальный код:', refCode);

            if (refCode) {
                // Сохраняем реферала в Firebase
                const saved = await referralService.saveReferral(refCode, msg.from);
                console.log('Результат сохранения реферала:', saved);

                if (saved) {
                    // Отправляем уведомление менеджеру
                    const userInfo = `${msg.from.first_name || ""} ${msg.from.last_name || ""} (@${msg.from.username || "не указан"})`;
                    await bot.sendMessage(
                        197115775, // ID менеджера
                        `🚀 Новый пользователь по реферальной ссылке: ${refCode}\n👤 ${userInfo}\n🆔 ChatID: ${chatId}`
                    );
                }
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