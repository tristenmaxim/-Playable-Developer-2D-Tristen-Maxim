// Менеджер аудио

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicAudio = null;
        this.masterVolume = 1.0;
        this.soundVolume = 1.0;
        this.musicVolume = 0.7;
        this.isMuted = false;
    }
    
    /**
     * Загрузка звука
     */
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds[name] = audio;
                resolve(audio);
            });
            
            audio.addEventListener('error', (e) => {
                console.warn(`Ошибка загрузки звука ${name}:`, e);
                reject(e);
            });
            
            audio.src = url;
        });
    }
    
    /**
     * Загрузка музыки
     */
    loadMusic(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.loop = true;
            
            audio.addEventListener('canplaythrough', () => {
                this.musicAudio = audio;
                resolve(audio);
            });
            
            audio.addEventListener('error', (e) => {
                console.warn(`Ошибка загрузки музыки:`, e);
                reject(e);
            });
            
            audio.src = url;
        });
    }
    
    /**
     * Воспроизведение звука
     */
    playSound(name, volume = 1.0) {
        if (this.isMuted) return;
        
        const sound = this.sounds[name];
        if (!sound) {
            console.warn(`Звук ${name} не найден`);
            return;
        }
        
        // Клонируем звук для возможности одновременного воспроизведения
        const soundClone = sound.cloneNode();
        soundClone.volume = volume * this.soundVolume * this.masterVolume;
        soundClone.play().catch(e => {
            console.warn(`Не удалось воспроизвести звук ${name}:`, e);
        });
    }
    
    /**
     * Воспроизведение музыки
     */
    playMusic(volume = 0.7) {
        if (this.isMuted || !this.musicAudio) return;
        
        this.musicAudio.volume = volume * this.musicVolume * this.masterVolume;
        this.musicAudio.play().catch(e => {
            console.warn('Не удалось воспроизвести музыку:', e);
        });
    }
    
    /**
     * Остановка музыки
     */
    stopMusic() {
        if (this.musicAudio) {
            this.musicAudio.pause();
            this.musicAudio.currentTime = 0;
        }
    }
    
    /**
     * Пауза музыки
     */
    pauseMusic() {
        if (this.musicAudio) {
            this.musicAudio.pause();
        }
    }
    
    /**
     * Возобновление музыки
     */
    resumeMusic() {
        if (this.musicAudio && !this.isMuted) {
            this.musicAudio.play().catch(e => {
                console.warn('Не удалось возобновить музыку:', e);
            });
        }
    }
    
    /**
     * Установка громкости звуков
     */
    setSoundVolume(volume) {
        this.soundVolume = clamp(volume, 0, 1);
    }
    
    /**
     * Установка громкости музыки
     */
    setMusicVolume(volume) {
        this.musicVolume = clamp(volume, 0, 1);
        if (this.musicAudio) {
            this.musicAudio.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    /**
     * Установка общей громкости
     */
    setMasterVolume(volume) {
        this.masterVolume = clamp(volume, 0, 1);
        if (this.musicAudio) {
            this.musicAudio.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    /**
     * Включить/выключить звук
     */
    setMuted(muted) {
        this.isMuted = muted;
        if (muted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
    }
    
    /**
     * Переключение звука
     */
    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }
}
