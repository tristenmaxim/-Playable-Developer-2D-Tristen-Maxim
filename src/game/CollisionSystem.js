// Система коллизий

class CollisionSystem {
    constructor() {
        // Кэш для оптимизации
        this.collisionCache = new Map();
    }
    
    /**
     * Проверка коллизии между двумя объектами (bounding box)
     */
    checkCollision(obj1, obj2) {
        const bounds1 = this.getBounds(obj1);
        const bounds2 = this.getBounds(obj2);
        
        return checkCollision(bounds1, bounds2);
    }
    
    /**
     * Получить границы объекта
     */
    getBounds(obj) {
        // Если у объекта есть метод getBounds, используем его
        if (typeof obj.getBounds === 'function') {
            return obj.getBounds();
        }
        
        // Иначе используем стандартные границы PixiJS
        const bounds = obj.getBounds();
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        };
    }
    
    /**
     * Проверка коллизии игрока с врагами
     */
    checkPlayerEnemyCollision(player, enemies) {
        const collisions = [];
        
        enemies.forEach(enemy => {
            if (enemy.isActive && !enemy.visible) return;
            
            if (this.checkCollision(player, enemy)) {
                collisions.push(enemy);
            }
        });
        
        return collisions;
    }
    
    /**
     * Проверка коллизии игрока с собираемыми предметами
     */
    checkPlayerCollectibleCollision(player, collectibles) {
        const collisions = [];
        
        collectibles.forEach(collectible => {
            if (!collectible.isActive || collectible.isCollected || !collectible.visible) return;
            
            if (this.checkCollision(player, collectible)) {
                collisions.push(collectible);
            }
        });
        
        return collisions;
    }
    
    /**
     * Очистка кэша
     */
    clearCache() {
        this.collisionCache.clear();
    }
}
