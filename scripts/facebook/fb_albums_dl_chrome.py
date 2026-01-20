#!/usr/bin/env python3
"""
Facebook Albums Downloader - USA TU CHROME REAL
Usa tu perfil de Chrome existente con la sesión de Facebook ya logueada.

⚠️  IMPORTANTE: Cierra Chrome antes de ejecutar este script
"""
import asyncio
import json
import os
import re
from urllib.parse import urlparse, parse_qs
from pathlib import Path

import aiohttp
from playwright.async_api import async_playwright, TimeoutError as PWTimeoutError

# PATHS
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
ALBUMS_JSON = DATA_DIR / "facebook-albums.json"
OUT_DIR = BASE_DIR / "images" / "raw_albums"

# CONFIG
START_URL = "https://www.facebook.com/naroa.artista.plastica/photos_albums"
MAX_SCROLLS_ALBUMS = 120
MAX_SCROLLS_PHOTOS = 10
SCROLL_PAUSE_SEC = 0.4
MAX_NO_NEW_ROUNDS = 3
CONCURRENCY = 40
MAX_PHOTOS_PER_ALBUM = 6

# Tu perfil de Chrome en macOS
CHROME_USER_DATA = os.path.expanduser("~/Library/Application Support/Google/Chrome")
CHROME_EXECUTABLE = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

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
        async with sem:
            try:
                # Pre-check existence if possible? Hard without exact name.
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
    print("=" * 60)
    print("⚠️  CIERRA Chrome completamente antes de continuar")
    print("=" * 60)
    input(">>> Presiona ENTER cuando Chrome esté cerrado...")
    
    async with async_playwright() as p:
        # Lanzar Chrome real con tu perfil
        browser = await p.chromium.launch_persistent_context(
            user_data_dir=CHROME_USER_DATA,
            executable_path=CHROME_EXECUTABLE,
            headless=False,
            channel="chrome",
            viewport={"width": 1400, "height": 900},
            args=["--profile-directory=Default"]
        )
        
        page = browser.pages[0] if browser.pages else await browser.new_page()
        
        print("\n🚀 Navegando a la página de álbumes...")
        await page.goto(START_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)

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
            print("\n[1/3] Recolectando links de álbumes (online)...")
            await page.goto(START_URL, wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)
            albums = await collect_album_links(page)
            print(f"Álbumes encontrados: {len(albums)}")

        if not albums:
            print("❌ Cero álbumes. Verifica que estás logueado en Facebook.")
            await browser.close()
            return

        all_total = 0
        for n, album_url in enumerate(albums, 1):
            aid = album_id_from_url(album_url) or f"album_{n:03d}"
            album_folder = OUT_DIR / sanitize(aid)

            print(f"\n[2/3] ({n}/{len(albums)}) Álbum: {aid}")
            try:
                await page.goto(album_url, wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)
            except PWTimeoutError:
                print("Timeout. Skip.")
                continue

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

        await browser.close()
        print(f"\n✅ TOTAL: {all_total} nuevos guardados en {OUT_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
