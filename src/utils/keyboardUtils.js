const { PARTNERS } = require('../config/partners');

function createTypeSelectionKeyboard(isAdmin = false, username = '') {
    console.log('\n=== Создание клавиатуры ===');
    console.log('Пользователь:', username);
    console.log('Is Admin:', isAdmin);

    const keyboard = {
        inline_keyboard: [
            [{ text: "Пополняемые карты", callback_data: "type_popolnyaemye" }],
            [{ text: "Предоплаченные карты", callback_data: "type_ne_popolnyaemye" }],
            [{ text: "Связаться с менеджером", callback_data: "contact_manager" }]
        ]
    };

    // Добавляем кнопку статистики только для тех, у кого есть доступ
    const userRefs = PARTNERS[username] || [];
    console.log('Доступные реферальные ссылки:', userRefs);

    if (isAdmin || userRefs.length > 0) {
        keyboard.inline_keyboard.push([{ text: "📊 Статистика", callback_data: "show_stats" }]);
    }

    console.log('Созданная клавиатура:', keyboard);
    console.log('====================\n');
    return { reply_markup: keyboard };
}

function createBackButtonKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Назад", callback_data: "back_to_menu" }]
            ]
        }
    };
}

function createBackAndContactKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Назад", callback_data: "back_to_menu" },
                    { text: "Связаться с менеджером", callback_data: "contact_manager" }
                ]
            ]
        }
    };
}

module.exports = {
    createTypeSelectionKeyboard,
    createBackAndContactKeyboard,
    createBackButtonKeyboard
}; 