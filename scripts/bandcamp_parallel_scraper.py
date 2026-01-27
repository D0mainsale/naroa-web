#!/usr/bin/env python3
"""Parallel Bandcamp Email Scraper – 10 Workers

• Reads artist URLs from a CSV (first column)
• Scrapes in parallel with a configurable thread pool
• Saves progress to resume after interruption
• Writes results to CSV (artist_url,email)
"""

import argparse
import csv
import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import List, Set, Tuple

import requests

# ─────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────
EMAIL_REGEX = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", re.I)
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; EmailScraper/1.0)"}
SCRIPT_DIR = Path(__file__).parent

DEFAULT_WORKERS = 10
DEFAULT_INPUT = SCRIPT_DIR / "artist_urls.csv"
DEFAULT_OUTPUT = SCRIPT_DIR / "all_bandcamp_emails.csv"
PROGRESS_FILE = SCRIPT_DIR / "progress_parallel.json"

# Thread‑safe print lock
print_lock = threading.Lock()

# ─────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────

def safe_print(msg: str):
    with print_lock:
        print(msg, flush=True)


def clean_email(raw: str) -> str:
    email = raw.strip().lower()
    email = re.sub(r"^mailto:\s*", "", email)
    email = email.split("?")[0].split("#")[0]
    email = re.sub(r"[<>;,'\"\[\]()]", "", email)
    return email


def get_emails(url: str) -> Set[str]:
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    content = resp.text
    emails: Set[str] = set()

    # mailto links
    for m in re.finditer(r'href=["\']mailto:([^"\']+)["\']', content, re.I):
        e = clean_email(m.group(1))
        if e:
            emails.add(e)

    # Plain text emails
    for m in EMAIL_REGEX.findall(content):
        e = clean_email(m)
        if e:
            emails.add(e)

    return emails


def load_urls(path: Path) -> List[str]:
    urls = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        first = next(reader, None)
        # skip header if it looks like one
        if first and not first[0].startswith("http"):
            pass
        else:
            if first:
                urls.append(first[0].strip())
        for row in reader:
            if row and row[0].strip().startswith("http"):
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


def append_results(results: List[Tuple[str, str]], output: Path):
    with open(output, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for row in results:
            writer.writerow(row)


def scrape_one(url: str) -> List[Tuple[str, str]]:
    try:
        emails = get_emails(url)
        return [(url, e) for e in sorted(emails)]
    except Exception as exc:
        safe_print(f"❌ {url}: {exc}")
        return []


# ─────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Parallel Bandcamp email scraper")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help="Input CSV")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output CSV")
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS, help="Thread count")
    parser.add_argument("--reset", action="store_true", help="Ignore previous progress")
    args = parser.parse_args()

    if not args.input.exists():
        safe_print(f"⚠️ Input file not found: {args.input}")
        sys.exit(1)

    urls = load_urls(args.input)
    safe_print(f"📋 Loaded {len(urls)} artist URLs from {args.input}")

    processed = set() if args.reset else load_progress()
    remaining = [u for u in urls if u not in processed]

    if not remaining:
        safe_print("✅ All URLs already processed. Use --reset to re‑run.")
        return

    safe_print(f"🚀 Scraping {len(remaining)} URLs with {args.workers} workers…")

    # Ensure output has header
    if not args.output.exists() or args.output.stat().st_size == 0:
        with open(args.output, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(["artist_url", "email"])

    done_count = len(processed)
    total = len(urls)

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(scrape_one, url): url for url in remaining}
        for future in as_completed(futures):
            url = futures[future]
            results = future.result()
            done_count += 1
            if results:
                append_results(results, args.output)
                safe_print(f"[{done_count}/{total}] ✅ {url} → {len(results)} email(s)")
            else:
                safe_print(f"[{done_count}/{total}] 🔸 {url} → 0 emails")
            processed.add(url)
            save_progress(processed)

    safe_print(f"\n🎉 Done! Results saved to {args.output}")


if __name__ == "__main__":
    main()
