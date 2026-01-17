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
     */
    static createDefaultTexture() {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xffd700);
        graphics.drawCircle(0, 0, 20);
        graphics.endFill();
        return graphics.generateCanvasTexture();
    }
    
    /**
     * Обновление позиции и анимации
     */
    update(delta) {
        if (!this.isActive || this.isCollected) return;
        
        // Движение слева направо
        this.x -= this.speed * (delta / 16);
        
        // Вращение
        this.rotation += this.rotationSpeed;
        
        // Пульсация (опционально)
        const scale = 1 + Math.sin(this.rotation * 2) * 0.1;
        this.scale.set(scale);
        
        // Удаление при выходе за экран
        if (this.x + this.width < 0) {
            this.isActive = false;
        }
    }
    
    /**
     * Получить границы для коллизий
     */
    getBounds() {
        const radius = (this.width / 2) * this.scale.x;
        return {
            x: this.x - radius,
            y: this.y - radius,
            width: radius * 2,
            height: radius * 2
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
