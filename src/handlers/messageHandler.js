const lasoBrowserService = require('../services/lasoBrowserService');

function formatTransactions(transactions) {
    if (!transactions || transactions.length === 0) return 'История транзакций пуста';

    return transactions.map(t =>
        `📅 ${t.date}\n💬 ${t.description}\n${t.status ? `✅ ${t.status}\n` : ''}💰 ${t.amount}`
    ).join('\n\n');
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
        switch (text) {
            case '/start':
                console.log('Обработка команды /start');
                const startMessage = 'Добро пожаловать! Доступные команды:\n' +
                    '/auth - авторизация\n' +
                    '/balance - проверка баланса карты\n' +
                    '/applepay - привязать Apple Pay\n' +
                    '/googlepay - привязать Google Pay';

                console.log('Отправляем сообщение:', startMessage);
                await bot.sendMessage(chatId, startMessage);
                console.log('Сообщение отправлено');
                break;

            case '/auth':
                console.log('Обработка команды /auth');
                await bot.sendMessage(chatId, 'Начинаю процесс авторизации...');

                try {
                    const privateKey = process.env.METAMASK_PRIVATE_KEY;
                    console.log('Получаем токен...');
                    const token = await lasoBrowserService.getToken(privateKey);
                    console.log('Токен получен:', token);
                    await bot.sendMessage(chatId, 'Авторизация успешно завершена! Теперь вы можете использовать /balance для проверки баланса.');
                } catch (error) {
                    console.error('Ошибка авторизации:', error);
                    await bot.sendMessage(chatId, 'Ошибка авторизации. Пожалуйста, попробуйте позже или обратитесь к администратору.');
                }
                break;

            case '/balance':
                console.log('Обработка команды /balance');
                await bot.sendMessage(chatId, 'Получаю информацию о балансе...');

                try {
                    const privateKey = process.env.METAMASK_PRIVATE_KEY;
                    console.log('Получаем баланс...');
                    const data = await lasoBrowserService.getBalance(privateKey);
                    console.log('Данные получены:', data);

                    const message = `💳 Карта Laso Finance\n` +
                        `Последние 4 цифры: *${data.lastFour}*\n` +
                        `Статус: *${data.status}*\n` +
                        `Баланс: *${data.balance}*`;

                    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                } catch (error) {
                    console.error('Ошибка получения баланса:', error);
                    await bot.sendMessage(chatId, 'Ошибка при получении баланса. Пожалуйста, попробуйте позже.');
                }
                break;

            case '/applepay':
                await bot.sendMessage(chatId, 'Начинаю процесс привязки Apple Pay...');

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
                await bot.sendMessage(chatId, 'Начинаю процесс привязки Google Pay...');

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
                console.log('Неизвестная команда:', text);
                await bot.sendMessage(chatId, 'Неизвестная команда. Используйте /start для просмотра доступных команд.');
        }
    } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
}

module.exports = handleMessage; 