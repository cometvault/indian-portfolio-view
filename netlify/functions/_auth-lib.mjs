import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { getStore } from '@netlify/blobs';

const COOKIE = 'pv_session';
const TTL_SEC = 60 * 60 * 24 * 7;

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error('AUTH_SECRET missing or too short (min 16 chars). Set it in Netlify env.');
  }
  return new TextEncoder().encode(s);
}

export function json(status, body, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

export function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body);
  } catch {
    return null;
  }
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateCredentials(email, password) {
  const e = normalizeEmail(email);
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return { ok: false, error: 'Enter a valid email.' };
  }
  if (!password || String(password).length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }
  if (String(password).length > 128) {
    return { ok: false, error: 'Password is too long.' };
  }
  return { ok: true, email: e };
}

function userStore() {
  return getStore({ name: 'portfolio-users', consistency: 'strong' });
}

export async function getUser(email) {
  const store = userStore();
  const raw = await store.get(email, { type: 'json' });
  return raw || null;
}

export async function saveUser(email, record) {
  const store = userStore();
  await store.setJSON(email, record);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload) {
  const key = secretKey();
  return new SignJWT({ sub: payload.email, name: payload.name || '' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SEC}s`)
    .sign(key);
}

export async function verifyToken(token) {
  const key = secretKey();
  const { payload } = await jwtVerify(token, key);
  return {
    email: payload.sub,
    name: payload.name || ''
  };
}

export function sessionCookie(token) {
  const secure = process.env.CONTEXT === 'production' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL_SEC}${secure}`;
}

export function clearCookie() {
  const secure = process.env.CONTEXT === 'production' ? '; Secure' : '';
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readCookie(event) {
  const header = event.headers.cookie || event.headers.Cookie || '';
  const parts = header.split(';').map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith(COOKIE + '=')) {
      return decodeURIComponent(p.slice(COOKIE.length + 1));
    }
  }
  return null;
}

export function publicUser(record) {
  if (!record) return null;
  return {
    email: record.email,
    name: record.name || '',
    createdAt: record.createdAt || null
  };
}
