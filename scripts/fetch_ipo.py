#!/usr/bin/env python3
"""Fetch IPO GMP data from ipowatch.in. Only fields the source publishes.

Columns kept: company, price_band, gmp, gmp_pct, opens, closes, status.
Lot / min / issue size / subscription are NOT published on the GMP table
and are intentionally omitted to avoid empty columns in the UI.
Never overwrite last good JSON on failure.
"""
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
OUT = ROOT / "data" / "ipo.json"
URL = "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
IST = timezone(timedelta(hours=5, minutes=30))

MONTHS = (
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
)


def fetch(url: str, retries: int = 3) -> str:
    last_err = None
    for i in range(retries):
        try:
            r = requests.get(
                url,
                headers={"User-Agent": UA, "Accept": "text/html"},
                timeout=25,
            )
            if r.status_code in (403, 429):
                raise RuntimeError(f"Blocked HTTP {r.status_code}")
            r.raise_for_status()
            if not r.text or len(r.text) < 500:
                raise RuntimeError("Empty response")
            return r.text
        except Exception as e:
            last_err = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"Fetch failed: {last_err}")


def parse_gmp(text: str):
    m = re.search(r"₹\s*(-?[\d,]+)", text.replace(",", ""))
    if not m:
        m = re.search(r"(-?\d+)", text)
        if not m:
            return None
    try:
        return int(m.group(1))
    except ValueError:
        return None


def parse_band(text: str):
    t = text.strip().replace("₹", "").strip()
    return t or None


def upper_price(band):
    if not band:
        return None
    s = band.replace(",", "")
    if "-" in s:
        try:
            return float(s.split("-")[-1].strip())
        except ValueError:
            return None
    try:
        return float(s)
    except ValueError:
        return None


def parse_dates(date_col: str):
    t = re.sub(r"\s+", " ", date_col.strip())
    if not t or t == "—":
        return "—", "—"
    month = ""
    m = re.search(r"\b([A-Za-z]{3})\b", t)
    if m:
        month = m.group(1).title()
        if month not in MONTHS:
            for mon in MONTHS:
                if mon.lower() in t.lower():
                    month = mon
                    break
    nums = re.findall(r"\d{1,2}", t)
    if len(nums) >= 2:
        d1, d2 = int(nums[0]), int(nums[1])
        if month and d1 > d2:
            idx = MONTHS.index(month)
            prev = MONTHS[(idx - 1) % 12]
            opens = f"{d1} {prev}"
            closes = f"{d2} {month}"
        else:
            opens = f"{d1} {month}".strip() if month else str(d1)
            closes = f"{d2} {month}".strip() if month else str(d2)
        return opens, closes
    if len(nums) == 1:
        day = f"{nums[0]} {month}".strip() if month else nums[0]
        return day, day
    return t, t


def parse_status(raw: str) -> str:
    st = (raw or "").lower()
    if "upcom" in st:
        return "upcoming"
    if "open" in st:
        return "open"
    return "closed"


def parse_table(soup, heading: str):
    rows = []
    h = soup.find(
        lambda tag: tag.name in ("h2", "h3")
        and heading.lower() in tag.get_text().lower()
    )
    if not h:
        return rows
    table = h.find_next("table")
    if not table:
        return rows
    for tr in table.find_all("tr")[1:]:
        cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
        if len(cells) < 6:
            continue
        name = re.sub(r"\s+", " ", cells[0]).strip()
        if not name or name.lower().startswith("ipo name"):
            continue
        gmp = parse_gmp(cells[1])
        band = parse_band(cells[3] if len(cells) > 3 else "")
        date_col = cells[5] if len(cells) > 5 else ""
        status = parse_status(cells[6] if len(cells) > 6 else "")
        opens, closes = parse_dates(date_col)
        up = upper_price(band)
        gmp_pct = round((gmp / up) * 100, 1) if gmp is not None and up else None
        rows.append({
            "company": name,
            "name": name,
            "price_band": band,
            "priceBand": band,
            "gmp": gmp,
            "gmp_pct": gmp_pct,
            "gmpPct": gmp_pct,
            "opens": opens,
            "closes": closes,
            "status": status,
        })
    return rows


def validate(mainboard, sme):
    total = len(mainboard) + len(sme)
    if total < 1:
        raise RuntimeError("Validation failed: zero rows")
    for r in mainboard + sme:
        if not r.get("company"):
            raise RuntimeError("Validation failed: missing company")
        if r.get("status") not in ("open", "upcoming", "closed"):
            raise RuntimeError(f"Validation failed: bad status {r.get('status')}")


def main() -> int:
    print(f"Fetching {URL}")
    html = fetch(URL)
    soup = BeautifulSoup(html, "html.parser")
    mainboard = parse_table(soup, "Mainboard IPO GMP")
    sme = parse_table(soup, "SME IPO GMP")
    print(f"Parsed mainboard={len(mainboard)} sme={len(sme)}")
    validate(mainboard, sme)
    now = datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
    payload = {
        "updated_at": now,
        "updated": now,
        "source": "ipowatch.in",
        "source_url": URL,
        "sourceUrl": URL,
        "note": "GMP is unofficial and unregulated. Sentiment only. Columns limited to what the source publishes.",
        "mainboard": mainboard,
        "sme": sme,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        print("Leaving existing data/ipo.json untouched.", file=sys.stderr)
        sys.exit(1)
