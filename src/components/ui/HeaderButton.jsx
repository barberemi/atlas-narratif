/**
 * Boutons de header partagés — famille « onglet souligné » de la Timeline,
 * adoptée comme style unique de tous les headers de page (harmonisation).
 *
 * - `HeaderToggle` : bascule de vue / toggle de fonction. Texte capitales fin,
 *   soulignement coloré quand actif. Neutre par défaut = crème + souligné or
 *   (comme l'onglet de vue de la Timeline). Passer `color` pour un toggle
 *   sémantique (texte + soulignement de cette couleur).
 * - `HeaderAction` : action primaire (Ajouter, Dashboard →). Texte vert semi-gras,
 *   pas de pastille pleine. Une seule par header.
 * - `HeaderSep` : fin filet vertical pour séparer des groupes / isoler l'action.
 *
 * Convention couleur : OR = état de vue / navigation ; VERT = action.
 */

const BASE = 'flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] pb-1 transition-all whitespace-nowrap';

const NEUTRAL_TEXT = '#ece7db'; // crème (onglet de vue actif)
const NEUTRAL_LINE = '#cba15e'; // or éditorial

/**
 * @param {boolean}  active   état actif (souligné + texte teinté)
 * @param {string}   [color]  accent sémantique quand actif (texte + soulignement).
 *                            Omis = neutre (crème + or), pour un onglet de vue.
 * @param {Function} onClick
 * @param {string}   [title]
 * @param {boolean}  [disabled]
 */
export function HeaderToggle({ active = false, color, onClick, title, disabled = false, children }) {
  const activeText = color ?? NEUTRAL_TEXT;
  const line       = color ?? NEUTRAL_LINE;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`${BASE} disabled:opacity-40`}
      style={{
        color:        active ? activeText : 'var(--color-atlas-soft)',
        borderBottom: `2px solid ${active ? line : 'transparent'}`,
        cursor:       disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Action primaire du header (texte vert semi-gras, façon « Ajouter » de la Timeline).
 * @param {Function} onClick
 * @param {string}   [color] défaut vert de marque
 * @param {string}   [title]
 */
export function HeaderAction({ onClick, color = '#5cae8e', title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${BASE} font-semibold hover:opacity-80`}
      style={{ color, borderBottom: '2px solid transparent', cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}

/** Fin filet vertical entre groupes de contrôles / avant l'action primaire. */
export function HeaderSep() {
  return <span aria-hidden="true" className="w-px h-4 self-center bg-white/10 flex-shrink-0" />;
}
