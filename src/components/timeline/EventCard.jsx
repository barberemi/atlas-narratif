import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SEVERITY_CONFIG } from '../../data/severity_config';
import { getEntityMeta } from '../../utils/entityUtils';
import { OUTCOME_MAP } from '../../data/outcome_config';
import { usePlantStore } from '../../stores/usePlantStore';
import { PLANT_TYPES } from '../../pages/PlantsBrowser';
import EntityChip from './EntityChip';
import DarkCard from '../ui/DarkCard';

export default function EventCard({ event, isDimmed, onEntityClick, onEdit, allIncoherences, beat, volumeLabel }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const linkedIncs = useMemo(() =>
    (event.incoherenceIds ?? []).map(id => allIncoherences.find(i => i.id === id)).filter(Boolean),
    [event, allIncoherences],
  );

  const povMeta = useMemo(() =>
    event.povCharacterId ? getEntityMeta(event.povCharacterId, 'character') : null,
    [event.povCharacterId],
  );

  const outcome = event.sceneOutcome ? OUTCOME_MAP[event.sceneOutcome] : null;

  const plants = usePlantStore(s => s.plants);
  const linkedPlants = useMemo(() =>
    (plants ?? []).filter(p => p.plantEventId === event.id || p.payoffEventId === event.id),
    [plants, event.id],
  );

  const accentColor = outcome ? outcome.color : beat ? beat.color : 'rgba(63,81,181,0.5)';

  return (
    <DarkCard
      dimmed={isDimmed}
      onClick={() => setExpanded(p => !p)}
      className="group"
      style={event.isFlashback ? { borderColor: 'rgba(217,119,6,0.4)', backgroundColor: 'rgba(120,77,15,0.07)' } : undefined}
    >
      <div className="h-0.5" style={{ backgroundColor: accentColor }} />

      <div className="p-4 space-y-3">

        {/* ── Titre + bouton édition ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {volumeLabel && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                {volumeLabel}
              </span>
            )}
            <p className="text-sm font-bold text-slate-200 leading-snug">{event.title}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onEdit(event); }}
            className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 transition-all duration-200"
            style={{ backgroundColor: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}
            title={t('btn.edit', 'Modifier')}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        {/* ── Tags groupés par type ── */}
        {(event.isFlashback || beat || povMeta || linkedPlants.length > 0) && (
          <div className="space-y-1">

            {/* Flashback */}
            {event.isFlashback && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 w-7 flex-shrink-0">↩</span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)' }}
                >
                  {t('eventEditor.flashback', 'Flashback')}
                  {event.storyChapterRef != null && (
                    <span style={{ opacity: 0.7 }}>· ch.{event.storyChapterRef}</span>
                  )}
                </span>
              </div>
            )}
            {/* STC */}
            {beat && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 w-7 flex-shrink-0">STC</span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${beat.color}18`, color: beat.color, border: `1px solid ${beat.color}40` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: beat.color }} />
                  {beat.label}
                </span>
              </div>
            )}

            {/* POV */}
            {povMeta && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 w-7 flex-shrink-0">POV</span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${povMeta.color}18`, color: povMeta.color, border: `1px solid ${povMeta.color}40` }}
                >
                  👁 {povMeta.name.split(' ')[0]}
                </span>
              </div>
            )}

            {/* Amorces */}
            {linkedPlants.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 w-7 flex-shrink-0">◈</span>
                <div className="flex flex-wrap gap-1">
                  {linkedPlants.map(p => {
                    const typeCfg = PLANT_TYPES.find(t => t.id === p.type) ?? PLANT_TYPES[2];
                    const isPayoff = p.payoffEventId === event.id;
                    return (
                      <span key={p.id}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${typeCfg.color}18`, color: typeCfg.color, border: `1px solid ${typeCfg.color}40` }}
                        title={isPayoff ? `Payoff : ${p.label}` : `${t('plants.plant')} : ${p.label}`}
                      >
                        {isPayoff ? '◎' : '◉'} {p.label.slice(0, 18)}{p.label.length > 18 ? '…' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Contenu étendu ── */}
        {expanded && (
          <>
            <div className="pt-1 border-t border-white/5 space-y-2">
              {event.description && (
                <p className="text-xs text-slate-400 leading-relaxed font-serif">{event.description}</p>
              )}
              {(event.sceneGoal || event.sceneConflict) && (
                <div className="space-y-1.5">
                  {event.sceneGoal && (
                    <div className="text-xs">
                      <span className="text-slate-600 uppercase tracking-wider text-[9px] font-bold">{t('eventEditor.sceneGoal')} </span>
                      <span className="text-slate-400 font-serif">{event.sceneGoal}</span>
                    </div>
                  )}
                  {event.sceneConflict && (
                    <div className="text-xs">
                      <span className="text-slate-600 uppercase tracking-wider text-[9px] font-bold">{t('eventEditor.sceneConflict')} </span>
                      <span className="text-slate-400 font-serif">{event.sceneConflict}</span>
                    </div>
                  )}
                  {outcome && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${outcome.color}18`, color: outcome.color, border: `1px solid ${outcome.color}40` }}
                    >
                      {outcome.icon} {t(`outcome.${outcome.id}`, outcome.label)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Entités ── */}
        <div className="flex flex-wrap gap-1">
          {event.entities.map(entity => (
            <EntityChip key={entity.id + entity.entityType} entity={entity} onClick={onEntityClick} />
          ))}
        </div>

        {/* ── Incohérences ── */}
        {expanded && linkedIncs.length > 0 && (
          <div className="pt-1 border-t border-white/5 space-y-1">
            {linkedIncs.map(inc => {
              const cfg = SEVERITY_CONFIG[inc.severity];
              return (
                <div key={inc.id} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  ⚠ {inc.title}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DarkCard>
  );
}
