// Класс врага

class Enemy extends PIXI.Sprite {
    constructor(texture) {
        // Создаем дефолтную текстуру ДО вызова super()
        const defaultTexture = texture || Enemy.createDefaultTexture();
        super(defaultTexture);
        
        this.speed = CONFIG.SPEED.ENEMY;
        this.isActive = true;
        
        // Устанавливаем начальную позицию (справа за экраном)
        this.x = CONFIG.SCREEN.WIDTH + 100;
        this.y = CONFIG.PLAYER.GROUND_Y;
        
        // Якорь снизу по центру
        this.anchor.set(0.5, 1);
    }
    
    /**
     * Создание дефолтной текстуры (красный прямоугольник)
     * Статический метод, чтобы можно было вызвать до super()
     * В PixiJS v7 используем Canvas API напрямую
     */
    static createDefaultTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // Рисуем красный прямоугольник
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 40, 60);
        
        // Создаем текстуру из canvas
        return PIXI.Texture.from(canvas);
    }
    
    /**
     * Обновление позиции
     */
    update(delta) {
        if (!this.isActive) return;
        
        // Движение справа налево
        // В PixiJS v7 delta обычно около 1 (60 FPS), конвертируем в пиксели за кадр
        // speed = 5 пикселей за кадр при 60 FPS
        this.x -= this.speed * delta;
        
        // Удаление при выходе за экран (используем getBounds() для получения размера)
        const bounds = this.getBounds();
        if (bounds.x + bounds.width < 0) {
            this.isActive = false;
        }
    }
    
    /**
     * Получить границы для коллизий
     */
    getBounds() {
        // Используем встроенный метод getBounds() от Sprite, чтобы избежать рекурсии
        const spriteBounds = super.getBounds();
        return {
            x: spriteBounds.x,
            y: spriteBounds.y,
            width: spriteBounds.width,
            height: spriteBounds.height
        };
    }
    
    /**
     * Активация врага
     */
    activate(x, y) {
        this.x = x || CONFIG.SCREEN.WIDTH + 100;
        this.y = y || CONFIG.PLAYER.GROUND_Y;
        this.isActive = true;
        this.visible = true;
    }
    
    /**
     * Деактивация врага
     */
    deactivate() {
        this.isActive = false;
        this.visible = false;
    }
}
