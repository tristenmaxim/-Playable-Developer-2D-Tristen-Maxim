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
        
        // Загружаем ассеты
        await this.loadAssets();
        
        // Создаем систему коллизий
        this.collisionSystem = new CollisionSystem();
        
        // Создаем игровые объекты
        this.createGameObjects();
        
        // Настраиваем игровой цикл
        this.setupGameLoop();
        
        // Настраиваем управление
        this.setupControls();
        
        // Запускаем игру
        this.start();
        
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
        
        // Обновляем врагов
        this.enemies.forEach(enemy => {
            enemy.update(delta);
            if (!enemy.isActive) {
                this.removeEnemy(enemy);
            }
        });
        
        // Обновляем собираемые предметы
        this.collectibles.forEach(collectible => {
            collectible.update(delta);
            if (!collectible.isActive) {
                this.removeCollectible(collectible);
            }
        });
        
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
     * Проверка коллизий
     */
    checkCollisions() {
        if (!this.player || !this.collisionSystem) return;
        
        // Проверка коллизии игрока с врагами
        const enemyCollisions = this.collisionSystem.checkPlayerEnemyCollision(this.player, this.enemies);
        enemyCollisions.forEach(enemy => {
            this.handleEnemyCollision(enemy);
        });
        
        // Проверка коллизии игрока с собираемыми предметами
        const collectibleCollisions = this.collisionSystem.checkPlayerCollectibleCollision(this.player, this.collectibles);
        collectibleCollisions.forEach(collectible => {
            this.handleCollectibleCollision(collectible);
        });
    }
    
    /**
     * Обработка столкновения с врагом
     */
    handleEnemyCollision(enemy) {
        if (!enemy.isActive) return;
        
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
    }
    
    /**
     * Добавление врага
     */
    addEnemy(x, y) {
        const enemy = new Enemy();
        enemy.activate(x, y);
        this.enemies.push(enemy);
        this.gameplayContainer.addChild(enemy);
        return enemy;
    }
    
    /**
     * Удаление врага
     */
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.gameplayContainer.removeChild(enemy);
            enemy.destroy();
        }
    }
    
    /**
     * Добавление собираемого предмета
     */
    addCollectible(x, y) {
        const collectible = new Collectible();
        collectible.activate(x, y);
        this.collectibles.push(collectible);
        this.gameplayContainer.addChild(collectible);
        return collectible;
    }
    
    /**
     * Удаление собираемого предмета
     */
    removeCollectible(collectible) {
        const index = this.collectibles.indexOf(collectible);
        if (index > -1) {
            this.collectibles.splice(index, 1);
            this.gameplayContainer.removeChild(collectible);
            collectible.destroy();
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
        
        // Очистка препятствий
        this.enemies.forEach(enemy => this.removeEnemy(enemy));
        this.collectibles.forEach(collectible => this.removeCollectible(collectible));
        
        // Скрываем экран окончания
        if (this.endScreen) {
            this.endScreen.hide();
        }
        
        console.log('Игра запущена');
    }
    
    /**
     * Пауза игры
     */
    pause() {
        this.isRunning = false;
    }
    
    /**
     * Возобновление игры
     */
    resume() {
        this.isRunning = true;
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
        if (this.app) {
            this.app.destroy(true);
        }
    }
}
