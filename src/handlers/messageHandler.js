const lasoBrowserService = require('../services/lasoBrowserService');

function formatTransactions(transactions) {
    if (!transactions || transactions.length === 0) return 'История транзакций пуста';
    
    return transactions.map(t => 
        `📅 ${t.date}\n💬 ${t.description}\n${t.status ? `✅ ${t.status}\n` : ''}💰 ${t.amount}`
    ).join('\n\n');
}

async function handleMessage(msg, bot) {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
        switch (text) {
            case '/start':
                await bot.sendMessage(chatId, 'Добро пожаловать! Используйте /auth для авторизации и /balance для проверки баланса карты.');
                break;

            case '/auth':
                await bot.sendMessage(chatId, 'Начинаю процесс авторизации...');
                
                try {
                    const result = await lasoBrowserService.init();
                    await bot.sendMessage(chatId, 'Авторизация успешно завершена! Теперь вы можете использовать /balance для проверки баланса.');
                } catch (error) {
                    console.error('Ошибка авторизации:', error);
                    await bot.sendMessage(chatId, 'Ошибка авторизации. Пожалуйста, попробуйте позже или обратитесь к администратору.');
                }
                break;

            case '/balance':
                await bot.sendMessage(chatId, 'Получаю информацию о балансе...');
                
                try {
                    const data = await lasoBrowserService.getBalance();
                    
                    const message = `💳 Баланс карты: ${data.balance}\n\n` +
                                  `📊 Последние транзакции:\n\n${formatTransactions(data.transactions)}`;
                    
                    await bot.sendMessage(chatId, message);
                } catch (error) {
                    console.error('Ошибка получения баланса:', error);
                    await bot.sendMessage(chatId, 'Ошибка при получении баланса. Возможно, нужно заново авторизоваться через /auth');
                }
                break;

            default:
                await bot.sendMessage(chatId, 'Неизвестная команда. Используйте /start для просмотра доступных команд.');
        }
    } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
}

module.exports = { handleMessage }; 