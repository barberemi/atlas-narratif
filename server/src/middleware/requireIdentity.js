import { createHmac, timingSafeEqual } from 'node:crypto';
import { auth } from '../auth.js';

const SECRET    = process.env.BETTER_AUTH_SECRET;
const TOKEN_TTL = 90 * 24 * 60 * 60 * 1000; // 90 jours

/** Vérifie que le token (format "timestamp.hmac") est valide et non expiré. */
function verifyDeviceToken(deviceId, token) {
  if (!deviceId || !token) return false;
  const dotIdx = token.indexOf('.');
  if (dotIdx < 1) return false;
  const ts   = token.slice(0, dotIdx);
  const hmac = token.slice(dotIdx + 1);
  const age  = Date.now() - Number(ts);
  if (isNaN(age) || age < 0 || age > TOKEN_TTL) return false;
  const expected = createHmac('sha256', SECRET).update(`${deviceId}:${ts}`).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(hmac, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Middleware hybride — exige au minimum une session authentifiée OU un deviceId signé.
 * Injecte c.set('userId'), c.set('deviceId'), c.set('user'), c.set('session').
 * Retourne 401 si ni session ni deviceId valide.
 */
export async function requireIdentity(c, next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null);
  const userId   = session?.user?.id ?? null;
  const deviceId = c.req.header('x-device-id') ?? null;
  const deviceToken = c.req.header('x-device-token') ?? null;

  // Utilisateur authentifié → OK (le deviceId est optionnel, utilisé pour le claim)
  if (userId) {
    c.set('session', session);
    c.set('user', session.user);
    c.set('userId', userId);
    c.set('deviceId', deviceId);
    return await next();
  }

  // Utilisateur anonyme → le deviceId doit être accompagné d'un token HMAC valide
  if (deviceId && verifyDeviceToken(deviceId, deviceToken)) {
    c.set('session', null);
    c.set('user', null);
    c.set('userId', null);
    c.set('deviceId', deviceId);
    return await next();
  }

  return c.json({ error: 'Non authentifié : session ou deviceId signé requis' }, 401);
}

/** Signe un deviceId avec timestamp — utilisé par la route /device/register. */
export function signDeviceId(deviceId) {
  const ts = String(Date.now());
  const hmac = createHmac('sha256', SECRET).update(`${deviceId}:${ts}`).digest('hex');
  return `${ts}.${hmac}`;
}
