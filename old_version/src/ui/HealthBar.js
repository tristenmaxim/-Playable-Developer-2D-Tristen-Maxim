// Полоса здоровья

class HealthBar extends PIXI.Container {
    constructor() {
        super();
        
        this.maxHealth = CONFIG.GAME.HEALTH;
        this.currentHealth = this.maxHealth;
        
        // Фон полосы
        this.bg = new PIXI.Graphics();
        this.bg.beginFill(0x333333);
        this.bg.drawRoundedRect(0, 0, 200, 20, 5);
        this.bg.endFill();
        this.addChild(this.bg);
        
        // Полоса здоровья
        this.bar = new PIXI.Graphics();
        this.addChild(this.bar);
        
        // Текст здоровья
        this.text = new PIXI.Text(`HP: ${this.currentHealth}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        this.text.x = 10;
        this.text.y = 25;
        this.addChild(this.text);
        
        // Позиционирование
        this.x = CONFIG.UI.HEALTH_POSITION.x;
        this.y = CONFIG.UI.HEALTH_POSITION.y;
        
        this.update();
    }
    
    /**
     * Обновление отображения
     */
    update() {
        // Очищаем предыдущую полосу
        this.bar.clear();
        
        // Вычисляем процент здоровья
        const percent = this.currentHealth / this.maxHealth;
        
        // Цвет в зависимости от здоровья
        let color = 0x00FF00; // Зеленый
        if (percent < 0.5) {
            color = 0xFFAA00; // Оранжевый
        }
        if (percent < 0.25) {
            color = 0xFF0000; // Красный
        }
        
        // Рисуем полосу здоровья
        this.bar.beginFill(color);
        this.bar.drawRoundedRect(2, 2, (200 - 4) * percent, 16, 3);
        this.bar.endFill();
        
        // Обновляем текст
        this.text.text = `HP: ${this.currentHealth}/${this.maxHealth}`;
    }
    
    /**
     * Установка здоровья
     */
    setHealth(health) {
        this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
        this.update();
        
        // Анимация при изменении
        if (health < this.maxHealth) {
            this.animateDamage();
        }
    }
    
    /**
     * Анимация урона
     */
    animateDamage() {
        const originalTint = this.bar.tint;
        this.bar.tint = 0xFF0000;
        
        setTimeout(() => {
            this.bar.tint = originalTint;
        }, 200);
    }
}
