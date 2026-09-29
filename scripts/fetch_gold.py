#!/usr/bin/env python3
"""Fetch gold rates. Never wipe last good JSON on failure."""
from __future__ import annotations

import json
import re
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Install: pip install requests beautifulsoup4", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "gold.json"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
IST = timezone(timedelta(hours=5, minutes=30))

CITIES = {
    "Mumbai": "https://www.goodreturns.in/gold-rates/mumbai.html",
    "Bengaluru": "https://www.goodreturns.in/gold-rates/bangalore.html",
    "Kolkata": "https://www.goodreturns.in/gold-rates/kolkata.html",
    "Hyderabad": "https://www.goodreturns.in/gold-rates/hyderabad.html",
}


def fetch(url: str, retries: int = 3) -> str:
    last_err = None
    for i in range(retries):
        try:
            r = requests.get(url, headers={"User-Agent": UA}, timeout=25)
            if r.status_code in (403, 429):
                raise RuntimeError(f"Blocked HTTP {r.status_code}")
            r.raise_for_status()
            return r.text
        except Exception as e:
            last_err = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(str(last_err))


def parse_rates(html: str):
    text = BeautifulSoup(html, "html.parser").get_text(" ", strip=True)
    r22 = r24 = None
    m22 = re.search(r"22\s*K[^\d]{0,20}([\d,]{4,})", text, re.I)
    m24 = re.search(r"24\s*K[^\d]{0,20}([\d,]{4,})", text, re.I)
    if m22:
        r22 = int(m22.group(1).replace(",", ""))
    if m24:
        r24 = int(m24.group(1).replace(",", ""))
    return r22, r24


def main() -> int:
    cities = []
    for name, url in CITIES.items():
        print(f"Fetching {name}")
        html = fetch(url)
        r22, r24 = parse_rates(html)
        if not r22 and not r24:
            raise RuntimeError(f"No rates for {name}")
        cities.append({"city": name, "rate22k": r22, "rate24k": r24, "change24k": None})
    if len(cities) < 1:
        raise RuntimeError("No cities parsed")
    now = datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
    payload = {
        "updated_at": now,
        "updated": now,
        "source": "goodreturns.in",
        "source_url": "https://www.goodreturns.in/gold-rates/",
        "sourceUrl": "https://www.goodreturns.in/gold-rates/",
        "note": "Metal rate only — no making charges.",
        "cities": cities,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        print("Leaving existing data/gold.json untouched.", file=sys.stderr)
        sys.exit(1)
