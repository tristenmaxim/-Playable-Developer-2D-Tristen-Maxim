#!/usr/bin/env node
/**
 * Скрипт сборки игры в единый HTML файл
 * Объединяет все JS файлы, конвертирует ассеты в data URI и создает финальный HTML
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const CONFIG = {
    srcDir: path.join(__dirname, '..', 'src'),
    assetsDir: path.join(__dirname, '..', 'assets'),
    outputFile: path.join(__dirname, '..', 'game.html'),
    templateFile: path.join(__dirname, '..', 'index.html')
};

/**
 * Чтение файла
 */
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        console.error(`Ошибка чтения файла ${filePath}:`, e.message);
        return null;
    }
}

/**
 * Запись файла
 */
function writeFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Создан файл: ${filePath}`);
    } catch (e) {
        console.error(`Ошибка записи файла ${filePath}:`, e.message);
    }
}

/**
 * Конвертация файла в base64 data URI
 */
function fileToDataURI(filePath, mimeType) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        return `data:${mimeType};base64,${base64}`;
    } catch (e) {
        console.error(`Ошибка конвертации ${filePath}:`, e.message);
        return null;
    }
}

/**
 * Определение MIME типа по расширению
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Рекурсивное чтение всех JS файлов из директории
 */
function getAllJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllJSFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

/**
 * Объединение всех JS файлов в правильном порядке
 */
function bundleJavaScript() {
    const jsFiles = [
        // Конфигурация и утилиты
        path.join(CONFIG.srcDir, 'config.js'),
        path.join(CONFIG.srcDir, 'utils', 'helpers.js'),
        path.join(CONFIG.srcDir, 'utils', 'ObjectPool.js'),
        path.join(CONFIG.srcDir, 'utils', 'AssetLoader.js'),
        
        // Аудио
        path.join(CONFIG.srcDir, 'audio', 'sounds.js'),
        path.join(CONFIG.srcDir, 'audio', 'AudioManager.js'),
        
        // UI
        path.join(CONFIG.srcDir, 'ui', 'ScoreDisplay.js'),
        path.join(CONFIG.srcDir, 'ui', 'HealthBar.js'),
        path.join(CONFIG.srcDir, 'ui', 'UIManager.js'),
        path.join(CONFIG.srcDir, 'ui', 'EndScreen.js'),
        
        // Игровые классы
        path.join(CONFIG.srcDir, 'game', 'Player.js'),
        path.join(CONFIG.srcDir, 'game', 'Background.js'),
        path.join(CONFIG.srcDir, 'game', 'Enemy.js'),
        path.join(CONFIG.srcDir, 'game', 'Collectible.js'),
        path.join(CONFIG.srcDir, 'game', 'CollisionSystem.js'),
        path.join(CONFIG.srcDir, 'game', 'ParticleSystem.js'),
        path.join(CONFIG.srcDir, 'game', 'Game.js')
    ];
    
    let bundledJS = '';
    
    jsFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const content = readFile(filePath);
            if (content) {
                bundledJS += `\n// === ${path.relative(CONFIG.srcDir, filePath)} ===\n`;
                bundledJS += content;
                bundledJS += '\n';
            }
        }
    });
    
    return bundledJS;
}

/**
 * Рекурсивное получение всех файлов из директории
 */
function getAllFiles(dir, extensions = []) {
    let fileList = [];
    
    if (!fs.existsSync(dir)) {
        return fileList;
    }
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            fileList = fileList.concat(getAllFiles(filePath, extensions));
        } else {
            const ext = path.extname(file).toLowerCase();
            if (extensions.length === 0 || extensions.includes(ext)) {
                fileList.push(filePath);
            }
        }
    });
    
    return fileList;
}

/**
 * Создание карты ассетов с data URI
 */
function createAssetsMap() {
    console.log('Конвертирую ассеты в data URI...');
    
    const assetsMap = {};
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const audioExtensions = ['.mp3', '.wav', '.ogg'];
    const fontExtensions = ['.ttf', '.woff', '.woff2', '.otf'];
    
    // Изображения
    const imageFiles = getAllFiles(path.join(CONFIG.assetsDir, 'images'), imageExtensions);
    imageFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        const mimeType = getMimeType(filePath);
        const dataURI = fileToDataURI(filePath, mimeType);
        if (dataURI) {
            assetsMap[fileName] = dataURI;
            console.log(`  ✓ ${fileName}`);
        }
    });
    
    // Аудио
    const audioFiles = getAllFiles(path.join(CONFIG.assetsDir, 'audio'), audioExtensions);
    audioFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        const mimeType = getMimeType(filePath);
        const dataURI = fileToDataURI(filePath, mimeType);
        if (dataURI) {
            assetsMap[fileName] = dataURI;
            console.log(`  ✓ ${fileName}`);
        }
    });
    
    // Шрифты
    const fontFiles = getAllFiles(path.join(CONFIG.assetsDir, 'fonts'), fontExtensions);
    fontFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        const mimeType = getMimeType(filePath);
        const dataURI = fileToDataURI(filePath, mimeType);
        if (dataURI) {
            assetsMap[fileName] = dataURI;
            console.log(`  ✓ ${fileName}`);
        }
    });
    
    return assetsMap;
}

