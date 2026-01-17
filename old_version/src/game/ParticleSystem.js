// Система частиц для визуальных эффектов

class ParticleSystem extends PIXI.Container {
    constructor() {
        super();
        
        this.particles = [];
        this.maxParticles = 50;
    }
    
    /**
     * Создание частицы
     */
    createParticle(x, y, color = 0xFFFFFF) {
        if (this.particles.length >= this.maxParticles) {
            // Переиспользуем старую частицу
            const particle = this.particles.shift();
            this.resetParticle(particle, x, y, color);
            return particle;
        }
        
        const particle = new PIXI.Graphics();
        particle.beginFill(color);
        particle.drawCircle(0, 0, 3);
        particle.endFill();
        
        this.resetParticle(particle, x, y, color);
        this.particles.push(particle);
        this.addChild(particle);
        
        return particle;
    }
    
    /**
     * Сброс частицы
     */
    resetParticle(particle, x, y, color) {
        particle.x = x;
        particle.y = y;
        particle.alpha = 1;
        particle.scale.set(1);
        
        // Случайная скорость
        particle.vx = random(-3, 3);
        particle.vy = random(-5, -2);
        particle.life = 1.0;
        particle.decay = random(0.02, 0.05);
        
        // Обновляем цвет
        particle.clear();
        particle.beginFill(color);
        particle.drawCircle(0, 0, random(2, 5));
        particle.endFill();
    }
    
    /**
     * Взрыв частиц (для сбора предметов)
     */
    burst(x, y, count = 10, color = 0xFFD700) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, color);
        }
    }
    
    /**
     * Обновление частиц
     */
    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Обновляем позицию
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Применяем гравитацию
            particle.vy += 0.2;
            
            // Уменьшаем жизнь
            particle.life -= particle.decay;
            particle.alpha = particle.life;
            particle.scale.set(particle.life);
            
            // Удаляем мертвые частицы
            if (particle.life <= 0) {
                this.removeChild(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Очистка всех частиц
     */
    clear() {
        this.particles.forEach(particle => {
            this.removeChild(particle);
            particle.destroy();
        });
        this.particles = [];
    }
}
