const lasoBrowserService = require('../services/lasoBrowserService');
const referralService = require('../services/referralService');
const { privetstvie } = require('../texts');
const { PARTNERS, ADMIN_ID } = require('../config/partners');
const { handleReferral } = require('../services/referralService');
const { createTypeSelectionKeyboard } = require('../utils/keyboardUtils');
const { getReferralStats } = require('../utils/statsUtils');

function formatTransactions(transactions) {
    if (!transactions || transactions.length === 0) return 'История транзакций пуста';

    return transactions.map(t =>
        `📅 ${t.date}\n💬 ${t.description}\n${t.status ? `✅ ${t.status}\n` : ''}💰 ${t.amount}`
    ).join('\n\n');
}

async function handleMessage(msg, bot) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    const text = msg.text;
    const isAdmin = userId === ADMIN_ID;

    console.log('\n=== Обработка сообщения ===');
    console.log('Chat ID:', chatId);
    console.log('User ID:', userId);
    console.log('Username:', username);
    console.log('Text:', text);
    console.log('====================\n');

    try {
        // Обработка команды /contact
        if (text === '/contact' || text === '/contact@your_bot_username') {
            console.log("Команда: Связаться с менеджером");
            const userInfo = `${msg.from.first_name || ""} ${msg.from.last_name || ""} (@${msg.from.username || "не указан"})`;
            const info = `Новый запрос на связь с менеджером:
ChatID: ${chatId}
Информация о пользователе: ${userInfo}`;
            console.log("Отправляем менеджеру:", info);
            await bot.telegram.sendMessage(ADMIN_ID, info);
            await bot.telegram.sendMessage(
                chatId,
                "Спасибо, ваша заявка отправлена. Наш менеджер свяжется с вами в ближайшее время.",
                createTypeSelectionKeyboard(isAdmin, username)
            );
            return;
        }

        // Обработка команды /stats
        if (text === '/stats' || text === '/stats@your_bot_username') {
            console.log("Команда: Статистика");
            const stats = await getReferralStats(username);
            await bot.telegram.sendMessage(chatId, stats, { parse_mode: 'Markdown' });
            return;
        }

        // Обработка реферальной ссылки или команды /start
        if (text && text.startsWith('/start')) {
            console.log("Команда: Старт");
            if (text !== '/start' && text !== '/start@your_bot_username') {
                const referralCode = text.split(' ')[1];
                console.log('Обнаружен реферальный код:', referralCode);
                await handleReferral(userId, username, referralCode);
            }

            // Создаем клавиатуру
            const keyboard = createTypeSelectionKeyboard(isAdmin, username);
            console.log('Отправляем сообщение с клавиатурой:', keyboard);

            // Отправка приветственного сообщения с клавиатурой
            await bot.telegram.sendMessage(
                chatId,
                privetstvie,
                keyboard
            );
            return;
        }

    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        await bot.telegram.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
}

module.exports = handleMessage; 