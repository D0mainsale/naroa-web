#!/usr/bin/env python3
"""
Bandcamp parallel email extractor using multiprocessing.
Each worker spawns its own browser instance.
"""

import csv
import json
import re
import time
import random
import multiprocessing as mp
from pathlib import Path
from typing import List, Set
from playwright.sync_api import sync_playwright

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
URLS_FILE = BASE_DIR / "artist_urls_1000.txt"
CSV_FILE = BASE_DIR / "bandcamp_emails_parallel.csv"
PROGRESS_FILE = BASE_DIR / "progress_parallel.json"
LOCK_FILE = BASE_DIR / ".lock"

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

NUM_WORKERS = 10
DELAY_MIN = 2.0
DELAY_MAX = 4.0

# ----------------------------------------------------------------------
# File-based locking for multiprocessing
# ----------------------------------------------------------------------
def load_urls() -> List[str]:
    if not URLS_FILE.is_file():
        return []
    with URLS_FILE.open("r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]

def load_progress() -> Set[str]:
    if not PROGRESS_FILE.is_file():
        return set()
    try:
        return set(json.loads(PROGRESS_FILE.read_text()).get("processed", []))
    except:
        return set()

def worker_process(worker_id: int, urls: List[str], result_queue: mp.Queue):
    """Each worker has its own browser instance."""
    results = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()
        
        for i, url in enumerate(urls):
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=25000)
                time.sleep(0.3)
                
                # Extract emails
                emails = set()
                
                # Check mailto links
                try:
                    mailto = page.evaluate("""() => 
                        Array.from(document.querySelectorAll('a[href^="mailto:"]'))
                        .map(a => a.href.replace('mailto:', '').split('?')[0])
                    """)
                    emails.update(e.strip().lower() for e in mailto if e)
                except:
                    pass
                
                # Check body text
                try:
                    text = page.inner_text("body")
                    emails.update(e.strip().lower() for e in EMAIL_REGEX.findall(text))
                except:
                    pass
                
                if emails:
                    print(f"[W{worker_id}] ✅ {url} -> {len(emails)} email(s)")
                    for email in emails:
                        results.append({"artist_url": url, "email": email})
                else:
                    print(f"[W{worker_id}] ⚪ {i+1}/{len(urls)}")
                    
            except Exception as e:
                print(f"[W{worker_id}] ❌ {url[:40]}... {str(e)[:30]}")
            
            time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))
        
        browser.close()
    
    result_queue.put((worker_id, urls, results))

def main():
    urls = load_urls()
    processed = load_progress()
    remaining = [u for u in urls if u not in processed]
    
    if not remaining:
        print("✅ All URLs already processed.")
        return
    
    print(f"🚀 Launching {NUM_WORKERS} workers for {len(remaining)} URLs...")
    
    # Split URLs across workers
    chunk_size = max(1, len(remaining) // NUM_WORKERS)
    chunks = [remaining[i:i + chunk_size] for i in range(0, len(remaining), chunk_size)]
    
    result_queue = mp.Queue()
    processes = []
    
    for i, chunk in enumerate(chunks[:NUM_WORKERS]):
        if chunk:
            p = mp.Process(target=worker_process, args=(i, chunk, result_queue))
            processes.append(p)
            p.start()
            time.sleep(0.5)  # Stagger browser launches
    
    # Collect results
    all_results = []
    all_processed = set(processed)
    
    for _ in processes:
        worker_id, urls_done, results = result_queue.get()
        all_results.extend(results)
        all_processed.update(urls_done)
        print(f"[W{worker_id}] Done - {len(results)} emails found")
    
    for p in processes:
        p.join()
    
    # Write results
    if all_results:
        file_exists = CSV_FILE.is_file()
        with CSV_FILE.open("a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["artist_url", "email"])
            if not file_exists:
                writer.writeheader()
            writer.writerows(all_results)
    
    # Save progress
    PROGRESS_FILE.write_text(json.dumps({"processed": list(all_processed)}))
    
    print(f"\n✅ Complete! Total emails: {len(all_results)}, Total processed: {len(all_processed)}")

if __name__ == "__main__":
    main()
