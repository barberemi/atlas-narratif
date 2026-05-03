/**
 * Chiffrement au repos — Atlas Narratif
 *
 * Envelope encryption : KEK (env var) wraps per-project DEK.
 * AES-256-GCM, IV 12 bytes, auth tag 16 bytes.
 * Format stocké : "enc:v1:<base64(iv + ciphertext + authTag)>"
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import sql from './db.js';

const ALGO    = 'aes-256-gcm';
const IV_LEN  = 12;
const TAG_LEN = 16;
const PREFIX  = 'enc:v1:';

// ── KEK (Key Encryption Key) ────────────────────────────────────────────────

let _kek = null;

function loadKek() {
  if (_kek !== null) return _kek;
  const raw = process.env.ATLAS_ENCRYPTION_KEY;
  if (!raw) { _kek = false; return false; }
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) {
    throw new Error(`ATLAS_ENCRYPTION_KEY doit faire 32 bytes (reçu ${buf.length}). Générer via : openssl rand -base64 32`);
  }
  _kek = buf;
  return _kek;
}

export function isEncryptionEnabled() {
  return loadKek() !== false;
}

// ── Chiffrement / Déchiffrement de valeurs ──────────────────────────────────

export function encrypt(plaintext, dek) {
  if (plaintext === null || plaintext === undefined) return plaintext;
  if (!dek) return plaintext;
  const str = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);
  const iv     = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, dek, iv);
  const enc    = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, enc, tag]).toString('base64');
}

export function decrypt(ciphertext, dek) {
  if (ciphertext === null || ciphertext === undefined) return ciphertext;
  if (typeof ciphertext !== 'string' || !ciphertext.startsWith(PREFIX)) return ciphertext;
  if (!dek) return ciphertext;
  const buf = Buffer.from(ciphertext.slice(PREFIX.length), 'base64');
  const iv  = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(buf.length - TAG_LEN);
  const enc = buf.subarray(IV_LEN, buf.length - TAG_LEN);
  const decipher = createDecipheriv(ALGO, dek, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc, null, 'utf8') + decipher.final('utf8');
}

// ── DEK wrap / unwrap ───────────────────────────────────────────────────────

export function generateDek() {
  return randomBytes(32);
}

export function wrapDek(dek, kek) {
  const iv     = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, kek, iv);
  const enc    = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString('base64');
}

export function unwrapDek(wrapped, kek) {
  const buf = Buffer.from(wrapped, 'base64');
  const iv  = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(buf.length - TAG_LEN);
  const enc = buf.subarray(IV_LEN, buf.length - TAG_LEN);
  const decipher = createDecipheriv(ALGO, kek, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}

// ── Cache DEK par projet ────────────────────────────────────────────────────

const _dekCache = new Map();

/**
 * Retourne la DEK déchiffrée d'un projet (depuis le cache ou la DB).
 * Retourne null si le chiffrement est désactivé ou si le projet n'a pas de DEK.
 */
export async function getProjectDek(projectId) {
  const kek = loadKek();
  if (!kek) return null;

  if (_dekCache.has(projectId)) return _dekCache.get(projectId);

  const [row] = await sql`SELECT encryption_key_enc FROM projects WHERE id = ${projectId}`;
  if (!row?.encryption_key_enc) return null;

  const dek = unwrapDek(row.encryption_key_enc, kek);
  _dekCache.set(projectId, dek);
  return dek;
}

/**
 * Génère une DEK, la wrappe et la stocke pour un projet.
 * Accepte un `tx` optionnel pour tourner dans une transaction existante.
 * Retourne la DEK en clair (Buffer).
 */
export async function createProjectDek(projectId, tx) {
  const kek = loadKek();
  if (!kek) return null;

  const dek = generateDek();
  const wrapped = wrapDek(dek, kek);
  const q = tx ?? sql;
  await q`UPDATE projects SET encryption_key_enc = ${wrapped} WHERE id = ${projectId}`;
  _dekCache.set(projectId, dek);
  return dek;
}

/**
 * Évacue la DEK du cache (après suppression d'un projet).
 */
export function evictProjectDek(projectId) {
  _dekCache.delete(projectId);
}
