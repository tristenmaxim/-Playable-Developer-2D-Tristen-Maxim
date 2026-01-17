// Пул объектов для оптимизации

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        // Предзаполняем пул
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    /**
     * Получить объект из пула
     */
    get() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        
        this.active.push(obj);
        return obj;
    }
    
    /**
     * Вернуть объект в пул
     */
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
            
            if (this.resetFn) {
                this.resetFn(obj);
            }
            
            this.pool.push(obj);
        }
    }
    
    /**
     * Очистить пул
     */
    clear() {
        this.active.forEach(obj => {
            if (obj.destroy) {
                obj.destroy();
            }
        });
        this.pool.forEach(obj => {
            if (obj.destroy) {
                obj.destroy();
            }
        });
        this.active = [];
        this.pool = [];
    }
    
    /**
     * Получить количество активных объектов
     */
    getActiveCount() {
        return this.active.length;
    }
    
    /**
     * Получить размер пула
     */
    getPoolSize() {
        return this.pool.length;
    }
}
