#!/usr/bin/env python3
"""Fetch complete IPO data from ipowatch.in for Portfolio View India.

Merges GMP, upcoming list, subscription (QIB/NII/Retail), listing calendar,
and company detail pages (lot shares + min application) for open & upcoming.
Never overwrites last good JSON on total failure.
"""
from __future__ import annotations

import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
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
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
IST = timezone(timedelta(hours=5, minutes=30))
MONTHS = {m.lower(): i for i, m in enumerate(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], 1)}
SESSION = requests.Session()
SESSION.headers.update(UA)

def get(url: str, retries: int = 3) -> BeautifulSoup:
    last = None
    for i in range(retries):
        try:
            r = SESSION.get(url, timeout=30)
            r.raise_for_status()
            return BeautifulSoup(r.text, "html.parser")
        except Exception as e:
            last = e
            time.sleep(1.2 * (i + 1))
    raise RuntimeError(f"{url}: {last}")

def norm_name(s: str) -> str:
    s = re.sub(r"[▲▼⬆⬇🟢🔴🟡*]+", "", s or "")
    s = re.sub(r"\s+", " ", s).strip()
    return re.sub(r"\s*\([^)]*\)\s*$", "", s)

def key(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", norm_name(s).lower())

def parse_num(s) -> float | None:
    if s is None: return None
    m = re.search(r"-?\d+(?:\.\d+)?", str(s).replace(",", "").replace("₹", ""))
    try: return float(m.group(0)) if m else None
    except ValueError: return None

def parse_int(s) -> int | None:
    n = parse_num(s)
    return int(n) if n is not None else None

def parse_band(s: str) -> str | None:
    if not s: return None
    t = s.replace("₹", "").replace(",", "")
    t = re.sub(r"\s+to\s+", "-", t, flags=re.I)
    t = re.sub(r"\s*[–—]\s*", "-", t)
    t = re.sub(r"\s+", "", t)
    m = re.search(r"(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?", t)
    if not m: return None
    return f"{m.group(1)}-{m.group(2)}" if m.group(2) else m.group(1)

def upper_band(band: str | None) -> float | None:
    if not band: return None
    try: return float(str(band).split("-")[-1])
    except ValueError: return None

def parse_dates(date_col: str) -> tuple[str, str]:
    t = re.sub(r"\s+", " ", (date_col or "").strip())
    m = re.match(r"(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)", t)
    if m:
        d1, d2, mon = int(m.group(1)), int(m.group(2)), m.group(3)[:3].title()
        if d1 > d2:
            mi = MONTHS.get(mon.lower(), 1)
            prev = list(MONTHS.keys())[(mi - 2) % 12]
            return f"{d1} {prev.title()}", f"{d2} {mon}"
        return f"{d1} {mon}", f"{d2} {mon}"
    m2 = re.search(r"([A-Za-z]+)\s+(\d{1,2})", t)
    if m2:
        mon, day = m2.group(1)[:3].title(), m2.group(2)
        return f"{day} {mon}", f"{day} {mon}"
    return (t or "—", t or "—")

def parse_listing(s: str) -> str | None:
    if not s: return None
    m = re.search(r"(\d{1,2})\s+([A-Za-z]+)", re.sub(r"\s+", " ", s.strip()))
    if m: return f"{int(m.group(1))} {m.group(2)[:3].title()}"
    return s.strip() or None

def parse_issue_cr(s: str) -> float | None:
    if not s: return None
    m = re.search(r"([\d.]+)\s*Cr", s.replace(",", ""), re.I)
    if m: return float(m.group(1))
    return parse_num(s)

def status_from(s: str) -> str:
    s = (s or "").lower()
    if "open" in s: return "open"
    if "upcom" in s: return "upcoming"
    if "close" in s or "listed" in s: return "closed"
    return "upcoming"

def scrape_gmp():
    soup = get("https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/")
    out, detail_links = {}, {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/"): href = "https://ipowatch.in" + href
        if "ipowatch.in" not in href: continue
        if re.search(r"-ipo/?$", href) and "gmp" not in href and "subscription" not in href:
            nm = norm_name(a.get_text(strip=True))
            if nm and len(nm) > 2 and "Apply" not in nm:
                detail_links[key(nm)] = href.split("?")[0]
    for ti, table in enumerate(soup.find_all("table")[:2]):
        seg = "main" if ti == 0 else "sme"
        for row in table.find_all("tr")[1:]:
            cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) < 6: continue
            name = norm_name(cells[0])
            if not name or name.lower().startswith("ipo"): continue
            gmp = parse_num(cells[1])
            band = parse_band(cells[3])
            est = cells[4] if len(cells) > 4 else ""
            est_price = parse_num(est.split("(")[0] if est else "")
            gmp_pct = None
            m = re.search(r"\(([-+]?\d+(?:\.\d+)?)%\)", est or "")
            if m: gmp_pct = float(m.group(1))
            elif gmp is not None and upper_band(band):
                gmp_pct = round(gmp / upper_band(band) * 100, 1)
            opens, closes = parse_dates(cells[5] if len(cells) > 5 else "")
            st = status_from(cells[6] if len(cells) > 6 else "")
            k = key(name)
            link = detail_links.get(k)
            if not link:
                for a in row.find_all("a", href=True):
                    h = a["href"]
                    if h.startswith("/"): h = "https://ipowatch.in" + h
                    if re.search(r"-ipo/?$", h) and "gmp" not in h:
                        link = h.split("?")[0]; break
            out[k] = {
                "company": name, "name": name, "seg": seg,
                "price_band": band, "priceBand": band,
                "gmp": int(gmp) if gmp is not None else None,
                "gmp_pct": gmp_pct, "gmpPct": gmp_pct,
                "est_listing": est_price,
                "opens": opens, "closes": closes, "status": st,
                "detail_url": link,
            }
    return out, detail_links

def scrape_upcoming():
    soup = get("https://ipowatch.in/upcoming-ipo-list/")
    out = {}
    for table in soup.find_all("table")[:2]:
        for row in table.find_all("tr")[1:]:
            cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) < 4: continue
            name = norm_name(cells[0])
            if not name or name.lower() in ("company", "ipo"): continue
            opens, closes = parse_dates(cells[1])
            issue = parse_issue_cr(cells[2])
            band = parse_band(cells[3])
            platform = cells[4] if len(cells) > 4 else ""
            rec = {"opens": opens, "closes": closes, "issue": issue, "issue_size": issue, "issueSize": issue,
                   "price_band": band, "priceBand": band}
            if platform: rec["platform"] = platform
            for a in row.find_all("a", href=True):
                h = a["href"]
                if h.startswith("/"): h = "https://ipowatch.in" + h
                if re.search(r"-ipo/?$", h) and "gmp" not in h:
                    rec["detail_url"] = h.split("?")[0]; break
            out[key(name)] = rec
    return out

