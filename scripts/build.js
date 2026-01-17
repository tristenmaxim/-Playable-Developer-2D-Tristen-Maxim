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
function injectAssets(jsCode, assetsMap) {
    // Создаем объект с data URI ассетами
    let assetsCode = '\n// === Встроенные ассеты ===\n';
    assetsCode += 'const EMBEDDED_ASSETS = {\n';
    
    Object.keys(assetsMap).forEach((key, index, array) => {
        const isLast = index === array.length - 1;
        assetsCode += `  "${key}": "${assetsMap[key]}"${isLast ? '' : ','}\n`;
    });
    
    assetsCode += '};\n\n';
    
    // Модифицируем AssetLoader для использования встроенных ассетов
    const assetLoaderPatch = `
// Патч для AssetLoader - использование встроенных ассетов
(function() {
    if (typeof EMBEDDED_ASSETS === 'undefined') {
        return; // Встроенные ассеты не найдены
    }
    
    // Сохраняем оригинальный метод load
    const originalLoad = AssetLoader.prototype.load;
    
    // Переопределяем метод load
    AssetLoader.prototype.load = async function() {
        // Создаем текстуры из data URI для изображений
        const imageAssets = {};
        const audioAssets = {};
        
        Object.keys(EMBEDDED_ASSETS).forEach(name => {
            const dataURI = EMBEDDED_ASSETS[name];
            const mimeMatch = dataURI.match(/data:([^;]+);/);
            if (!mimeMatch) return;
            
            const mimeType = mimeMatch[1];
            
            if (mimeType.startsWith('image/')) {
                // Создаем текстуру из data URI
                const texture = PIXI.Texture.from(dataURI);
                imageAssets[name] = texture;
            } else if (mimeType.startsWith('audio/')) {
                // Для аудио создаем Audio объект
                const audio = new Audio(dataURI);
                audioAssets[name] = audio;
            }
        });
        
        // Маппинг имен файлов на алиасы из CONFIG
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
        
        // Заполняем loadedAssets
        Object.keys(assetMapping).forEach(fileName => {
            const alias = assetMapping[fileName];
            if (imageAssets[fileName]) {
                this.loadedAssets[alias] = imageAssets[fileName];
            } else if (audioAssets[fileName]) {
                this.loadedAssets[alias] = audioAssets[fileName];
            }
        });
        
        // Вызываем оригинальный load для совместимости (если нужно)
        if (originalLoad) {
            try {
                await originalLoad.call(this);
            } catch (e) {
                // Игнорируем ошибки, так как ассеты уже загружены
            }
        }
        
        // Скрываем экран загрузки
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        return this.loadedAssets;
    };
})();
`;
    
    return assetsCode + assetLoaderPatch + jsCode;
}

/**
 * Создание финального HTML
 */
function buildHTML() {
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
    
    // Инжектируем ассеты в JavaScript
    if (Object.keys(assetsMap).length > 0) {
        console.log('\nВстраиваю ассеты в код...');
        bundledJS = injectAssets(bundledJS, assetsMap);
    }
    
    // Создаем финальный HTML
    let finalHTML = template;
    
    // Удаляем все script теги с src
    finalHTML = finalHTML.replace(/<script[^>]*src=["'][^"']+["'][^>]*><\/script>/g, '');
    
    // Удаляем все script теги с type="module"
    finalHTML = finalHTML.replace(/<script[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/g, '');
    
    // Удаляем ссылки на внешние ресурсы из head (если есть)
    finalHTML = finalHTML.replace(/<link[^>]*href=["'][^"']+["'][^>]*>/g, '');
    
    // Добавляем объединенный JavaScript перед закрывающим тегом body
    const scriptTag = `<script>\n${bundledJS}\n</script>`;
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
    buildHTML();
}

module.exports = { buildHTML };