/**
 * Инжекция ассетов в JavaScript код
 */
function injectAssets(assetsMap) {
    // Создаем объект с data URI ассетами
    let assetsCode = '\n// === Встроенные ассеты ===\n';
    assetsCode += 'const EMBEDDED_ASSETS = {\n';
    
    Object.keys(assetsMap).forEach((key, index, array) => {
        const isLast = index === array.length - 1;
        // Экранируем специальные символы в data URI для безопасной вставки в JavaScript строку
        const escapedDataURI = assetsMap[key]
            .replace(/\\/g, '\\\\')  // Экранируем обратные слеши
            .replace(/"/g, '\\"')     // Экранируем двойные кавычки
            .replace(/'/g, "\\'")     // Экранируем одинарные кавычки
            .replace(/\n/g, '\\n')    // Экранируем переносы строк
            .replace(/\r/g, '\\r')   // Экранируем возврат каретки
            .replace(/\t/g, '\\t');   // Экранируем табуляции
        assetsCode += `  "${key}": "${escapedDataURI}"${isLast ? '' : ','}\n`;
    });
    
    assetsCode += '};\n\n';
    
    // Модифицируем AssetLoader для использования встроенных ассетов
    const assetLoaderPatch = `
// Патч для AssetLoader - использование встроенных ассетов
(function() {
    if (typeof EMBEDDED_ASSETS === 'undefined') {
        console.warn('EMBEDDED_ASSETS не найдены, используется стандартная загрузка');
        return;
    }
    
    if (typeof AssetLoader === 'undefined') {
        console.warn('AssetLoader класс не найден, патч не будет применен.');
        return;
    }
    
    // Переопределяем метод load
    AssetLoader.prototype.load = async function() {
        console.log('Загрузка встроенных ассетов...');
        
        // Маппинг имен файлов на алиасы
        const assetMapping = {
            'player-spritesheet.png': 'player',
            'player-large.png': 'playerLarge',
            'background-layer1.webp': 'background1',
            'background-layer2.webp': 'background2',
            'background-layer3.webp': 'background3',
            'enemy-spritesheet.png': 'enemy',
            'collectible-spritesheet.png': 'collectible',
            'particle.png': 'particle',
            'jump.mp3': 'jumpSound',
            'collect.mp3': 'collectSound',
            'collision.mp3': 'collisionSound',
            'music.mp3': 'music'
        };
        
        // Загружаем все ассеты
        Object.keys(assetMapping).forEach(fileName => {
            const alias = assetMapping[fileName];
            const dataURI = EMBEDDED_ASSETS[fileName];
            
            if (!dataURI) {
                console.warn(\`Ассет \${fileName} не найден в EMBEDDED_ASSETS\`);
                return;
            }
            
            const mimeMatch = dataURI.match(/data:([^;]+);/);
            if (!mimeMatch) {
                console.warn(\`Неверный формат data URI для \${fileName}\`);
                return;
            }
            
            const mimeType = mimeMatch[1];
            
            if (mimeType.startsWith('image/')) {
                // Создаем текстуру из data URI используя BaseTexture для надежности
                try {
                    const baseTexture = PIXI.BaseTexture.from(dataURI);
                    const texture = new PIXI.Texture(baseTexture);
                    // Сохраняем как объект с полем texture для совместимости с getTexture()
                    this.loadedAssets[alias] = { texture: texture };
                    console.log(\`✓ Загружена текстура: \${alias}\`);
                } catch (error) {
                    console.error(\`✗ Ошибка загрузки текстуры \${alias}:\`, error);
                    // Создаем пустую текстуру как fallback
                    this.loadedAssets[alias] = { texture: PIXI.Texture.EMPTY };
                }
            } else if (mimeType.startsWith('audio/')) {
                // Для аудио создаем Audio объект
                try {
                    const audio = new Audio(dataURI);
                    // Предзагружаем аудио
                    audio.preload = 'auto';
                    this.loadedAssets[alias] = audio;
                    console.log(\`✓ Загружен звук: \${alias}\`);
                } catch (error) {
                    console.error(\`✗ Ошибка загрузки звука \${alias}:\`, error);
                }
            }
        });
        
        console.log('Все встроенные ассеты загружены');
        
        // Скрываем экран загрузки
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Обновляем прогресс
        this.loadProgress = 100;
        
        return this.loadedAssets;
    };
})();
`;
    
    return assetsCode + assetLoaderPatch;
}

/**
 * Создание финального HTML
 */
async function buildHTML() {
    console.log('Начинаю сборку...\n');
    
    // Читаем шаблон
    const template = readFile(CONFIG.templateFile);
    if (!template) {
        console.error('Не удалось прочитать шаблон!');
        process.exit(1);
    }
    
    // Объединяем JavaScript
    console.log('Объединяю JavaScript файлы...');
    let bundledJS = bundleJavaScript();
    
    // Создаем карту ассетов
    const assetsMap = createAssetsMap();
    
    // Инжектируем ассеты в JavaScript (ПОСЛЕ всего кода, чтобы патч выполнялся после определения AssetLoader)
    if (Object.keys(assetsMap).length > 0) {
        console.log('\nВстраиваю ассеты в код...');
        const assetsCode = injectAssets(assetsMap); // Получаем патч
        // Добавляем патч в конец bundledJS (после определения AssetLoader)
        bundledJS = bundledJS + '\n' + assetsCode;
    }
    
    // Создаем финальный HTML
    let finalHTML = template;
    
    // Извлекаем URL PixiJS перед удалением script тегов
    const pixiMatch = template.match(/<script[^>]*src=["']([^"']*pixi[^"']*)["'][^>]*><\/script>/i);
    let pixiScript = '';
    
    if (pixiMatch) {
        const pixiUrl = pixiMatch[1];
        console.log(`Найден PixiJS: ${pixiUrl}`);
        // Загружаем PixiJS и встраиваем его
        try {
            const https = require('https');
            const http = require('http');
            const url = require('url');
            
            const pixiContent = await new Promise((resolve, reject) => {
                const parsedUrl = url.parse(pixiUrl);
                const client = parsedUrl.protocol === 'https:' ? https : http;
                
                client.get(pixiUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => resolve(data));
                }).on('error', reject);
            });
            
            pixiScript = `<script>\n${pixiContent}\n</script>`;
            console.log('PixiJS встроен в файл');
        } catch (error) {
            console.warn(`Не удалось встроить PixiJS, оставляем ссылку: ${error.message}`);
            pixiScript = `<script src="${pixiMatch[0].match(/src=["']([^"']+)["']/)[1]}"></script>`;
        }
    } else {
        console.warn('PixiJS не найден в шаблоне!');
    }
    
    // Удаляем все script теги с src
    finalHTML = finalHTML.replace(/<script[^>]*src=["'][^"']+["'][^>]*><\/script>/g, '');
    
    // Удаляем все script теги с type="module"
    finalHTML = finalHTML.replace(/<script[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/g, '');
    
    // Удаляем ссылки на внешние ресурсы из head (если есть)
    finalHTML = finalHTML.replace(/<link[^>]*href=["'][^"']+["'][^>]*>/g, '');
    
    // Извлекаем код инициализации игры из шаблона (если есть)
    const initCodeMatch = template.match(/<script>[\s\S]*?window\.addEventListener\(['"]DOMContentLoaded['"][\s\S]*?<\/script>/);
    let initCode = '';
    if (initCodeMatch) {
        initCode = initCodeMatch[0];
        // Удаляем код инициализации из шаблона (он будет добавлен в конце)
        finalHTML = finalHTML.replace(initCodeMatch[0], '');
    }
    
    // Добавляем PixiJS, объединенный JavaScript и код инициализации перед закрывающим тегом body
    const scriptTag = `${pixiScript}\n<script>\n${bundledJS}\n</script>${initCode ? '\n' + initCode : ''}`;
    finalHTML = finalHTML.replace('</body>', `${scriptTag}\n</body>`);
    
    // Сохраняем результат
    writeFile(CONFIG.outputFile, finalHTML);
    
    // Проверяем размер
    const stats = fs.statSync(CONFIG.outputFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`\n✓ Размер файла: ${sizeMB} MB`);
    
    if (stats.size > 5 * 1024 * 1024) {
        console.warn('⚠️  ВНИМАНИЕ: Размер файла превышает 5 MB!');
        console.warn('   Необходима дополнительная оптимизация ассетов.');
    } else {
        console.log('✓ Размер файла в пределах лимита (5 MB)');
    }
    
    console.log('\n✓ Сборка завершена!');
    console.log(`✓ Файл сохранен: ${CONFIG.outputFile}`);
}

// Запуск сборки
if (require.main === module) {
    buildHTML().catch(error => {
        console.error('Ошибка сборки:', error);
        process.exit(1);
    });
}

module.exports = { buildHTML };
