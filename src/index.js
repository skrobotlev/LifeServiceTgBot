require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const handleMessage = require('./handlers/messageHandler');
const { handleCallback } = require("./handlers/callbackHandler");

// Проверяем наличие токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('Ошибка: TELEGRAM_BOT_TOKEN не найден в .env файле');
    process.exit(1);
}

// Создаем бота с минимальными настройками
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Базовые команды
bot.setMyCommands([
    { command: "/start", description: "Начать работу" },
    { command: "/auth", description: "Авторизация" },
    { command: "/balance", description: "Баланс карты" }
]);

// Обработчики
bot.on('message', (msg) => handleMessage(msg, bot));
bot.on('callback_query', (query) => handleCallback(query, bot));

// Простой обработчик ошибок
bot.on('polling_error', (error) => {
    console.error('Ошибка бота:', error.message);
});

console.log('Бот запущен');

module.exports = { bot }; 