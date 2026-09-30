#!/usr/bin/env python3
"""Fetch Nifty 50 and Bank Nifty levels (Yahoo Finance chart API)."""
from __future__ import annotations
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "markets.json"
IST = timezone(timedelta(hours=5, minutes=30))

def yf(sym: str) -> dict:
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=5d"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        d = json.load(r)
    meta = d["chart"]["result"][0]["meta"]
    price = float(meta.get("regularMarketPrice") or meta.get("fulldayPrice") or 0)
    prev = float(meta.get("chartPreviousClose") or meta.get("previousClose") or 0)
    chg = price - prev if prev else None
    pct = (chg / prev * 100) if prev and chg is not None else None
    return {
        "price": round(price, 2),
        "change": round(chg, 2) if chg is not None else None,
        "change_pct": round(pct, 2) if pct is not None else None,
    }

def main() -> int:
    nifty = yf("%5ENSEI")
    bank = yf("%5ENSEBANK")
    out = {
        "updated_at": datetime.now(IST).replace(microsecond=0).isoformat(),
        "source": "Yahoo Finance",
        "source_url": "https://finance.yahoo.com",
        "nifty50": {**nifty, "name": "NIFTY 50"},
        "bank_nifty": {**bank, "name": "BANK NIFTY"},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print("Wrote", OUT, out["nifty50"]["price"], out["bank_nifty"]["price"])
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
