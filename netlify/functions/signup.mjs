import {
  json, parseBody, validateCredentials, getUser, saveUser,
  hashPassword, signToken, sessionCookie, publicUser
} from './_auth-lib.mjs';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = parseBody(event);
    if (!body) return json(400, { error: 'Invalid JSON body' });

    const check = validateCredentials(body.email, body.password);
    if (!check.ok) return json(400, { error: check.error });

    const name = String(body.name || '').trim().slice(0, 80);
    const existing = await getUser(check.email);
    if (existing) {
      return json(409, { error: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(body.password);
    const record = {
      email: check.email,
      name,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    await saveUser(check.email, record);

    const token = await signToken({ email: check.email, name });
    return json(201, { user: publicUser(record) }, {
      'Set-Cookie': sessionCookie(token)
    });
  } catch (err) {
    console.error('signup', err);
    const msg = String(err.message || err);
    if (msg.includes('AUTH_SECRET')) {
      return json(503, { error: 'Auth is not configured yet. Set AUTH_SECRET on Netlify.' });
    }
    return json(500, { error: 'Could not create account. Try again.' });
  }
}
