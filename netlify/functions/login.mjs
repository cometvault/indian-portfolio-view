import {
  json, parseBody, validateCredentials, getUser, verifyPassword,
  signToken, sessionCookie, publicUser
} from './_auth-lib.mjs';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = parseBody(event);
    if (!body) return json(400, { error: 'Invalid JSON body' });

    const check = validateCredentials(body.email, body.password);
    if (!check.ok) return json(400, { error: check.error });

    const user = await getUser(check.email);
    if (!user || !user.passwordHash) {
      return json(401, { error: 'Invalid email or password.' });
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) return json(401, { error: 'Invalid email or password.' });

    const token = await signToken({ email: user.email, name: user.name || '' });
    return json(200, { user: publicUser(user) }, {
      'Set-Cookie': sessionCookie(token)
    });
  } catch (err) {
    console.error('login', err);
    const msg = String(err.message || err);
    if (msg.includes('AUTH_SECRET')) {
      return json(503, { error: 'Auth is not configured yet. Set AUTH_SECRET on Netlify.' });
    }
    return json(500, { error: 'Could not sign in. Try again.' });
  }
}
