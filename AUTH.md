# Auth — Google via Supabase

Email/password signup is **removed**. Sign-in is **Continue with Google** only.

## 1. Create a Supabase project

1. Go to https://supabase.com → New project
2. **Project Settings → API**
   - Copy **Project URL**
   - Copy **anon public** key

## 2. Put them in the site

Edit `js/supabase-config.js`:

```js
window.PV_SUPABASE = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
};
```

Commit and let Netlify redeploy.

## 3. Enable Google provider

1. Supabase → **Authentication → Providers → Google** → Enable
2. Google Cloud Console → Credentials → OAuth client ID (Web):
   - Authorized JavaScript origins: `https://easy-nivesh.netlify.app`
   - Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Paste Client ID + Secret into Supabase Google settings → Save

## 4. Supabase URL config

**Authentication → URL configuration**

- Site URL: `https://easy-nivesh.netlify.app`
- Redirect URLs: `https://easy-nivesh.netlify.app/login.html` and `https://easy-nivesh.netlify.app/**`

## 5. Test

https://easy-nivesh.netlify.app/login.html → **Continue with Google**

## Notes

- Anon key is public by design. Never put **service_role** in the frontend.
- `AUTH_SECRET` is not needed for Google auth.
- Netlify site must be **Public**.
