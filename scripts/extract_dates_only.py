#!/usr/bin/env python3
"""
Extract dates from existing Facebook albums (NO IMAGE DOWNLOAD)
This script visits the 53 albums we already scraped and extracts only their creation dates.
"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright, TimeoutError as PWTimeoutError

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
ALBUMS_JSON = DATA_DIR / "facebook-albums.json"
METADATA_JSON = DATA_DIR / "album-metadata.json"

async def extract_album_date(page):
    """Extract album creation date from Facebook metadata."""
    date_extraction_js = r"""() => {
        // Strategy 1: Look for time elements with data-utime
        const timeElems = document.querySelectorAll('time[data-utime]');
        if (timeElems.length > 0) {
            const utime = timeElems[0].getAttribute('data-utime');
            if (utime) return { timestamp: parseInt(utime), source: 'data-utime' };
        }
        
        // Strategy 2: Look for aria-label dates or text patterns
        const allText = document.body.innerText;
        const datePatterns = [
            /Created\\s+on\\s+(\\w+\\s+\\d{1,2},\\s+\\d{4})/i,
            /(\\w+\\s+\\d{1,2},\\s+\\d{4})/
        ];
        
        for (const pattern of datePatterns) {
            const match = allText.match(pattern);
            if (match) {
                return { dateString: match[1], source: 'text-pattern' };
            }
        }
        
        // Strategy 3: Look for JSON-LD or meta tags
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
            try {
                const data = JSON.parse(script.textContent);
                if (data.dateCreated) return { dateString: data.dateCreated, source: 'json-ld' };
                if (data.uploadDate) return { dateString: data.uploadDate, source: 'json-ld' };
            } catch (e) {}
        }
        
        return null;
    }"""
    
    try:
        result = await page.evaluate(date_extraction_js)
        if result:
            if 'timestamp' in result:
                from datetime import datetime
                dt = datetime.fromtimestamp(result['timestamp'])
                return dt.strftime('%Y-%m-%d')
            elif 'date String' in result:
                from datetime import datetime
                date_str = result['dateString']
                for fmt in ['%B %d, %Y', '%b %d, %Y', '%Y-%m-%d']:
                    try:
                        dt = datetime.strptime(date_str, fmt)
                        return dt.strftime('%Y-%m-%d')
                    except:
                        continue
        return None
    except Exception as e:
        print(f"Error extracting date: {e}")
        return None

async def main():
    # Load existing albums list
    if not ALBUMS_JSON.exists():
        print(f"❌ No se encontró {ALBUMS_JSON}")
        return
    
    with open(ALBUMS_JSON, "r") as f:
        data = json.load(f)
        albums = data.get("albums", [])
    
    if not albums:
        print("❌ No hay álbumes en el JSON")
        return
    
    print(f"📋 Extrayendo fechas de {len(albums)} álbumes (SIN descargar imágenes)...")
    
    # Load existing metadata if any
    album_metadata = {}
    if METADATA_JSON.exists():
        try:
            with open(METADATA_JSON, "r") as f:
                album_metadata = json.load(f)
            print(f"📖 Metadata existente: {len(album_metadata)} álbumes")
        except Exception as e:
            print(f"⚠️ Error cargando metadata: {e}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()
        
        # Manual login
        await page.goto("https://www.facebook.com", wait_until="domcontentloaded")
        print("=" * 60)
        print("🔐 ESPERA: Loguéate en Facebook")
        print("=" * 60)
        input(">>> Presiona ENTER cuando estés logueado...")
        
        success_count = 0
        fail_count = 0
        
        for n, album_url in enumerate(albums, 1):
            # Extract album ID from URL
            from urllib.parse import urlparse, parse_qs
            import re
            q = parse_qs(urlparse(album_url).query)
            s = (q.get("set") or [None])[0]
            aid = None
            if s:
                m = re.search(r"\\ba\\.(\\d+)\\b", s)
                aid = m.group(1) if m else None
            
            if not aid:
                aid = f"album_{n:03d}"
            
            # Skip if we already have metadata
            if aid in album_metadata and album_metadata[aid].get('date'):
                print(f"[{n}/{len(albums)}] ✓ {aid} - Ya tiene fecha: {album_metadata[aid]['date']}")
                success_count += 1
                continue
            
            print(f"\\n[{n}/{len(albums)}] Álbum: {aid}")
            
            try:
                await page.goto(album_url, wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(2000)
            except PWTimeoutError:
                print("⏱️ Timeout. Skip.")
                fail_count += 1
                continue
            except Exception as e:
                print(f"❌ Error: {e}")
                fail_count += 1
                continue
            
            # Extract date
            album_date = await extract_album_date(page)
            if album_date:
                print(f"📅 Fecha extraída: {album_date}")
                album_metadata[aid] = {
                    "date": album_date,
                    "url": album_url
                }
                success_count += 1
            else:
                print(f"⚠️ No se pudo extraer fecha")
                fail_count += 1
        
        await browser.close()
        
        # Save metadata
        try:
            with open(METADATA_JSON, "w") as f:
                json.dump(album_metadata, f, indent=2)
            print(f"\\n💾 Guardados metadatos de {len(album_metadata)} álbumes en {METADATA_JSON}")
            print(f"✅ Éxito: {success_count} | ⚠️ Fallos: {fail_count}")
        except Exception as e:
            print(f"❌ Error guardando metadata: {e}")

if __name__ == "__main__":
    asyncio.run(main())
