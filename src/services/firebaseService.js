const { db } = require('../config/firebaseConfig');
const { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } = require('firebase/firestore');

class FirebaseService {
    // Создание нового пользователя
    async createUser(userId, userData) {
        try {
            const userRef = doc(db, 'users', userId.toString());
            await setDoc(userRef, {
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error creating user:', error);
            return false;
        }
    }

    // Получение пользователя
    async getUser(userId) {
        try {
            const userRef = doc(db, 'users', userId.toString());
            const userSnap = await getDoc(userRef);
            return userSnap.exists() ? userSnap.data() : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    // Обновление данных пользователя
    async updateUser(userId, userData) {
        try {
            const userRef = doc(db, 'users', userId.toString());
            await updateDoc(userRef, {
                ...userData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    // Создание новой транзакции
    async createTransaction(transactionData) {
        try {
            const transactionsRef = collection(db, 'transactions');
            const newTransactionRef = doc(transactionsRef);
            await setDoc(newTransactionRef, {
                ...transactionData,
                createdAt: new Date(),
                status: 'pending'
            });
            return newTransactionRef.id;
        } catch (error) {
            console.error('Error creating transaction:', error);
            return null;
        }
    }

    // Получение транзакций пользователя
    async getUserTransactions(userId) {
        try {
            const transactionsRef = collection(db, 'transactions');
            const q = query(transactionsRef, where('userId', '==', userId.toString()));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting user transactions:', error);
            return [];
        }
    }
}

module.exports = new FirebaseService(); 