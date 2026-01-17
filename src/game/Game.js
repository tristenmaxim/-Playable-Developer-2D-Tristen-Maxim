// Главный класс игры

class Game {
    constructor() {
        this.app = null;
        this.assetLoader = null;
        this.isRunning = false;
        this.score = 0;
        this.health = CONFIG.GAME.HEALTH;
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
        
        // Инициализируем загрузчик ассетов
        this.assetLoader = new AssetLoader();
        
        // Загружаем ассеты (пока пусто, добавим позже)
        await this.loadAssets();
        
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
        // Пока ассетов нет, просто создаем пустую загрузку
        // Позже добавим реальные ассеты
        await this.assetLoader.load();
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
        // Здесь будет логика обновления игры
        // Пока просто увеличиваем счет
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
        if (!this.isRunning) return;
        console.log('Прыжок!');
        // Логика прыжка будет добавлена позже
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
