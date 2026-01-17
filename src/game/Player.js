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
            
            console.log(`[Player] Размеры текстуры: ${texture.width}x${texture.height}`);
            
            // Проверяем, это спрайт-лист или одиночная текстура
            // Если текстура большая (спрайт-лист), вырезаем один кадр
            // Судя по скриншоту, спрайт-лист содержит несколько кадров в ряд
            if (texture.width > 500 || texture.height > 800) {
                console.log(`[Player] Обнаружен спрайт-лист, вырезаю один кадр...`);
                
                // Судя по скриншоту, кадры расположены горизонтально (в ряд)
                // Предположим, что кадры примерно квадратные или близкие к квадрату
                // Если высота ~750, то кадр примерно 750x750 или меньше
                // Попробуем определить количество кадров по ширине
                const frameHeight = texture.height; // Высота = высота одного кадра
                // Если ширина больше высоты в 2+ раза, значит кадры в ряд
                const framesInRow = Math.max(1, Math.floor(texture.width / frameHeight));
                const frameWidth = texture.width / framesInRow;
                
                console.log(`[Player] Размеры кадра: ${frameWidth}x${frameHeight}, кадров в ряду: ${framesInRow}`);
                
                // Вырезаем первый кадр (стояние)
                // В PixiJS v7 используем правильный способ создания текстуры из кадра
                try {
                    // Получаем базовую текстуру (source в v7)
                    const source = texture.source || texture.baseTexture;
                    if (source) {
                        const frame = new PIXI.Rectangle(0, 0, frameWidth, frameHeight);
                        // Создаем новую текстуру из базовой с указанным фреймом
                        const frameTexture = new PIXI.Texture({
                            source: source,
                            frame: frame
                        });
                        this.sprite = new PIXI.Sprite(frameTexture);
                        console.log(`[Player] Создан спрайт из кадра: ${this.sprite.width}x${this.sprite.height}`);
                    } else {
                        throw new Error('Не удалось получить source');
                    }
                } catch (error) {
                    console.error(`[Player] Ошибка вырезания кадра:`, error);
                    // Fallback: используем полную текстуру, но масштабируем
                    this.sprite = new PIXI.Sprite(texture);
                    // Масштабируем, чтобы показать только один кадр
                    this.sprite.scale.set(frameWidth / texture.width, frameHeight / texture.height);
                    console.log(`[Player] Используется fallback с масштабированием`);
                }
            } else {
                // Одиночная текстура
                console.log(`[Player] Используется одиночная текстура`);
                this.sprite = new PIXI.Sprite(texture);
            }
            
            this.sprite.anchor.set(0.5, 1); // Якорь снизу по центру
            this.addChild(this.sprite);
            
            // Обновляем размеры для коллизий
            this._collisionWidth = this.sprite.width;
            this._collisionHeight = this.sprite.height;
            
            console.log(`[Player] Инициализация завершена, размеры коллизий: ${this._collisionWidth}x${this._collisionHeight}`);
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
