#!/usr/bin/env python3
"""Discogs Email Scraper – Parallel (10 workers)

Extracts artist names from Bandcamp URLs, searches Discogs, and scrapes emails.
"""

import argparse
import csv
import json
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import List, Set, Tuple
from urllib.parse import quote

import requests

# ─────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────
EMAIL_REGEX = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", re.I)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
SCRIPT_DIR = Path(__file__).parent

DEFAULT_WORKERS = 10
DEFAULT_INPUT = SCRIPT_DIR / "artist_urls.csv"
DEFAULT_OUTPUT = SCRIPT_DIR / "discogs_emails.csv"
PROGRESS_FILE = SCRIPT_DIR / "progress_discogs.json"

print_lock = threading.Lock()


def safe_print(msg: str):
    with print_lock:
        print(msg, flush=True)


def clean_email(raw: str) -> str:
    email = raw.strip().lower()
    email = re.sub(r"^mailto:\s*", "", email)
    email = email.split("?")[0].split("#")[0]
    email = re.sub(r"[<>;,'\"\[\]()]", "", email)
    
    if "@" not in email:
        return ""
    local, domain = email.rsplit("@", 1)
    if "." not in domain:
        return ""
    
    # Filter false positives
    false_patterns = [
        r"@2x\.", r"\.png$", r"\.jpg$", r"\.gif$", r"\.svg$", r"\.webp$",
        r"dummy_", r"placeholder", r"example\.com", r"domain\.com",
        r"email@", r"sentry", r"cloudflare", r"discogs\.com",
        r"zendesk", r"helpdesk", r"support@discogs", r"noreply",
    ]
    for pattern in false_patterns:
        if re.search(pattern, email, re.I):
            return ""
    
    tld = domain.split(".")[-1]
    if len(tld) < 2 or not tld.isalpha():
        return ""
    
    return email


def extract_artist_name(bandcamp_url: str) -> str:
    """Extract artist name from Bandcamp URL"""
    match = re.search(r"https?://([^.]+)\.bandcamp\.com", bandcamp_url)
    if match:
        name = match.group(1).replace("-", " ").strip()
        return name
    return ""


def search_discogs_artist(artist_name: str) -> str:
    """Search Discogs for an artist and return their page URL."""
    search_url = f"https://www.discogs.com/search/?q={quote(artist_name)}&type=artist"
    try:
        resp = requests.get(search_url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        
        # Look for artist link in search results
        # Pattern: /artist/123456-Artist-Name
        match = re.search(r'href="(/artist/\d+-[^"]+)"', resp.text)
        if match:
            return f"https://www.discogs.com{match.group(1)}"
    except Exception:
        pass
    return ""


def get_discogs_emails(artist_url: str) -> Set[str]:
    """Fetch Discogs artist page and extract emails."""
    emails: Set[str] = set()
    
    try:
        resp = requests.get(artist_url, headers=HEADERS, timeout=20)
        if resp.status_code == 404:
            return set()
        resp.raise_for_status()
        content = resp.text
        
        # Search for emails in the page
        for match in EMAIL_REGEX.findall(content):
            email = clean_email(match)
            if email:
                emails.add(email)
        
        # Also check for external links that might lead to contact pages
        # Look for profile links section
        site_matches = re.findall(r'href="(https?://(?!discogs)[^"]+)"', content)
        for site_url in site_matches[:5]:  # Check first 5 external links
            if any(x in site_url.lower() for x in ['facebook', 'twitter', 'instagram', 'youtube', 'soundcloud']):
                continue  # Skip social media
            try:
                site_resp = requests.get(site_url, headers=HEADERS, timeout=10)
                if site_resp.status_code == 200:
                    for match in EMAIL_REGEX.findall(site_resp.text):
                        email = clean_email(match)
                        if email:
                            emails.add(email)
            except:
                pass
                
    except Exception as e:
        safe_print(f"❌ {artist_url}: {e}")
    
    return emails


def load_urls(path: Path) -> List[str]:
    urls = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        first = next(reader, None)
        if first and not first[0].startswith("http"):
            pass
        else:
            if first:
                urls.append(first[0].strip())
        for row in reader:
            if row and row[0].strip():
                urls.append(row[0].strip())
    return urls


def load_progress() -> set:
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            data = json.load(f)
            return set(data.get("processed", []))
    return set()


def save_progress(done: set):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump({"processed": list(done)}, f)


def scrape_one(bandcamp_url: str) -> List[Tuple[str, str, str]]:
    """Returns list of (bandcamp_url, discogs_url, email)"""
    artist_name = extract_artist_name(bandcamp_url)
    if not artist_name:
        return []
    
    # Search Discogs for artist
    discogs_url = search_discogs_artist(artist_name)
    if not discogs_url:
        return []
    
    # Get emails from Discogs page
    emails = get_discogs_emails(discogs_url)
    return [(bandcamp_url, discogs_url, e) for e in sorted(emails)]


def main():
    parser = argparse.ArgumentParser(description="Discogs email scraper")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    if not args.input.exists():
        safe_print(f"⚠️ Input file not found: {args.input}")
        return

    urls = load_urls(args.input)
    safe_print(f"📋 Loaded {len(urls)} Bandcamp URLs")

    processed = set() if args.reset else load_progress()
    remaining = [u for u in urls if u not in processed]

    if not remaining:
        safe_print("✅ All URLs already processed. Use --reset to re-run.")
        return

    safe_print(f"🚀 Searching Discogs for {len(remaining)} artists with {args.workers} workers…")

    # Ensure output has header
    if not args.output.exists() or args.output.stat().st_size == 0:
        with open(args.output, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(["bandcamp_url", "discogs_url", "email"])

    done_count = len(processed)
    total = len(urls)
    emails_found = 0

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(scrape_one, url): url for url in remaining}
        for future in as_completed(futures):
            url = futures[future]
            results = future.result()
            done_count += 1
            
            if results:
                with open(args.output, "a", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f)
                    for row in results:
                        writer.writerow(row)
                emails_found += len(results)
                safe_print(f"[{done_count}/{total}] ✅ {extract_artist_name(url)} → {len(results)} email(s)")
            else:
                safe_print(f"[{done_count}/{total}] 🔸 {extract_artist_name(url)} → 0")
            
            processed.add(url)
            save_progress(processed)
            
            # Polite delay
            time.sleep(0.3)

    safe_print(f"\n🎉 Done! {emails_found} emails saved to {args.output}")


if __name__ == "__main__":
    main()
