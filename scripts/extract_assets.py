#!/usr/bin/env python3
"""
Скрипт для извлечения всех ассетов из playable HTML файла
"""
import re
import base64
import os
import json
from pathlib import Path

def extract_data_uris(html_content):
    """Извлекает все data URI из HTML"""
    # Паттерн для data URI (изображения, звуки и т.д.)
    data_uri_pattern = r'data:([^;]+);base64,([^"\'>\s]+)'
    matches = re.findall(data_uri_pattern, html_content)
    
    assets = []
    for i, (mime_type, data) in enumerate(matches):
        # Определяем расширение файла по MIME типу
        ext_map = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'image/svg+xml': '.svg',
            'image/avif': '.avif',
            'audio/mpeg': '.mp3',
            'audio/wav': '.wav',
            'audio/ogg': '.ogg',
            'font/woff': '.woff',
            'font/woff2': '.woff2',
            'font/ttf': '.ttf',
            'font/otf': '.otf',
        }
        
        ext = ext_map.get(mime_type, '.bin')
        filename = f'asset_{i:04d}{ext}'
        
        try:
            # Декодируем base64
            decoded_data = base64.b64decode(data)
            assets.append({
                'filename': filename,
                'mime_type': mime_type,
                'data': decoded_data,
                'size': len(decoded_data)
            })
        except Exception as e:
            print(f"Ошибка декодирования asset {i}: {e}")
            continue
    
    return assets

def extract_urls(html_content):
    """Извлекает все URL ресурсов из HTML"""
    # Паттерны для различных типов URL
    patterns = [
        r'url\(["\']?([^"\')]+\.(png|jpg|jpeg|gif|webp|svg|mp3|wav|ogg|woff|woff2|ttf|otf))["\']?\)',
        r'src=["\']([^"\']+\.(png|jpg|jpeg|gif|webp|svg|mp3|wav|ogg|woff|woff2|ttf|otf))["\']',
        r'href=["\']([^"\']+\.(png|jpg|jpeg|gif|webp|svg|mp3|wav|ogg|woff|woff2|ttf|otf))["\']',
        r'["\']([^"\']+\.(png|jpg|jpeg|gif|webp|svg|mp3|wav|ogg|woff|woff2|ttf|otf))["\']',
    ]
    
    urls = set()
    for pattern in patterns:
        matches = re.findall(pattern, html_content, re.IGNORECASE)
        for match in matches:
            url = match[0] if isinstance(match, tuple) else match
            # Фильтруем data URI и относительные пути
            if not url.startswith('data:') and not url.startswith('http'):
                urls.add(url)
    
    return sorted(list(urls))

def analyze_game_structure(html_content):
    """Анализирует структуру игры"""
    analysis = {
        'has_canvas': '<canvas' in html_content.lower(),
        'has_webgl': 'webgl' in html_content.lower() or 'WebGL' in html_content,
        'has_phaser': 'phaser' in html_content.lower(),
        'has_pixi': 'pixi' in html_content.lower() or 'PIXI' in html_content,
        'has_three': 'three' in html_content.lower() or 'THREE' in html_content,
        'has_audio': 'Audio' in html_content or 'audio' in html_content.lower(),
        'has_animation': 'animation' in html_content.lower() or 'animate' in html_content.lower(),
    }
    
    # Ищем основные библиотеки
    libs = []
    if 'phaser' in html_content.lower():
        libs.append('Phaser')
    if 'pixi' in html_content.lower() or 'PIXI' in html_content:
        libs.append('PixiJS')
    if 'three' in html_content.lower() or 'THREE' in html_content:
        libs.append('Three.js')
    if 'matter' in html_content.lower():
        libs.append('Matter.js')
    
    analysis['detected_libraries'] = libs
    
    return analysis

def main():
    # Создаем директории
    base_dir = Path(__file__).parent
    assets_dir = base_dir / 'reference_assets'
    assets_dir.mkdir(exist_ok=True)
    
    data_uri_dir = assets_dir / 'data_uri_assets'
    data_uri_dir.mkdir(exist_ok=True)
    
    # Читаем HTML
    html_file = base_dir / 'playable_game.html'
    if not html_file.exists():
        print(f"Файл {html_file} не найден!")
        return
    
    print(f"Читаю {html_file}...")
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        html_content = f.read()
    
    print(f"Размер HTML: {len(html_content) / 1024 / 1024:.2f} MB")
    
    # Извлекаем data URI
    print("\nИзвлекаю data URI ассеты...")
    data_assets = extract_data_uris(html_content)
    print(f"Найдено {len(data_assets)} data URI ассетов")
    
    # Сохраняем data URI ассеты
    asset_info = []
    total_size = 0
    for asset in data_assets:
        filepath = data_uri_dir / asset['filename']
        with open(filepath, 'wb') as f:
            f.write(asset['data'])
        total_size += asset['size']
        asset_info.append({
            'filename': asset['filename'],
            'mime_type': asset['mime_type'],
            'size': asset['size'],
            'size_kb': round(asset['size'] / 1024, 2)
        })
        print(f"  Сохранен: {asset['filename']} ({asset['size'] / 1024:.2f} KB)")
    
    # Извлекаем URL
    print("\nИщу URL ресурсов...")
    urls = extract_urls(html_content)
    print(f"Найдено {len(urls)} потенциальных URL ресурсов")
    if urls:
        print("Примеры URL:")
        for url in urls[:10]:
            print(f"  {url}")
    
    # Анализируем структуру
    print("\nАнализирую структуру игры...")
    analysis = analyze_game_structure(html_content)
    print(f"Обнаруженные библиотеки: {', '.join(analysis['detected_libraries']) if analysis['detected_libraries'] else 'Не обнаружено'}")
    print(f"Canvas: {analysis['has_canvas']}")
    print(f"WebGL: {analysis['has_webgl']}")
    print(f"Audio: {analysis['has_audio']}")
    
    # Сохраняем метаданные
    metadata = {
        'html_size_mb': round(len(html_content) / 1024 / 1024, 2),
        'data_uri_assets_count': len(data_assets),
        'data_uri_assets_total_size_kb': round(total_size / 1024, 2),
        'urls_found': len(urls),
        'urls': urls[:50],  # Первые 50 URL
        'analysis': analysis,
        'assets': asset_info
    }
    
    metadata_file = assets_dir / 'metadata.json'
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\nМетаданные сохранены в {metadata_file}")
    print(f"\nВсего извлечено: {len(data_assets)} ассетов, общий размер: {total_size / 1024 / 1024:.2f} MB")

if __name__ == '__main__':
    main()
