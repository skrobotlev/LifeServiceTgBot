const token = "7623617111:AAF1X988ErWNSxMYJn1Z7z3PGqhrvNJLG7A";
const ADMIN_CHAT_ID = 197115775;

const availableCards = [
  { name: "Пополняемая международная Visa", id: "card_reloadable" },
  { name: "Предоплаченная международная Mastercard", id: "card_non_reloadable" },
  { name: "Карта Bybit", id: "card_bybit" },
];

const adminIDs = [ADMIN_CHAT_ID];

module.exports = {
  token,
  ADMIN_CHAT_ID,
  availableCards,
  adminIDs
}; 