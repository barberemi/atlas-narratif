import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../ui/Icon';
import { actSegments, actIndexForChapter, actColor, chapterPercent } from '../../utils/acts';

/**
 * Curseur de chapitres partagé — pilote le temps de TOUS les personnages visibles
 * en même temps (piste 1 de la refonte carte). Remplace l'ancienne matrice
 * persos × chapitres qui portait le temps dans un state caché.
 *
 * Glisser le curseur = déplacer tous les personnages au chapitre correspondant.
 * Bandes d'acte peintes derrière la piste, alignées sur le modèle partagé
 * `utils/acts.js` (mêmes bandes que la frise Save the Cat et la Timeline).
 *
 * @param {Array<{number:number,title:string}>} chapters chapitres triés
 * @param {number}   index index courant (0..chapters.length-1)
 * @param {Function} onChange (index) => void
 * @param {Array<{gather:boolean,split:boolean,label:string}|null>} markers repères de
 *        convergence/divergence par chapitre (piste 4), même index que `chapters`
 * @param {string|null} currentInfo légende « qui est ensemble » au chapitre courant
 * @param {boolean}  playing lecture animée en cours (piste 7)
 * @param {Function} onTogglePlay bascule lecture / pause
 */
export default function ChapterCursor({ chapters, index, onChange, markers = [], currentInfo = null, playing = false, onTogglePlay }) {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const n = chapters.length;

  const idxFromClientX = useCallback((clientX) => {
    const el = trackRef.current;
    if (!el) return index;
    const rect = el.getBoundingClientRect();
    const pct  = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    // Inverse de chapterPercent : centre de case = (i + 0.5) / n
    return Math.min(n - 1, Math.max(0, Math.round(pct * n - 0.5)));
  }, [index, n]);

  const handlePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onChange(idxFromClientX(e.clientX));
  }, [idxFromClientX, onChange]);

  const handlePointerMove = useCallback((e) => {
    if (e.buttons === 0) return; // pas en train de glisser
    const next = idxFromClientX(e.clientX);
    if (next !== index) onChange(next);
  }, [idxFromClientX, index, onChange]);

  const handleKeyDown = useCallback((e) => {
    let next = index;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') next = index - 1;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = index + 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End')  next = n - 1;
    else return;
    e.preventDefault();
    onChange(Math.min(n - 1, Math.max(0, next)));
  }, [index, n, onChange]);

  if (!n) return null;

  const current    = chapters[index];
  const segments   = actSegments(n);
  const handlePct  = chapterPercent(index, n);
  const actLabels  = { 0: t('stc.actI'), 1: t('stc.actII'), 2: t('stc.actIII') };
  const anyMarker  = markers.some(m => m && (m.gather || m.split));

  return (
    <div
      className="px-6 md:px-16 py-2.5 select-none"
      style={{ backgroundColor: 'rgba(21,23,27,0.97)', borderTop: '1px solid var(--color-atlas-line)' }}
    >
      {/* ── Légende : chapitre courant ── */}
      <div className="flex items-baseline justify-between mb-2 gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[10px] font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em]">
            {t('map.chapterCursor')}
          </span>
          {anyMarker && (
            <span className="flex items-center gap-3 text-[10px] text-atlas-soft">
              <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rotate-45" style={{ backgroundColor: '#5cae8e' }} />{t('map.gatheringLabel')}</span>
              <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rotate-45" style={{ border: '1.5px solid var(--color-atlas-gold)' }} />{t('map.splitLabel')}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-atlas-soft truncate text-right">
          <span className="font-mono text-atlas-gold">{t('timeline.chapter', { n: current.number })}</span>
          {current.title && <span className="font-serif italic text-slate-300"> · {current.title}</span>}
        </p>
      </div>

      {/* ── Bandes d'acte ── */}
      <div className="flex w-full h-4 mb-1" aria-hidden="true">
        {segments.map(seg => (
          <div
            key={seg.key}
            className="flex items-center justify-center overflow-hidden"
            style={{
              width: `${(seg.count / n) * 100}%`,
              backgroundColor: `${seg.color}14`,
              borderLeft: seg.start > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <span
              className="text-[9px] font-grotesk font-bold uppercase tracking-[0.15em] truncate px-1"
              style={{ color: seg.color, opacity: 0.75 }}
            >
              {actLabels[seg.actIndex]}
            </span>
          </div>
        ))}
      </div>

      {/* ── Piste ── */}
      <div className="flex items-center gap-3">
        {onTogglePlay && (
          <button
            onClick={onTogglePlay}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all"
            style={{
              backgroundColor: playing ? 'rgba(92,174,142,0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${playing ? 'rgba(92,174,142,0.5)' : 'rgba(255,255,255,0.12)'}`,
              color: playing ? '#5cae8e' : 'var(--color-atlas-soft)',
            }}
            title={playing ? t('map.pause') : t('map.play')}
            aria-label={playing ? t('map.pause') : t('map.play')}
          >
            <Icon name={playing ? 'pause' : 'play'} size={13} />
          </button>
        )}
        <button
          onClick={() => onChange(Math.max(0, index - 1))}
          disabled={index === 0}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-atlas-mute hover:text-slate-200 disabled:opacity-20 transition-colors"
          title={t('map.prevChapter')}
          aria-label={t('map.prevChapter')}
        >
          <Icon name="chevronLeft" size={16} />
        </button>

        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={t('map.chapterCursor')}
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={index + 1}
          aria-valuetext={t('timeline.chapter', { n: current.number })}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onKeyDown={handleKeyDown}
          className="relative flex-1 h-8 cursor-pointer touch-none outline-none group"
          style={{ minWidth: 0 }}
        >
          {/* Ligne de base */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          {/* Portion parcourue */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-px"
            style={{ left: 0, width: `${handlePct}%`, backgroundColor: 'var(--color-atlas-gold)', opacity: 0.5 }}
          />
          {/* Ticks par chapitre */}
          {chapters.map((ch, i) => {
            const pct  = chapterPercent(i, n);
            const past = i <= index;
            const col  = actColor(actIndexForChapter(i, n));
            return (
              <span
                key={ch.number}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${pct}%`,
                  width: 4, height: 4,
                  backgroundColor: col,
                  opacity: past ? 0.8 : 0.28,
                }}
                title={`${t('timeline.chapter', { n: ch.number })}${ch.title ? ` · ${ch.title}` : ''}`}
              />
            );
          })}
          {/* Repères convergence (◆ plein) / divergence (◇ creux) */}
          {chapters.map((ch, i) => {
            const m = markers[i];
            if (!m || (!m.gather && !m.split)) return null;
            const gather = m.gather;
            return (
              <span
                key={`m-${ch.number}`}
                className="absolute -translate-x-1/2 rotate-45 pointer-events-none"
                style={{
                  left: `${chapterPercent(i, n)}%`,
                  top: 1,
                  width: 6, height: 6,
                  backgroundColor: gather ? '#5cae8e' : 'transparent',
                  border: gather ? 'none' : '1.5px solid var(--color-atlas-gold)',
                }}
                title={m.label}
              />
            );
          })}
          {/* Handle */}
          <span
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-shadow group-focus:ring-2"
            style={{
              left: `${handlePct}%`,
              width: 16, height: 16,
              backgroundColor: actColor(actIndexForChapter(index, n)),
              border: '2px solid #fff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.6)',
            }}
          />
        </div>

        <button
          onClick={() => onChange(Math.min(n - 1, index + 1))}
          disabled={index === n - 1}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-atlas-mute hover:text-slate-200 disabled:opacity-20 transition-colors"
          title={t('map.nextChapter')}
          aria-label={t('map.nextChapter')}
        >
          <Icon name="chevronRight" size={16} />
        </button>

        <span className="flex-shrink-0 text-[10px] font-mono text-atlas-mute tabular-nums w-10 text-right">
          {index + 1}/{n}
        </span>
      </div>

      {/* Légende « ensemble » au chapitre courant (piste 4) */}
      {currentInfo && (
        <p className="mt-1.5 text-[11px] text-atlas-soft truncate">
          <span className="inline-block w-1.5 h-1.5 rotate-45 mr-1.5 align-middle" style={{ backgroundColor: '#5cae8e' }} />
          {currentInfo}
        </p>
      )}
    </div>
  );
}
