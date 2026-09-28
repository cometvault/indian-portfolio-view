# Auth setup (Netlify)

## What you get

- **Login** `/login.html` and **Sign up** `/signup.html`
- API via Netlify Functions:
  - `POST /api/signup` — create account
  - `POST /api/login` — sign in (HttpOnly cookie)
  - `POST /api/logout` — clear session
  - `GET /api/me` — current user
- Users stored in **Netlify Blobs** (password hashed with bcrypt)
- Session = JWT in `pv_session` cookie (7 days)

## One-time Netlify config

1. Site linked to this repo (publish directory = repo root).
2. **Site settings → Environment variables** → Add:
   - **Key:** `AUTH_SECRET`
   - **Value:** a long random string (32+ characters). Example:
     ```bash
     openssl rand -hex 32
     ```
3. Redeploy the site.
4. Open `https://YOUR-SITE.netlify.app/signup.html` and create an account.

## Local Functions (optional)

```bash
npm install
npx netlify dev
```

Requires Netlify CLI and the same `AUTH_SECRET` in a local `.env` (do not commit `.env`).

## Security notes

- Never commit `AUTH_SECRET`.
- Auth only works on the **Netlify** domain (Functions + Blobs).
- GitHub Pages / static file hosts cannot run this backend.
- This is **account preference** auth — not SEBI KYC, not a broker login.

## Next (later)

- Persist New To Finance fields server-side per user
- Email verification / password reset
- Rate limiting on `/api/login` and `/api/signup`
