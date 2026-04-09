import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import sql from './db.js';
import { auth } from './auth.js';

const app = new Hono();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Dev : tout localhost autorisé
// Prod : uniquement FRONTEND_URL (mais nginx proxy = même origine, CORS inutile)

const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
  .split(',').map(s => s.trim());

function resolveOrigin(requestOrigin) {
  if (!requestOrigin) return allowedOrigins[0];
  if (allowedOrigins.includes(requestOrigin)) return requestOrigin;
  // En dev, autoriser tout localhost
  if (requestOrigin.startsWith('http://localhost:') || requestOrigin.startsWith('http://127.0.0.1:')) {
    return requestOrigin;
  }
  return null;
}

const corsMiddleware = cors({
  origin: resolveOrigin,
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
});

app.use('*', corsMiddleware);

// ── Better Auth — /auth/** ────────────────────────────────────────────────────
// Better Auth retourne un Response natif, on lui ajoute les headers CORS manuellement.

app.all('/auth/*', async (c) => {
  console.log(`[auth] ${c.req.method} ${c.req.path}`);
  const res    = await auth.handler(c.req.raw);
  console.log(`[auth] réponse : ${res.status}`);
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
  } catch (err) {
    return c.json({ status: 'error', db: err.message }, 500);
  }
});

// ── Routes API ────────────────────────────────────────────────────────────────
import api from './routes/api.js';
app.route('/api', api);

// ── Démarrage ─────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port }, () => {
  console.log(`API Atlas Narratif → http://localhost:${port}`);
  console.log(`DB  → ${process.env.DATABASE_URL ?? 'postgresql://atlas:atlas_dev@localhost:5432/atlas'}`);
});
