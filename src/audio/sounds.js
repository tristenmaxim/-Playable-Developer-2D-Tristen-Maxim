// Конфигурация звуков

const SOUNDS_CONFIG = {
    // Пути к звуковым файлам (будут добавлены позже)
    paths: {
        jump: 'assets/audio/jump.mp3',
        collect: 'assets/audio/collect.mp3',
        collision: 'assets/audio/collision.mp3',
        gameOver: 'assets/audio/gameover.mp3',
        music: 'assets/audio/music.mp3'
    },
    
    // Настройки громкости для каждого звука
    volumes: {
        jump: 0.5,
        collect: 0.7,
        collision: 0.8,
        gameOver: 0.6,
        music: 0.5
    }
};
