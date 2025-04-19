const { getReferralStats } = require('./messageHandler');
const ADMIN_ID = 197115775;

async function handleCallback(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;
    const isAdmin = userId === ADMIN_ID;

    try {
        console.log('=== Обработка callback ===');
        console.log('Chat ID:', chatId);
        console.log('User ID:', userId);
        console.log('Callback data:', data);

        switch (data) {
            case 'show_stats':
                if (isAdmin) {
                    const statsMessage = await getReferralStats();
                    await bot.editMessageText(statsMessage, {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id,
                        parse_mode: 'Markdown'
                    });
                } else {
                    await bot.answerCallbackQuery(callbackQuery.id, {
                        text: '⛔️ У вас нет доступа к этой функции',
                        show_alert: true
                    });
                }
                break;

            case 'type_popolnyaemye':
                // Обработка выбора пополняемых карт
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Вы выбрали пополняемые карты'
                });
                break;

            case 'type_ne_popolnyaemye':
                // Обработка выбора предоплаченных карт
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Вы выбрали предоплаченные карты'
                });
                break;

            case 'contact_manager':
                // Обработка запроса на связь с менеджером
                await bot.answerCallbackQuery(callbackQuery.id);
                await bot.sendMessage(chatId, 'Для связи с менеджером напишите: @manager');
                break;

            default:
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Неизвестная команда'
                });
        }
    } catch (error) {
        console.error('Ошибка обработки callback:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Произошла ошибка. Попробуйте позже.',
            show_alert: true
        });
    }
}

module.exports = handleCallback; 