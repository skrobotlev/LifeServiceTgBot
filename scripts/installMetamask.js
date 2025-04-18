const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

const METAMASK_EXTENSION_PATH = path.join(os.homedir(), '.metamask-extension');
const METAMASK_VERSION = '11.15.0'; // Последняя стабильная версия

async function downloadMetamask() {
    console.log('Скачивание MetaMask...');

    if (!fs.existsSync(METAMASK_EXTENSION_PATH)) {
        fs.mkdirSync(METAMASK_EXTENSION_PATH, { recursive: true });
    }

    const zipPath = path.join(METAMASK_EXTENSION_PATH, 'metamask.zip');
    const file = fs.createWriteStream(zipPath);

    return new Promise((resolve, reject) => {
        https.get(`https://github.com/MetaMask/metamask-extension/releases/download/v${METAMASK_VERSION}/metamask-chrome-${METAMASK_VERSION}.zip`, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('MetaMask скачан');
                resolve(zipPath);
            });
        }).on('error', (err) => {
            fs.unlink(zipPath, () => { });
            reject(err);
        });
    });
}

async function installMetamask() {
    try {
        const zipPath = await downloadMetamask();

        // Распаковываем архив
        console.log('Распаковка MetaMask...');
        if (process.platform === 'darwin') {
            execSync(`unzip -o ${zipPath} -d ${METAMASK_EXTENSION_PATH}`);
        } else if (process.platform === 'win32') {
            execSync(`powershell -Command "Expand-Archive -Force ${zipPath} ${METAMASK_EXTENSION_PATH}"`);
        } else {
            execSync(`unzip -o ${zipPath} -d ${METAMASK_EXTENSION_PATH}`);
        }

        // Удаляем архив
        fs.unlinkSync(zipPath);
        console.log('MetaMask успешно установлен');
    } catch (error) {
        console.error('Ошибка при установке MetaMask:', error);
        process.exit(1);
    }
}

installMetamask(); 