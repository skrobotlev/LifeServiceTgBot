require('dotenv').config();
const { Telegraf } = require('telegraf');
const handleMessage = require('./src/handlers/messageHandler');
const handleCallback = require('./src/handlers/callbackHandler');

console.log('=== Инициализация бота ===');
console.log('Токен бота:', process.env.TELEGRAM_BOT_TOKEN ? 'установлен' : 'отсутствует');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Обработка сообщений
bot.on('message', async (ctx) => {
    try {
        console.log('\n=== Новое сообщение ===');
        console.log('Текст:', ctx.message.text);
        console.log('От:', ctx.message.from.username);
        await handleMessage(ctx.message, bot);
    } catch (error) {
        console.error('Error handling message:', error);
        await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

// Обработка callback-запросов
bot.on('callback_query', async (ctx) => {
    try {
        console.log('\n=== Новый callback ===');
        console.log('Данные:', ctx.callbackQuery.data);
        console.log('От:', ctx.callbackQuery.from.username);
        await handleCallback(ctx.callbackQuery, bot);
    } catch (error) {
        console.error('Error handling callback:', error);
        await ctx.answerCbQuery('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

// Запуск бота
bot.launch()
    .then(() => {
        console.log('Bot started successfully');
    })
    .catch((error) => {
        console.error('Error starting bot:', error);
    });

// Включение graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 