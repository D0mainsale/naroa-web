#!/usr/bin/env python3
"""
Extractor de nombres de álbumes desde la página de todos los álbumes
Extrae todos los nombres de una vez desde la vista de álbumes
"""
import asyncio
import json
import re
from pathlib import Path

from playwright.async_api import async_playwright

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
NAMES_JSON = DATA_DIR / "album-names.json"
ALBUMS_URL = "https://www.facebook.com/naroa.artista.plastica/photos_albums"

async def main():
    print("🏷️ Extractor de Nombres de Álbumes (modo bulk)")
    print("=" * 50)
    
    # Load existing names
    existing_names = {}
    if NAMES_JSON.exists():
        with open(NAMES_JSON) as f:
            existing_names = json.load(f)
    print(f"✅ Nombres existentes: {len(existing_names)}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()
        
        await page.goto("https://www.facebook.com", wait_until="domcontentloaded")
        
        print("\n" + "=" * 60)
        print("🔐 ESPERA: Loguéate en Facebook")
        print("   Luego navega a: " + ALBUMS_URL)
        print("=" * 60)
        input(">>> Presiona ENTER cuando estés en la página de álbumes...")
        
        print("\n📜 Haciendo scroll para cargar todos los álbumes...")
        
        # Scroll to load all albums
        for i in range(80):
            await page.mouse.wheel(0, 2000)
            await page.wait_for_timeout(300)
            if i % 20 == 0:
                print(f"   Scroll {i+1}/80...")
        
        print("✅ Scroll completado")
        
        # Extract album links and titles
        extraction_js = r"""() => {
            const results = [];
            const links = document.querySelectorAll('a[href*="/media/set/?set=a."]');
            
            for (const link of links) {
                const href = link.getAttribute('href') || '';
                const match = href.match(/set=a\.(\d+)/);
                if (!match) continue;
                
                const albumId = match[1];
                
                // Find the title near this link
                // Strategy 1: Look for text in parent containers
                let title = null;
                let parent = link.parentElement;
                for (let depth = 0; depth < 5 && parent; depth++) {
                    const spans = parent.querySelectorAll('span');
                    for (const span of spans) {
                        const text = span.innerText?.trim();
                        if (text && text.length > 2 && text.length < 80) {
                            // Skip generic texts
                            if (!text.match(/^(\d+ fotos?|\d+ photos?|Ver|See|Más|More|Albums?|Álbum)/i)) {
                                title = text;
                                break;
                            }
                        }
                    }
                    if (title) break;
                    parent = parent.parentElement;
                }
                
                if (title && !results.find(r => r.id === albumId)) {
                    results.push({ id: albumId, title: title });
                }
            }
            
            return results;
        }"""
        
        print("🔍 Extrayendo títulos...")
        albums = await page.evaluate(extraction_js)
        
        print(f"   Encontrados: {len(albums)} álbumes con título")
        
        # Merge with existing
        new_count = 0
        for album in albums:
            aid = album['id']
            title = album['title']
            if aid not in existing_names:
                existing_names[aid] = title
                new_count += 1
                print(f"   + {aid}: {title[:50]}...")
        
        await browser.close()
    
    # Save
    with open(NAMES_JSON, 'w') as f:
        json.dump(existing_names, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 50)
    print(f"✅ COMPLETADO")
    print(f"   Nombres nuevos: {new_count}")
    print(f"   Total nombres: {len(existing_names)}")
    print(f"   Guardado en: {NAMES_JSON}")

if __name__ == "__main__":
    asyncio.run(main())
