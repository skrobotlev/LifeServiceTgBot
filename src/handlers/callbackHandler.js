async function handleCallback(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    try {
        // Здесь будет обработка callback-запросов
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('Ошибка обработки callback:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
}

module.exports = { handleCallback }; 