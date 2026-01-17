// Конфигурация игры
const CONFIG = {
    // Размеры экрана
    SCREEN: {
        WIDTH: 375,
        HEIGHT: 667,
        ASPECT_RATIO: 375 / 667
    },
    
    // Настройки PixiJS
    PIXI: {
        BACKGROUND_COLOR: 0x1099bb,
        RESOLUTION: window.devicePixelRatio || 1,
        AUTO_DENSITY: true,
        ANTIALIAS: true
    },
    
    // Физика игрока
    PLAYER: {
        INITIAL_X: 100,
        INITIAL_Y: 500,
        GROUND_Y: 500,
        JUMP_POWER: -15,
        GRAVITY: 0.8,
        MAX_VELOCITY_Y: 20
    },
    
    // Скорости движения
    SPEED: {
        BACKGROUND: 2,
        ENEMY: 5,
        COLLECTIBLE: 5,
        GAME: 1
    },
    
    // Генерация препятствий
    SPAWN: {
        ENEMY_INTERVAL_MIN: 2000,  // мс
        ENEMY_INTERVAL_MAX: 4000,
        COLLECTIBLE_INTERVAL_MIN: 1500,
        COLLECTIBLE_INTERVAL_MAX: 3000,
        DIFFICULTY_INCREASE_RATE: 0.001  // увеличение сложности за мс
    },
    
    // Игровая механика
    GAME: {
        INITIAL_SCORE: 0,
        SCORE_PER_SECOND: 1,
        COLLECTIBLE_SCORE: 10,
        HEALTH: 3
    },
    
    // UI
    UI: {
        SCORE_POSITION: { x: 20, y: 20 },
        HEALTH_POSITION: { x: 20, y: 60 }
    }
};
