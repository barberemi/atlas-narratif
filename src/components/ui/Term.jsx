import { useState, useRef, useLayoutEffect } from 'react';
import { GLOSSARY } from '../../data/glossary';

// ── Term ────────────────────────────────────────────────────────────────────
// Filet terminologique : enveloppe un mot du jargon narratif et affiche sa
// définition (glossaire) au survol ou au focus.
// Usage : <Term id="stc">Save the Cat</Term> — sans enfant, affiche le label.
// Si l'id est inconnu du glossaire, rend les enfants sans décoration.
//
// La bulle est en position:fixed, calculée depuis le rect du terme : sous le
// terme par défaut, bascule au-dessus si pas de place, clampée horizontalement
// dans le viewport. Évite tout découpage (titres en haut / bords) et passe
// au-dessus du reste (z-index élevé).
function Term({ id, children }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0, visible: false });
  const ref = useRef(null);
  const tipRef = useRef(null);
  const entry = GLOSSARY[id];

  useLayoutEffect(() => {
    if (!open || !ref.current || !tipRef.current) return;
    const r = ref.current.getBoundingClientRect();
    const tw = tipRef.current.offsetWidth;
    const th = tipRef.current.offsetHeight;
    const gap = 8, m = 8;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(m, Math.min(left, window.innerWidth - tw - m));
    let top = r.bottom + gap;                                   // sous le terme par défaut
    if (top + th > window.innerHeight - m) {                    // pas de place en bas → au-dessus
      const above = r.top - th - gap;
      if (above >= m) top = above;
    }
    setPos({ left, top, visible: true });
  }, [open]);

  // Fallback silencieux : id inconnu → pas de déco, juste le contenu.
  if (!entry) return <>{children}</>;

  const content = children ?? entry.label;

  return (
    <span
      ref={ref}
      className="border-b border-dotted border-white/30 cursor-help"
      tabIndex={0}
      aria-label={entry.def}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setPos(p => ({ ...p, visible: false })); }}
      onFocus={() => setOpen(true)}
      onBlur={() => { setOpen(false); setPos(p => ({ ...p, visible: false })); }}
    >
      {content}
      {open && (
        <span
          ref={tipRef}
          role="tooltip"
          className="max-w-[240px] w-max rounded-none px-3 py-2 text-[11px] leading-snug text-atlas-soft shadow-2xl pointer-events-none"
          style={{
            position: 'fixed', left: pos.left, top: pos.top,
            visibility: pos.visible ? 'visible' : 'hidden', zIndex: 100,
            backgroundColor: '#15171b', border: '1px solid var(--color-atlas-line)',
          }}
        >
          {entry.def}
        </span>
      )}
    </span>
  );
}

export default Term;
