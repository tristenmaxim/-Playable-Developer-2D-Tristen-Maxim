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
        
        // Контейнеры для организации объектов
        this.gameContainer = null;
        this.backgroundContainer = null;
        this.gameplayContainer = null;
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
        
        this.app.stage.addChild(this.gameContainer);
        this.gameContainer.addChild(this.backgroundContainer);
        this.gameContainer.addChild(this.gameplayContainer);
        
        // Инициализируем загрузчик ассетов
        this.assetLoader = new AssetLoader();
        
        // Загружаем ассеты
        await this.loadAssets();
        
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
        
        // Увеличиваем счет
        this.score += CONFIG.GAME.SCORE_PER_SECOND * (delta / 60);
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
