const TelegramApi = require("node-telegram-bot-api");

const { privetstvie } = require("./texts");
const {
  descriptionReloadableLasoCard,
  descriptionNonReloadableLasoCard,
} = require("./descriptions");

const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";
const bot = new TelegramApi(token, { polling: true });

// Проверьте, что ID менеджера корректен
const MANAGER_CHAT_ID = 197115775; // ID менеджера

// Массив с данными о доступных картах
const availableCards = [
  { name: "Карта Bybit", id: "card_bybit" },
  {
    name: "Предоплаченная международная Mastercard",
    id: "card_non_reloadable",
  },
  { name: "Пополняемая международная Visa", id: "card_reloadable" },
];

// Клавиатура выбора карт + связь с менеджером
function createCardSelectionKeyboard() {
  const inlineKeyboard = availableCards.map((card) => [
    { text: card.name, callback_data: card.id },
  ]);
  inlineKeyboard.push([
    { text: "Связаться с менеджером", callback_data: "contact_manager" },
  ]);
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  };
}

// Клавиатура "Назад"
function createBackButtonKeyboard() {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Назад", callback_data: "back_to_menu" }]],
    }),
  };
}

// Состояния пользователей (для диалога с менеджером)
const userStates = {};

// Устанавливаем команды
bot.setMyCommands([
  { command: "/start", description: "Приветствие" },
  { command: "/info", description: "Информация" },
  { command: "/contact", description: "Связаться с менеджером" },
]);

// Обработчик текстовых сообщений
bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  // Команда /start
  if (text === "/start") {
    console.log("Пользователь ввёл /start, чат ID:", chatId);
    await bot.sendMessage(chatId, privetstvie, createCardSelectionKeyboard());
    return;
  }

  // Команда /contact
  if (text === "/contact") {
    console.log("Пользователь ввёл /contact, чат ID:", chatId);
    userStates[chatId] = { stage: "ask_username" };
    await bot.sendMessage(
      chatId,
      "Пожалуйста, введите ваш ник:",
      createBackButtonKeyboard()
    );
    return;
  }

  // Если пользователь в процессе диалога
  if (userStates[chatId]) {
    const state = userStates[chatId];
    console.log(
      `Пользователь ${chatId} ввёл текст: "${text}", stage: ${state.stage}`
    );

    if (state.stage === "ask_username") {
      state.username = text;
      state.stage = "ask_email";
      await bot.sendMessage(
        chatId,
        "Спасибо. Теперь введите ваш email:",
        createBackButtonKeyboard()
      );
      return;
    }

    if (state.stage === "ask_email") {
      state.email = text;
      state.stage = "ask_message";
      await bot.sendMessage(
        chatId,
        "Отлично. Напишите, пожалуйста, ваше сообщение для менеджера:",
        createBackButtonKeyboard()
      );
      return;
    }

    if (state.stage === "ask_message") {
      state.message = text;
      const userInfo = `${msg.from.first_name || ""} ${
        msg.from.last_name || ""
      } (@${msg.from.username || "не указан"})`;
      const info = `Новый запрос на связь с менеджером:
Ник: ${state.username}
Email: ${state.email}
Сообщение: ${state.message}
ChatID: ${chatId}
Информация о пользователе: ${userInfo}`;
      console.log("Отправляем менеджеру:", info);
      await bot.sendMessage(MANAGER_CHAT_ID, info);
      await bot.sendMessage(
        chatId,
        "Спасибо, ваша заявка отправлена. Наш менеджер свяжется с вами в ближайшее время.",
        createCardSelectionKeyboard()
      );
      delete userStates[chatId];
      return;
    }
  }
});

// Обработчик callback-запросов
bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;

  // Проверим, что событие действительно обрабатывается
  console.log(`callback_query от чата ${chatId}, data = ${data}`);

  // Отвечаем на callback-запрос
  await bot.answerCallbackQuery(msg.id);

  // Кнопка "Назад"
  if (data === "back_to_menu") {
    console.log("Нажата кнопка Назад, сбрасываем состояние");
    delete userStates[chatId];
    await bot.sendMessage(chatId, privetstvie, createCardSelectionKeyboard());
    return;
  }

  // Кнопка "Связаться с менеджером"
  if (data === "contact_manager") {
    console.log("Нажата кнопка 'Связаться с менеджером'");
    userStates[chatId] = { stage: "ask_username" };
    await bot.sendMessage(
      chatId,
      "Пожалуйста, введите ваш ник:",
      createBackButtonKeyboard()
    );
    return;
  }

  // Обработка выбора карты
  const selectedCard = availableCards.find((card) => card.id === data);
  if (!selectedCard) {
    console.log("Карта не найдена по id:", data);
    return;
  }

  console.log("Выбрана карта:", selectedCard.name, "с id:", selectedCard.id);

  if (selectedCard.id === "card_reloadable") {
    console.log("Отправляем описание пополняемой карты");
    await bot.sendMessage(
      chatId,
      descriptionReloadableLasoCard,
      createBackButtonKeyboard()
    );
  } else if (selectedCard.id === "card_non_reloadable") {
    console.log("Отправляем описание непополняемой карты");
    await bot.sendMessage(
      chatId,
      descriptionNonReloadableLasoCard,
      createBackButtonKeyboard()
    );
  } else {
    console.log("Отправляем стандартное сообщение (Bybit или что-то ещё)");
    await bot.sendMessage(
      chatId,
      `Вы выбрали ${selectedCard.name}. Пожалуйста, свяжитесь с нашим менеджером для дальнейшего оформления или оставьте ваш контакт.`,
      createBackButtonKeyboard()
    );
  }
});
