const TelegramApi = require("node-telegram-bot-api");

const { privetstvie } = require("./texts");
const {
  descriptionReloadableLasoCard,
  descriptionNonReloadableLasoCard,
  bybitDecription,
} = require("./descriptions");

const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";
const bot = new TelegramApi(token, { polling: true });

// ID менеджера и администратора (один и тот же)
const ADMIN_CHAT_ID = 197115775;

// Массив с данными о доступных картах с типами
const availableCards = [
  { name: "Пополняемая международная Visa", id: "card_reloadable", type: "popolnyaemye" },
  { name: "Предоплаченная международная Mastercard", id: "card_non_reloadable", type: "ne_popolnyaemye" },
  { name: "Карта Bybit", id: "card_bybit", type: "popolnyaemye" },
];

//////////////////////////////
// Меню выбора типа карт  //
//////////////////////////////

function createTypeSelectionKeyboard() {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Пополняемые карты", callback_data: "type_popolnyaemye" }],
        [{ text: "Непополняемые карты", callback_data: "type_ne_popolnyaemye" }],
        [{ text: "Связаться с менеджером", callback_data: "contact_manager" }],
      ],
    }),
  };
}

////////////////////////////////////////
// Клавиатура для выбора карты по типу //
////////////////////////////////////////

function createCardsByTypeKeyboard(cardType) {
  const filtered = availableCards.filter((card) => card.type === cardType);
  const inlineKeyboard = filtered.map((card) => [
    { text: card.name, callback_data: card.id },
  ]);
  // Кнопка "Назад" возвращает к выбору категории
  inlineKeyboard.push([{ text: "Назад", callback_data: "back_to_type" }]);
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  };
}

/////////////////////////////////
// Клавиатуры, используемые ранее
/////////////////////////////////

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

//////////////////////////
// Админ-панель клавиатура
//////////////////////////

function createAdminKeyboard() {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Рассылка", callback_data: "admin_broadcast" }],
        [{ text: "Статистика", callback_data: "admin_stats" }],
        [{ text: "Закрыть панель", callback_data: "admin_close" }],
      ],
    }),
  };
}

//////////////////////////
// Состояния пользователей
//////////////////////////

const userStates = {};

// Список администраторов (в данном случае один)
const adminIDs = [ADMIN_CHAT_ID];

////////////////////////////
// Установка команд бота  //
////////////////////////////

bot.setMyCommands([
  { command: "/start", description: "Приветствие" },
  { command: "/info", description: "Информация" },
  { command: "/contact", description: "Связаться с менеджером" },
  { command: "/admin", description: "Админ-панель" },
]);

//////////////////////////////
// Обработчик текстовых сообщений
//////////////////////////////

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  // Команда /start – выводим основное меню с выбором типа карт
  if (text === "/start") {
    console.log("Пользователь ввёл /start, чат ID:", chatId);
    await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
    return;
  }

  // Команда /contact – инициирует диалог с менеджером
  if (text === "/contact") {
    console.log("Пользователь ввёл /contact, чат ID:", chatId);
    userStates[chatId] = { stage: "ask_username" };
    await bot.sendMessage(chatId, "Пожалуйста, введите ваш ник:", createBackButtonKeyboard());
    return;
  }

  // Команда /admin – доступ только для админа
  if (text === "/admin") {
    console.log("Пользователь ввёл /admin, чат ID:", chatId);
    if (!adminIDs.includes(chatId)) {
      return bot.sendMessage(chatId, "Доступ запрещён.");
    }
    await bot.sendMessage(chatId, "Добро пожаловать в админ-панель. Выберите действие:", createAdminKeyboard());
    return;
  }

  // Обработка диалога с менеджером
  if (userStates[chatId]) {
    const state = userStates[chatId];
    console.log(`Пользователь ${chatId} ввёл текст: "${text}", stage: ${state.stage}`);

    if (state.stage === "ask_username") {
      state.username = text;
      state.stage = "ask_email";
      await bot.sendMessage(chatId, "Спасибо. Теперь введите ваш email:", createBackButtonKeyboard());
      return;
    }
    if (state.stage === "ask_email") {
      state.email = text;
      state.stage = "ask_message";
      await bot.sendMessage(chatId, "Отлично. Напишите, пожалуйста, ваше сообщение для менеджера:", createBackButtonKeyboard());
      return;
    }
    if (state.stage === "ask_message") {
      state.message = text;
      const userInfo = `${msg.from.first_name || ""} ${msg.from.last_name || ""} (@${msg.from.username || "не указан"})`;
      const info = `Новый запрос на связь с менеджером:
Ник: ${state.username}
Email: ${state.email}
Сообщение: ${state.message}
ChatID: ${chatId}
Информация о пользователе: ${userInfo}`;
      console.log("Отправляем менеджеру:", info);
      await bot.sendMessage(ADMIN_CHAT_ID, info);
      await bot.sendMessage(chatId, "Спасибо, ваша заявка отправлена. Наш менеджер свяжется с вами в ближайшее время.", createTypeSelectionKeyboard());
      delete userStates[chatId];
      return;
    }

    // Админский диалог (например, рассылка)
    if (state.stage === "broadcast") {
      await bot.sendMessage(chatId, "Рассылка запущена!\nТекст рассылки: " + text);
      delete userStates[chatId];
      return;
    }
  }
});