def scrape_sub():
    soup = get("https://ipowatch.in/ipo-subscription-status-today/")
    out = {}
    table = soup.find("table")
    if not table: return out
    for row in table.find_all("tr")[1:]:
        cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
        if len(cells) < 7: continue
        name = norm_name(cells[0])
        if not name: continue
        out[key(name)] = {
            "sub_qib": parse_num(cells[3]), "sub_nii": parse_num(cells[4]),
            "sub_retail": parse_num(cells[5]), "sub": parse_num(cells[6]),
            "subscription": parse_num(cells[6]), "subscription_x": parse_num(cells[6]),
            "sub_updated": cells[7] if len(cells) > 7 else None,
        }
    return out

def scrape_listing():
    soup = get("https://ipowatch.in/new-ipo-listing-today-ipo-listing-date/")
    out = {}
    for table in soup.find_all("table")[:2]:
        for row in table.find_all("tr")[1:]:
            cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) < 3: continue
            name = norm_name(cells[0])
            if not name or name.lower() == "ipo": continue
            listing = parse_listing(cells[2])
            out[key(name)] = {"listing": listing, "listing_date": listing}
    return out

def scrape_detail(url: str) -> dict:
    try:
        soup = get(url, retries=2)
    except Exception:
        return {}
    rec = {}
    for t in soup.find_all("table"):
        rows = []
        for row in t.find_all("tr"):
            cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
            if cells: rows.append(cells)
        if not rows: continue
        header = " ".join(rows[0]).lower()
        if "lot size" in header and "shares" in header and "amount" in header:
            for row in rows[1:]:
                if not row: continue
                if "retail minimum" in row[0].lower() and len(row) >= 4:
                    shares = parse_int(row[2])
                    amount = parse_int(row[3])
                    if shares:
                        rec["lot"] = shares; rec["lot_size"] = shares; rec["lotSize"] = shares
                    if amount:
                        rec["min"] = amount; rec["min_amount"] = amount; rec["minAmount"] = amount
                    break
            continue
        for row in rows:
            if len(row) < 2: continue
            label = row[0].lower().rstrip(":")
            val = row[1]
            if "issue size" in label:
                iss = parse_issue_cr(val)
                if iss is not None:
                    rec["issue"] = iss; rec["issue_size"] = iss; rec["issueSize"] = iss
            elif "price band" in label:
                b = parse_band(val)
                if b: rec["price_band"] = b; rec["priceBand"] = b
            elif "open date" in label:
                o, _ = parse_dates(val); rec["opens"] = o
            elif "close date" in label:
                _, c = parse_dates(val); rec["closes"] = c
            elif "listing date" in label:
                rec["listing"] = parse_listing(val); rec["listing_date"] = rec["listing"]
    return rec

