// Экран окончания игры

class EndScreen extends PIXI.Container {
    constructor() {
        super();
        
        this.visible = false;
        this.isWin = false;
        this.finalScore = 0;
        this.bestScore = 0;
        
        // Фон (полупрозрачный)
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x000000, 0.7);
        this.background.drawRect(0, 0, CONFIG.SCREEN.WIDTH, CONFIG.SCREEN.HEIGHT);
        this.background.endFill();
        this.addChild(this.background);
        
        // Контейнер для контента
        this.content = new PIXI.Container();
        this.content.x = CONFIG.SCREEN.WIDTH / 2;
        this.content.y = CONFIG.SCREEN.HEIGHT / 2;
        this.addChild(this.content);
        
        // Заголовок
        this.title = new PIXI.Text('Игра окончена', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
            align: 'center'
        });
        this.title.anchor.set(0.5, 0.5);
        this.title.y = -100;
        this.content.addChild(this.title);
        
        // Подзаголовок
        this.subtitle = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xCCCCCC,
            align: 'center'
        });
        this.subtitle.anchor.set(0.5, 0.5);
        this.subtitle.y = -50;
        this.content.addChild(this.subtitle);
        
        // Финальный счет
        this.scoreText = new PIXI.Text('Счет: 0', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xFFFF00,
            fontWeight: 'bold',
            align: 'center'
        });
        this.scoreText.anchor.set(0.5, 0.5);
        this.scoreText.y = 0;
        this.content.addChild(this.scoreText);
        
        // Лучший результат
        this.bestScoreText = new PIXI.Text('Лучший: 0', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xCCCCCC,
            align: 'center'
        });
        this.bestScoreText.anchor.set(0.5, 0.5);
        this.bestScoreText.y = 40;
        this.content.addChild(this.bestScoreText);
        
        // Кнопка перезапуска
        this.restartButton = this.createRestartButton();
        this.restartButton.y = 100;
        this.content.addChild(this.restartButton);
    }
    
    /**
     * Создание кнопки перезапуска
     */
    createRestartButton() {
        const button = new PIXI.Container();
        
        // Фон кнопки
        const bg = new PIXI.Graphics();
        bg.beginFill(0x4CAF50);
        bg.drawRoundedRect(-100, -25, 200, 50, 10);
        bg.endFill();
        button.addChild(bg);
        
        // Текст кнопки
        const text = new PIXI.Text('Играть снова', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
            align: 'center'
        });
        text.anchor.set(0.5, 0.5);
        button.addChild(text);
        
        // Интерактивность
        button.interactive = true;
        button.buttonMode = true;
        button.cursor = 'pointer';
        
        // Анимация при наведении
        button.on('pointerover', () => {
            button.scale.set(1.1);
        });
        
        button.on('pointerout', () => {
            button.scale.set(1);
        });
        
        button.anchor = { x: 0.5, y: 0.5 };
        
        return button;
    }
    
    /**
     * Показать экран окончания
     */
    show(isWin, finalScore, bestScore) {
        this.isWin = isWin;
        this.finalScore = finalScore;
        this.bestScore = bestScore;
        
        // Обновляем текст
        this.title.text = isWin ? 'Победа!' : 'Игра окончена';
        this.title.style.fill = isWin ? 0x00FF00 : 0xFF0000;
        this.subtitle.text = isWin ? 'Отличная игра!' : 'Попробуйте еще раз';
        this.scoreText.text = `Счет: ${formatNumber(Math.floor(finalScore))}`;
        this.bestScoreText.text = `Лучший: ${formatNumber(bestScore)}`;
        
        // Показываем экран
        this.visible = true;
        
        // Анимация появления
        this.alpha = 0;
        this.scale.set(0.8);
        
        // Плавное появление
        const fadeIn = () => {
            if (this.alpha < 1) {
                this.alpha += 0.1;
                this.scale.x += 0.02;
                this.scale.y += 0.02;
                requestAnimationFrame(fadeIn);
            } else {
                this.alpha = 1;
                this.scale.set(1);
            }
        };
        fadeIn();
    }
    
    /**
     * Скрыть экран
     */
    hide() {
        this.visible = false;
        this.alpha = 0;
        this.scale.set(0.8);
    }
    
    /**
     * Установить обработчик перезапуска
     */
    setRestartCallback(callback) {
        this.restartButton.on('pointerdown', () => {
            callback();
            this.hide();
        });
    }
}
