const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  // Конфигурация Firebase
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function linkWalletToUser(telegramId, walletAddress) {
  try {
    await setDoc(doc(db, "users", telegramId.toString()), {
      walletAddress,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error linking wallet:", error);
    return false;
  }
}

async function getUserWallet(telegramId) {
  try {
    const docRef = doc(db, "users", telegramId.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().walletAddress;
    }
    return null;
  } catch (error) {
    console.error("Error getting wallet:", error);
    return null;
  }
}

module.exports = {
  linkWalletToUser,
  getUserWallet
}; 