////////////////////////////////////
// Обработчик callback-запросов
////////////////////////////////////

bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;

  console.log(`callback_query от чата ${chatId}, data = ${data}`);
  await bot.answerCallbackQuery(msg.id);

  // Кнопка "Назад" (из карточного меню)
  if (data === "back_to_menu") {
    console.log("Нажата кнопка Назад, сбрасываем состояние");
    delete userStates[chatId];
    await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
    return;
  }

  // Кнопка "Назад" из выбора типа карт
  if (data === "back_to_type") {
    console.log("Нажата кнопка Назад в выборе типа");
    await bot.sendMessage(chatId, privetstvie, createTypeSelectionKeyboard());
    return;
  }

  // Кнопка "Связаться с менеджером"
  if (data === "contact_manager") {
    console.log("Нажата кнопка 'Связаться с менеджером'");
    userStates[chatId] = { stage: "ask_username" };
    await bot.sendMessage(chatId, "Пожалуйста, введите ваш ник:", createBackButtonKeyboard());
    return;
  }

  // Обработка выбора типа карт
  if (data === "type_popolnyaemye") {
    console.log("Выбрана категория: Пополняемые карты");
    await bot.sendMessage(chatId, "Выберите карту:", createCardsByTypeKeyboard("popolnyaemye"));
    return;
  }
  if (data === "type_ne_popolnyaemye") {
    console.log("Выбрана категория: Непополняемые карты");
    await bot.sendMessage(chatId, "Выберите карту:", createCardsByTypeKeyboard("ne_popolnyaemye"));
    return;
  }

  // Обработка выбора конкретной карты
  const selectedCard = availableCards.find((card) => card.id === data);
  if (!selectedCard) {
    console.log("Карта не найдена по id:", data);
    return;
  }
  console.log("Выбрана карта:", selectedCard.name, "с id:", selectedCard.id);

  if (selectedCard.id === "card_bybit") {
    console.log("Отправляем описание карты Bybit");
    await bot.sendMessage(chatId, bybitDecription, createBackAndContactKeyboard());
  }
  if (selectedCard.id === "card_reloadable") {
    console.log("Отправляем описание пополняемой карты");
    await bot.sendMessage(chatId, descriptionReloadableLasoCard, createBackAndContactKeyboard());
  }
  if (selectedCard.id === "card_non_reloadable") {
    console.log("Отправляем описание непополняемой карты");
    await bot.sendMessage(chatId, descriptionNonReloadableLasoCard, createBackAndContactKeyboard());
  }

  // Обработка админ-панели
  if (data === "admin_broadcast") {
    console.log("Админ выбрал рассылку");
    userStates[chatId] = { stage: "broadcast" };
    await bot.sendMessage(chatId, "Введите текст для рассылки:", {
      reply_markup: JSON.stringify({
        inline_keyboard: [[{ text: "Отмена", callback_data: "broadcast_cancel" }]],
      }),
    });
    return;
  }
  if (data === "admin_stats") {
    console.log("Админ выбрал статистику");
    await bot.sendMessage(chatId, "Статистика:\nПользователей: 123\nАктивных: 45\nСообщений: 678", createAdminKeyboard());
    return;
  }
  if (data === "admin_close") {
    console.log("Админ закрыл панель");
    await bot.sendMessage(chatId, "Панель закрыта.", createTypeSelectionKeyboard());
    return;
  }
  if (data === "broadcast_cancel") {
    console.log("Админ отменил рассылку");
    delete userStates[chatId];
    await bot.sendMessage(chatId, "Рассылка отменена.", createAdminKeyboard());
    return;
  }
});
