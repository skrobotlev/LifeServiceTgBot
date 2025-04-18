require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const handleMessage = require('./handlers/messageHandler');
const { handleCallback } = require("./handlers/callbackHandler");

// Проверяем наличие токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('Ошибка: TELEGRAM_BOT_TOKEN не найден в .env файле');
    process.exit(1);
}

console.log('=== Инициализация бота ===');
console.log('Токен бота:', process.env.TELEGRAM_BOT_TOKEN);

// Создаем бота с минимальными настройками
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// Проверяем, что бот работает
bot.getMe().then(me => {
    console.log('Бот успешно инициализирован:', me.username);
}).catch(err => {
    console.error('Ошибка при инициализации бота:', err);
    process.exit(1);
});

// Обработчики
bot.on('message', async (msg) => {
    console.log('=== Новое сообщение ===');
    console.log('Chat ID:', msg.chat.id);
    console.log('Text:', msg.text);
    console.log('From:', msg.from.username);
    console.log('====================');

    handleMessage(msg, bot);
});

bot.on('callback_query', async (query) => {
    console.log('=== Новый callback ===');
    console.log('Query:', query);
    console.log('====================');

    handleCallback(query, bot);
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