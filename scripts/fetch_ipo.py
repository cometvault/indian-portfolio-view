#!/usr/bin/env python3
"""Fetch live IPO GMP from investorgain.com into data/ipo.json."""
from __future__ import annotations

import json
import re
import time
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "ipo.json"
SOURCE_URL = "https://www.investorgain.com/report/ipo-gmp-live/331/"
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
IST = timezone(timedelta(hours=5, minutes=30))
MONTHS = {
    m.lower()[:3]: i
    for i, m in enumerate(
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1
    )
}


def get(url: str) -> BeautifulSoup:
    for i in range(3):
        try:
            r = requests.get(url, headers=UA, timeout=30)
            r.raise_for_status()
            return BeautifulSoup(r.text, "html.parser")
        except Exception:
            time.sleep(1.2 * (i + 1))
    raise RuntimeError(f"Failed to fetch {url}")


def parse_num(s):
    if s is None:
        return None
    s = str(s).replace(",", "").replace("₹", "").replace("—", "").replace("--", "").strip()
    if not s or s == "-":
        return None
    m = re.search(r"-?\d+(?:\.\d+)?", s)
    return float(m.group(0)) if m else None


def parse_day_mon(s):
    if not s:
        return None
    s = re.sub(r"\s*GMP:.*", "", str(s), flags=re.I).strip()
    m = re.search(r"(\d{1,2})[-\s]+([A-Za-z]{3})", s)
    if m:
        return f"{int(m.group(1))} {m.group(2).title()}"
    m = re.search(r"(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})", s)
    if m:
        mon = int(m.group(2))
        names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        if 1 <= mon <= 12:
            return f"{int(m.group(1))} {names[mon]}"
    return None


def to_date(s):
    if not s or s == "—":
        return None
    m = re.match(r"(\d{1,2})\s+([A-Za-z]{3})", s.strip())
    if not m:
        return None
    mon = MONTHS.get(m.group(2).lower()[:3])
    if not mon:
        return None
    try:
        return datetime(datetime.now(IST).year, mon, int(m.group(1)), tzinfo=IST).date()
    except Exception:
        return None


def trailing_code(name: str):
    tokens = re.findall(r"[A-Za-z@]+", name or "")
    if not tokens:
        return None
    while tokens and tokens[-1] in ("SME", "IPO", "NSE", "BSE"):
        tokens.pop()
    if tokens and tokens[-1] in ("Allotted", "Listed"):
        return "C"
    if not tokens:
        return None
    last = tokens[-1].upper()
    if last in ("U", "O", "C", "CT"):
        return last
    if "@" in (name or "") and re.search(r"\bL@", name or ""):
        return "C"
    return None


def status_of(raw_name: str, opens, closes) -> str:
    code = trailing_code(raw_name)
    if code in ("CT", "O"):
        return "open"
    if code == "U":
        return "upcoming"
    if code == "C":
        return "closed"
    if re.search(r"closing\s*today", raw_name or "", re.I):
        return "open"
    today = datetime.now(IST).date()
    o, c = to_date(opens), to_date(closes)
    if o and o > today:
        return "upcoming"
    if c and c < today:
        return "closed"
    if o or c:
        return "open"
    return "upcoming"


def clean_name(name: str) -> str:
    s = re.sub(r"\s+", " ", name or "").strip()
    s = re.sub(r"\s+L@[\d.]+.*$", "", s)
    s = re.sub(
        r"\s+(NSE|BSE)?\s*(SME)?\s*(IPO)?\s*(U|O|C|CT)?\s*(Allotted|Listed)?\s*$",
        "",
        s,
        flags=re.I,
    )
    s = re.sub(r"\s+SME\s*$", "", s, flags=re.I)
    s = re.sub(r"\s+IPO\s*$", "", s, flags=re.I)
    s = re.sub(r"\s+[UOC]$", "", s)
    return s.strip()


def is_sme(raw: str) -> bool:
    return bool(re.search(r"\bSME\b|\bEMERGE\b", raw or "", re.I))


def scrape():
    soup = get(SOURCE_URL)
    table = soup.find("table")
    if not table:
        raise RuntimeError("No GMP table on InvestorGain")
    out, seen = [], set()
    for row in table.find_all("tr")[1:]:
        cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
        if len(cells) < 8:
            continue
        raw = cells[0]
        if not raw or raw.lower().startswith("name"):
            continue
        name = clean_name(raw)
        if not name or len(name) < 2:
            continue
        key = re.sub(r"[^a-z0-9]", "", name.lower())
        if key in seen:
            continue
        seen.add(key)
        gmp_cell = cells[1] if len(cells) > 1 else ""
        gmp = parse_num(gmp_cell.split("(")[0])
        gmp_pct = None
        m = re.search(r"\(([-+]?\d+(?:\.\d+)?)%\)", gmp_cell)
        if m:
            gmp_pct = float(m.group(1))
        sub = parse_num(cells[3]) if len(cells) > 3 else None
        price = parse_num(cells[4]) if len(cells) > 4 else None
        issue = parse_num(cells[5]) if len(cells) > 5 else None
        lot = parse_num(cells[6]) if len(cells) > 6 else None
        opens = parse_day_mon(cells[7] if len(cells) > 7 else "")
        closes = parse_day_mon(cells[8] if len(cells) > 8 else "")
        listing = parse_day_mon(cells[10] if len(cells) > 10 else "")
        st = status_of(raw, opens, closes)
        band = None
        if price and price > 0:
            band = str(int(price)) if float(price).is_integer() else str(price)
        if gmp is not None and price and price > 0 and gmp_pct is None:
            gmp_pct = round(gmp / price * 100, 1)
        min_amt = int(round(lot * price)) if lot and price else None
        out.append({
            "company": name,
            "name": name,
            "seg": "sme" if is_sme(raw) else "main",
            "price_band": band,
            "priceBand": band,
            "gmp": int(round(gmp)) if gmp is not None else None,
            "gmp_pct": gmp_pct,
            "gmpPct": gmp_pct,
            "sub": sub,
            "subscription": sub,
            "lot": int(lot) if lot else None,
            "lot_size": int(lot) if lot else None,
            "min": min_amt,
            "min_amount": min_amt,
            "issue": issue,
            "issue_size": issue,
            "opens": opens or "—",
            "closes": closes or "—",
            "listing": listing,
            "status": st,
        })
    return out


def main():
    try:
        rows = scrape()
    except Exception as e:
        print("Scrape failed", e)
        if OUT.exists():
            print("Keeping last good", OUT)
            return
        raise
    mainboard = [r for r in rows if r["seg"] != "sme"]
    sme = [r for r in rows if r["seg"] == "sme"]
    sk = lambda r: (
        {"open": 0, "upcoming": 1, "closed": 2}.get(r["status"], 3),
        -(r.get("gmp_pct") or -999),
    )
    mainboard.sort(key=sk)
    sme.sort(key=sk)
    now = datetime.now(IST).replace(microsecond=0).isoformat()
    payload = {
        "updated_at": now,
        "updated": now,
        "source": "investorgain.com",
        "source_url": SOURCE_URL,
        "sourceUrl": SOURCE_URL,
        "note": "GMP unofficial (InvestorGain). Status from live markers (O/U/C/CT) + dates.",
        "mainboard": mainboard,
        "sme": sme,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Wrote", OUT, "main", len(mainboard), "sme", len(sme))
    print("status", Counter(r["status"] for r in rows))


if __name__ == "__main__":
    main()
