/**
 * Parse d'un vault Obsidian → notes structurées.
 *
 * Frontmatter YAML via js-yaml, décompression .zip via jszip. Champs inline
 * Dataview `key:: value`, tags `#tag`, wikilinks `[[Cible]]` / `[[Cible|alias]]`
 * restent en regex (robuste et suffisant ; couvre les cas courants).
 */

import { load as yamlLoad } from 'js-yaml';
import JSZip from 'jszip';

/** Sépare le frontmatter YAML (--- … ---) du corps. Retourne { frontmatter, body }. */
export function parseFrontmatter(content) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);
  if (!m) return { frontmatter: {}, body: content };
  let frontmatter = {};
  try {
    const parsed = yamlLoad(m[1]);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) frontmatter = parsed;
  } catch {
    // YAML invalide → frontmatter vide, on garde le corps.
  }
  return { frontmatter, body: m[2] };
}

/** Champs inline Dataview : `clé:: valeur` (une par ligne). */
export function extractInlineFields(body) {
  const fields = {};
  const re = /^([A-Za-z0-9_-][A-Za-z0-9_ -]*)::\s*(.+)$/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    fields[m[1].trim()] = m[2].trim();
  }
  return fields;
}

/** Tags `#tag` (hors code inline). Retourne un tableau dédupliqué sans le #. */
export function extractTags(content) {
  const tags = new Set();
  const re = /(?:^|\s)#([A-Za-z0-9_\-/]+)/g;
  let m;
  while ((m = re.exec(content)) !== null) tags.add(m[1]);
  return [...tags];
}

/** Wikilinks `[[Cible]]` ou `[[Cible|alias]]`. Retourne [{ target, alias }]. */
export function extractWikilinks(text) {
  const links = [];
  const re = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    links.push({ target: m[1].trim(), alias: m[2]?.trim() ?? null });
  }
  return links;
}

/** Nom de note depuis un chemin (basename sans extension). */
export function noteTitle(path) {
  const base = path.split('/').pop() ?? path;
  return base.replace(/\.md$/i, '');
}

/** Dossier parent (pour la classification par dossier). */
export function noteFolder(path) {
  const parts = path.split('/');
  return parts.length > 1 ? parts[parts.length - 2] : '';
}

/** Parse une note unique { path, content }. */
export function parseNote({ path, content }) {
  const { frontmatter, body } = parseFrontmatter(content);
  return {
    path,
    title: frontmatter.title || frontmatter.name || noteTitle(path),
    folder: noteFolder(path),
    frontmatter,
    inlineFields: extractInlineFields(body),
    tags: [...new Set([...(Array.isArray(frontmatter.tags) ? frontmatter.tags : []), ...extractTags(body)])],
    wikilinks: extractWikilinks(content),
    body: body.trim(),
  };
}

/**
 * Parse une liste de fichiers déjà décompressés : [{ path, content }].
 * Ignore les fichiers non-Markdown.
 */
export function parseVault(files) {
  return files
    .filter(f => /\.md$/i.test(f.path))
    .map(parseNote);
}

/**
 * Décompresse un ArrayBuffer de .zip (export de vault Obsidian) en notes parsées.
 * Ignore les entrées non-Markdown et les dossiers cachés (.obsidian, .trash…).
 */
export async function parseVaultZip(zipArrayBuffer) {
  const zip = await JSZip.loadAsync(zipArrayBuffer);
  const files = [];
  const entries = Object.values(zip.files).filter(
    f => !f.dir && /\.md$/i.test(f.name) && !f.name.split('/').some(seg => seg.startsWith('.')),
  );
  for (const entry of entries) {
    files.push({ path: entry.name, content: await entry.async('string') });
  }
  return parseVault(files);
}
