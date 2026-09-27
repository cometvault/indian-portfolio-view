# Portfolio View · India

Educational portfolio mix reference for the Indian market.

**Live site:** https://cometvault.github.io/indian-portfolio-view/

No buy / sell / hold advice. No scheme or ticker names. Directional shapes only.

---

## Pages

| Page | What you get |
|------|----------------|
| **Overview** | Age-based mix calculator + interactive pie |
| **IPOs** | Mainboard & SME grey-market premium (GMP + %) |
| **Gold & ETF** | 22K / 24K rates for Bangalore, Mumbai, Kolkata, Hyderabad |
| **Mutual Funds** | Equity / Debt / Hybrid category roles only |
| **Equity** | Fixed 50% Mid · 30% Large · 20% Small sleeve |

---

## Deploy (GitHub Pages)

Already configured for this repo.

1. **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)`
2. Wait ~1 minute.
3. Open: `https://<user>.github.io/indian-portfolio-view/`

Project pages need no CNAME. A `.nojekyll` file is included so GitHub Pages serves all static files as-is.

---

## Data

| File | Source | Refresh |
|------|--------|---------|
| `data/ipo.json` | ipowatch.in (public GMP table) | Nightly Action + on-page load |
| `data/gold.json` | goodreturns.in city pages | Nightly Action + on-page load |

Manual refresh: **Actions → Update market data nightly → Run workflow**.

Scraping is best-effort. If a source changes layout, existing JSON is left unchanged until fixed.

---

## Local preview

```bash
# from repo root
python3 -m http.server 8080
# open http://localhost:8080
```

Or: `npx serve .`

---

## Disclaimer

A full mandatory disclaimer (scroll + checkbox) appears on every page load. Content is educational only, not SEBI-registered advice, and carries no liability for decisions made using this site.

---

## Stack

- Static HTML / CSS / vanilla JS
- Pure SVG pie chart (no chart library)
- GitHub Actions (Python + BeautifulSoup) for nightly data
- Space Grotesk + Inter typography
