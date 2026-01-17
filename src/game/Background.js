// Класс фона с параллакс скроллингом

class Background extends PIXI.Container {
    constructor() {
        super();
        
        this.layers = [];
        this.speeds = [0.5, 1, 1.5]; // Разные скорости для слоев
    }
    
    /**
     * Инициализация фона с текстурами
     */
    init(textures) {
        // Очищаем существующие слои
        this.layers.forEach(layer => this.removeChild(layer));
        this.layers = [];
        
        // Создаем слои фона
        if (textures && textures.length > 0) {
            textures.forEach((texture, index) => {
                if (texture) {
                    const layer = this.createLayer(texture, this.speeds[index] || 1);
                    this.layers.push(layer);
                    this.addChild(layer);
                }
            });
        } else {
            // Если нет текстур, создаем простой градиентный фон
            this.createDefaultBackground();
        }
    }
    
    /**
     * Создание слоя фона
     */
    createLayer(texture, speed) {
        const container = new PIXI.Container();
        container.speed = speed;
        
        // Создаем два спрайта для бесшовного зацикливания
        const sprite1 = new PIXI.Sprite(texture);
        const sprite2 = new PIXI.Sprite(texture);
        
        sprite1.x = 0;
        sprite2.x = texture.width;
        
        sprite1.y = CONFIG.SCREEN.HEIGHT - texture.height;
        sprite2.y = CONFIG.SCREEN.HEIGHT - texture.height;
        
        container.addChild(sprite1);
        container.addChild(sprite2);
        
        container.width = texture.width * 2;
        container.sprites = [sprite1, sprite2];
        
        return container;
    }
    
    /**
     * Создание дефолтного фона (градиент)
     */
    createDefaultBackground() {
        const graphics = new PIXI.Graphics();
        
        // Градиент от неба к земле
        graphics.beginFill(0x87CEEB); // Небо
        graphics.drawRect(0, 0, CONFIG.SCREEN.WIDTH, CONFIG.SCREEN.HEIGHT * 0.7);
        graphics.endFill();
        
        graphics.beginFill(0x8B7355); // Земля
        graphics.drawRect(0, CONFIG.SCREEN.HEIGHT * 0.7, CONFIG.SCREEN.WIDTH, CONFIG.SCREEN.HEIGHT * 0.3);
        graphics.endFill();
        
        this.addChild(graphics);
    }
    
    /**
     * Обновление движения фона
     */
    update(delta) {
        this.layers.forEach(layer => {
            if (layer.sprites) {
                // Движем слой
                layer.x -= layer.speed * CONFIG.SPEED.BACKGROUND * (delta / 16);
                
                // Бесшовное зацикливание
                layer.sprites.forEach(sprite => {
                    sprite.x -= layer.speed * CONFIG.SPEED.BACKGROUND * (delta / 16);
                    
                    // Если спрайт ушел за левый край, перемещаем его вправо
                    if (sprite.x + sprite.width < 0) {
                        sprite.x += layer.width;
                    }
                });
            }
        });
    }
    
    /**
     * Сброс позиции
     */
    reset() {
        this.layers.forEach(layer => {
            layer.x = 0;
            if (layer.sprites) {
                layer.sprites[0].x = 0;
                layer.sprites[1].x = layer.sprites[0].width;
            }
        });
    }
}
