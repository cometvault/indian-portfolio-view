import { json, readCookie, verifyToken, getUser, publicUser } from './_auth-lib.mjs';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  try {
    const token = readCookie(event);
    if (!token) return json(401, { user: null });

    const session = await verifyToken(token);
    const user = await getUser(session.email);
    if (!user) return json(401, { user: null });

    return json(200, { user: publicUser(user) });
  } catch (err) {
    return json(401, { user: null });
  }
}
