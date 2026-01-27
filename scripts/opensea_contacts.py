#!/usr/bin/env python3
"""
OpenSea Public Profile Contact Extractor
=========================================
Extracts PUBLICLY AVAILABLE contact information from OpenSea profiles.
Only collects data that users have voluntarily shared on their profiles.

Usage:
    python3 opensea_contacts.py                    # Interactive mode
    python3 opensea_contacts.py --input users.txt  # From file (one username/address per line)
    python3 opensea_contacts.py --collection slug  # All owners of a collection
    
Requirements:
    pip install requests beautifulsoup4

Note: You need an OpenSea API key. Get one at https://opensea.io/account/settings/developer
"""

import requests
import csv
import time
import re
import argparse
import json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from bs4 import BeautifulSoup

# ============================================================================
# CONFIGURATION
# ============================================================================

# OpenSea API Key - Get yours at https://opensea.io/account/settings/developer
OPENSEA_API_KEY = ""  # <-- PUT YOUR API KEY HERE

# Rate limiting (requests per second)
RATE_LIMIT_DELAY = 0.5

# Output settings
OUTPUT_DIR = Path(__file__).parent / "data"
OUTPUT_FILE = OUTPUT_DIR / f"opensea_contacts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

# ============================================================================
# API FUNCTIONS
# ============================================================================

def get_api_headers():
    """Get headers for OpenSea API requests."""
    headers = {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    if OPENSEA_API_KEY:
        headers["X-API-KEY"] = OPENSEA_API_KEY
    return headers


def get_user_profile(address_or_username: str) -> dict:
    """
    Fetch public profile data from OpenSea API.
    
    Args:
        address_or_username: Ethereum address (0x...) or OpenSea username
        
    Returns:
        dict with profile data or empty dict on error
    """
    url = f"https://api.opensea.io/api/v2/accounts/{address_or_username}"
    
    try:
        response = requests.get(url, headers=get_api_headers(), timeout=30)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            print(f"  ⚠️  Profile not found: {address_or_username}")
            return {}
        elif response.status_code == 429:
            print(f"  ⏳ Rate limited, waiting 60s...")
            time.sleep(60)
            return get_user_profile(address_or_username)
        else:
            print(f"  ❌ API error {response.status_code}: {response.text[:100]}")
            return {}
            
    except requests.RequestException as e:
        print(f"  ❌ Request error: {e}")
        return {}


def get_collection_owners(collection_slug: str, limit: int = 100) -> list:
    """
    Get list of NFT owners from a collection.
    
    Args:
        collection_slug: OpenSea collection slug (e.g., 'boredapeyachtclub')
        limit: Maximum number of owners to fetch
        
    Returns:
        List of owner addresses
    """
    owners = set()
    url = f"https://api.opensea.io/api/v2/collection/{collection_slug}/nfts"
    params = {"limit": 50}
    
    print(f"\n📦 Fetching owners from collection: {collection_slug}")
    
    try:
        while len(owners) < limit:
            response = requests.get(url, headers=get_api_headers(), params=params, timeout=30)
            
            if response.status_code != 200:
                print(f"  ❌ Error fetching collection: {response.status_code}")
                break
                
            data = response.json()
            nfts = data.get("nfts", [])
            
            if not nfts:
                break
                
            for nft in nfts:
                # Get current owner
                owners_list = nft.get("owners", [])
                for owner in owners_list:
                    if owner.get("address"):
                        owners.add(owner["address"])
                        
            # Check for pagination
            next_cursor = data.get("next")
            if not next_cursor:
                break
            params["cursor"] = next_cursor
            
            print(f"  Found {len(owners)} unique owners so far...")
            time.sleep(RATE_LIMIT_DELAY)
            
    except requests.RequestException as e:
        print(f"  ❌ Request error: {e}")
        
    return list(owners)[:limit]


# ============================================================================
# CONTACT EXTRACTION
# ============================================================================

def extract_contacts_from_profile(profile: dict) -> dict:
    """
    Extract publicly available contact information from profile data.
    
    Args:
        profile: OpenSea API profile response
        
    Returns:
        dict with extracted contact information
    """
    contacts = {
        "username": profile.get("username", ""),
        "address": profile.get("address", ""),
        "bio": profile.get("bio", ""),
        "twitter": "",
        "instagram": "",
        "website": "",
        "discord": "",
        "email": "",
        "other_links": []
    }
    
    # Extract social media accounts
    social_accounts = profile.get("social_media_accounts", [])
    for account in social_accounts:
        platform = account.get("platform", "").lower()
        username = account.get("username", "")
        
        if platform in ["x", "twitter"]:
            contacts["twitter"] = f"https://twitter.com/{username}"
        elif platform == "instagram":
            contacts["instagram"] = f"https://instagram.com/{username}"
        elif platform == "discord":
            contacts["discord"] = username
            
    # Extract website
    website = profile.get("website", "")
    if website:
        contacts["website"] = website
        
    # Try to extract email from bio
    bio = profile.get("bio", "") or ""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, bio)
    if emails:
        contacts["email"] = emails[0]
        
    return contacts


