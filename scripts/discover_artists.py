#!/usr/bin/env python3
"""
Bandcamp Artist URL Discovery via Tag Pages.

Scrapes Bandcamp tag pages to collect artist URLs.
Target: ~10,000 unique artist URLs.
"""

import json
import re
import time
from pathlib import Path
from typing import Set

import requests
from bs4 import BeautifulSoup

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
OUTPUT_FILE = BASE_DIR / "artist_urls.txt"
PROGRESS_FILE = BASE_DIR / "discover_progress.json"

# Tags to scrape (electronic, techno, IDM, experimental, etc.)
TAGS = [
    "electronic", "techno", "idm", "ambient", "industrial",
    "experimental", "noise", "drone", "dark-ambient", "synthwave",
    "house", "minimal", "dub-techno", "electro", "breakbeat",
    "drum-and-bass", "jungle", "glitch", "downtempo", "trip-hop",
    "post-punk", "darkwave", "ebm", "coldwave", "goth",
    "witch-house", "vaporwave", "lo-fi", "chillwave", "shoegaze",
    "psych", "krautrock", "prog", "avant-garde", "musique-concrete",
    "field-recordings", "sound-art", "electroacoustic", "modular",
    "generative", "algorave", "bass-music", "dubstep", "uk-garage",
    "grime", "footwork", "juke", "hardcore", "gabber", "speedcore"
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

TARGET_COUNT = 10000
DELAY_SECONDS = 2.0  # Respectful delay between requests

# ----------------------------------------------------------------------
# Helper Functions
# ----------------------------------------------------------------------
def load_progress() -> dict:
    """Load discovery progress."""
    if PROGRESS_FILE.is_file():
        try:
            return json.loads(PROGRESS_FILE.read_text())
        except Exception:
            pass
    return {"completed_tags": [], "artists": []}

def save_progress(data: dict):
    """Save discovery progress."""
    PROGRESS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2))

def save_urls(artists: Set[str]):
    """Save artist URLs to file."""
    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        f.write("\n".join(sorted(artists)))
    print(f"💾 Saved {len(artists)} URLs to {OUTPUT_FILE.name}")

def extract_artists_from_tag(tag: str, page: int = 1) -> Set[str]:
    """Extract artist URLs from a Bandcamp tag page."""
    artists = set()
    url = f"https://bandcamp.com/tag/{tag}?page={page}"
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Find artist links in tag results
        for a in soup.select("a[href*='.bandcamp.com']"):
            href = a.get("href", "")
            # Extract base artist URL (remove album/track paths)
            match = re.match(r"(https?://[^/]+\.bandcamp\.com)", href)
            if match:
                artists.add(match.group(1))
        
        # Also check for data attributes containing URLs
        for item in soup.select("[data-band-url]"):
            band_url = item.get("data-band-url", "")
            if band_url and ".bandcamp.com" in band_url:
                artists.add(band_url.rstrip("/"))
                
    except Exception as e:
        print(f"⚠️ Error on {url}: {e}")
    
    return artists

# ----------------------------------------------------------------------
# Main Execution
# ----------------------------------------------------------------------
def main():
    progress = load_progress()
    all_artists: Set[str] = set(progress.get("artists", []))
    completed_tags = set(progress.get("completed_tags", []))
    
    print(f"🚀 Starting discovery. Current: {len(all_artists)} artists")
    print(f"🎯 Target: {TARGET_COUNT} artists")
    
    for tag in TAGS:
        if len(all_artists) >= TARGET_COUNT:
            break
            
        if tag in completed_tags:
            print(f"⏭️ Skipping completed tag: {tag}")
            continue
        
        print(f"\n📂 Scraping tag: {tag}")
        tag_artists = set()
        
        # Scrape multiple pages per tag
        for page in range(1, 21):  # Up to 20 pages per tag
            if len(all_artists) + len(tag_artists) >= TARGET_COUNT:
                break
                
            new_artists = extract_artists_from_tag(tag, page)
            
            if not new_artists:
                print(f"   Page {page}: No more results")
                break
            
            # Filter out already known artists
            unique_new = new_artists - all_artists - tag_artists
            tag_artists.update(unique_new)
            
            print(f"   Page {page}: +{len(unique_new)} new ({len(tag_artists)} from tag)")
            time.sleep(DELAY_SECONDS)
        
        # Update totals
        all_artists.update(tag_artists)
        completed_tags.add(tag)
        
        # Save checkpoint
        progress = {
            "completed_tags": list(completed_tags),
            "artists": list(all_artists)
        }
        save_progress(progress)
        save_urls(all_artists)
        
        print(f"✅ Tag '{tag}' done. Total: {len(all_artists)} artists")
    
    print(f"\n🎉 Discovery complete! Total: {len(all_artists)} unique artists")
    save_urls(all_artists)

if __name__ == "__main__":
    main()
