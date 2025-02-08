const TelegramApi = require("node-telegram-bot-api");

const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";

const bot = new TelegramApi(token, { polling: true });
const { gameOptions, againOption } = require("./options");
const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Бот загадал цифру от 0до9`);
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Угадай", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    {
      command: "/start",
      description: "Приветствие",
    },
    {
      command: "/info",
      description: "Инфа?",
    },
    {
      command: "/game",
      description: "Сыграем",
    },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    console.log(msg);

    if (text === "/start") {
      await bot.sendMessage(
        chatId,
        "Приветственное сообщение!АССАЛАМУ АЛЕЙКУМ"
      );
      return bot.sendSticker(
        chatId,
        "https://tlgrm.ru/_/stickers/6a2/48d/6a248d0e-129a-331c-9825-49089da76b49/3.webp"
      );
    }

    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`
      );
    }

    if (text === "/game") {
      startGame(chatId);
      //   await bot.sendMessage(chatId, `Бот загадал цифру от 0до9`);
      //   const randomNumber = Math.floor(Math.random() * 10);
      //   chats[chatId] = randomNumber;
      //   return bot.sendMessage(chatId, "Угадай", gameOptions);
    }

    return bot.sendMessage(chatId, "Не понял нахуй");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === "/again") {
      startGame(chatId);
    }

    if (data === chats[chatId]) {
      return await bot.sendMessage(
        chatId,
        `Поздравляю, отгадал цифру ${chats[chatId]}`,
        againOption
      );
    } else {
      return await bot.sendMessage(
        chatId,
        `Сорян, не угадал ${chats[chatId]}`,
        againOption
      );
    }
  });
};

start();
