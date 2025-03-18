const TelegramApi = require("node-telegram-bot-api");

const { privetstvie } = require("./texts");
const { descriptionReloadableLasoCard } = require("./descriptions");

const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";
const bot = new TelegramApi(token, { polling: true });

// Массив с данными о доступных картах
const availableCards = [
  { name: "Карта Bybit", id: "card_visa" },
  { name: "Предоплаченная международная Mastercard", id: "card_mastercard" },
  { name: "Пополняемая международная Visa", id: "card_maestro" },
];

// Функция для формирования клавиатуры с кнопками выбора карты
const createCardSelectionKeyboard = () => {
  const inlineKeyboard = availableCards.map((card) => [
    { text: card.name, callback_data: card.id },
  ]);
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  };
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Приветствие" },
    { command: "/info", description: "Информация" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      // Отправляем приветственное сообщение с кнопками для выбора карты
      await bot.sendMessage(chatId, privetstvie, createCardSelectionKeyboard());
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    // Проверяем, выбрана ли одна из карт
    const selectedCard = availableCards.find((card) => card.id === data);
    if (selectedCard) {
      if (selectedCard.id === "card_maestro") {
        // Если выбрана карта с id "card_maestro", отправляем соответствующее описание
        await bot.sendMessage(chatId, descriptionReloadableLasoCard);
      } else {
        // Для остальных карт стандартное сообщение
        await bot.sendMessage(
          chatId,
          `Вы выбрали ${selectedCard.name}. Пожалуйста, свяжитесь с нашим менеджером для дальнейшего оформления или оставьте ваш контакт.`
        );
      }
    }
  });
};

start();
