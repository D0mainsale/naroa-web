#!/usr/bin/env python3
"""
Extractor de nombres de álbumes de Facebook
Navega a cada álbum y extrae el título real
"""
import asyncio
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.async_api import async_playwright

# PATHS
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
ALBUMS_JSON = DATA_DIR / "facebook-albums.json"
NAMES_JSON = DATA_DIR / "album-names.json"

def album_id_from_url(url: str) -> str | None:
    q = parse_qs(urlparse(url).query)
    s = (q.get("set") or [None])[0]
    if not s:
        return None
    m = re.search(r"\ba\.(\d+)\b", s)
    return m.group(1) if m else None

async def extract_album_title(page) -> str | None:
    """Extract album title from current page using multiple strategies"""
    
    extraction_js = r"""() => {
        // Strategy 1: Look for the album title in spans with specific patterns
        const spans = document.querySelectorAll('span');
        for (const span of spans) {
            // Facebook album titles are usually in large fonts
            const style = window.getComputedStyle(span);
            const fontSize = parseFloat(style.fontSize);
            if (fontSize >= 20 && span.innerText && span.innerText.length > 2 && span.innerText.length < 100) {
                const text = span.innerText.trim();
                // Skip generic texts
                if (!text.match(/^(Fotos|Photos|Álbum|Album|Ver|See|Más|More|\d+)/i)) {
                    return text;
                }
            }
        }
        
        // Strategy 2: Look for h1, h2 elements
        const headings = document.querySelectorAll('h1, h2');
        for (const h of headings) {
            const text = h.innerText?.trim();
            if (text && text.length > 2 && text.length < 100) {
                return text;
            }
        }
        
        // Strategy 3: Look for aria-label on images that might contain title
        const imgs = document.querySelectorAll('img[aria-label]');
        for (const img of imgs) {
            const label = img.getAttribute('aria-label');
            if (label && label.length > 5 && label.length < 100) {
                return label;
            }
        }
        
        // Strategy 4: Look in the page title
        const title = document.title;
        if (title && !title.includes('Facebook')) {
            const match = title.match(/^([^|]+)/);
            if (match) return match[1].trim();
        }
        
        return null;
    }"""
    
    try:
        result = await page.evaluate(extraction_js)
        return result
    except Exception as e:
        print(f"Error extracting title: {e}")
        return None

async def main():
    print("🏷️ Extractor de Nombres de Álbumes de Facebook")
    print("=" * 50)
    
    # Load albums
    if not ALBUMS_JSON.exists():
        print(f"❌ No se encontró {ALBUMS_JSON}")
        return
    
    with open(ALBUMS_JSON) as f:
        albums_data = json.load(f)
        album_urls = albums_data.get("albums", [])
    
    # Load existing names
    existing_names = {}
    if NAMES_JSON.exists():
        with open(NAMES_JSON) as f:
            existing_names = json.load(f)
    
    print(f"📦 Total álbumes: {len(album_urls)}")
    print(f"✅ Ya tienen nombre: {len(existing_names)}")
    
    # Find albums without names
    missing = []
    for url in album_urls:
        aid = album_id_from_url(url)
        if aid and aid not in existing_names:
            missing.append((aid, url))
    
    print(f"❓ Sin nombre: {len(missing)}")
    
    if not missing:
        print("✅ Todos los álbumes tienen nombre!")
        return
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()
        
        # Go to Facebook
        await page.goto("https://www.facebook.com", wait_until="domcontentloaded")
        
        print("\n" + "=" * 60)
        print("🔐 ESPERA: Loguéate en Facebook en la ventana del navegador")
        print("=" * 60)
        input(">>> Presiona ENTER cuando estés logueado...")
        
        new_names = {}
        for i, (aid, url) in enumerate(missing, 1):
            print(f"\n[{i}/{len(missing)}] Álbum: {aid}")
            
            try:
                await page.goto(url, wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)
                
                title = await extract_album_title(page)
                
                if title:
                    print(f"   ✅ Nombre: {title}")
                    new_names[aid] = title
                    existing_names[aid] = title
                else:
                    print(f"   ⚠️ No se encontró nombre")
                    
            except Exception as e:
                print(f"   ❌ Error: {e}")
                continue
            
            # Save periodically
            if i % 10 == 0:
                with open(NAMES_JSON, "w") as f:
                    json.dump(existing_names, f, indent=2, ensure_ascii=False)
                print(f"   💾 Guardado progreso ({len(existing_names)} nombres)")
        
        await browser.close()
    
    # Final save
    with open(NAMES_JSON, "w") as f:
        json.dump(existing_names, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 50)
    print(f"✅ COMPLETADO")
    print(f"   Nombres nuevos extraídos: {len(new_names)}")
    print(f"   Total nombres: {len(existing_names)}")
    print(f"   Guardado en: {NAMES_JSON}")

if __name__ == "__main__":
    asyncio.run(main())
