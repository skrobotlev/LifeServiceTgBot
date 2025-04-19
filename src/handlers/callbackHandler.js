const { getReferralStats } = require('./messageHandler');
const { PARTNERS, ADMIN_ID } = require('../config/partners');

async function handleCallback(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const username = callbackQuery.from.username;
    const data = callbackQuery.data;
    const isAdmin = userId === ADMIN_ID;

    try {
        console.log('=== Обработка callback ===');
        console.log('Chat ID:', chatId);
        console.log('User ID:', userId);
        console.log('Username:', username);
        console.log('Callback data:', data);

        switch (data) {
            case 'show_stats':
                if (!username) {
                    await bot.answerCallbackQuery(callbackQuery.id, {
                        text: '⚠️ Для доступа к статистике необходимо установить username в Telegram',
                        show_alert: true
                    });
                    return;
                }

                const statsMessage = await getReferralStats(username);
                if (statsMessage === '⛔️ У вас нет доступа к статистике') {
                    await bot.answerCallbackQuery(callbackQuery.id, {
                        text: statsMessage,
                        show_alert: true
                    });
                } else {
                    await bot.editMessageText(statsMessage, {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id,
                        parse_mode: 'Markdown'
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