const TelegramApi = require("node-telegram-bot-api");

const { privetstvie } = require("./texts");
const {
  descriptionReloadableLasoCard,
  descriptionNonReloadableLasoCard,
  bybitDecription,
} = require("./descriptions");

const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";
const bot = new TelegramApi(token, { polling: true });

const MANAGER_CHAT_ID = 197115775;

const availableCards = [
  {
    name: "Пополняемая международная Visa",
    id: "card_reloadable",
    type: "popolnyaemye",
  },
  {
    name: "Предоплаченная международная Mastercard",
    id: "card_non_reloadable",
    type: "ne_popolnyaemye",
  },
  { name: "Карта Bybit", id: "card_bybit", type: "popolnyaemye" },
];

function createTypeSelectionKeyboard() {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Пополняемые карты", callback_data: "type_popolnyaemye" }],
        [{ text: "Предоплаченные карты", callback_data: "type_ne_popolnyaemye" }],
        [{ text: "Связаться с менеджером", callback_data: "contact_manager" }],
      ],
    }),
  };
}

function createCardsByTypeKeyboard(cardType) {
  const filtered = availableCards.filter((card) => card.type === cardType);
  const inlineKeyboard = filtered.map((card) => [
    { text: card.name, callback_data: card.id },
  ]);
  inlineKeyboard.push([{ text: "Назад", callback_data: "back_to_type" }]);
  return { reply_markup: JSON.stringify({ inline_keyboard: inlineKeyboard }) };
}

function createBackButtonKeyboard() {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Назад", callback_data: "back_to_menu" }]],
    }),
  };
}

function createBackAndContactKeyboard() {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Назад", callback_data: "back_to_menu" },
          { text: "Связаться с менеджером", callback_data: "contact_manager" },
        ],
      ],
    }),
  };
}

const userStates = {};

bot.setMyCommands([
  { command: "/start", description: "Приветствие" },
  { command: "/info", description: "Информация" },
  { command: "/contact", description: "Связаться с менеджером" },
]);

// === ОБРАБОТКА С РЕФЕРАЛЬНЫМ КОДОМ ===
bot.onText(/\/start(?:\s(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const refCode = match[1];

  if (refCode) {
    const userInfo = `${msg.from.first_name || ""} ${msg.from.last_name || ""} (@${msg.from.username || "не указан"})`;
    await bot.sendMessage(
      MANAGER_CHAT_ID,
      `🚀 Новый пользователь по реферальной ссылке: ${refCode}\n👤 ${userInfo}\n🆔 ChatID: ${chatId}`
    );
  }

  console.log("Пользователь ввёл /start, чат ID:", chatId);
  await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
});

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

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
      const userInfo = `${msg.from.first_name || ""} ${msg.from.last_name || ""
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
        createTypeSelectionKeyboard()
      );
      delete userStates[chatId];
      return;
    }
  }
});

bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;
  console.log(`callback_query от чата ${chatId}, data = ${data}`);
  await bot.answerCallbackQuery(msg.id);

  if (data === "back_to_menu") {
    console.log("Нажата кнопка Назад, сбрасываем состояние");
    delete userStates[chatId];
    await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
    return;
  }
  if (data === "back_to_type") {
    console.log("Нажата кнопка Назад в выборе типа");
    await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
    return;
  }
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

  if (data === "type_popolnyaemye") {
    console.log("Выбрана категория: Пополняемые карты");
    await bot.sendMessage(
      chatId,
      "Выберите карту:",
      createCardsByTypeKeyboard("popolnyaemye")
    );
    return;
  }
  if (data === "type_ne_popolnyaemye") {
    console.log("Выбрана категория: Предоплаченные карты");
    await bot.sendMessage(
      chatId,
      "Выберите карту:",
      createCardsByTypeKeyboard("ne_popolnyaemye")
    );
    return;
  }

  const selectedCard = availableCards.find((card) => card.id === data);
  if (!selectedCard) {
    console.log("Карта не найдена по id:", data);
    return;
  }
  console.log("Выбрана карта:", selectedCard.name, "с id:", selectedCard.id);
  if (selectedCard.id === "card_bybit") {
    console.log("Отправляем описание карты Bybit");
    await bot.sendMessage(
      chatId,
      bybitDecription,
      createBackAndContactKeyboard()
    );
  }
  if (selectedCard.id === "card_reloadable") {
    console.log("Отправляем описание пополняемой карты");
    await bot.sendMessage(
      chatId,
      descriptionReloadableLasoCard,
      createBackAndContactKeyboard()
    );
  }
  if (selectedCard.id === "card_non_reloadable") {
    console.log("Отправляем описание предоплачиваемые карты");
    await bot.sendMessage(
      chatId,
      descriptionNonReloadableLasoCard,
      createBackAndContactKeyboard()
    );
  }
})