import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import sql from './db.js';
import { auth } from './auth.js';
import { migrate } from './migrate.js';
import { isEncryptionEnabled } from './crypto.js';

const app = new Hono();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Dev : tout localhost autorisé
// Prod : uniquement FRONTEND_URL (mais nginx proxy = même origine, CORS inutile)

const allowedOrigins = process.env.FRONTEND_URL.split(',').map(s => s.trim());

const isDev = process.env.NODE_ENV !== 'production';

function resolveOrigin(requestOrigin) {
  if (!requestOrigin) return allowedOrigins[0];
  if (allowedOrigins.includes(requestOrigin)) return requestOrigin;
  // En dev uniquement, autoriser tout localhost
  if (isDev && (requestOrigin.startsWith('http://localhost:') || requestOrigin.startsWith('http://127.0.0.1:'))) {
    return requestOrigin;
  }
  return null;
}

const corsMiddleware = cors({
  origin: resolveOrigin,
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-Device-Id', 'X-Device-Token'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  maxAge: 86400,
});

app.use('*', corsMiddleware);

// ── Better Auth — /auth/** ────────────────────────────────────────────────────
// Better Auth retourne un Response natif, on lui ajoute les headers CORS manuellement.

app.all('/auth/*', async (c) => {
  if (isDev) console.log(`[auth] ${c.req.method} ${c.req.path}`);
  const res    = await auth.handler(c.req.raw);
  if (isDev) console.log(`[auth] réponse : ${res.status}`);
  const origin = c.req.header('origin');
  const allowed = origin ? resolveOrigin(origin) : null;
  if (!allowed) return res;

  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin',      allowed);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Vary', 'Origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (c) => {
  try {
    await sql`SELECT 1`;
    return c.json({ status: 'ok', db: 'connected' });
  } catch {
    return c.json({ status: 'error', db: 'unavailable' }, 500);
  }
});

// ── Routes API ────────────────────────────────────────────────────────────────
import api from './routes/api.js';
app.route('/api', api);

// ── Migrations + Démarrage ───────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3001;
await migrate().catch(err => {
  console.error('[migrate] FATAL :', err.message);
  process.exit(1);
});
const server = serve({ fetch: app.fetch, port }, () => {
  console.log(`API Atlas Narratif → http://localhost:${port}`);
  console.log('DB  → connectée');
  console.log(`ENC → ${isEncryptionEnabled() ? 'activé (AES-256-GCM)' : 'désactivé (données en clair)'}`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`[shutdown] ${signal} reçu, arrêt en cours…`);
  server.close(() => {
    sql.end().then(() => {
      console.log('[shutdown] Connexions DB fermées. Bye.');
      process.exit(0);
    });
  });
  // Si le shutdown prend trop longtemps, forcer l'arrêt après 5s
  setTimeout(() => { console.error('[shutdown] Timeout, arrêt forcé.'); process.exit(1); }, 5000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
