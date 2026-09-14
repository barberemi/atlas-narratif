import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VIZ_STATUS } from '../../data/viz_palette';
import Icon from '../ui/Icon';

const PencilIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/**
 * Tiroir de détail d'un beat (chantier 4) — ouvert au clic sur un beat de la frise.
 * Fusionne l'ancienne liste des 15 beats + les alertes en un seul endroit contextuel :
 * description, position idéale/tolérance, note(s) de craft, scènes qui le portent
 * (par tome, éditables), exemples canoniques, et l'action créer/éditer.
 *
 * @param {{ beat, events, volumes, isSeriesMode, totalChapters, isAlert, notes, onAssign }} props
 */
export default function BeatDrawer({ beat, events = [], volumes, isSeriesMode, totalChapters, isAlert, notes = [], onAssign }) {
  const { t } = useTranslation();
  const [exampleIdx, setExampleIdx] = useState(0);

  // Réinitialise le carrousel quand on change de beat
  useEffect(() => { setExampleIdx(0); }, [beat.id]);

  const rawExamples = beat.examples ?? [];
  const translated  = t(`narrative:beats.${beat.id}.examples`, { returnObjects: true, defaultValue: null });
  const examples    = Array.isArray(translated) ? translated : rawExamples;
  const current     = examples[exampleIdx];

  const placed      = events.length > 0;
  const primaryEvent = events[0] ?? null;
  const actualPct = (primaryEvent && !isSeriesMode && totalChapters)
    ? Math.round(((primaryEvent.chapter - 1 + 0.5) / totalChapters) * 100)
    : null;

  const volumeLabel = (evt) => {
    if (!volumes || volumes.length <= 1) return null;
    const vol = volumes.find(v => v.id === evt.volumeId);
    return vol ? `T.${vol.number}` : null;
  };

  // Statut du beat
  const status = !placed
    ? { label: t('stc.statusMissing'), color: 'var(--color-atlas-mute)' }
    : isAlert
      ? { label: t('stc.statusDeviation'), color: VIZ_STATUS.warn }
      : { label: t('stc.statusOnTrack'),  color: VIZ_STATUS.ok };

  return (
    <div className="flex flex-col gap-4" data-testid="beat-drawer">
      {/* En-tête : numéro + label + statut */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-black"
          style={{
            fontSize: 14,
            backgroundColor: `${beat.color}18`,
            border: `2px solid ${isAlert ? VIZ_STATUS.warn : beat.color + '80'}`,
            color: isAlert ? VIZ_STATUS.warn : beat.color,
          }}
        >
          {beat.number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-slate-100 leading-tight">
            {t(`narrative:beats.${beat.id}.label`, beat.label)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: status.color, backgroundColor: `${status.color}18` }}
            >
              {status.label}
            </span>
            <span className="text-[10px] font-mono text-atlas-mute">
              {t('stc.idealTolerance', { ideal: beat.idealPercent, tol: beat.tolerance })}
              {actualPct !== null && ` · ${t('stc.actualAt', { pct: actualPct })}`}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-atlas-soft leading-relaxed">
        {t(`narrative:beats.${beat.id}.desc`, beat.description)}
      </p>

      {/* Note(s) de craft rattachée(s) à ce beat */}
      {notes.map(n => (
        <div
          key={n.id}
          className="rounded-none px-3 py-2.5"
          style={{ backgroundColor: `${VIZ_STATUS.warn}12`, border: `1px solid ${VIZ_STATUS.warn}40` }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Icon name="warning" size={12} style={{ color: VIZ_STATUS.warn }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: VIZ_STATUS.warn }}>
              {t(n.titleKey)}
            </span>
          </div>
          <p className="text-[11px] text-atlas-soft leading-snug">{t(n.detailKey, n.params)}</p>
        </div>
      ))}

      {/* Scènes qui portent le beat */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em]">
          {t('stc.scenesForBeat')}
        </p>
        {placed ? (
          events.map(evt => {
            const lbl = volumeLabel(evt);
            return (
              <div
                key={evt.id}
                className="flex items-center gap-2 px-2.5 py-2 rounded-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                {lbl && (
                  <span className="font-mono font-bold px-1 rounded flex-shrink-0" style={{ fontSize: 9, backgroundColor: `${beat.color}20`, color: beat.color }}>
                    {lbl}
                  </span>
                )}
                <span className="text-[11px] font-mono text-atlas-mute flex-shrink-0">Ch.{evt.chapter}</span>
                <span className="text-xs text-slate-300 truncate flex-1">{evt.title}</span>
                <button
                  onClick={() => onAssign(beat, evt)}
                  className="w-6 h-6 flex items-center justify-center rounded-none flex-shrink-0 transition-all"
                  style={{ backgroundColor: 'rgba(92,174,142,0.15)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.3)' }}
                  title={t('stc.editEvent')}
                >
                  <PencilIcon />
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-atlas-mute italic">{t('stc.noSceneForBeat')}</p>
        )}
        <button
          onClick={() => onAssign(beat, null)}
          className="mt-1 w-full py-2 rounded-none text-xs font-bold transition-all"
          style={{ backgroundColor: 'rgba(92,174,142,0.1)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.25)' }}
        >
          {placed ? t('stc.addAnotherScene') : t('stc.createEventForBeat')}
        </button>
      </div>

      {/* Exemple canonique */}
      {current && (
        <div className="rounded-none px-3 py-2.5 flex flex-col gap-2" style={{ backgroundColor: `${beat.color}08`, border: `1px solid ${beat.color}20` }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExampleIdx(i => (i - 1 + examples.length) % examples.length)}
              className="w-5 h-5 flex items-center justify-center rounded text-[11px]"
              style={{ color: beat.color, backgroundColor: `${beat.color}15` }}
            >‹</button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${beat.color}20`, color: beat.color }}>
              {current.work}
            </span>
            <button
              onClick={() => setExampleIdx(i => (i + 1) % examples.length)}
              className="w-5 h-5 flex items-center justify-center rounded text-[11px]"
              style={{ color: beat.color, backgroundColor: `${beat.color}15` }}
            >›</button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic text-center">{current.text}</p>
        </div>
      )}
    </div>
  );
}
