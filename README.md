# Indian Portfolio View

A minimal, classic white website that presents **directional portfolio proportions** for the Indian market — IPOs (live GMP), Gold & ETF (clubbed), Mutual Funds (category-level only), and Equity (50 % Mid · 30 % Large · 20 % Small).

**No buy / sell / hold recommendations. No specific mutual-fund or ETF names.**

Designed for GitHub Pages so data can be refreshed on every visitor load and updated nightly via GitHub Actions.

---

## Pages

| Page | Content |
|------|---------|
| **Overview** | Navigation + illustrative equity mix |
| **IPOs** | Mainboard & SME grey-market premium table (source: public tables such as ipowatch.in) |
| **Gold & ETF** | City rates for Mumbai, Bangalore, Hyderabad, Kolkata + structural note that ETF exposure ranks higher within a gold sleeve |
| **Mutual Funds** | Category roles (Large / Mid / Small / Flexi / Debt / Hybrid) — zero scheme names |
| **Equity** | Fixed 50 / 30 / 20 proportion explanation |

---

## Deploy on GitHub Pages

1. This repository is already set up.
2. In the repo **Settings → Pages**:
   - Source: Deploy from a branch
   - Branch: `main` / root (or `/ (root)`)
3. After a minute the site will be live at  
   `https://cometvault.github.io/indian-portfolio-view/`

---

## Live data behaviour

- **On every page refresh** the browser loads `data/ipo.json` and `data/gold.json`.
- A **nightly GitHub Action** (`.github/workflows/update-data.yml`) attempts to scrape the latest IPO GMP table from ipowatch.in and stamps the gold JSON with today’s date.
- You can also trigger the workflow manually from the **Actions** tab.

> Scraping is best-effort. If the source HTML structure changes, the Action will leave the existing JSON untouched. You can always edit the JSON files by hand.

---

## Local preview

```bash
# any static server
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:8080`.

---

## Aesthetics

- Bright white background
- Elegant serif headings (Source Serif 4) + clean sans body (Inter)
- Soft borders, minimal shadows, generous whitespace
- Responsive grid & tables

---

## Disclaimer

This project is for **educational and informational purposes only**.  
It is **not** registered with SEBI and does **not** constitute investment advice, solicitation or a recommendation to buy, sell or hold any security.  
Grey-market premiums are unofficial street quotes. Gold rates are indicative retail figures. Always verify with primary sources and consult a qualified advisor.
