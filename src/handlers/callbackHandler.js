const { PARTNERS, ADMIN_ID } = require('../config/partners');
const { descriptionReloadableLasoCard, descriptionNonReloadableLasoCard, bybitDecription } = require('../../descriptions');
const { createTypeSelectionKeyboard, createBackAndContactKeyboard, createBackButtonKeyboard } = require('../utils/keyboardUtils');
const { getReferralStats } = require('../utils/statsUtils');

const availableCards = [
    {
        name: "Пополняемая международная Visa",
        id: "card_reloadable",
        type: "popolnyaemye"
    },
    {
        name: "Предоплаченная международная Mastercard",
        id: "card_non_reloadable",
        type: "ne_popolnyaemye"
    },
    {
        name: "Карта Bybit",
        id: "card_bybit",
        type: "popolnyaemye"
    }
];

function createCardsByTypeKeyboard(cardType) {
    console.log('Создание клавиатуры для типа карты:', cardType);
    const filtered = availableCards.filter(card => card.type === cardType);
    console.log('Отфильтрованные карты:', filtered);
    const inlineKeyboard = filtered.map(card => [
        { text: card.name, callback_data: card.id }
    ]);
    inlineKeyboard.push([{ text: "Назад", callback_data: "back_to_type" }]);
    const keyboard = { reply_markup: { inline_keyboard: inlineKeyboard } };
    console.log('Созданная клавиатура:', keyboard);
    return keyboard;
}

async function handleCallback(callbackQuery, bot) {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const username = callbackQuery.from.username;
    const isAdmin = userId === ADMIN_ID;

    console.log('\n=== Обработка callback ===');
    console.log('Data:', data);
    console.log('Chat ID:', chatId);
    console.log('User ID:', userId);
    console.log('Username:', username);
    console.log('Is Admin:', isAdmin);
    console.log('====================\n');

    try {
        await bot.telegram.answerCbQuery(callbackQuery.id);

        if (data === "back_to_menu") {
            console.log("Нажата кнопка Назад");
            const keyboard = createTypeSelectionKeyboard(isAdmin, username);
            console.log('Отправляем клавиатуру:', keyboard);
            await bot.telegram.sendMessage(chatId, "Выберите тип карты:", keyboard);
            return;
        }

        if (data === "back_to_type") {
            console.log("Нажата кнопка Назад в выборе типа");
            const keyboard = createTypeSelectionKeyboard(isAdmin, username);
            console.log('Отправляем клавиатуру:', keyboard);
            await bot.telegram.sendMessage(chatId, "Выберите тип карты:", keyboard);
            return;
        }

        if (data === "contact_manager") {
            console.log("Нажата кнопка 'Связаться с менеджером'");
            const userInfo = `${callbackQuery.from.first_name || ""} ${callbackQuery.from.last_name || ""} (@${callbackQuery.from.username || "не указан"})`;
            const info = `Новый запрос на связь с менеджером:
ChatID: ${chatId}
Информация о пользователе: ${userInfo}`;
            console.log("Отправляем менеджеру:", info);
            await bot.telegram.sendMessage(ADMIN_ID, info);
            await bot.telegram.sendMessage(
                chatId,
                "Спасибо, ваша заявка отправлена. Наш менеджер свяжется с вами в ближайшее время.",
                createTypeSelectionKeyboard(isAdmin, username)
            );
            return;
        }

        if (data === "type_popolnyaemye") {
            console.log("Выбрана категория: Пополняемые карты");
            const keyboard = createCardsByTypeKeyboard("popolnyaemye");
            console.log('Отправляем клавиатуру:', keyboard);
            await bot.telegram.sendMessage(chatId, "Выберите карту:", keyboard);
            return;
        }

        if (data === "type_ne_popolnyaemye") {
            console.log("Выбрана категория: Предоплаченные карты");
            const keyboard = createCardsByTypeKeyboard("ne_popolnyaemye");
            console.log('Отправляем клавиатуру:', keyboard);
            await bot.telegram.sendMessage(chatId, "Выберите карту:", keyboard);
            return;
        }

        if (data === "show_stats") {
            console.log("Запрошена статистика");
            const stats = await getReferralStats(username);
            await bot.telegram.sendMessage(chatId, stats, { parse_mode: 'Markdown' });
            return;
        }

        const selectedCard = availableCards.find(card => card.id === data);
        if (!selectedCard) {
            console.log("Карта не найдена по id:", data);
            return;
        }

        console.log("Выбрана карта:", selectedCard.name, "с id:", selectedCard.id);

        if (selectedCard.id === "card_bybit") {
            console.log("Отправляем описание карты Bybit");
            const keyboard = createBackAndContactKeyboard();
            console.log('Отправляем клавиатуру:', keyboard);
            await bot.telegram.sendMessage(chatId, bybitDecription, keyboard);
        } else if (selectedCard.id === "card_reloadable") {
            console.log("Отправляем описание пополняемой карты");
            const keyboard = createBackAndContactKeyboard();
            console.log('Отправляем клавиатуру:', keyboard);
            await bot.telegram.sendMessage(chatId, descriptionReloadableLasoCard, keyboard);
        } else if (selectedCard.id === "card_non_reloadable") {
            console.log("Отправляем описание предоплачиваемые карты");
            const keyboard = createBackAndContactKeyboard();
            console.log('Отправляем клавиатуру:', keyboard);
            await bot.telegram.sendMessage(chatId, descriptionNonReloadableLasoCard, keyboard);
        }
    } catch (error) {
        console.error('Ошибка при обработке callback:', error);
        await bot.telegram.answerCbQuery(callbackQuery.id, {
            text: 'Произошла ошибка. Попробуйте позже.',
            show_alert: true
        });
    }
}

module.exports = handleCallback; 