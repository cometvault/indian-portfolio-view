# Portfolio View · India

Educational portfolio mix reference for the Indian market.

**Public frontend:** Netlify only  
**Source:** private GitHub repo (not GitHub Pages)

No buy / sell / hold advice. No scheme or ticker names.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Static HTML / CSS / JS on **Netlify** |
| Auth API | **Netlify Functions** (`/api/signup`, `/api/login`, `/api/logout`, `/api/me`) |
| Users | **Netlify Blobs** + bcrypt password hashes |
| Session | HttpOnly JWT cookie (`pv_session`) |

See **[AUTH.md](AUTH.md)** for setup (`AUTH_SECRET` env var).

---

## Pages

| Page | Content |
|------|---------|
| Overview | Hub + teaser |
| New To Finance | Emergency fund, IPO bucket, age mix |
| IPOs / Gold / MF / Equity | Reference tools |
| Login / Signup | Account for preferences |

---

## Deploy on Netlify

1. Import this repo in Netlify (publish directory: `/`, build: `npm install`).
2. Set env **`AUTH_SECRET`** (32+ random chars).
3. Deploy. Open `/signup.html`.
4. Disable GitHub Pages so only Netlify is public.

---

## Disclaimer

Educational only. Not SEBI-registered. Not investment advice.
