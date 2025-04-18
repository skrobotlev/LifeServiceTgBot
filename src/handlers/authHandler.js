const { lasoBrowserService } = require('../services/lasoBrowserService');

async function handleAuth(msg, bot) {
    const chatId = msg.chat.id;
    console.log('=== Обработка команды /auth ===');

    try {
        console.log('Пытаемся открыть страницу...');
        await lasoBrowserService.openAuthPage();
        console.log('Страница успешно открыта');
        await bot.sendMessage(chatId, 'Страница открыта');
    } catch (error) {
        console.error('Ошибка при открытии страницы:', error);
        await bot.sendMessage(chatId, 'Ошибка при открытии страницы: ' + error.message);
    }
}

module.exports = { handleAuth }; 