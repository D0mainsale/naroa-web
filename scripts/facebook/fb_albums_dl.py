#!/usr/bin/env python3
"""
Facebook Albums Downloader for Naroa's Artist Page
Downloads all photos from all albums on:
https://www.facebook.com/naroa.artista.plastica/photos_albums

Requirements:
- cookies.json with Facebook session cookies (c_user, xs, etc.)
- pip install playwright aiohttp
- python -m playwright install chromium
"""
import asyncio
import json
import os
import re
from urllib.parse import urlparse, parse_qs

import aiohttp
from playwright.async_api import async_playwright, TimeoutError as PWTimeoutError

START_URL = "https://www.facebook.com/naroa.artista.plastica/photos_albums"
COOKIES_JSON = "cookies.json"
OUT_DIR = "fb_naroa_albums"
MAX_SCROLLS_ALBUMS = 120          # scroll en la lista de álbumes
MAX_SCROLLS_PHOTOS = 400          # scroll dentro de cada álbum
SCROLL_PAUSE_SEC = 1.2
MAX_NO_NEW_ROUNDS = 12
CONCURRENCY = 12

# -------- util --------

def sanitize(s: str) -> str:
    s = re.sub(r"[^\w\-.]+", "_", s, flags=re.UNICODE)
    return s[:180] if len(s) > 180 else s

def pick_largest_from_srcset(srcset: str) -> str | None:
    if not srcset:
        return None
    parts = [p.strip() for p in srcset.split(",") if p.strip()]
    if not parts:
        return None
    return parts[-1].split(" ")[0].strip()

def looks_like_image_host(url: str) -> bool:
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return False
    return ("fbcdn" in host) or ("scontent" in host)

def album_id_from_url(url: str) -> str | None:
    # muchas URLs llevan set=a.<ALBUMID> o set=pcb.<...>
    q = parse_qs(urlparse(url).query)
    s = (q.get("set") or [None])[0]
    if not s:
        return None
    # e.g. "a.123456789012345"
    m = re.search(r"\ba\.(\d+)\b", s)
    return m.group(1) if m else None

# -------- playwright flows --------

async def load_cookies(context):
    if not os.path.exists(COOKIES_JSON):
        raise SystemExit(
            f"Falta {COOKIES_JSON}. Exporta cookies de facebook.com (logueado) y guárdalas como {COOKIES_JSON}."
        )
    with open(COOKIES_JSON, "r", encoding="utf-8") as f:
        cookies = json.load(f)
    await context.add_cookies(cookies)

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
    """
    En la vista photos_albums, Facebook suele renderizar cards con links a /media/set/?set=a.<id>...
    Aquí capturamos TODOS los href que parezcan álbumes.
    """
    collector_js = r"""() => {
        const out = [];
        const anchors = Array.from(document.querySelectorAll("a[href]"));
        for (const a of anchors) {
            const href = a.getAttribute("href") || "";
            // album links típicos:
            // /media/set/?set=a.<id>&type=3
            // /media/set/?vanity=...&set=a.<id>
            if (href.includes("/media/set/?") && href.includes("set=a.")) {
                out.push(new URL(href, location.origin).toString());
            }
        }
        return out;
    }"""
    links = await infinite_scroll_collect(
        page,
        max_scrolls=MAX_SCROLLS_ALBUMS,
        collector_js=collector_js,
        max_no_new=MAX_NO_NEW_ROUNDS,
    )
    # dedupe por album id si existe
    by_id = {}
    for u in links:
        aid = album_id_from_url(u) or u
        by_id[aid] = u
    return list(by_id.values())

async def collect_photo_urls_in_album(page):
    """
    Dentro del álbum, cogemos imágenes grandes preferentemente por srcset (última entrada),
    filtrando a hosts de imágenes reales (scontent/fbcdn).
    """
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
    raw = await infinite_scroll_collect(
        page,
        max_scrolls=MAX_SCROLLS_PHOTOS,
        collector_js=collector_js,
        max_no_new=MAX_NO_NEW_ROUNDS,
    )
    # filtra basura
    urls = []
    for u in raw:
        if u and u.startswith("http") and looks_like_image_host(u):
            urls.append(u)
    # dedupe preservando orden
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out

# -------- downloader --------

async def download_urls(urls: list[str], folder: str):
    os.makedirs(folder, exist_ok=True)
    sem = asyncio.Semaphore(CONCURRENCY)

    async def fetch(session, url, idx):
        async with sem:
            try:
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
                elif "jpeg" in ct or "jpg" in ct:
                    ext = ".jpg"

                base = urlparse(url).path.split("/")[-1] or "img"
                name = sanitize(f"{idx:06d}_{base}") + ext
                path = os.path.join(folder, name)
                with open(path, "wb") as f:
                    f.write(data)
                return (url, True, path)
            except Exception as e:
                return (url, False, repr(e))

    async with aiohttp.ClientSession(headers={"User-Agent": "Mozilla/5.0"}) as session:
        res = await asyncio.gather(*(fetch(session, u, i) for i, u in enumerate(urls, 1)))

    ok = [x for x in res if x[1]]
    bad = [x for x in res if not x[1]]
    return ok, bad

# -------- main --------

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # pon False si FB te bloquea headless
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        await load_cookies(context)

        page = await context.new_page()
        await page.goto(START_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(2500)

        print("[1/3] Recolectando links de álbumes…")
        albums = await collect_album_links(page)
        print(f"Álbumes encontrados: {len(albums)}")

        if not albums:
            print("Cero álbumes. Diagnóstico: cookies inválidas / no logueado / markup cambió / FB te capó.")
            await browser.close()
            return

        all_total = 0
        for n, album_url in enumerate(albums, 1):
            aid = album_id_from_url(album_url) or f"album_{n:03d}"
            album_folder = os.path.join(OUT_DIR, sanitize(aid))

            print(f"\n[2/3] ({n}/{len(albums)}) Álbum: {aid}")
            try:
                await page.goto(album_url, wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)
            except PWTimeoutError:
                print("Timeout abriendo álbum. Skip.")
                continue

            photo_urls = await collect_photo_urls_in_album(page)
            print(f"Fotos (URLs) detectadas: {len(photo_urls)}")
            if not photo_urls:
                print("0 URLs: FB te está sirviendo vista limitada / necesitas headless=False / login wall.")
                continue

            print("[3/3] Descargando…")
            ok, bad = await download_urls(photo_urls, album_folder)
            all_total += len(ok)
            print(f"OK: {len(ok)} | FAIL: {len(bad)} | Guardado en: {album_folder}")
            if bad:
                print("Fallos (muestra):")
                for u, _, err in bad[:8]:
                    print(" -", u, "=>", err)

        await browser.close()
        print(f"\nTOTAL descargadas: {all_total} (en {OUT_DIR})")

if __name__ == "__main__":
    asyncio.run(main())
