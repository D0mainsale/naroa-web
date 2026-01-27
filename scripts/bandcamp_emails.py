#!/usr/bin/env python3
"""
Bandcamp public-email extractor (resumable, rate-limited).

- Reads URLs from `artist_urls.txt` (one per line).
- Respects 1.5s delay between requests.
- Saves results to `bandcamp_emails.csv`.
- Maintains progress in `progress.json` for resumability.
"""

import csv
import json
import re
import time
from pathlib import Path
from typing import List

import requests
from bs4 import BeautifulSoup

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
URLS_FILE = BASE_DIR / "artist_urls.txt"
CSV_FILE = BASE_DIR / "bandcamp_emails.csv"
PROGRESS_FILE = BASE_DIR / "progress.json"

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
}

DELAY_SECONDS = 3.0  # Increased delay to be more polite
BATCH_SIZE = 25
MAX_RETRIES = 2

# ----------------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------------
def load_urls() -> List[str]:
    """Read URLs from the plain-text file, ignoring blanks/comments."""
    if not URLS_FILE.is_file():
        raise FileNotFoundError(f"Missing {URLS_FILE}")
    with URLS_FILE.open("r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]

def load_progress() -> int:
    """Return the index of the last processed URL (0-based)."""
    if not PROGRESS_FILE.is_file():
        return 0
    try:
        data = json.loads(PROGRESS_FILE.read_text())
        return int(data.get("last_index", 0))
    except Exception:
        return 0

def save_progress(idx: int):
    """Persist the last processed index."""
    PROGRESS_FILE.write_text(json.dumps({"last_index": idx}, ensure_ascii=False))

def extract_emails(soup: BeautifulSoup) -> List[str]:
    """Return a list of unique public emails found on the page."""
    emails = set()

    # 1. mailto: links (publicly visible contact)
    for a in soup.select('a[href^="mailto:"]'):
        mail = a.get("href", "").replace("mailto:", "").split("?")[0]
        if mail:
            emails.add(mail.strip().lower())

    # 2. Plain-text emails in visible text
    for txt in soup.stripped_strings:
        for match in EMAIL_REGEX.findall(txt):
            emails.add(match.strip().lower())

    return list(emails)

def write_csv(rows: List[dict]):
    """Append rows to the CSV, creating header if file does not exist."""
    file_exists = CSV_FILE.is_file()
    with CSV_FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["artist_url", "email"])
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)

# ----------------------------------------------------------------------
# Main execution
# ----------------------------------------------------------------------
def fetch_with_retry(session: requests.Session, url: str) -> BeautifulSoup | None:
    """Fetch URL with retry logic and exponential backoff."""
    import random
    
    for attempt in range(MAX_RETRIES + 1):
        try:
            # Add random jitter to delay
            jitter = random.uniform(0.5, 2.0)
            if attempt > 0:
                backoff = (2 ** attempt) + jitter
                print(f"   ↻ Retry {attempt}/{MAX_RETRIES} after {backoff:.1f}s...")
                time.sleep(backoff)
            
            resp = session.get(url, headers=HEADERS, timeout=20)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")
            
        except requests.exceptions.HTTPError as e:
            if resp.status_code == 403 and attempt < MAX_RETRIES:
                continue  # Retry on 403
            raise
        except requests.exceptions.RequestException as e:
            if attempt < MAX_RETRIES:
                continue
            raise
    
    return None

def main():
    import random
    
    urls = load_urls()
    start_idx = load_progress()

    if start_idx >= len(urls):
        print("✅ All URLs already processed.")
        return

    print(f"🚀 Starting at index {start_idx} of {len(urls)} URLs…")
    batch = []
    
    # Use persistent session for cookies
    session = requests.Session()
    session.headers.update(HEADERS)

    for idx in range(start_idx, len(urls)):
        url = urls[idx]
        try:
            soup = fetch_with_retry(session, url)
            if soup:
                emails = extract_emails(soup)
                
                if emails:
                    print(f"✉️  Found {len(emails)} email(s) on {url}")
                    for email in emails:
                        batch.append({"artist_url": url, "email": email})
                else:
                    print(f"   {idx+1}/{len(urls)}: {url} - no email")

            # Progress checkpoint
            if (idx + 1) % BATCH_SIZE == 0 or idx == len(urls) - 1:
                if batch:
                    write_csv(batch)
                    batch.clear()
                save_progress(idx + 1)
                print(f"🔹 Checkpoint: {idx + 1}/{len(urls)} processed.")

        except Exception as e:
            print(f"⚠️ Error on {url}: {e}")

        # Random delay to appear more human
        delay = DELAY_SECONDS + random.uniform(0.5, 2.5)
        time.sleep(delay)

    print("✅ Extraction completed.")
    save_progress(len(urls))

if __name__ == "__main__":
    main()
