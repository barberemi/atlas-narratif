import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHeroJourneyStore } from '../stores/useHeroJourneyStore';
import { useLoreStore } from '../stores/useLoreStore';
import { useVolumeStore } from '../stores/useVolumeStore';
import { useStoreLoader } from '../hooks/useStoreLoader';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import Icon from '../components/ui/Icon';
import Term from '../components/ui/Term';
import { useVolumeFilter } from '../hooks/useVolumeFilter';
import { VIZ_STATUS } from '../data/viz_palette';
import { HERO_PHASES, HERO_STAGES, HERO_PHASE_MAP } from '../data/hero_journey_config';

// ── StageCard ─────────────────────────────────────────────────────────────────

function StageCard({ stage, entry, onSave, onRemove, t }) {
  const phase      = HERO_PHASE_MAP[stage.phase];
  const phaseColor = phase?.color ?? '#5cae8e';

  const [editing,    setEditing]    = useState(false);
  const [chapterNum, setChapterNum] = useState(entry?.chapterNum ?? '');
  const [summary,    setSummary]    = useState(entry?.summary    ?? '');

  // Sync local state when entry changes from outside
  useEffect(() => {
    if (!editing) {
      setChapterNum(entry?.chapterNum ?? '');
      setSummary(entry?.summary    ?? '');
    }
  }, [entry, editing]);

  const handleSave = async () => {
    await onSave({
      stageKey:   stage.key,
      chapterNum: chapterNum !== '' ? Number(chapterNum) : null,
      summary:    summary.trim() || null,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setChapterNum(entry?.chapterNum ?? '');
    setSummary(entry?.summary    ?? '');
    setEditing(false);
  };

  const handleRemove = async () => {
    if (!entry) return;
    await onRemove(entry.id);
    setEditing(false);
  };

  const hasSummary = entry?.summary;
  const hasChapter = entry?.chapterNum != null;

  return (
    <div
      className="rounded-none overflow-hidden transition-all duration-150"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderStyle: 'solid',
        borderWidth: '1px 1px 1px 3px',
        borderColor: editing
          ? `${phaseColor}50 ${phaseColor}50 ${phaseColor}50 ${phaseColor}`
          : `transparent transparent transparent ${phaseColor}`,
      }}
    >
      {/* Contenu principal */}
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={() => !editing && setEditing(true)}
      >
        <div className="flex items-start gap-3">
          <Icon name={stage.icon} size={20} className="flex-shrink-0 mt-0.5" style={{ color: phaseColor }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-serif text-sm font-semibold text-atlas-text">{t(`narrative:hero.stages.${stage.key}.label`, stage.label)}</p>
              {hasChapter && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: `${phaseColor}20`,
                    color: phaseColor,
                    border: `1px solid ${phaseColor}35`,
                  }}
                >
                  Ch.{entry.chapterNum}
                </span>
              )}
            </div>
            <p className="text-xs text-atlas-soft italic font-serif mt-0.5 leading-relaxed">
              {t(`narrative:hero.stages.${stage.key}.desc`, stage.desc)}
            </p>
            {hasSummary && (
              <p className="text-xs text-slate-300 mt-2 leading-relaxed border-t border-white/5 pt-2">
                {entry.summary}
              </p>
            )}
            {!editing && (
              <p
                className="text-[10px] mt-2 transition-colors"
                style={{ color: phaseColor, opacity: 0.6 }}
              >
                {hasSummary ? t('hero.clickToEdit', 'Cliquer pour modifier\u2026') : t('hero.clickToAnnotate', 'Cliquer pour annoter\u2026')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire d'édition inline */}
      {editing && (
        <div
          className="px-4 pb-4 flex flex-col gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3 pt-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('label.chapters', 'Chapitre')}</label>
              <input
                type="number"
                min={1}
                value={chapterNum}
                onChange={e => setChapterNum(e.target.value)}
                placeholder="—"
                className="w-16 px-2 py-1.5 rounded-none text-xs text-slate-200 outline-none text-center"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('hero.noteSummary', 'Note / R\u00e9sum\u00e9')}</label>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder={t('hero.summaryPlaceholder', 'D\u00e9crivez comment cette \u00e9tape se manifeste dans votre histoire\u2026')}
                rows={3}
                className="w-full px-3 py-2 rounded-none text-xs text-slate-200 outline-none resize-none"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] transition-all"
              style={{
                backgroundColor: `${phaseColor}25`,
                color: phaseColor,
                border: `1px solid ${phaseColor}40`,
              }}
            >
              {t('btn.save')}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] text-atlas-mute transition-all hover:text-atlas-soft"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {t('btn.cancel')}
            </button>
            {entry && (
              <button
                onClick={handleRemove}
                className="ml-auto px-3 py-1.5 font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] text-red-500 transition-all hover:text-red-400"
                style={{ border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {t('btn.delete')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function HeroJourney() {
  const { t } = useTranslation();
  const allEntries     = useHeroJourneyStore(s => s.entries);
  const saveEntry      = useHeroJourneyStore(s => s.saveEntry);
  const removeEntry    = useHeroJourneyStore(s => s.removeEntry);
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);
  const filterByVolume = useVolumeFilter();
  const entries        = filterByVolume(allEntries);

  const characters    = useLoreStore(s => s.characters);

  useStoreLoader([useHeroJourneyStore]);

  // ── Personnage héros sélectionné ──────────────────────────────────────────
  const [heroCharId,    setHeroCharId]    = useState('');
  const [charMenuOpen,  setCharMenuOpen]  = useState(false);
  const charMenuRef = useRef(null);
  useEffect(() => {
    if (!charMenuOpen) return;
    const handler = (e) => { if (charMenuRef.current && !charMenuRef.current.contains(e.target)) setCharMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [charMenuOpen]);

  const characterList = characters ?? [];

  // Réinitialiser la sélection si le perso n'existe plus
  useEffect(() => {
    if (heroCharId && characterList.length && !characterList.find(c => c.id === heroCharId)) {
      setHeroCharId('');
    }
  }, [characterList, heroCharId]);

  // ── Index des entrées par stageKey pour le perso sélectionné ─────────────
  const entryMap = useMemo(() => {
    const map = new Map();
    for (const e of (entries ?? [])) {
      if (e.characterId === (heroCharId || null)) {
        map.set(e.stageKey, e);
      }
    }
    return map;
  }, [entries, heroCharId]);

  // ── Statistiques ─────────────────────────────────────────────────────────
  const filledCount = useMemo(
    () => HERO_STAGES.filter(s => entryMap.has(s.key)).length,
    [entryMap],
  );

  // Compteur de stages remplis par personnage (pour le dropdown)
  const countPerChar = useMemo(() => {
    const map = new Map();
    for (const e of (entries ?? [])) {
      if (!e.characterId) continue;
      map.set(e.characterId, (map.get(e.characterId) ?? 0) + 1);
    }
    return map;
  }, [entries]);

  // Auto-sélection au premier chargement : atterrir sur le personnage au
  // parcours le plus renseigné plutôt que sur un écran vide « 0/12 ».
  // Une seule fois par montage → ne réécrase pas un choix « Aucun personnage ».
  const didAutoSelectRef = useRef(false);
  useEffect(() => {
    if (didAutoSelectRef.current || heroCharId || !countPerChar.size) return;
    let bestId = null, bestCount = 0;
    for (const c of characterList) {
      const n = countPerChar.get(c.id) ?? 0;
      if (n > bestCount) { bestCount = n; bestId = c.id; }
    }
    if (bestId) {
      didAutoSelectRef.current = true;
      setHeroCharId(bestId);
    }
  }, [countPerChar, characterList, heroCharId]);

  const handleSave = async ({ stageKey, chapterNum, summary }) => {
    await saveEntry({
      stageKey,
      characterId: heroCharId || null,
      chapterNum,
      summary,
      volumeId: activeVolumeId ?? null,
    });
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200 overflow-hidden">

      {/* Header */}
      <header data-tour="heros-stages" className="flex items-center px-6 py-5 border-b border-atlas-line flex-shrink-0 gap-4 flex-wrap">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'\u00c9crire \u00b7 voyage du h\u00e9ros'}</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            <Term id="heroJourney">{t('hero.titlePrefix', 'Voyage du')} <span className="italic" style={{ color: '#5cae8e' }}>{t('hero.titleHighlight', 'H\u00e9ros')}</span></Term>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {t('hero.subtitle', '12 \u00e9tapes arch\u00e9typales de Joseph Campbell')} · {filledCount}/{HERO_STAGES.length} {t('hero.stagesFilled', '\u00e9tapes renseign\u00e9es')}
          </p>
        </div>

        {/* Sélecteur de personnage */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('hero.heroLabel', 'H\u00e9ros')}</span>
          <div className="relative" ref={charMenuRef}>
            {(() => {
              const selectedChar = characterList.find(c => c.id === heroCharId);
              return (
                <>
                  <button
                    onClick={() => setCharMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-semibold transition-all"
                    style={{
                      minWidth: 200,
                      backgroundColor: selectedChar ? `${selectedChar.color}22` : 'rgba(255,255,255,0.06)',
                      color:           selectedChar ? selectedChar.color : '#94a3b8',
                      border:          selectedChar ? `1px solid ${selectedChar.color}55` : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {selectedChar ? (
                      <>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedChar.color }} />
                        {selectedChar.name}
                        {(() => {
                          const count = countPerChar.get(selectedChar.id) ?? 0;
                          const total = HERO_STAGES.length;
                          const full  = count === total;
                          return count > 0 ? (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
                              style={{
                                backgroundColor: full ? 'rgba(16,185,129,0.2)' : 'rgba(92,174,142,0.2)',
                                color:           full ? VIZ_STATUS.ok : '#5cae8e',
                              }}
                            >
                              {full ? <Icon name="checkmark" size={14} /> : `${count}/${total}`}
                            </span>
                          ) : null;
                        })()}
                      </>
                    ) : (
                      <>
                        <Icon name="user" size={14} className="text-atlas-soft" />
                        {t('hero.chooseCharacter', 'Choisir un personnage\u2026')}
                      </>
                    )}
                    <span className="ml-auto text-atlas-mute"><Icon name={charMenuOpen ? 'chevronUp' : 'chevronDown'} size={12} /></span>
                  </button>
                  {charMenuOpen && (
                    <div
                      className="absolute left-0 top-full mt-1 z-30 rounded-none overflow-y-auto"
                      style={{ minWidth: 220, maxHeight: 'calc(100vh - 120px)', backgroundColor: '#1a1d22', border: '1px solid var(--color-atlas-line)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
                    >
                      <button
                        onClick={() => { setHeroCharId(''); setCharMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all hover:bg-white/5 text-atlas-mute"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-700" />
                        {t('hero.noCharacter', 'Aucun personnage')}
                      </button>
                      {characterList.map(c => {
                        const count   = countPerChar.get(c.id) ?? 0;
                        const total   = HERO_STAGES.length;
                        const full    = count === total;
                        const active  = heroCharId === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => { setHeroCharId(c.id); setCharMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all hover:bg-white/5"
                            style={{ color: active ? c.color : 'var(--color-atlas-soft)' }}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="flex-1 text-left">{c.name}</span>
                            {count > 0 && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: full ? 'rgba(16,185,129,0.15)' : 'rgba(92,174,142,0.15)',
                                  color:           full ? VIZ_STATUS.ok : '#5cae8e',
                                  border: `1px solid ${full ? 'rgba(16,185,129,0.3)' : 'rgba(92,174,142,0.3)'}`,
                                }}
                              >
                                {full ? <Icon name="checkmark" size={14} /> : `${count}/${total}`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </header>

      {/* Contenu */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 py-6">

        {entries === null ? (
          <Skeleton variant="card" />
        ) : characterList.length === 0 ? (
          <EmptyState icon={<Icon name="hero" size={40} className="text-atlas-mute" />} title={t('empty.noCharacters')} hint={t('hero.emptyHint', 'Ajoutez des personnages dans le Lore pour commencer le Voyage du H\u00e9ros.')} />
        ) : (
          <div data-tour="heros-grid" className="max-w-6xl mx-auto">

            {/* Légende des phases */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              {HERO_PHASES.map(phase => (
                <div key={phase.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: phase.color }}
                  />
                  <span className="text-xs text-slate-400 font-semibold">{t(`narrative:hero.phases.${phase.id}`, phase.label)}</span>
                </div>
              ))}
              <div className="ml-auto">
                <div
                  className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{
                    backgroundColor: filledCount === HERO_STAGES.length
                      ? 'rgba(16,185,129,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    color: filledCount === HERO_STAGES.length ? VIZ_STATUS.ok : 'var(--color-atlas-soft)',
                    border: filledCount === HERO_STAGES.length
                      ? '1px solid rgba(16,185,129,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {filledCount}/{HERO_STAGES.length} {t('hero.stages', '\u00e9tapes')}
                </div>
              </div>
            </div>

            {/* Grille 3 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HERO_PHASES.map(phase => {
                const phaseStages = HERO_STAGES.filter(s => s.phase === phase.id);
                return (
                  <div key={phase.id} className="flex flex-col gap-3">
                    {/* En-tête de phase */}
                    <div
                      className="flex items-center gap-2 pb-2"
                      style={{ borderBottom: `2px solid ${phase.color}` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: phase.color }}
                      />
                      <span className="font-grotesk text-xs font-bold tracking-[0.14em] uppercase" style={{ color: phase.color }}>
                        {t(`narrative:hero.phases.${phase.id}`, phase.label)}
                      </span>
                      <span className="text-[10px] text-atlas-mute ml-auto">
                        {phaseStages.filter(s => entryMap.has(s.key)).length}/{phaseStages.length}
                      </span>
                    </div>

                    {/* Cartes d'étapes */}
                    {phaseStages.map(stage => (
                      <StageCard
                        key={stage.key}
                        stage={stage}
                        entry={entryMap.get(stage.key) ?? null}
                        onSave={handleSave}
                        onRemove={removeEntry}
                        t={t}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
