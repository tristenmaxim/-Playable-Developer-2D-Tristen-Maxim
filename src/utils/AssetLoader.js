// Система загрузки ассетов
// Совместима с PixiJS v7 (использует PIXI.Assets вместо устаревшего PIXI.Loader)

class AssetLoader {
    constructor() {
        // В PixiJS v7 PIXI.Loader удалён, используем PIXI.Assets
        this.loadedAssets = {};
        this.loadProgress = 0;
    }
    
    /**
     * Добавить ресурс для загрузки
     * В v7 используется PIXI.Assets.add()
     */
    add(name, url) {
        if (!this._assetsToLoad) {
            this._assetsToLoad = {};
        }
        this._assetsToLoad[name] = url;
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
     * В v7 используется PIXI.Assets.load()
     * Этот метод будет переопределён патчем для встроенных ассетов
     */
    async load() {
        // Если есть ассеты для загрузки, используем PIXI.Assets
        if (this._assetsToLoad && Object.keys(this._assetsToLoad).length > 0) {
            try {
                for (const [name, url] of Object.entries(this._assetsToLoad)) {
                    console.log(`Загрузка: ${name}`);
                    const texture = await PIXI.Assets.load(url);
                    this.loadedAssets[name] = { texture };
                }
                console.log('Все ресурсы загружены');
            } catch (error) {
                console.error('Ошибка загрузки ресурсов:', error);
            }
        }
        this.loadProgress = 100;
        return this.loadedAssets;
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
