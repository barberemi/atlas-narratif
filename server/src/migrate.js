import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sql from './db.js';

const MIGRATIONS_DIR = new URL('../db/migrations', import.meta.url).pathname;

/**
 * Système de migrations minimal.
 * - Crée la table `schema_migrations` si elle n'existe pas.
 * - Lit les fichiers .sql dans server/db/migrations/ triés par nom.
 * - Applique ceux qui ne sont pas encore enregistrés.
 */
export async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  let files;
  try {
    files = (await readdir(MIGRATIONS_DIR)).filter(f => f.endsWith('.sql')).sort();
  } catch {
    // Pas de dossier migrations → rien à faire
    return;
  }

  if (files.length === 0) return;

  const applied = new Set(
    (await sql`SELECT version FROM schema_migrations`).map(r => r.version)
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const content = await readFile(join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`[migrate] Applying ${file}…`);
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`INSERT INTO schema_migrations (version) VALUES (${file})`;
    });
    console.log(`[migrate] ${file} applied.`);
  }
}
