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

module.exports = {
  createCardSelectionKeyboard,
  createBackButtonKeyboard,
  createBackAndContactKeyboard,
  createAdminKeyboard
}; 