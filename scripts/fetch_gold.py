#!/usr/bin/env python3
"""Fetch gold rates per gram from goodreturns.in. Never wipe last good JSON on failure."""
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
    "Delhi": "https://www.goodreturns.in/gold-rates/delhi.html",
    "Bengaluru": "https://www.goodreturns.in/gold-rates/bangalore.html",
    "Kolkata": "https://www.goodreturns.in/gold-rates/kolkata.html",
    "Hyderabad": "https://www.goodreturns.in/gold-rates/hyderabad.html",
    "Chennai": "https://www.goodreturns.in/gold-rates/chennai.html",
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
    soup = BeautifulSoup(html, "html.parser")
    r22 = r24 = chg = None
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        if not rows:
            continue
        headers = [c.get_text(" ", strip=True).lower() for c in rows[0].find_all(["td", "th"])]
        if any("gram" in h for h in headers) or (
            len(headers) >= 3 and "24" in (headers[1] if len(headers) > 1 else "")
        ):
            for tr in rows[1:]:
                cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
                if not cells:
                    continue
                if cells[0].strip() in ("1", "1g", "1 g"):
                    def num(s):
                        m = re.search(r"[\d,]+", s.replace("₹", ""))
                        return int(m.group(0).replace(",", "")) if m else None
                    if len(cells) >= 3:
                        r24 = num(cells[1])
                        r22 = num(cells[2])
                    break
        if any("date" in h for h in headers) and chg is None:
            for tr in rows[1:2]:
                cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
                if len(cells) >= 2:
                    m = re.search(r"\(([+-]?\d+)\)", cells[1])
                    if m:
                        chg = int(m.group(1))
    return r22, r24, chg


def main() -> int:
    cities = []
    for name, url in CITIES.items():
        print(f"Fetching {name}")
        html = fetch(url)
        r22, r24, chg = parse_rates(html)
        if not r22 and not r24:
            raise RuntimeError(f"No rates for {name}")
        cities.append({
            "city": name,
            "k24": r24,
            "k22": r22,
            "rate24k": r24,
            "rate22k": r22,
            "change24k": chg,
        })
        print(f"  24K={r24} 22K={r22} chg={chg}")
    if len(cities) < 1:
        raise RuntimeError("No cities parsed")
    now = datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
    payload = {
        "updated_at": now,
        "updated": now,
        "source": "goodreturns.in",
        "source_url": "https://www.goodreturns.in/gold-rates/",
        "sourceUrl": "https://www.goodreturns.in/gold-rates/",
        "note": "Rates per gram. Metal rate only \u2014 no making charges.",
        "unit": "per_gram",
        "cities": cities,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Wrote", OUT, "cities", len(cities))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        print("Leaving existing data/gold.json untouched.", file=sys.stderr)
        sys.exit(1)
