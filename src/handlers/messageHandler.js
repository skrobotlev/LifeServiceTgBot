const lasoBrowserService = require('../services/lasoBrowserService');
const referralService = require('../services/referralService');
const { privetstvie } = require('../texts');
const { PARTNERS, ADMIN_ID } = require('../config/partners');
const { handleReferral } = require('../services/referralService');
const { createTypeSelectionKeyboard } = require('../utils/keyboardUtils');

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
        // Обработка реферальной ссылки
        if (text && text.startsWith('/start ')) {
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
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        await bot.telegram.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
}

module.exports = handleMessage; 