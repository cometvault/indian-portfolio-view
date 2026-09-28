# Portfolio View · India

Educational portfolio mix reference for the Indian market.

**Public site (frontend):** hosted on **Netlify** (your Netlify URL).

**Source code:** this GitHub repository — keep it **private**. Do **not** use GitHub Pages for the public site.

No buy / sell / hold advice. No scheme or ticker names. Directional shapes only.

---

## Architecture (current → next)

| Layer | Where | Who can access |
|-------|--------|----------------|
| **Frontend (public)** | Netlify | Anyone with your Netlify URL |
| **Source code** | GitHub (private repo) | You (+ collaborators you invite) |
| **Backend / login** | Planned next | API + auth (not in this static site yet) |

GitHub is **not** the public website. Disable GitHub Pages so `*.github.io` is not a second public copy.

---

## Disable GitHub Pages (required)

1. Open the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **None** (or remove the `main` / root publish).
3. Save. The site at `https://cometvault.github.io/indian-portfolio-view/` should stop serving.

Optional: delete any custom domain on Pages if you ever added one.

---

## Make the repo private (recommended)

1. Repo → **Settings** → **General** → **Danger Zone** → **Change repository visibility** → **Make private**.
2. Netlify can still deploy: connect the repo with the **Netlify GitHub App** (it keeps access after the repo becomes private).

---

## Netlify setup (frontend only)

1. Netlify → **Add new site** → Import from Git → this repo.
2. **Build settings** for a static site:
   - Build command: *(leave empty)* or `echo "static"`
   - Publish directory: `/` (repo root)
3. Deploy. Use the Netlify URL (or your custom domain) as the **only** public frontend.

Continuous deploy: every push to `main` rebuilds on Netlify if the site is linked to the repo.

---

## Pages

| Page | Content |
|------|---------|
| **Overview** | Hub + teaser to beginner path |
| **New To Finance** | Emergency fund, IPO bucket, age mix calculator |
| **IPOs** | GMP + % |
| **Gold & ETF** | City rates |
| **Mutual Funds** | Categories only |
| **Equity** | 50 / 30 / 20 |

---

## Data

| File | Source | Refresh |
|------|--------|---------|
| `data/ipo.json` | ipowatch.in | Nightly Action + on-page load |
| `data/gold.json` | goodreturns.in | Nightly Action + on-page load |

Actions still run on the private repo if Actions are enabled.

---

## Backend / login (next update)

This project is still **static HTML/CSS/JS**. Login and a real backend will need:

- An API host (e.g. Netlify Functions, Cloudflare Workers, or a small Node/Python service)
- Auth (e.g. email OTP, OAuth, or a provider like Clerk / Auth0 / Supabase Auth)
- Secrets only on the server — never in the frontend repo as public env values meant to stay secret

Until then, the Netlify site is public HTML only; treat it as educational content, not a secured app.

---

## Local preview

```bash
python3 -m http.server 8080
```

---

## Disclaimer

Educational only. Not SEBI-registered. Not investment advice.
