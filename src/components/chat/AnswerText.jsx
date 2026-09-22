import { useNavigate } from 'react-router-dom';
import { resolveEntityByName, entityHrefById, getEntityMeta, hrefForEntity, chatSourceHref } from '../../utils/entityUtils';

/**
 * Rend une réponse du chat en texte enrichi :
 *  - `**gras**`               → <strong>
 *  - `[[Nom]]` / `[[Nom|alias]]` (wikilink)   → lien cliquable vers la fiche (résolu par nom)
 *  - `[entity_id]` (citation)                 → lien cliquable vers la fiche (résolu par id, affiche le nom)
 *  - `[id]` d'une source non-entité (événement, beat, plant, note…) → nom lisible
 *    résolu via `sources` (le passage cité), au lieu de l'id technique.
 * Références non résolues → texte brut (rien n'est perdu).
 */
const ID = '[a-z]+_[a-z0-9_]+';
const TOKEN = new RegExp(`(\\*\\*[^*]+\\*\\*|\\[\\[[^\\]]+\\]\\]|\\[${ID}(?:\\s*,\\s*${ID})*\\])`, 'g');
const LINK_CLS = 'underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors';

export default function AnswerText({ text, sources = [] }) {
  const navigate = useNavigate();
  if (!text) return null;

  const go = (href) => (e) => { e.stopPropagation(); navigate(href); };
  // Map id → source citée (nom + type) pour résoudre les citations non-entités.
  const sourceById = new Map((sources ?? []).map(s => [s.id, s]));
  const parts = String(text).split(TOKEN);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        // **gras**
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }

        // [[wikilink]] (résolu par nom)
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const raw = part.slice(2, -2);
          const [target, alias] = raw.split('|');
          const label = (alias ?? target).trim();
          const hit = resolveEntityByName(target.trim());
          return hit
            ? <button key={i} type="button" onClick={go(hrefForEntity(hit))} className={LINK_CLS} style={{ color: hit.color }} title={hit.name}>{label}</button>
            : <span key={i}>{label}</span>;
        }

        // [entity_id] ou [id1, id2] (citation) → nom(s) d'entité cliquable(s), crochets conservés
        if (part.startsWith('[') && part.endsWith(']')) {
          const ids = part.slice(1, -1).split(',').map(s => s.trim());
          return (
            <span key={i}>
              [{ids.map((id, k) => {
                const meta = getEntityMeta(id);
                const entHref = entityHrefById(id);
                const src = sourceById.get(id);
                const srcHref = src ? chatSourceHref(src) : null;
                let node;
                if (meta && entHref) {
                  node = <button type="button" onClick={go(entHref)} className={LINK_CLS} style={{ color: meta.color }} title={id}>{meta.name}</button>;
                } else if (src?.name && srcHref) {
                  node = <button type="button" onClick={go(srcHref)} className={LINK_CLS} title={id}>{src.name}</button>;
                } else if (src?.name) {
                  node = <span title={id}>{src.name}</span>;
                } else {
                  node = id;
                }
                return <span key={k}>{k > 0 && ', '}{node}</span>;
              })}]
            </span>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
