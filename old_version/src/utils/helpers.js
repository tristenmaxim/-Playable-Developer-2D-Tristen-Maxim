// Вспомогательные функции

/**
 * Генерация случайного числа в диапазоне
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Генерация случайного целого числа в диапазоне
 */
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

/**
 * Проверка коллизии между двумя прямоугольниками
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Ограничение значения в диапазоне
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Линейная интерполяция
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Форматирование числа (например, для счета)
 */
function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}
