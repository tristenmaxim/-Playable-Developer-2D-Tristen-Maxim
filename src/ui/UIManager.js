// Менеджер UI

class UIManager extends PIXI.Container {
    constructor() {
        super();
        
        this.scoreDisplay = null;
        this.healthBar = null;
        
        // Контейнер для UI элементов
        this.uiContainer = new PIXI.Container();
        this.addChild(this.uiContainer);
    }
    
    /**
     * Инициализация UI
     */
    init() {
        // Создаем отображение счета
        this.scoreDisplay = new ScoreDisplay();
        this.uiContainer.addChild(this.scoreDisplay);
        
        // Создаем полосу здоровья
        this.healthBar = new HealthBar();
        this.uiContainer.addChild(this.healthBar);
    }
    
    /**
     * Обновление счета
     */
    updateScore(score) {
        if (this.scoreDisplay) {
            this.scoreDisplay.updateScore(score);
        }
    }
    
    /**
     * Обновление здоровья
     */
    updateHealth(health) {
        if (this.healthBar) {
            this.healthBar.setHealth(health);
        }
    }
    
    /**
     * Анимация счета
     */
    animateScore() {
        if (this.scoreDisplay) {
            this.scoreDisplay.animate();
        }
    }
}
