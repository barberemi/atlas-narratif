import { betterAuth } from 'better-auth';
import pg from 'pg';
import { Resend } from 'resend';

const { Pool } = pg;

// ── Vérification variables requises ───────────────────────────────────────────
const required = ['BETTER_AUTH_SECRET', 'DATABASE_URL', 'FRONTEND_URL', 'BETTER_AUTH_URL'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[auth] FATAL : ${key} est requis.`);
    process.exit(1);
  }
}
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (secret.length < 32 || secret.includes('change-this')) {
    console.error('[auth] FATAL : BETTER_AUTH_SECRET trop faible en production (min 32 caractères, pas de placeholder).');
    process.exit(1);
  }
}
if (!process.env.GOOGLE_CLIENT_ID) {
  console.info('[auth] Google OAuth désactivé (GOOGLE_CLIENT_ID absent)');
}
if (!process.env.RESEND_API_KEY) {
  console.info('[auth] Resend absent — les emails seront affichés dans la console (mode dev)');
}

// ── Connexion DB pour Better Auth (pool pg séparé) ────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ── Email via Resend ──────────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM   = process.env.EMAIL_FROM || 'noreply@atlasnarratif.com';

function maskEmail(email) {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

async function sendEmail(to, subject, html) {
  console.log(`[sendEmail] → ${maskEmail(to)} | sujet: ${subject} | resend: ${!!resend}`);
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

// ── Email translations ────────────────────────────────────────────────────────
const emailI18n = {
  fr: {
    resetSubject: 'Réinitialisation de mot de passe — Atlas Narratif',
    resetTitle: 'Réinitialiser votre mot de passe',
    resetBody: 'Ce lien est valable <strong>1 heure</strong> :',
    resetButton: 'Changer mon mot de passe',
    resetFooter: "Si vous n'avez pas demandé ce changement, ignorez cet email.",
    verifySubject: 'Vérifiez votre adresse email — Atlas Narratif',
    verifyTitle: 'Bienvenue sur Atlas Narratif',
    verifyBody: 'Cliquez pour activer votre compte :',
    verifyButton: 'Vérifier mon email',
    verifyFooter: "Si vous n'avez pas créé de compte, ignorez cet email.",
  },
  en: {
    resetSubject: 'Password Reset — Atlas Narrative',
    resetTitle: 'Reset your password',
    resetBody: 'This link is valid for <strong>1 hour</strong>:',
    resetButton: 'Change my password',
    resetFooter: 'If you did not request this change, ignore this email.',
    verifySubject: 'Verify your email — Atlas Narrative',
    verifyTitle: 'Welcome to Atlas Narrative',
    verifyBody: 'Click to activate your account:',
    verifyButton: 'Verify my email',
    verifyFooter: 'If you did not create an account, ignore this email.',
  },
  zh: {
    resetSubject: '重置密码 — 叙事图谱',
    resetTitle: '重置您的密码',
    resetBody: '此链接有效期为<strong>1小时</strong>：',
    resetButton: '更改我的密码',
    resetFooter: '如果您未请求此更改，请忽略此邮件。',
    verifySubject: '验证您的邮箱 — 叙事图谱',
    verifyTitle: '欢迎使用叙事图谱',
    verifyBody: '点击激活您的账户：',
    verifyButton: '验证我的邮箱',
    verifyFooter: '如果您未创建账户，请忽略此邮件。',
  },
};

function getEmailLang(user) {
  const lang = user?.lang || user?.locale || 'fr';
  return emailI18n[lang] ? lang : 'fr';
}

function emailHtml({ title, body, buttonUrl, buttonLabel, footer }) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#1e293b">${title}</h2>
    <p>${body}</p>
    <a href="${buttonUrl}" style="display:inline-block;padding:12px 24px;background:#3F51B5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
      ${buttonLabel}
    </a>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">${footer}</p>
  </div>`;
}

// ── Better Auth ───────────────────────────────────────────────────────────────
export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/auth',
  secret:  process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    process.env.FRONTEND_URL,
  ],

  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      // 'lax' requis : 'strict' casserait le retour Google OAuth et les liens email
      sameSite: 'lax',
      secure: process.env.BETTER_AUTH_URL?.startsWith('https://') ?? false,
    },
  },

  // ── Email + mot de passe ──────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const t = emailI18n[getEmailLang(user)];
      await sendEmail(
        user.email,
        t.resetSubject,
        emailHtml({ title: t.resetTitle, body: t.resetBody, buttonUrl: url, buttonLabel: t.resetButton, footer: t.resetFooter }),
      );
    },
  },

  // ── Vérification email ────────────────────────────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log('[emailVerification] sendVerificationEmail appelé pour :', maskEmail(user.email));
      const t = emailI18n[getEmailLang(user)];
      await sendEmail(
        user.email,
        t.verifySubject,
        emailHtml({ title: t.verifyTitle, body: t.verifyBody, buttonUrl: url, buttonLabel: t.verifyButton, footer: t.verifyFooter }),
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
