// Отображение счета

class ScoreDisplay extends PIXI.Container {
    constructor() {
        super();
        
        this.score = 0;
        
        // Создаем текстовый элемент
        this.text = new PIXI.Text('0', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 4
        });
        
        this.text.anchor.set(0, 0);
        this.addChild(this.text);
        
        // Позиционирование
        this.x = CONFIG.UI.SCORE_POSITION.x;
        this.y = CONFIG.UI.SCORE_POSITION.y;
    }
    
    /**
     * Обновление счета
     */
    updateScore(score) {
        this.score = Math.floor(score);
        this.text.text = formatNumber(this.score);
    }
    
    /**
     * Анимация обновления
     */
    animate() {
        // Пульсация при обновлении
        const originalScale = this.scale.x;
        this.scale.set(originalScale * 1.2);
        
        setTimeout(() => {
            this.scale.set(originalScale);
        }, 150);
    }
}
