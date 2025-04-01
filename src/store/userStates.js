const userStates = {};

function getUserState(chatId) {
  return userStates[chatId];
}

function setUserState(chatId, state) {
  userStates[chatId] = state;
}

function deleteUserState(chatId) {
  delete userStates[chatId];
}

module.exports = {
  getUserState,
  setUserState,
  deleteUserState
}; 