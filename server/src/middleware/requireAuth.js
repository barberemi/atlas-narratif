import { auth } from '../auth.js';

/**
 * Middleware Hono — vérifie que la requête est authentifiée.
 * Injecte `c.set('session', session)` et `c.set('user', session.user)`.
 * Retourne 401 si pas de session valide.
 */
export async function requireAuth(c, next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Non authentifié' }, 401);
  }

  c.set('session', session);
  c.set('user', session.user);
  await next();
}
