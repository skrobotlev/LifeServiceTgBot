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
                await bot.sendMessage(chatId, 'Добро пожаловать! Доступные команды:\n' +
                    '/auth - авторизация\n' +
                    '/balance - проверка баланса карты\n' +
                    '/applepay - привязать Apple Pay\n' +
                    '/googlepay - привязать Google Pay');
                break;

            case '/auth':
                await bot.sendMessage(chatId, 'Начинаю процесс авторизации...');
                
                try {
                    // Здесь нужно получить приватный ключ из базы данных или .env для конкретного пользователя
                    const privateKey = process.env.METAMASK_PRIVATE_KEY;
                    const result = await lasoBrowserService.init(privateKey);
                    await bot.sendMessage(chatId, 'Авторизация успешно завершена! Теперь вы можете использовать /balance для проверки баланса.');
                } catch (error) {
                    console.error('Ошибка авторизации:', error);
                    await bot.sendMessage(chatId, 'Ошибка авторизации. Пожалуйста, попробуйте позже или обратитесь к администратору.');
                }
                break;

            case '/balance':
                await bot.sendMessage(chatId, 'Получаю информацию о балансе...');
                
                try {
                    // Здесь нужно получить приватный ключ из базы данных или .env для конкретного пользователя
                    const privateKey = process.env.METAMASK_PRIVATE_KEY;
                    const data = await lasoBrowserService.getBalance(privateKey);
                    
                    const message = `💳 Карта Laso Finance\n` +
                        `Последние 4 цифры: *${data.lastFour}*\n` +
                        `Срок действия: *${data.expiry}*\n` +
                        `Статус: *${data.status}*\n` +
                        `Дата выпуска: *${data.createdAt}*\n` +
                        `Баланс: *$${data.balance}*\n\n` +
                        `Платежные системы:\n` +
                        `${data.paymentMethods ? data.paymentMethods.join(', ') : 'Не привязаны'}`;
                    
                    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                } catch (error) {
                    console.error('Ошибка получения баланса:', error);
                    await bot.sendMessage(chatId, 'Ошибка при получении баланса. Возможно, нужно заново авторизоваться через /auth');
                }
                break;

            case '/applepay':
                await bot.sendMessage(chatId, 'Начинаю процесс привязки Apple Pay...\n' +
                    'Сейчас откроется браузер, где вам нужно будет:\n' +
                    '1. Дождаться загрузки страницы\n' +
                    '2. Нажать на кнопку Apple Pay\n' +
                    '3. Следовать инструкциям для привязки карты\n' +
                    'После успешной привязки браузер закроется автоматически.');
                
                try {
                    const privateKey = process.env.METAMASK_PRIVATE_KEY;
                    await lasoBrowserService.setupPaymentMethod(privateKey, 'apple');
                    await bot.sendMessage(chatId, 'Apple Pay успешно привязан к карте!');
                } catch (error) {
                    console.error('Ошибка привязки Apple Pay:', error);
                    await bot.sendMessage(chatId, 'Ошибка при привязке Apple Pay. Пожалуйста, попробуйте позже.');
                }
                break;

            case '/googlepay':
                await bot.sendMessage(chatId, 'Начинаю процесс привязки Google Pay...\n' +
                    'Сейчас откроется браузер, где вам нужно будет:\n' +
                    '1. Дождаться загрузки страницы\n' +
                    '2. Нажать на кнопку Google Pay\n' +
                    '3. Следовать инструкциям для привязки карты\n' +
                    'После успешной привязки браузер закроется автоматически.');
                
                try {
                    const privateKey = process.env.METAMASK_PRIVATE_KEY;
                    await lasoBrowserService.setupPaymentMethod(privateKey, 'google');
                    await bot.sendMessage(chatId, 'Google Pay успешно привязан к карте!');
                } catch (error) {
                    console.error('Ошибка привязки Google Pay:', error);
                    await bot.sendMessage(chatId, 'Ошибка при привязке Google Pay. Пожалуйста, попробуйте позже.');
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

module.exports = handleMessage; 