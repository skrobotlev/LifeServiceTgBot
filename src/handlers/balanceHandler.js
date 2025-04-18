const { lasoBrowserService } = require('../services/lasoBrowserService');

async function handleBalance(msg, bot) {
    const chatId = msg.chat.id;
    console.log('=== Обработка команды /balance ===');

    try {
        // 1. Открываем страницу
        console.log('Открываем страницу...');
        await lasoBrowserService.openPage();
        console.log('Страница открыта');

        // 2. Получаем данные из localStorage
        console.log('Получаем данные из localStorage...');
        const data = await lasoBrowserService.getLocalStorageData();
        console.log('Данные получены:', data);

        // 3. Отправляем данные пользователю
        await bot.sendMessage(chatId, `Данные карты:\n${JSON.stringify(data, null, 2)}`);

    } catch (error) {
        console.error('Ошибка при получении баланса:', error);
        await bot.sendMessage(chatId, 'Ошибка при получении данных: ' + error.message);
    }
}

module.exports = { handleBalance }; 