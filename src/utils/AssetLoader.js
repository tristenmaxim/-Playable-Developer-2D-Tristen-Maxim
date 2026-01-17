// Система загрузки ассетов

class AssetLoader {
    constructor() {
        this.loader = new PIXI.Loader();
        this.loadedAssets = {};
        this.loadProgress = 0;
    }
    
    /**
     * Добавить ресурс для загрузки
     */
    add(name, url) {
        this.loader.add(name, url);
        return this;
    }
    
    /**
     * Добавить несколько ресурсов
     */
    addBatch(assets) {
        for (const [name, url] of Object.entries(assets)) {
            this.add(name, url);
        }
        return this;
    }
    
    /**
     * Загрузить все ресурсы
     */
    load() {
        return new Promise((resolve, reject) => {
            this.loader
                .on('progress', (loader, resource) => {
                    this.loadProgress = loader.progress;
                    console.log(`Загрузка: ${resource.name} - ${Math.round(loader.progress)}%`);
                })
                .on('complete', (loader, resources) => {
                    // Сохраняем загруженные ресурсы
                    for (const [name, resource] of Object.entries(resources)) {
                        this.loadedAssets[name] = resource;
                    }
                    console.log('Все ресурсы загружены');
                    resolve(this.loadedAssets);
                })
                .on('error', (error, loader, resource) => {
                    console.error(`Ошибка загрузки ${resource.name}:`, error);
                    reject(error);
                })
                .load();
        });
    }
    
    /**
     * Получить загруженный ресурс
     */
    get(name) {
        return this.loadedAssets[name]?.texture || this.loadedAssets[name];
    }
    
    /**
     * Получить текстуру
     */
    getTexture(name) {
        const resource = this.loadedAssets[name];
        return resource?.texture || null;
    }
    
    /**
     * Получить спрайт
     */
    getSprite(name) {
        const texture = this.getTexture(name);
        return texture ? new PIXI.Sprite(texture) : null;
    }
}
