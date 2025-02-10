const TelegramApi = require("node-telegram-bot-api");

const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";

const bot = new TelegramApi(token, { polling: true });

// Приветственное сообщение
const privetstvie = `👋 Приветствуем вас в LifeService! 💳🚀

Мы рады, что вы здесь и готовы открыть для себя мир удобных международных платежей!

Выберите, какой тип карты вас интересует:`;

// Клавиатура для выбора типа карты
const cardOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Пополняемые карты", callback_data: "rechargeable" },
        { text: "Предоплаченные карты", callback_data: "prepaid" }
      ],
      [
        { text: "Карта Bybit", callback_data: "bybit" }
      ]
    ]
  })
};

// Клавиатура с кнопкой для связи с менеджером
const contactManagerButton = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Связаться с менеджером для оформления", callback_data: "contact_manager" }
      ]
    ]
  })
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
      // Отправляем приветственное сообщение с выбором типа карты
      await bot.sendMessage(chatId, privetstvie, cardOptions);
    }

    if (text === "/info") {
      return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    // Описание для пополняемых карт (информация из сообщений 09.12.2024 и 14.12.2024)
    if (data === "rechargeable") {
      const messageText = `💸 *Пополняемые карты* 💸

• Выпуск карты — $30.
• Пополнение через наш сервис — 10% от суммы.
• Возможность пополнять криптовалютой самостоятельно.
• Возврат до 80% на рублёвую карту, если карта не подойдет.
• Лимит использования — до $3000 в месяц.
• Поддержка платежей через ApplePay, GooglePay, SamsungPay и другие.

Эти карты отлично подходят для регулярных платежей и контроля расходов.`;
      return await bot.sendMessage(chatId, messageText, { parse_mode: "Markdown", ...contactManagerButton });
    }

    // Описание для предоплаченных карт (информация из сообщения 14.12.2024)
    if (data === "prepaid") {
      const messageText = `💵 *Предоплаченные карты* 💵

• Однократное пополнение.
• Комиссия — 10% от суммы (минимум $20).
• Работают по всему миру (за исключением санкционных стран) — подходят для покупок в супермаркетах, аптеках, бутиках и интернет-сервисах (ApplePay, GooglePay, Airbnb, Booking и др.).
• Высокая безопасность, простота использования и поддержка на всех этапах.

Идеальный вариант для разовых покупок и оплаты услуг.`;
      return await bot.sendMessage(chatId, messageText, { parse_mode: "Markdown", ...contactManagerButton });
    }

    // Описание для карт Bybit (информация из сообщения 27.01.2025)
    if (data === "bybit") {
      const messageText = `💳 *Карта Bybit* 💳

• Оформление виртуальной и физической карты Bybit всего за 1 день.
• При заказе физической карты в комплект входит настоящая SIM-карта.
• Бесплатное годовое обслуживание.
• Оплата всех иностранных сервисов без ограничений.
• Срок действия — 3 года.
• Пополнение с любого российского банка.
• До 10% кешбека на зарубежные траты и суточный лимит до 5000 евро.
• Баланс карты равен балансу кошелька Bybit.

*Примечание:* Виртуальная карта Bybit не работает в России.`;
      return await bot.sendMessage(chatId, messageText, { parse_mode: "Markdown", ...contactManagerButton });
    }

    // Если пользователь нажал на кнопку «Связаться с менеджером для оформления»
    if (data === "contact_manager") {
      return await bot.sendMessage(chatId, "Пожалуйста, оставьте ваш контакт или напишите ваш вопрос, и наш менеджер свяжется с вами для оформления карты.");
    }
  });
};

start();
