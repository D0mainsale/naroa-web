#!/usr/bin/env python3
"""
Bandcamp public-email extractor using Playwright (resumable, anti-bot).

- Uses a real browser engine (Chromium) to bypass 403 Forbidden checks.
- Reads URLs from `artist_urls.txt`.
- Saves results to `bandcamp_emails.csv`.
- Maintains progress in `progress.json`.
"""

import csv
import json
import re
import time
import random
from pathlib import Path
from typing import List, Set
from playwright.sync_api import sync_playwright, Page

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
URLS_FILE = BASE_DIR / "artist_urls.txt"
CSV_FILE = BASE_DIR / "bandcamp_emails.csv"
PROGRESS_FILE = BASE_DIR / "progress.json"

# Regex for finding emails in text
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Delay between requests (seconds)
DELAY_MIN = 3.0
DELAY_MAX = 7.0

# ----------------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------------
def load_urls() -> List[str]:
    """Read URLs from the plain-text file, ignoring blanks/comments."""
    if not URLS_FILE.is_file():
        print(f"❌ Error: {URLS_FILE} not found.")
        return []
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

def append_to_csv(rows: List[dict]):
    """Append rows to the CSV, creating header if file does not exist."""
    file_exists = CSV_FILE.is_file()
    with CSV_FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["artist_url", "email"])
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)

def extract_emails(page: Page) -> Set[str]:
    """Extract visible emails from the rendered page."""
    found_emails = set()

    # 1. Check 'mailto:' links
    try:
        mailto_links = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a[href^="mailto:"]'))
                        .map(a => a.href.replace('mailto:', '').split('?')[0]);
        }""")
        for email in mailto_links:
            if email:
                found_emails.add(email.strip().lower())
    except Exception as e:
        print(f"   ⚠️ Error checking mailto links: {e}")

    # 2. Check full visible text content
    try:
        page_text = page.inner_text("body")
        matches = EMAIL_REGEX.findall(page_text)
        for match in matches:
            found_emails.add(match.strip().lower())
    except Exception as e:
        print(f"   ⚠️ Error checking text content: {e}")

    return found_emails

# ----------------------------------------------------------------------
# Main execution
# ----------------------------------------------------------------------
def main():
    urls = load_urls()
    if not urls:
        return

    start_idx = load_progress()
    if start_idx >= len(urls):
        print("✅ All URLs already processed.")
        return

    print(f"🚀 Starting extraction with Playwright. Queue: {len(urls) - start_idx} URLs.")

    with sync_playwright() as p:
        # Launch browser (headless=True is faster, but False is safer for debugging/anti-bot)
        # We try headless=True first with a real user agent.
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        for idx in range(start_idx, len(urls)):
            url = urls[idx]
            print(f"Processing {idx + 1}/{len(urls)}: {url} ...", end="", flush=True)
            
            try:
                # Go to the page
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                # Small wait to ensure dynamic content loads (Bandcamp is mostly static but safe to wait)
                time.sleep(1)

                emails = extract_emails(page)
                
                if emails:
                    print(f" ✅ Found: {', '.join(emails)}")
                    rows = [{"artist_url": url, "email": email} for email in emails]
                    append_to_csv(rows)
                else:
                    print(f" ⚪ No email found.")

            except Exception as e:
                print(f" ❌ Error: {e}")
            
            # Save progress immediately
            save_progress(idx + 1)

            # Random delay to be polite
            sleep_time = random.uniform(DELAY_MIN, DELAY_MAX)
            time.sleep(sleep_time)

        browser.close()

    print("✅ Extraction run completed.")

if __name__ == "__main__":
    main()
