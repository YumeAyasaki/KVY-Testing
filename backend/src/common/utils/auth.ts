import crypto from 'crypto';

type Role = 'ADMIN' | 'SELLER';
type Payload = { userId: string; role: Role; sellerId?: string; exp?: number };

const SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'dev_secret_change_me';

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string) {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

export function signToken(payload: Omit<Payload, 'exp'>, expiresInSeconds = 3600 * 60) {
  const now = Math.floor(Date.now() / 1000);
  const withExp: Payload = { ...payload, exp: now + expiresInSeconds };
  const payloadB64 = base64UrlEncode(JSON.stringify(withExp));
  const sig = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('hex');
  return `${payloadB64}.${sig}`;
}

export function verifyToken(token: string): Payload | null {
  try {
    const trimmed = token.trim();
    const parts = trimmed.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadB64, sigHex] = parts;
    if (!payloadB64 || !sigHex) {
      return null;
    }

    const expected = crypto.createHmac('sha256', SECRET).update(payloadB64).digest();
    let provided: Buffer;
    try {
      provided = Buffer.from(sigHex, 'hex');
    } catch (err) {
      return null;
    }

    if (provided.length !== expected.length) {
      return null;
    }

    const valid = crypto.timingSafeEqual(expected, provided);
    if (!valid) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as Payload;
    const now = Math.floor(Date.now() / 1000);

    if (typeof payload.exp === 'number' && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export function decodeTokenPayload(token: string): Payload | null {
  try {
    const trimmed = token.trim();
    const parts = trimmed.split('.');
    if (parts.length < 1) return null;
    const payloadJson = base64UrlDecode(parts[0]);
    return JSON.parse(payloadJson) as Payload;
  } catch (err) {
    return null;
  }
}

export type { Payload, Role };
