#!/usr/bin/env python3
"""
Facebook Albums Downloader - MODO MANUAL (sin cookies.json)
Abre navegador visible para que te loguees tú mismo.
"""
import asyncio
import json
import os
import re
import sys
from urllib.parse import urlparse, parse_qs
from pathlib import Path

import aiohttp
from playwright.async_api import async_playwright, TimeoutError as PWTimeoutError

# PATHS
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
ALBUMS_JSON = DATA_DIR / "facebook-albums.json"
METADATA_JSON = DATA_DIR / "album-metadata.json"
OUT_DIR = BASE_DIR / "images" / "raw_albums"

START_URL = "https://www.facebook.com/naroa.artista.plastica/photos_albums"
MAX_SCROLLS_ALBUMS = 120
MAX_SCROLLS_PHOTOS = 15  # Increased for more photos
SCROLL_PAUSE_SEC = 0.4
MAX_NO_NEW_ROUNDS = 3
CONCURRENCY = 40
MAX_PHOTOS_PER_ALBUM = 2  # Solo 2 fotos por álbum
SKIP_EXISTING_ALBUMS = True  # Skip albums already downloaded

def sanitize(s: str) -> str:
    s = re.sub(r"[^\w\-.]+", "_", s, flags=re.UNICODE)
    return s[:180] if len(s) > 180 else s

def looks_like_image_host(url: str) -> bool:
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return False
    return ("fbcdn" in host) or ("scontent" in host)

def album_id_from_url(url: str) -> str | None:
    q = parse_qs(urlparse(url).query)
    s = (q.get("set") or [None])[0]
    if not s:
        return None
    m = re.search(r"\ba\.(\d+)\b", s)
    return m.group(1) if m else None

async def infinite_scroll_collect(page, max_scrolls: int, collector_js: str, max_no_new: int):
    seen = set()
    no_new = 0
    for _ in range(max_scrolls):
        batch = await page.evaluate(collector_js)
        before = len(seen)
        for x in batch:
            if x:
                seen.add(x)
        after = len(seen)
        if after == before:
            no_new += 1
        else:
            no_new = 0
        if no_new >= max_no_new:
            break
        await page.mouse.wheel(0, 2600)
        await page.wait_for_timeout(int(SCROLL_PAUSE_SEC * 1000))
    return sorted(seen)

async def collect_album_links(page):
    collector_js = r"""() => {
        const out = [];
        const anchors = Array.from(document.querySelectorAll("a[href]"));
        for (const a of anchors) {
            const href = a.getAttribute("href") || "";
            if (href.includes("/media/set/?") && href.includes("set=a.")) {
                out.push(new URL(href, location.origin).toString());
            }
        }
        return out;
    }"""
    links = await infinite_scroll_collect(page, MAX_SCROLLS_ALBUMS, collector_js, MAX_NO_NEW_ROUNDS)
    by_id = {}
    for u in links:
        aid = album_id_from_url(u) or u
        by_id[aid] = u
    return list(by_id.values())

async def extract_album_date(page):
    """
    Extract album creation date from Facebook metadata.
    Tries multiple strategies to find the date.
    """
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
            /Created\s+on\s+(\w+\s+\d{1,2},\s+\d{4})/i,
            /(\w+\s+\d{1,2},\s+\d{4})/
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
                # Convert Unix timestamp to ISO date
                from datetime import datetime
                dt = datetime.fromtimestamp(result['timestamp'])
                return dt.strftime('%Y-%m-%d')
            elif 'dateString' in result:
                # Try to parse various date formats
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

async def collect_photo_urls_in_album(page):
    collector_js = r"""() => {
        const out = [];
        document.querySelectorAll("img").forEach(img => {
            const src = img.getAttribute("src") || "";
            const srcset = img.getAttribute("srcset") || "";
            let best = "";
            if (srcset) {
                const parts = srcset.split(",").map(s => s.trim()).filter(Boolean);
                if (parts.length) best = parts[parts.length - 1].split(" ")[0];
            }
            if (!best) best = src;
            out.push(best || "");
        });
        return out;
    }"""
    raw = await infinite_scroll_collect(page, MAX_SCROLLS_PHOTOS, collector_js, MAX_NO_NEW_ROUNDS)
    urls = [u for u in raw if u and u.startswith("http") and looks_like_image_host(u)]
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out

async def download_urls(urls: list[str], folder: Path):
    folder.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(CONCURRENCY)

    async def fetch(session, url, idx):
        # Infer filename first to check existence
        base = urlparse(url).path.split("/")[-1] or "img"
        # We assume jpg unless we read headers, but for skipping we check generic pattern or ignore ext matching for now?
        # To be safe, we might need to fetch header or just check if "idx_*" exists?
        # Simpler: lets just do the request. Logic to skip strictly requires knowing the exact filename.
        # But facebook URLs usually have the ID in the name.
        
        # Optimized: Check if we have a file with this index prefix
        # This is a bit weak if URLs change order. 
        # Better: use hash of URL as filename? Or trust the order from the page?
        # Let's trust order for now but be careful.
        # Actually, let's just try to download. If we want to accept "resume", we need stable names.
        # Facebook URLs expire? No, usually static IDs.
        
        async with sem:
            try:
                # Calculate likely filename prefix to see if we can skip?
                # No, let's just download but check file size?
                # For now: standard check.
                
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=60)) as r:
                    if r.status != 200:
                        return (url, False, f"HTTP {r.status}")
                    
                    data = await r.read()
                    ct = (r.headers.get("content-type") or "").lower()

                ext = ".jpg"
                if "png" in ct:
                    ext = ".png"
                elif "webp" in ct:
                    ext = ".webp"
                
                base = urlparse(url).path.split("/")[-1] or "img"
                name = sanitize(f"{idx:06d}_{base}")
                if not name.endswith(ext):
                    name += ext
                    
                path = folder / name
                
                if path.exists() and path.stat().st_size > 0:
                    # Skip writing
                    return (url, True, f"{path} (skipped)")
                
                with open(path, "wb") as f:
                    f.write(data)
                return (url, True, str(path))
            except Exception as e:
                return (url, False, repr(e))

    async with aiohttp.ClientSession(headers={"User-Agent": "Mozilla/5.0"}) as session:
        res = await asyncio.gather(*(fetch(session, u, i) for i, u in enumerate(urls, 1)))
    ok = [x for x in res if x[1]]
    bad = [x for x in res if not x[1]]
    return ok, bad