def main() -> int:
    try:
        gmp, detail_links = scrape_gmp()
        up = scrape_upcoming()
        sub = scrape_sub()
        listing = scrape_listing()
    except Exception as e:
        print("List fetch failed:", e, file=sys.stderr)
        if OUT.exists():
            print("Keeping last good", OUT)
            return 0
        return 1

    urls = {}
    for k, r in gmp.items():
        if r.get("detail_url"): urls[k] = r["detail_url"]
        elif k in detail_links: urls[k] = detail_links[k]
    for k, r in up.items():
        if r.get("detail_url") and k not in urls: urls[k] = r["detail_url"]

    need = [k for k, r in gmp.items() if r.get("status") in ("open", "upcoming") and k in urls]
    details = {}

    def job(k: str):
        return k, scrape_detail(urls[k])

    with ThreadPoolExecutor(max_workers=6) as ex:
        for fut in as_completed([ex.submit(job, k) for k in need]):
            k, rec = fut.result()
            details[k] = rec

    rows = []
    for k, base in gmp.items():
        r = dict(base)
        r.pop("detail_url", None)
        if k in up:
            u = up[k]
            if u.get("price_band") and "-" in str(u["price_band"]):
                r["price_band"] = u["price_band"]; r["priceBand"] = u["price_band"]
            if u.get("issue") is not None:
                r["issue"] = u["issue"]; r["issue_size"] = u["issue"]; r["issueSize"] = u["issue"]
            if u.get("platform"): r["platform"] = u["platform"]
        if k in listing:
            for kk, vv in listing[k].items():
                if vv: r[kk] = vv
        if k in sub:
            for kk, vv in sub[k].items():
                if vv is not None: r[kk] = vv
        if k in details:
            d = details[k]
            for kk, vv in d.items():
                if vv is None: continue
                if kk in ("lot", "lot_size", "lotSize", "min", "min_amount", "minAmount"):
                    r[kk] = vv
                elif kk in ("price_band", "priceBand") and "-" in str(vv):
                    r[kk] = vv
                elif kk not in r or r[kk] in (None, "", "—"):
                    r[kk] = vv
        if r.get("lot") and not r.get("min"):
            upb = upper_band(r.get("price_band"))
            if upb: r["min"] = int(r["lot"] * upb)
        if r.get("min") is not None:
            r["min_amount"] = r["min"]; r["minAmount"] = r["min"]
        if r.get("lot") is not None:
            r["lot_size"] = r["lot"]; r["lotSize"] = r["lot"]
        rows.append(r)

    mainboard = [r for r in rows if r.get("seg") != "sme"]
    sme = [r for r in rows if r.get("seg") == "sme"]

    def sk(r):
        return ({"open": 0, "upcoming": 1, "closed": 2}.get(r.get("status"), 3), -(r.get("gmp_pct") or -999))

    mainboard.sort(key=sk)
    sme.sort(key=sk)

    payload = {
        "updated_at": datetime.now(IST).replace(microsecond=0).isoformat(),
        "updated": datetime.now(IST).replace(microsecond=0).isoformat(),
        "source": "ipowatch.in",
        "source_url": "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/",
        "sourceUrl": "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/",
        "note": "GMP unofficial. Enriched with issue size, listing, subscription (QIB/NII/Retail), lot size and min application from company pages.",
        "mainboard": mainboard,
        "sme": sme,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Wrote", OUT, "main", len(mainboard), "sme", len(sme), "details", len(details))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
