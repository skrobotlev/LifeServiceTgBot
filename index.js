const TelegramApi = require("node-telegram-bot-api");

const { privetstvie } = require("./texts");
const { descriptionReloadableLasoCard } = require("./descriptions");

const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";
const bot = new TelegramApi(token, { polling: true });

const MANAGER_CHAT_ID = 197115775; // ID менеджера

// Массив с данными о доступных картах
const availableCards = [
  { name: "Карта Bybit", id: "card_visa" },
  { name: "Предоплаченная международная Mastercard", id: "card_mastercard" },
  { name: "Пополняемая международная Visa", id: "card_maestro" },
];

// Функция для формирования клавиатуры с кнопками выбора карты и контакта менеджера
const createCardSelectionKeyboard = () => {
  const inlineKeyboard = availableCards.map((card) => [
    { text: card.name, callback_data: card.id },
  ]);
  // Добавляем кнопку для связи с менеджером
  inlineKeyboard.push([
    { text: "Связаться с менеджером", callback_data: "contact_manager" },
  ]);
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  };
};

// Объект для хранения состояний пользователей
const userStates = {};

// Устанавливаем команды бота
bot.setMyCommands([
  { command: "/start", description: "Приветствие" },
  { command: "/info", description: "Информация" },
  { command: "/contact", description: "Связаться с менеджером" },
]);

// Обработчик текстовых сообщений
bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === "/start") {
    await bot.sendMessage(chatId, privetstvie, createCardSelectionKeyboard());
    return;
  }

  if (text === "/contact") {
    userStates[chatId] = { stage: "ask_username" };
    await bot.sendMessage(chatId, "Пожалуйста, введите ваш ник:");
    return;
  }

  // Если пользователь уже находится в диалоге (состояние сохранено)
  if (userStates[chatId]) {
    const state = userStates[chatId];
    if (state.stage === "ask_username") {
      state.username = text;
      state.stage = "ask_email";
      await bot.sendMessage(chatId, "Спасибо. Теперь введите ваш email:");
      return;
    }
    if (state.stage === "ask_email") {
      state.email = text;
      state.stage = "ask_message";
      await bot.sendMessage(
        chatId,
        "Отлично. Напишите, пожалуйста, ваше сообщение для менеджера:"
      );
      return;
    }
    if (state.stage === "ask_message") {
      state.message = text;
      // Формируем дополнительную информацию о пользователе из msg.from
      const userInfo = `${msg.from.first_name || ""} ${
        msg.from.last_name || ""
      } (@${msg.from.username || "не указан"})`;
      const info = `Новый запрос на связь с менеджером:
Ник: ${state.username}
Email: ${state.email}
Сообщение: ${state.message}
ChatID: ${chatId}
Информация о пользователе: ${userInfo}`;
      await bot.sendMessage(MANAGER_CHAT_ID, info);
      await bot.sendMessage(
        chatId,
        "Спасибо, ваша заявка отправлена. Наш менеджер свяжется с вами в ближайшее время."
      );
      delete userStates[chatId];
      return;
    }
  }
});

// Обработчик callback-запросов от inline-клавиатуры
bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;

  if (data === "contact_manager") {
    userStates[chatId] = { stage: "ask_username" };
    await bot.sendMessage(chatId, "Пожалуйста, введите ваш ник:");
    return;
  }

  // Обработка выбора карты
  const selectedCard = availableCards.find((card) => card.id === data);
  if (selectedCard) {
    if (selectedCard.id === "card_maestro") {
      await bot.sendMessage(chatId, descriptionReloadableLasoCard);
    } else {
      await bot.sendMessage(
        chatId,
        `Вы выбрали ${selectedCard.name}. Пожалуйста, свяжитесь с нашим менеджером для дальнейшего оформления или оставьте ваш контакт.`
      );
    }
  }
})