async def main():
    async with async_playwright() as p:
        # NAVEGADOR VISIBLE - te logueas tú
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()
        
        # Ir a Facebook
        await page.goto("https://www.facebook.com", wait_until="domcontentloaded")
        
        print("=" * 60)
        print("🔐 ESPERA: Loguéate en Facebook en la ventana del navegador")
        print("   Una vez logueado, navega a la página de álbumes:")
        print(f"   {START_URL}")
        print("=" * 60)
        input(">>> Presiona ENTER cuando estés en la página de álbumes logueado...")
        
        # Tentar cargar álbumes desde JSON
        albums = []
        if ALBUMS_JSON.exists():
            print(f"📖 Leyendo álbumes de {ALBUMS_JSON}...")
            try:
                with open(ALBUMS_JSON, "r") as f:
                    data = json.load(f)
                    albums = data.get("albums", [])
                    print(f"✅ Cargados {len(albums)} álbumes del JSON local.")
            except Exception as e:
                print(f"⚠️ Error leyendo JSON: {e}")

        if not albums:
            print("\n[1/3] Recolectando links de álbumes (no encontrados en JSON)...")
            # Navegar a álbumes solo si no tenemos lista
            await page.goto(START_URL, wait_until="domcontentloaded")
            await page.wait_for_timeout(2500)
            albums = await collect_album_links(page)
            print(f"Álbumes encontrados online: {len(albums)}")
            
            # GUARDAR EL JSON ACTUALIZADO
            try:
                with open(ALBUMS_JSON, "w") as f:
                    json.dump({
                        "source": "facebook.com/naroa.artista.plastica",
                        "extracted": "2026-01-20",
                        "total_albums": len(albums),
                        "albums": albums,
                        "note": "Full list extracted manually"
                    }, f, indent=2)
                print(f"💾 Guardada lista de {len(albums)} álbumes en {ALBUMS_JSON}")
            except Exception as e:
                print(f"⚠️ Error guardando JSON: {e}")
        
        if not albums:
            print("❌ Cero álbumes. Verifica que estás logueado en Facebook.")
            await browser.close()
            return

        # Load existing metadata
        album_metadata = {}
        if METADATA_JSON.exists():
            try:
                with open(METADATA_JSON, "r") as f:
                    album_metadata = json.load(f)
                print(f"📖 Loaded metadata for {len(album_metadata)} albums")
            except Exception as e:
                print(f"⚠️ Error loading metadata: {e}")
        
        all_total = 0
        skipped_count = 0
        for n, album_url in enumerate(albums, 1):
            aid = album_id_from_url(album_url) or f"album_{n:03d}"
            # Usar ruta absoluta para evitar ambigüedad
            album_folder = OUT_DIR / sanitize(aid)

            # Skip if already downloaded
            if SKIP_EXISTING_ALBUMS and album_folder.exists():
                existing_files = list(album_folder.glob("*.jpg")) + list(album_folder.glob("*.png")) + list(album_folder.glob("*.webp"))
                if len(existing_files) >= 1:  # Consider downloaded if has at least 1 image
                    skipped_count += 1
                    print(f"⏭️  ({n}/{len(albums)}) Skip: {aid} ({len(existing_files)} imgs ya descargadas)")
                    continue

            print(f"\n[2/3] ({n}/{len(albums)}) Álbum: {aid}")
            try:
                await page.goto(album_url, wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)
            except PWTimeoutError:
                print("Timeout. Skip.")
                continue

            # Extract album date
            album_date = await extract_album_date(page)
            if album_date:
                print(f"📅 Fecha del álbum: {album_date}")
                album_metadata[aid] = {
                    "date": album_date,
                    "url": album_url
                }
            else:
                print(f"⚠️ No se pudo extraer fecha")
            
            photo_urls = await collect_photo_urls_in_album(page)
            # LIMITAR FOTOS
            if len(photo_urls) > MAX_PHOTOS_PER_ALBUM:
                photo_urls = photo_urls[:MAX_PHOTOS_PER_ALBUM]

            print(f"Fotos detectadas: {len(photo_urls)} (Limitado a {MAX_PHOTOS_PER_ALBUM})")
            if not photo_urls:
                continue

            print("[3/3] Descargando…")
            ok, bad = await download_urls(photo_urls, album_folder)
            all_total += len(ok)
            print(f"OK: {len(ok)} | FAIL: {len(bad)} | → {album_folder}")

        # Save metadata
        try:
            with open(METADATA_JSON, "w") as f:
                json.dump(album_metadata, f, indent=2)
            print(f"\n💾 Guardados metadatos de {len(album_metadata)} álbumes en {METADATA_JSON}")
        except Exception as e:
            print(f"⚠️ Error guardando metadata: {e}")
        
        await browser.close()
        print(f"\n✅ TOTAL: {all_total} nuevos guardados en {OUT_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