def extract_email_from_website(website_url: str) -> str:
    """
    Try to extract a public email from a website.
    Only scrapes the main page and contact page.
    
    Args:
        website_url: URL of the website
        
    Returns:
        Email address if found, empty string otherwise
    """
    if not website_url:
        return ""
        
    # Ensure URL has scheme
    if not website_url.startswith("http"):
        website_url = f"https://{website_url}"
        
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    urls_to_check = [
        website_url,
        f"{website_url}/contact",
        f"{website_url}/about",
    ]
    
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    
    for url in urls_to_check:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                # Look for mailto: links first
                soup = BeautifulSoup(response.text, 'html.parser')
                mailto_links = soup.find_all('a', href=re.compile(r'^mailto:'))
                for link in mailto_links:
                    email = link['href'].replace('mailto:', '').split('?')[0]
                    if email and '@' in email:
                        return email
                        
                # Then search in text
                emails = re.findall(email_pattern, response.text)
                # Filter out common false positives
                for email in emails:
                    if not any(fp in email.lower() for fp in ['example.com', 'domain.com', 'email.com', 'test.']):
                        return email
                        
        except requests.RequestException:
            pass
            
    return ""


# ============================================================================
# MAIN PROCESSING
# ============================================================================

def process_users(users: list, extract_website_emails: bool = True) -> list:
    """
    Process a list of users and extract their public contact information.
    
    Args:
        users: List of usernames or addresses
        extract_website_emails: Whether to try to extract emails from linked websites
        
    Returns:
        List of contact dictionaries
    """
    results = []
    total = len(users)
    
    print(f"\n🔍 Processing {total} profiles...\n")
    
    for i, user in enumerate(users, 1):
        user = user.strip()
        if not user:
            continue
            
        print(f"[{i}/{total}] {user}")
        
        # Get profile from API
        profile = get_user_profile(user)
        if not profile:
            continue
            
        # Extract contacts
        contacts = extract_contacts_from_profile(profile)
        
        # Try to get email from website if not found
        if extract_website_emails and contacts["website"] and not contacts["email"]:
            print(f"  🌐 Checking website for contact...")
            email = extract_email_from_website(contacts["website"])
            if email:
                contacts["email"] = email
                print(f"  ✉️  Found email: {email}")
                
        # Only add if we found some contact info
        if any([contacts["twitter"], contacts["instagram"], contacts["website"], 
                contacts["email"], contacts["discord"]]):
            results.append(contacts)
            print(f"  ✅ Found contacts: Twitter={bool(contacts['twitter'])}, "
                  f"Email={bool(contacts['email'])}, Website={bool(contacts['website'])}")
        else:
            print(f"  ⚪ No public contacts found")
            
        time.sleep(RATE_LIMIT_DELAY)
        
    return results


def save_to_csv(results: list, output_file: Path):
    """Save results to CSV file."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    fieldnames = ["username", "address", "twitter", "instagram", "website", 
                  "email", "discord", "bio"]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for result in results:
            writer.writerow(result)
            
    print(f"\n💾 Saved {len(results)} contacts to {output_file}")


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Extract public contact information from OpenSea profiles"
    )
    parser.add_argument(
        "--input", "-i",
        help="Input file with usernames/addresses (one per line)"
    )
    parser.add_argument(
        "--collection", "-c",
        help="OpenSea collection slug to get owners from"
    )
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=100,
        help="Maximum number of profiles to process (default: 100)"
    )
    parser.add_argument(
        "--no-website-check",
        action="store_true",
        help="Don't try to extract emails from linked websites"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output CSV file path"
    )
    
    args = parser.parse_args()
    
    # Check API key
    if not OPENSEA_API_KEY:
        print("⚠️  WARNING: No OpenSea API key configured!")
        print("   Get one at: https://opensea.io/account/settings/developer")
        print("   Then add it to OPENSEA_API_KEY in this script.\n")
        print("   Proceeding without API key (may be rate limited)...\n")
    
    users = []
    
    # Get users from collection
    if args.collection:
        users = get_collection_owners(args.collection, args.limit)
        
    # Get users from input file
    elif args.input:
        input_path = Path(args.input)
        if input_path.exists():
            with open(input_path, 'r') as f:
                users = [line.strip() for line in f 
                         if line.strip() and not line.strip().startswith('#')]
        else:
            print(f"❌ Input file not found: {args.input}")
            return
            
    # Interactive mode
    else:
        print("=" * 60)
        print("OpenSea Public Contact Extractor")
        print("=" * 60)
        print("\nEnter usernames or wallet addresses (one per line).")
        print("Press Enter twice when done:\n")
        
        while True:
            line = input()
            if not line:
                break
            users.append(line.strip())
            
    if not users:
        print("No users to process!")
        return
        
    users = users[:args.limit]
    
    # Process users
    results = process_users(
        users, 
        extract_website_emails=not args.no_website_check
    )
    
    # Save results
    output_file = Path(args.output) if args.output else OUTPUT_FILE
    if results:
        save_to_csv(results, output_file)
        
        # Print summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total profiles checked: {len(users)}")
        print(f"Profiles with contacts: {len(results)}")
        print(f"With Twitter: {sum(1 for r in results if r['twitter'])}")
        print(f"With Email: {sum(1 for r in results if r['email'])}")
        print(f"With Website: {sum(1 for r in results if r['website'])}")
    else:
        print("\n⚠️  No contacts found!")


if __name__ == "__main__":
    main()
