// Главный класс игры

class Game {
    constructor() {
        this.app = null;
        this.assetLoader = null;
        this.isRunning = false;
        this.score = 0;
        this.health = CONFIG.GAME.HEALTH;
        
        // Игровые объекты
        this.player = null;
        this.background = null;
        this.enemies = [];
        this.collectibles = [];
        this.collisionSystem = null;
        this.particleSystem = null;
        this.audioManager = null;
        
        // Пул объектов для оптимизации
        this.enemyPool = null;
        this.collectiblePool = null;
        
        // Контейнеры для организации объектов
        this.gameContainer = null;
        this.backgroundContainer = null;
        this.gameplayContainer = null;
        this.uiContainer = null;
        
        // UI
        this.uiManager = null;
        this.endScreen = null;
        
        // Генерация препятствий
        this.lastEnemySpawn = 0;
        this.lastCollectibleSpawn = 0;
        this.difficultyMultiplier = 1;
        this.gameTime = 0;
    }
    
    /**
     * Инициализация игры
     */
    async init() {
        // Создаем PixiJS приложение
        this.app = new PIXI.Application({
            width: CONFIG.SCREEN.WIDTH,
            height: CONFIG.SCREEN.HEIGHT,
            backgroundColor: CONFIG.PIXI.BACKGROUND_COLOR,
            resolution: CONFIG.PIXI.RESOLUTION,
            autoDensity: CONFIG.PIXI.AUTO_DENSITY,
            antialias: CONFIG.PIXI.ANTIALIAS
        });
        
        // Добавляем canvas в контейнер
        const container = document.getElementById('game-container');
        const canvas = this.app.view;
        canvas.id = 'game-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        
        // Создаем контейнеры для организации объектов
        this.gameContainer = new PIXI.Container();
        this.backgroundContainer = new PIXI.Container();
        this.gameplayContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();
        
        this.app.stage.addChild(this.gameContainer);
        this.gameContainer.addChild(this.backgroundContainer);
        this.gameContainer.addChild(this.gameplayContainer);
        this.gameContainer.addChild(this.uiContainer);
        
        // Создаем UI менеджер
        this.uiManager = new UIManager();
        this.uiManager.init();
        this.uiContainer.addChild(this.uiManager);
        
        // Создаем экран окончания игры
        this.endScreen = new EndScreen();
        this.endScreen.setRestartCallback(() => {
            this.start();
        });
        this.uiContainer.addChild(this.endScreen);
        
        // Инициализируем загрузчик ассетов
        this.assetLoader = new AssetLoader();
        
        // Инициализируем аудио менеджер
        this.audioManager = new AudioManager();
        
        // Загружаем ассеты
        await this.loadAssets();
        
        // Загружаем звуки
        await this.loadSounds();
        
        // Создаем систему коллизий
        this.collisionSystem = new CollisionSystem();
        
        // Создаем систему частиц
        this.particleSystem = new ParticleSystem();
        this.gameplayContainer.addChild(this.particleSystem);
        
        // Создаем пулы объектов
        this.enemyPool = new ObjectPool(
            () => new Enemy(),
            (enemy) => {
                enemy.deactivate();
                enemy.visible = false;
            },
            5
        );
        
        this.collectiblePool = new ObjectPool(
            () => new Collectible(),
            (collectible) => {
                collectible.deactivate();
                collectible.isCollected = false;
                collectible.visible = false;
            },
            5
        );
        
        // Создаем игровые объекты
        this.createGameObjects();
        
        // Настраиваем игровой цикл
        this.setupGameLoop();
        
        // Настраиваем управление
        this.setupControls();
        
        // Настраиваем адаптивность
        this.setupResponsive();
        
        // Запускаем игру
        this.start();
        
        // Запускаем музыку
        if (this.audioManager) {
            this.audioManager.playMusic();
        }
        
        console.log('Игра инициализирована');
    }
    
    /**
     * Загрузка ассетов
     */
    async loadAssets() {
        // Загружаем ассеты (пока используем дефолтные спрайты)
        // Позже добавим реальные текстуры из assets/
        await this.assetLoader.load();
    }
    
    /**
     * Загрузка звуков
     * Проверяет сначала встроенные ассеты, затем пытается загрузить из файлов
     */
    async loadSounds() {
        if (!this.audioManager) return;

        try {
            // Маппинг имён звуков
            const soundMapping = {
                'jump': 'jumpSound',
                'collect': 'collectSound',
                'collision': 'collisionSound'
            };

            // Сначала пробуем использовать встроенные ассеты
            for (const [name, alias] of Object.entries(soundMapping)) {
                const embeddedSound = this.assetLoader.loadedAssets[alias];
                if (embeddedSound && embeddedSound instanceof Audio) {
                    this.audioManager.sounds[name] = embeddedSound;
                    console.log(`Звук ${name} загружен из встроенных ассетов`);
                }
            }

            // Музыка
            const embeddedMusic = this.assetLoader.loadedAssets['music'];
            if (embeddedMusic && embeddedMusic instanceof Audio) {
                this.audioManager.musicAudio = embeddedMusic;
                this.audioManager.musicAudio.loop = true;
                console.log('Музыка загружена из встроенных ассетов');
            }
        } catch (e) {
            console.warn('Ошибка загрузки звуков:', e);
        }
    }
    
