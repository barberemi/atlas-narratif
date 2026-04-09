import { betterAuth } from 'better-auth';
import pg from 'pg';
import { Resend } from 'resend';

const { Pool } = pg;

// ── Avertissements dev ────────────────────────────────────────────────────────
if (!process.env.BETTER_AUTH_SECRET) {
  console.warn('[auth] ⚠  BETTER_AUTH_SECRET absent — clé de dev utilisée (ne pas utiliser en prod)');
}
if (!process.env.GOOGLE_CLIENT_ID) {
  console.info('[auth] Google OAuth désactivé (GOOGLE_CLIENT_ID absent)');
}
if (!process.env.RESEND_API_KEY) {
  console.info('[auth] Resend absent — les emails seront affichés dans la console (mode dev)');
}

// ── Connexion DB pour Better Auth (pool pg séparé) ────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://atlas:atlas_dev@localhost:5432/atlas',
});

// ── Email via Resend ──────────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM   = process.env.EMAIL_FROM ?? 'noreply@atlasnarratif.com';

async function sendEmail(to, subject, html) {
  console.log(`[sendEmail] → ${to} | sujet: ${subject} | resend: ${!!resend}`);
  if (!resend) {
    console.log(`\n[DEV EMAIL] À : ${to}\nSujet : ${subject}\n${html.replace(/<[^>]+>/g, '')}\n`);
    return;
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    console.log('[sendEmail] Resend OK :', JSON.stringify(result));
  } catch (err) {
    console.error('[sendEmail] Resend ERREUR :', err.message, err);
  }
}

// ── Better Auth ───────────────────────────────────────────────────────────────
export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  basePath: '/auth',
  secret:  process.env.BETTER_AUTH_SECRET ?? 'dev-secret-atlas-narratif-change-in-prod',

  trustedOrigins: [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
  ],

  // ── Email + mot de passe ──────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        'Réinitialisation de mot de passe — Atlas Narratif',
        `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1e293b">Réinitialiser votre mot de passe</h2>
          <p>Ce lien est valable <strong>1 heure</strong> :</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#3F51B5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Changer mon mot de passe
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            Si vous n'avez pas demandé ce changement, ignorez cet email.
          </p>
        </div>`,
      );
    },
  },

  // ── Vérification email ────────────────────────────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log('[emailVerification] sendVerificationEmail appelé pour :', user.email, '| url :', url);
      await sendEmail(
        user.email,
        'Vérifiez votre adresse email — Atlas Narratif',
        `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1e293b">Bienvenue sur Atlas Narratif</h2>
          <p>Cliquez pour activer votre compte :</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#3F51B5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Vérifier mon email
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </div>`,
      );
    },
  },

  // ── Google OAuth (désactivé si credentials absents) ───────────────────────
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
});
