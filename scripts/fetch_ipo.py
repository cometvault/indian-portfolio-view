#!/usr/bin/env python3
"""Fetch IPO GMP from ipowatch.in into data/ipo.json.

Status comes from the company cell (Open/Closed/Upcoming or (O)/(U)/(C)),
with open/close dates as fallback. Column index 6 does not exist on the GMP table.
"""
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
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
SESSION = requests.Session()
SESSION.headers.update(UA)
IST = timezone(timedelta(hours=5, minutes=30))
MONTHS = {
    m.lower(): i
    for i, m in enumerate(
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1
    )
}


def get(url: str) -> BeautifulSoup:
    for i in range(3):
        try:
            r = SESSION.get(url, timeout=30)
            r.raise_for_status()
            return BeautifulSoup(r.text, "html.parser")
        except Exception:
            time.sleep(1.2 * (i + 1))
    raise RuntimeError(f"Failed to fetch {url}")


def norm_name(s: str) -> str:
    s = re.sub(r"[▲▼⬆⬇🟢🔴🟡*]+", "", s or "")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s*\([^)]*\)\s*$", "", s)
    s = re.sub(r"\s+(Open|Closed|Upcoming|Listed)\s*$", "", s, flags=re.I)
    if "₹" in s:
        s = s.split("₹")[0].strip()
    return s.strip()


def key(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", norm_name(s).lower())


def parse_num(s) -> float | None:
    m = re.search(r"-?\d+(?:\.\d+)?", str(s or "").replace(",", "").replace("₹", ""))
    return float(m.group(0)) if m else None


def parse_band(s: str) -> str | None:
    if not s:
        return None
    t = re.sub(r"\s+to\s+", "-", str(s).replace("₹", "").replace(",", ""), flags=re.I)
    t = re.sub(r"\s*[–—]\s*", "-", t)
    t = re.sub(r"\s+", "", t)
    m = re.search(r"(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?", t)
    if not m:
        return None
    return f"{m.group(1)}-{m.group(2)}" if m.group(2) else m.group(1)


def upper_band(band) -> float | None:
    try:
        return float(str(band).split("-")[-1])
    except Exception:
        return None


def parse_dates(date_col: str):
    t = re.sub(r"\s+", " ", (date_col or "").strip()).rstrip("*")
    m = re.match(r"(\d{1,2})\s+([A-Za-z]+)\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)", t)
    if m:
        return (
            f"{int(m.group(1))} {m.group(2)[:3].title()}",
            f"{int(m.group(3))} {m.group(4)[:3].title()}",
        )
    m = re.match(r"(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)", t)
    if m:
        d1, d2, mon = int(m.group(1)), int(m.group(2)), m.group(3)[:3].title()
        if d1 > d2:
            mi = MONTHS.get(mon.lower(), 1)
            prev = list(MONTHS.keys())[(mi - 2) % 12]
            return f"{d1} {prev.title()}", f"{d2} {mon}"
        return f"{d1} {mon}", f"{d2} {mon}"
    m2 = re.search(r"(\d{1,2})\s+([A-Za-z]+)", t)
    if m2:
        x = f"{int(m2.group(1))} {m2.group(2)[:3].title()}"
        return x, x
    return (t or "—"), (t or "—")


def status_from(s: str) -> str:
    s = (s or "").lower()
    m = re.search(r"\(\s*([ouc])\s*\)", s)
    if m:
        return {"o": "open", "u": "upcoming", "c": "closed"}[m.group(1)]
    if "open" in s and "closed" not in s:
        return "open"
    if "upcom" in s:
        return "upcoming"
    if "close" in s or "listed" in s:
        return "closed"
    return ""


def status_from_dates(opens: str, closes: str) -> str:
    now = datetime.now(IST).date()

    def to_d(s):
        m = re.match(r"(\d{1,2})\s+([A-Za-z]{3})", (s or "").strip())
        if not m:
            return None
        mon = MONTHS.get(m.group(2).lower()[:3])
        if not mon:
            return None
        try:
            return datetime(now.year, mon, int(m.group(1)), tzinfo=IST).date()
        except Exception:
            return None

    o, c = to_d(opens), to_d(closes)
    if o and o > now:
        return "upcoming"
    if c and c < now:
        return "closed"
    if o or c:
        return "open"
    return "upcoming"


def scrape_gmp():
    soup = get("https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/")
    out = {}
    for ti, table in enumerate(soup.find_all("table")[:2]):
        seg = "main" if ti == 0 else "sme"
        for row in table.find_all("tr")[1:]:
            cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) < 6:
                continue
            raw = cells[0]
            name = norm_name(raw)
            if not name or name.lower().startswith("ipo"):
                continue
            gmp = parse_num(cells[1])
            band = parse_band(cells[3])
            est = cells[4] if len(cells) > 4 else ""
            gmp_pct = None
            m = re.search(r"\(([-+]?\d+(?:\.\d+)?)%\)", est or "")
            if m:
                gmp_pct = float(m.group(1))
            elif gmp is not None and upper_band(band):
                gmp_pct = round(gmp / upper_band(band) * 100, 1)
            opens, closes = parse_dates(cells[5] if len(cells) > 5 else "")
            st = status_from(raw) or status_from_dates(opens, closes)
            out[key(name)] = {
                "company": name,
                "name": name,
                "seg": seg,
                "price_band": band,
                "priceBand": band,
                "gmp": int(gmp) if gmp is not None else None,
                "gmp_pct": gmp_pct,
                "gmpPct": gmp_pct,
                "opens": opens,
                "closes": closes,
                "status": st,
            }
    return out


def main():
    try:
        gmp = scrape_gmp()
    except Exception as e:
        print("GMP scrape failed", e)
        if OUT.exists():
            print("Keeping last good", OUT)
            return
        raise

    rows = list(gmp.values())
    mainboard = [r for r in rows if r.get("seg") != "sme"]
    sme = [r for r in rows if r.get("seg") == "sme"]

    def sk(r):
        return (
            {"open": 0, "upcoming": 1, "closed": 2}.get(r.get("status"), 3),
            -(r.get("gmp_pct") or -999),
        )

    mainboard.sort(key=sk)
    sme.sort(key=sk)
    now = datetime.now(IST).replace(microsecond=0).isoformat()
    payload = {
        "updated_at": now,
        "updated": now,
        "source": "ipowatch.in",
        "source_url": "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/",
        "sourceUrl": "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/",
        "note": "GMP unofficial. Status from company markers + dates.",
        "mainboard": mainboard,
        "sme": sme,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Wrote", OUT, "main", len(mainboard), "sme", len(sme))
    print("status", Counter(r["status"] for r in rows))


if __name__ == "__main__":
    main()
