// Класс игрока

class Player extends PIXI.Container {
    constructor() {
        super();
        
        this.velocityY = 0;
        this.isJumping = false;
        this.isOnGround = true;
        this.currentState = 'running'; // 'running', 'jumping'
        
        // Создаем спрайт (пока простой прямоугольник, позже заменим на спрайт)
        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0x00ff00);
        this.sprite.drawRect(0, 0, 50, 80);
        this.sprite.endFill();
        this.addChild(this.sprite);
        
        // Устанавливаем начальную позицию
        this.x = CONFIG.PLAYER.INITIAL_X;
        this.y = CONFIG.PLAYER.INITIAL_Y;
        
        // Размеры для коллизий (используем приватные свойства, чтобы избежать конфликта с PixiJS)
        this._collisionWidth = 50;
        this._collisionHeight = 80;
    }
    
    /**
     * Инициализация с текстурами
     */
    init(texture) {
        if (texture) {
            // Если есть текстура, заменяем графику на спрайт
            this.removeChild(this.sprite);
            
            // Проверяем, это спрайт-лист или одиночная текстура
            // Если текстура большая (спрайт-лист), вырезаем один кадр
            // Размеры спрайт-листа: 932x1506, предположим 2 кадра по вертикали
            if (texture.width > 500 || texture.height > 800) {
                // Это спрайт-лист, вырезаем первый кадр (стояние)
                const frameWidth = texture.width;
                const frameHeight = texture.height / 2; // Предполагаем 2 кадра по вертикали
                
                const frame = new PIXI.Rectangle(0, 0, frameWidth, frameHeight);
                const frameTexture = new PIXI.Texture(texture.baseTexture, frame);
                this.sprite = new PIXI.Sprite(frameTexture);
            } else {
                // Одиночная текстура
                this.sprite = new PIXI.Sprite(texture);
            }
            
            this.sprite.anchor.set(0.5, 1); // Якорь снизу по центру
            this.addChild(this.sprite);
            
            // Обновляем размеры для коллизий
            this._collisionWidth = this.sprite.width;
            this._collisionHeight = this.sprite.height;
        }
    }
    
    /**
     * Прыжок
     */
    jump() {
        if (!this.isOnGround || this.isJumping) return;
        
        this.isJumping = true;
        this.isOnGround = false;
        this.velocityY = CONFIG.PLAYER.JUMP_POWER;
        this.currentState = 'jumping';
        
        console.log('Player jump!');
    }
    
    /**
     * Обновление позиции и физики
     */
    update(delta) {
        // Применяем гравитацию
        if (!this.isOnGround) {
            this.velocityY += CONFIG.PLAYER.GRAVITY;
            
            // Ограничиваем максимальную скорость падения
            if (this.velocityY > CONFIG.PLAYER.MAX_VELOCITY_Y) {
                this.velocityY = CONFIG.PLAYER.MAX_VELOCITY_Y;
            }
            
            // Обновляем позицию по Y
            this.y += this.velocityY;
            
            // Проверка приземления
            if (this.y >= CONFIG.PLAYER.GROUND_Y) {
                this.y = CONFIG.PLAYER.GROUND_Y;
                this.velocityY = 0;
                this.isOnGround = true;
                this.isJumping = false;
                this.currentState = 'running';
            }
        }
    }
    
    /**
     * Получить границы для коллизий
     */
    getBounds() {
        return {
            x: this.x - this._collisionWidth / 2,
            y: this.y - this._collisionHeight,
            width: this._collisionWidth,
            height: this._collisionHeight
        };
    }
    
    /**
     * Сброс позиции
     */
    reset() {
        this.x = CONFIG.PLAYER.INITIAL_X;
        this.y = CONFIG.PLAYER.INITIAL_Y;
        this.velocityY = 0;
        this.isJumping = false;
        this.isOnGround = true;
        this.currentState = 'running';
    }
}
