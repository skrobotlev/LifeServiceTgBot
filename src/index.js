require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const handleMessage = require('./handlers/messageHandler').handleMessage;
const handleCallback = require('./handlers/callbackHandler');

console.log('Сервис инициализирован');

// Проверяем наличие токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('Ошибка: TELEGRAM_BOT_TOKEN не найден в .env файле');
    process.exit(1);
}

// Инициализация Firebase
require('./config/firebaseConfig');

console.log('=== Инициализация бота ===');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
    console.log('\n=== Получено сообщение ===');
    console.log('Chat ID:', msg.chat.id);
    console.log('Text:', msg.text);
    console.log('====================\n');
    await handleMessage(msg, bot);
});

// Обработка callback-запросов от inline-кнопок
bot.on('callback_query', async (callbackQuery) => {
    console.log('\n=== Получен callback ===');
    console.log('Chat ID:', callbackQuery.message.chat.id);
    console.log('Data:', callbackQuery.data);
    console.log('====================\n');
    await handleCallback(callbackQuery, bot);
});

process.on('unhandledRejection', (error) => {
    console.error('Необработанная ошибка:', error);
});

// Проверяем, что бот работает
bot.getMe().then(me => {
    console.log('Бот успешно инициализирован:', me.username);
}).catch(err => {
    console.error('Ошибка при инициализации бота:', err);
    process.exit(1);
});

// Обработчики ошибок
bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error.message);
});

bot.on('webhook_error', (error) => {
    console.error('Ошибка webhook:', error.message);
});

bot.on('error', (error) => {
    console.error('Общая ошибка бота:', error.message);
});

console.log('Бот запущен и готов к работе');

module.exports = { bot }; 