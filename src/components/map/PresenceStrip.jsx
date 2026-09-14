import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { locationColor } from '../../utils/color';
import Icon from '../ui/Icon';

/**
 * Frise de présence — comparatif « qui est où, quand » (piste 2 de la refonte carte).
 * Une barre fine par personnage affiché, segmentée le long de l'axe chapitres :
 * chaque cellule est colorée par le LIEU où se trouve le personnage à ce chapitre
 * (couleur stable via `locationColor`, en attendant les régions — piste 5). Les
 * chapitres où le personnage est POV sont marqués d'un point. Remplace l'ancienne
 * matrice persos × chapitres (mur de points) par un bloc compact.
 *
 * Entre deux apparitions, on reporte le dernier lieu connu (le personnage « reste »
 * là où il était — cohérent avec le marqueur de la carte). Avant sa 1re apparition
 * ou après la dernière, la case est vide.
 *
 * @param {Array<{number:number,title:string}>} chapters chapitres triés
 * @param {Array<{key:string,label:string,color:string,journey:Array}>} characters personnages affichés
 * @param {number}   index index du chapitre courant (curseur partagé)
 * @param {Function} onChange (index) => void — cliquer une colonne déplace le curseur
 * @param {boolean}  open replié / déplié (piste 6 — dock bas pliable)
 * @param {Function} onToggle bascule replié / déplié
 */
export default function PresenceStrip({ chapters, characters, index, onChange, open = true, onToggle }) {
  const { t } = useTranslation();
  const n = chapters.length;

  // Pour chaque personnage : une cellule par chapitre (ou null si absent).
  const rows = useMemo(() => characters.map(char => {
    const steps = char.journey ?? [];
    if (!steps.length) return { char, cells: chapters.map(() => null) };

    const firstCh = steps[0].chapterNum;
    const lastCh  = steps[steps.length - 1].chapterNum;

    // Étape exacte par chapitre (dernière de son chapitre : lieu le plus récent)
    const byChapter = new Map();
    for (const s of steps) {
      const prev = byChapter.get(s.chapterNum);
      byChapter.set(s.chapterNum, {
        locationId: s.locationId ?? null,
        lieu:       s.lieu,
        isPov:      Boolean(prev?.isPov || s.isPov),
      });
    }

    const cells = chapters.map(ch => {
      if (ch.number < firstCh || ch.number > lastCh) return null; // hors présence connue
      const exact = byChapter.get(ch.number);
      if (exact) return exact;
      // report du dernier lieu connu ≤ ce chapitre (le perso « reste » sur place)
      let carried = null;
      for (const s of steps) { if (s.chapterNum <= ch.number) carried = s; else break; }
      return carried ? { locationId: carried.locationId ?? null, lieu: carried.lieu, isPov: false } : null;
    });

    return { char, cells };
  }), [characters, chapters]);

  if (!n || !characters.length) return null;

  return (
    <div
      className={`px-6 md:px-16 ${open ? 'pt-3 pb-1' : 'py-1.5'}`}
      style={{ backgroundColor: 'rgba(21,23,27,0.97)', borderTop: '1px solid var(--color-atlas-line)' }}
    >
      {/* En-tête + légende — cliquable pour replier/déplier */}
      <div className="flex items-baseline justify-between gap-4" style={{ marginBottom: open ? 8 : 0 }}>
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 flex-shrink-0 group"
          title={open ? t('map.collapse') : t('map.expand')}
          aria-expanded={open}
        >
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={12} className="text-atlas-mute group-hover:text-slate-300 transition-colors" />
          <span className="text-[10px] font-grotesk font-bold text-atlas-mute group-hover:text-slate-300 uppercase tracking-[0.2em] transition-colors">
            {t('map.presenceTitle')}
          </span>
          <span className="text-[10px] font-mono text-atlas-mute/70">· {characters.length}</span>
        </button>
        {open && (
          <div className="flex items-center gap-4 text-[10px] text-atlas-soft">
            <span>{t('map.byLocationLegend')}</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#fff', boxShadow: '0 0 0 1.5px rgba(0,0,0,0.5)' }} />
              {t('map.povLegend')}
            </span>
          </div>
        )}
      </div>

      {/* Barres */}
      {open && (
      <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar" style={{ maxHeight: '32vh' }}>
        {rows.map(({ char, cells }) => (
          <div key={char.key} className="flex items-center gap-3">
            {/* Étiquette personnage */}
            <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: 120 }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: char.color }} />
              <span className="text-xs font-semibold truncate" style={{ color: char.color }}>{char.label}</span>
            </div>

            {/* Piste : une cellule par chapitre */}
            <div className="relative flex-1 flex h-4 rounded-sm overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              {cells.map((cell, i) => {
                const isCurrent = i === index;
                return (
                  <button
                    key={chapters[i].number}
                    onClick={() => onChange(i)}
                    title={`${t('timeline.chapter', { n: chapters[i].number })}${cell ? ` · ${cell.lieu}` : ''}${cell?.isPov ? ' · POV' : ''}`}
                    className="relative flex-1 h-full flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: cell ? locationColor(cell.locationId) : 'transparent',
                      borderLeft: isCurrent ? '1px solid rgba(255,255,255,0.85)' : 'none',
                      borderRight: isCurrent ? '1px solid rgba(255,255,255,0.85)' : 'none',
                    }}
                  >
                    {cell?.isPov && (
                      <span
                        className="block rounded-full"
                        style={{ width: 5, height: 5, backgroundColor: '#fff', boxShadow: '0 0 0 1.5px rgba(0,0,0,0.55)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
