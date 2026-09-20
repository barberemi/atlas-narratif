import { useNavigate } from 'react-router-dom';
import { resolveEntityByName, hrefForEntity } from '../../utils/entityUtils';

/**
 * Rend un texte en transformant les wikilinks `[[Cible]]` / `[[Cible|alias]]`
 * (hérités d'un import Obsidian) en liens cliquables vers la fiche de l'entité.
 *
 * - Cible résolue (nom ou alias d'une entité existante) → bouton coloré qui
 *   navigue vers `/relations?entity=<id>` (le graphe centré sur l'entité).
 * - Cible non résolue → texte brut sans les crochets (pas de markup visible).
 *
 * Utilisable à l'intérieur d'un `<p>` (rend des `<span>`/`<button>` inline).
 */
// Regex source : instancié frais à chaque appel (pas de `lastIndex` partagé mutable).
const WIKILINK_SRC = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;

export default function WikiText({ text, className }) {
  const navigate = useNavigate();
  if (!text) return null;
  if (!text.includes('[[')) return <span className={className}>{text}</span>;

  const parts = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(new RegExp(WIKILINK_SRC))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const target = m[1].trim();
    const label = (m[2] ?? m[1]).trim();
    const hit = resolveEntityByName(target);
    if (hit) {
      parts.push(
        <button
          key={`wl-${key++}`}
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(hrefForEntity(hit)); }}
          className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors"
          style={{ color: hit.color }}
          title={hit.name}
        >
          {label}
        </button>,
      );
    } else {
      parts.push(<span key={`wl-${key++}`}>{label}</span>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <span className={className}>{parts}</span>;
}
