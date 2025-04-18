const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSIONS_DIR = path.join(__dirname, '../extensions');
const METAMASK_DIR = path.join(EXTENSIONS_DIR, 'metamask');

console.log(`
Для установки MetaMask выполните следующие шаги:

1. Скачайте MetaMask для Chrome:
   https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn

2. Найдите скачанный файл (обычно в Downloads) и переименуйте его в metamask.zip

3. Создайте директорию для расширения:
   mkdir -p ${METAMASK_DIR}

4. Распакуйте MetaMask в эту директорию:
   unzip ~/Downloads/metamask.zip -d ${METAMASK_DIR}

После выполнения этих шагов, MetaMask будет готов к использованию с Puppeteer.

Текущий статус:
- Директория расширений: ${fs.existsSync(EXTENSIONS_DIR) ? 'Существует ✅' : 'Отсутствует ❌'}
- Директория MetaMask: ${fs.existsSync(METAMASK_DIR) ? 'Существует ✅' : 'Отсутствует ❌'}
${fs.existsSync(METAMASK_DIR) ? '- Файлы в директории MetaMask: ' + fs.readdirSync(METAMASK_DIR).length : ''}
`);

// Создаем директорию для расширений, если она не существует
if (!fs.existsSync(EXTENSIONS_DIR)) {
    fs.mkdirSync(EXTENSIONS_DIR, { recursive: true });
    console.log('Создана директория для расширений');
}

if (!fs.existsSync(METAMASK_DIR)) {
    fs.mkdirSync(METAMASK_DIR, { recursive: true });
    console.log('Создана директория для MetaMask');
} 