const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

// Проверка наличия всех необходимых переменных окружения
const requiredEnvVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

let app;
let db;

try {
    console.log('=== Инициализация Firebase ===');
    console.log('Конфигурация:', firebaseConfig);

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    console.log('Firebase App инициализирован');

    // Initialize Firestore
    db = getFirestore(app);
    console.log('Firestore инициализирован');

    // Проверяем подключение
    console.log('Firebase успешно инициализирован');
} catch (error) {
    console.error('Ошибка при инициализации Firebase:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}

// Проверяем наличие конфигурации Firebase
if (!process.env.FIREBASE_API_KEY || !process.env.FIREBASE_PROJECT_ID) {
    console.error('Ошибка: Конфигурация Firebase не найдена в .env файле');
    process.exit(1);
}

module.exports = {
    db
}; 