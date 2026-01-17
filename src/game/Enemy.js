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
        
        // Движение слева направо
        this.x -= this.speed * (delta / 16);
        
        // Удаление при выходе за экран (используем getBounds() для получения размера)
        const bounds = this.getBounds();
        if (this.x + bounds.width < 0) {
            this.isActive = false;
        }
    }
    
    /**
     * Получить границы для коллизий
     */
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height,
            width: this.width,
            height: this.height
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
