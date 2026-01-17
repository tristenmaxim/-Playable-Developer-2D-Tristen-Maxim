// Класс собираемого предмета

class Collectible extends PIXI.Sprite {
    constructor(texture) {
        // Создаем дефолтную текстуру ДО вызова super()
        const defaultTexture = texture || Collectible.createDefaultTexture();
        super(defaultTexture);
        
        this.speed = CONFIG.SPEED.COLLECTIBLE;
        this.isActive = true;
        this.isCollected = false;
        this.rotationSpeed = 0.05;
        
        // Устанавливаем начальную позицию
        this.x = CONFIG.SCREEN.WIDTH + 100;
        this.y = CONFIG.PLAYER.GROUND_Y - 100; // Немного выше земли
        
        // Якорь по центру
        this.anchor.set(0.5, 0.5);
        
        // Анимация вращения
        this.rotation = 0;
    }
    
    /**
     * Создание дефолтной текстуры (желтый круг)
     * Статический метод, чтобы можно было вызвать до super()
     * В PixiJS v7 используем Canvas API напрямую
     */
    static createDefaultTexture() {
        const canvas = document.createElement('canvas');
        const size = 40; // Диаметр круга
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Рисуем желтый круг
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Создаем текстуру из canvas
        return PIXI.Texture.from(canvas);
    }
    
    /**
     * Обновление позиции и анимации
     */
    update(delta) {
        if (!this.isActive || this.isCollected) return;
        
        // Движение справа налево
        // В PixiJS v7 delta обычно около 1 (60 FPS), конвертируем в пиксели за кадр
        this.x -= this.speed * delta;
        
        // Вращение
        this.rotation += this.rotationSpeed * delta;
        
        // Пульсация (опционально)
        const scale = 1 + Math.sin(this.rotation * 2) * 0.1;
        this.scale.set(scale);
        
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
     * Сбор предмета
     */
    collect() {
        if (this.isCollected) return false;
        
        this.isCollected = true;
        this.isActive = false;
        this.visible = false;
        
        return true;
    }
    
    /**
     * Активация предмета
     */
    activate(x, y) {
        this.x = x || CONFIG.SCREEN.WIDTH + 100;
        this.y = y || CONFIG.PLAYER.GROUND_Y - 100;
        this.isActive = true;
        this.isCollected = false;
        this.visible = true;
        this.rotation = 0;
        this.scale.set(1);
    }
    
    /**
     * Деактивация предмета
     */
    deactivate() {
        this.isActive = false;
        this.visible = false;
    }
}