    /**
     * Создание игровых объектов
     */
    createGameObjects() {
        // Создаем фон
        this.background = new Background();
        const bgTexture1 = this.assetLoader.getTexture('background1');
        const bgTexture2 = this.assetLoader.getTexture('background2');
        const bgTexture3 = this.assetLoader.getTexture('background3');
        this.background.init([bgTexture1, bgTexture2, bgTexture3].filter(Boolean));
        this.backgroundContainer.addChild(this.background);
        
        // Создаем игрока
        this.player = new Player();
        const playerTexture = this.assetLoader.getTexture('player');
        this.player.init(playerTexture);
        this.gameplayContainer.addChild(this.player);
    }
    
    /**
     * Настройка игрового цикла
     */
    setupGameLoop() {
        this.app.ticker.add((delta) => {
            if (!this.isRunning) return;
            
            this.update(delta);
        });
    }
    
    /**
     * Обновление игры
     */
    update(delta) {
        // Увеличиваем игровое время
        this.gameTime += delta;
        
        // Увеличиваем сложность со временем
        this.difficultyMultiplier = 1 + (this.gameTime * CONFIG.SPAWN.DIFFICULTY_INCREASE_RATE);
        
        // Обновляем фон
        if (this.background) {
            this.background.update(delta);
        }
        
        // Обновляем игрока
        if (this.player) {
            this.player.update(delta);
        }
        
        // Обновляем врагов (оптимизация: проверяем только активных)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isActive) {
                this.removeEnemy(enemy);
                continue;
            }
            enemy.update(delta);
        }
        
        // Обновляем собираемые предметы (оптимизация: проверяем только активных)
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (!collectible.isActive) {
                this.removeCollectible(collectible);
                continue;
            }
            collectible.update(delta);
        }
        
        // Обновляем систему частиц
        if (this.particleSystem) {
            this.particleSystem.update(delta);
        }
        
        // Генерация препятствий
        this.spawnObstacles(delta);
        
        // Проверка коллизий
        this.checkCollisions();
        
        // Увеличиваем счет
        this.score += CONFIG.GAME.SCORE_PER_SECOND * (delta / 60);
        
        // Обновляем UI
        if (this.uiManager) {
            this.uiManager.updateScore(this.score);
            this.uiManager.updateHealth(this.health);
        }
    }
    
    /**
     * Генерация препятствий
     */
    spawnObstacles(delta) {
        const currentTime = this.gameTime;
        
        // Генерация врагов
        const enemyInterval = random(
            CONFIG.SPAWN.ENEMY_INTERVAL_MIN / this.difficultyMultiplier,
            CONFIG.SPAWN.ENEMY_INTERVAL_MAX / this.difficultyMultiplier
        );
        
        if (currentTime - this.lastEnemySpawn >= enemyInterval) {
            this.spawnEnemy();
            this.lastEnemySpawn = currentTime;
        }
        
        // Генерация собираемых предметов
        const collectibleInterval = random(
            CONFIG.SPAWN.COLLECTIBLE_INTERVAL_MIN,
            CONFIG.SPAWN.COLLECTIBLE_INTERVAL_MAX
        );
        
        if (currentTime - this.lastCollectibleSpawn >= collectibleInterval) {
            this.spawnCollectible();
            this.lastCollectibleSpawn = currentTime;
        }
    }
    
    /**
     * Создание врага
     */
    spawnEnemy() {
        const y = CONFIG.PLAYER.GROUND_Y;
        const x = CONFIG.SCREEN.WIDTH + 50;
        this.addEnemy(x, y);
    }
    
    /**
     * Создание собираемого предмета
     */
    spawnCollectible() {
        const y = CONFIG.PLAYER.GROUND_Y - randomInt(50, 150);
        const x = CONFIG.SCREEN.WIDTH + 50;
        this.addCollectible(x, y);
    }
    
    /**
     * Проверка коллизий (оптимизация: проверяем только видимые объекты)
     */
    checkCollisions() {
        if (!this.player || !this.collisionSystem) return;
        
        // Фильтруем только активных и видимых врагов
        const activeEnemies = this.enemies.filter(e => e.isActive && e.visible);
        
        // Проверка коллизии игрока с врагами
        const enemyCollisions = this.collisionSystem.checkPlayerEnemyCollision(this.player, activeEnemies);
        enemyCollisions.forEach(enemy => {
            this.handleEnemyCollision(enemy);
        });
        
        // Фильтруем только активные и не собранные предметы
        const activeCollectibles = this.collectibles.filter(c => c.isActive && !c.isCollected && c.visible);
        
        // Проверка коллизии игрока с собираемыми предметами
        const collectibleCollisions = this.collisionSystem.checkPlayerCollectibleCollision(this.player, activeCollectibles);
        collectibleCollisions.forEach(collectible => {
            this.handleCollectibleCollision(collectible);
        });
    }
    
    /**
     * Обработка столкновения с врагом
     */
    handleEnemyCollision(enemy) {
        if (!enemy.isActive) return;
        
        // Эффект тряски экрана
        this.shakeScreen();
        
        // Эффект вспышки
        this.flashEffect();
        
        // Воспроизводим звук столкновения
        if (this.audioManager) {
            this.audioManager.playSound('collision', 0.8);
        }
        
        // Уменьшаем здоровье
        this.health--;
        
        // Удаляем врага
        this.removeEnemy(enemy);
        
        console.log(`Столкновение! Здоровье: ${this.health}`);
        
        // Проверка окончания игры
        if (this.health <= 0) {
            this.gameOver();
        }
    }
    
    /**
     * Обработка сбора предмета
     */
    handleCollectibleCollision(collectible) {
        if (collectible.isCollected) return;
        
        // Собираем предмет
        if (collectible.collect()) {
            // Эффект частиц при сборе
            if (this.particleSystem) {
                this.particleSystem.burst(collectible.x, collectible.y, 15, 0xFFD700);
            }
            
            // Воспроизводим звук сбора
            if (this.audioManager) {
                this.audioManager.playSound('collect', 0.7);
            }
            
            // Увеличиваем счет
            this.score += CONFIG.GAME.COLLECTIBLE_SCORE;
            
            // Анимация UI
            if (this.uiManager) {
                this.uiManager.animateScore();
            }
            
            // Удаляем предмет
            this.removeCollectible(collectible);
            
            console.log(`Предмет собран! Счет: ${this.score}`);
        }
    }
    
    /**
     * Эффект тряски экрана
     */
    shakeScreen() {
        if (!this.gameContainer) return;
        
        const originalX = this.gameContainer.x;
        const originalY = this.gameContainer.y;
        const intensity = 10;
        const duration = 200;
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const offsetX = (Math.random() - 0.5) * intensity * (1 - elapsed / duration);
                const offsetY = (Math.random() - 0.5) * intensity * (1 - elapsed / duration);
                this.gameContainer.x = originalX + offsetX;
                this.gameContainer.y = originalY + offsetY;
                requestAnimationFrame(shake);
            } else {
                this.gameContainer.x = originalX;
                this.gameContainer.y = originalY;
            }
        };
        shake();
    }
    
    /**
     * Эффект вспышки
     */
    flashEffect() {
        if (!this.app) return;
        
        // Создаем временный overlay для вспышки
        const flash = new PIXI.Graphics();
        flash.beginFill(0xFFFFFF, 0.5);
        flash.drawRect(0, 0, CONFIG.SCREEN.WIDTH, CONFIG.SCREEN.HEIGHT);
        flash.endFill();
        flash.alpha = 0;
        this.uiContainer.addChild(flash);
        
        // Анимация вспышки
        const fadeOut = () => {
            if (flash.alpha > 0) {
                flash.alpha -= 0.2;
                requestAnimationFrame(fadeOut);
            } else {
                this.uiContainer.removeChild(flash);
                flash.destroy();
            }
        };
        
        flash.alpha = 0.5;
        fadeOut();
    }
    
    /**
     * Окончание игры
     */
    gameOver() {
        this.isRunning = false;
        const finalScore = Math.floor(this.score);
        console.log(`Игра окончена! Финальный счет: ${finalScore}`);
        
        // Сохраняем лучший результат
        const bestScore = this.saveBestScore();
        
        // Показываем экран окончания
        if (this.endScreen) {
            const isWin = this.health > 0; // Пока просто проверяем здоровье
            this.endScreen.show(isWin, finalScore, bestScore);
        }
    }
    
    /**
     * Сохранение лучшего результата
     */
    saveBestScore() {
        try {
            const bestScore = parseInt(localStorage.getItem('runner_best_score') || '0', 10);
            const currentScore = Math.floor(this.score);
            
            if (currentScore > bestScore) {
                localStorage.setItem('runner_best_score', currentScore);
                console.log(`Новый рекорд: ${currentScore}`);
                return currentScore;
            }
            return bestScore;
        } catch (e) {
            console.warn('Не удалось сохранить результат:', e);
            return 0;
        }
    }
    
    /**
     * Получить лучший результат
     */
    getBestScore() {
        try {
            return parseInt(localStorage.getItem('runner_best_score') || '0', 10);
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * Настройка управления
     */
    setupControls() {
        // Обработка клика/тапа
        this.app.view.addEventListener('click', () => {
            this.handleJump();
        });
        
        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                this.handleJump();
            }
        });
    }
    
    /**
     * Обработка прыжка
     */
    handleJump() {
        if (!this.isRunning || !this.player) return;
        this.player.jump();
        
        // Воспроизводим звук прыжка
        if (this.audioManager) {
            this.audioManager.playSound('jump', 0.5);
        }
    }
    
    /**
     * Добавление врага (с использованием пула)
     */
    addEnemy(x, y) {
        const enemy = this.enemyPool.get();
        enemy.activate(x, y);
        this.enemies.push(enemy);
        if (!this.gameplayContainer.children.includes(enemy)) {
            this.gameplayContainer.addChild(enemy);
        }
        return enemy;
    }
    
    /**
     * Удаление врага (возврат в пул)
     */
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.gameplayContainer.removeChild(enemy);
            this.enemyPool.release(enemy);
        }
    }
    
    /**
     * Добавление собираемого предмета (с использованием пула)
     */
    addCollectible(x, y) {
        const collectible = this.collectiblePool.get();
        collectible.activate(x, y);
        this.collectibles.push(collectible);
        if (!this.gameplayContainer.children.includes(collectible)) {
            this.gameplayContainer.addChild(collectible);
        }
        return collectible;
    }
    
    /**
     * Удаление собираемого предмета (возврат в пул)
     */
    removeCollectible(collectible) {
        const index = this.collectibles.indexOf(collectible);
        if (index > -1) {
            this.collectibles.splice(index, 1);
            this.gameplayContainer.removeChild(collectible);
            this.collectiblePool.release(collectible);
        }
    }
    
    /**
     * Запуск игры
     */
    start() {
        this.isRunning = true;
        this.score = CONFIG.GAME.INITIAL_SCORE;
        this.health = CONFIG.GAME.HEALTH;
        this.gameTime = 0;
        this.lastEnemySpawn = 0;
        this.lastCollectibleSpawn = 0;
        this.difficultyMultiplier = 1;
        
        // Сброс игрока
        if (this.player) {
            this.player.reset();
        }
        
        // Очистка препятствий (возврат в пулы)
        const enemiesCopy = [...this.enemies];
        enemiesCopy.forEach(enemy => this.removeEnemy(enemy));
        const collectiblesCopy = [...this.collectibles];
        collectiblesCopy.forEach(collectible => this.removeCollectible(collectible));
        
        // Скрываем экран окончания
        if (this.endScreen) {
            this.endScreen.hide();
        }
        
        // Перезапускаем музыку
        if (this.audioManager) {
            this.audioManager.stopMusic();
            this.audioManager.playMusic();
        }
        
        console.log('Игра запущена');
    }
    
    /**
     * Пауза игры
     */
    pause() {
        this.isRunning = false;
        if (this.audioManager) {
            this.audioManager.pauseMusic();
        }
    }
    
    /**
     * Возобновление игры
     */
    resume() {
        this.isRunning = true;
        if (this.audioManager) {
            this.audioManager.resumeMusic();
        }
    }
    
    /**
     * Остановка игры
     */
    stop() {
        this.isRunning = false;
        this.app.ticker.stop();
    }
    
    /**
     * Уничтожение игры
     */
    destroy() {
        this.stop();
        
        // Очищаем пулы
        if (this.enemyPool) {
            this.enemyPool.clear();
        }
        if (this.collectiblePool) {
            this.collectiblePool.clear();
        }
        
        // Останавливаем музыку
        if (this.audioManager) {
            this.audioManager.stopMusic();
        }
        
        if (this.app) {
            this.app.destroy(true);
        }
    }
    
    /**
     * Настройка адаптивности
     */
    setupResponsive() {
        const resize = () => {
            const container = document.getElementById('game-container');
            if (!container || !this.app) return;
            
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Вычисляем масштаб
            const scaleX = containerWidth / CONFIG.SCREEN.WIDTH;
            const scaleY = containerHeight / CONFIG.SCREEN.HEIGHT;
            const scale = Math.min(scaleX, scaleY, 1);
            
            // Применяем масштаб
            this.app.renderer.resize(CONFIG.SCREEN.WIDTH, CONFIG.SCREEN.HEIGHT);
            this.app.view.style.width = (CONFIG.SCREEN.WIDTH * scale) + 'px';
            this.app.view.style.height = (CONFIG.SCREEN.HEIGHT * scale) + 'px';
        };
        
        window.addEventListener('resize', resize);
        resize();
    }
}
