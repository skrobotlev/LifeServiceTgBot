const TelegramApi = require("node-telegram-bot-api");
const { token } = require("./config/config");
const { handleMessage } = require("./handlers/messageHandler");
const { handleCallback } = require("./handlers/callbackHandler");

const bot = new TelegramApi(token, { polling: true });

bot.setMyCommands([
  { command: "/start", description: "Приветствие" },
  { command: "/info", description: "Информация" },
  { command: "/contact", description: "Связаться с менеджером" },
  { command: "/admin", description: "Админ-панель" },
  { command: "/auth", description: "Авторизация в Laso" },
  { command: "/balance", description: "Проверить баланс карты" }
]);

bot.on("message", (msg) => handleMessage(msg, bot));
bot.on("callback_query", (callbackQuery) => handleCallback(callbackQuery, bot));

module.exports = { bot }; 