import { useState, useEffect, useMemo, useRef } from 'react';
import { useDb } from '../db/DbContext';
import { useProject } from '../db/ProjectContext';
import { useHeroJourneyStore } from '../stores/useHeroJourneyStore';
import { useLoreStore } from '../stores/useLoreStore';
import { useVolumeStore } from '../stores/useVolumeStore';
import { useVolumeFilter } from '../hooks/useVolumeFilter';
import { HERO_PHASES, HERO_STAGES, HERO_PHASE_MAP } from '../data/hero_journey_config';

// ── StageCard ─────────────────────────────────────────────────────────────────

function StageCard({ stage, entry, onSave, onRemove }) {
  const phase      = HERO_PHASE_MAP[stage.phase];
  const phaseColor = phase?.color ?? '#3F51B5';

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
      className="rounded-xl overflow-hidden transition-all duration-150"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: editing
          ? `1px solid ${phaseColor}50`
          : '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${phaseColor}`,
      }}
    >
      {/* Contenu principal */}
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={() => !editing && setEditing(true)}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">{stage.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-200">{stage.label}</p>
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
            <p className="text-xs text-slate-500 italic font-serif mt-0.5 leading-relaxed">
              {stage.desc}
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
                {hasSummary ? 'Cliquer pour modifier…' : 'Cliquer pour annoter…'}
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
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Chapitre</label>
              <input
                type="number"
                min={1}
                value={chapterNum}
                onChange={e => setChapterNum(e.target.value)}
                placeholder="—"
                className="w-16 px-2 py-1.5 rounded-lg text-xs text-slate-200 outline-none text-center"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Note / Résumé</label>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Décrivez comment cette étape se manifeste dans votre histoire…"
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-xs text-slate-200 outline-none resize-none"
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
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                backgroundColor: `${phaseColor}25`,
                color: phaseColor,
                border: `1px solid ${phaseColor}40`,
              }}
            >
              Enregistrer
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 transition-all hover:text-slate-300"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Annuler
            </button>
            {entry && (
              <button
                onClick={handleRemove}
                className="ml-auto px-3 py-1.5 rounded-lg text-xs text-red-500 transition-all hover:text-red-400"
                style={{ border: '1px solid rgba(239,68,68,0.2)' }}
              >
                Effacer
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
  const db            = useDb();
  const { projectId } = useProject();

  const allEntries     = useHeroJourneyStore(s => s.entries);
  const loadEntries    = useHeroJourneyStore(s => s.load);
  const saveEntry      = useHeroJourneyStore(s => s.saveEntry);
  const removeEntry    = useHeroJourneyStore(s => s.removeEntry);
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);
  const filterByVolume = useVolumeFilter();
  const entries        = filterByVolume(allEntries);

  const characters    = useLoreStore(s => s.characters);
  const loadLore      = useLoreStore(s => s.load);

  useEffect(() => {
    if (!db || !projectId) return;
    loadEntries(db, projectId);
    if (!characters) loadLore(db, projectId);
  }, [db, projectId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-hidden">

      {/* Header */}
      <header data-tour="heros-stages" className="flex items-center px-6 py-3 border-b border-white/10 flex-shrink-0 gap-4 flex-wrap">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Voyage du <span style={{ color: '#3F51B5' }}>Héros</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            12 étapes archétypales de Joseph Campbell · {filledCount}/{HERO_STAGES.length} étapes renseignées
          </p>
        </div>

        {/* Sélecteur de personnage */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Héros</span>
          <div className="relative" ref={charMenuRef}>
            {(() => {
              const selectedChar = characterList.find(c => c.id === heroCharId);
              return (
                <>
                  <button
                    onClick={() => setCharMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
                                backgroundColor: full ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
                                color:           full ? '#10b981' : '#818cf8',
                              }}
                            >
                              {full ? '✓' : `${count}/${total}`}
                            </span>
                          ) : null;
                        })()}
                      </>
                    ) : (
                      <>
                        <span className="text-slate-500">👤</span>
                        Choisir un personnage…
                      </>
                    )}
                    <span className="ml-auto text-slate-600 text-[10px]">{charMenuOpen ? '▲' : '▼'}</span>
                  </button>
                  {charMenuOpen && (
                    <div
                      className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
                      style={{ minWidth: 220, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
                    >
                      <button
                        onClick={() => { setHeroCharId(''); setCharMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all hover:bg-white/5 text-slate-600"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-700" />
                        Aucun personnage
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
                            style={{ color: active ? c.color : '#64748b' }}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="flex-1 text-left">{c.name}</span>
                            {count > 0 && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: full ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                                  color:           full ? '#10b981' : '#818cf8',
                                  border: `1px solid ${full ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                                }}
                              >
                                {full ? '✓' : `${count}/${total}`}
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
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-600 font-serif italic">Chargement…</p>
          </div>
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
                  <span className="text-xs text-slate-400 font-semibold">{phase.label}</span>
                </div>
              ))}
              <div className="ml-auto">
                <div
                  className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{
                    backgroundColor: filledCount === HERO_STAGES.length
                      ? 'rgba(16,185,129,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    color: filledCount === HERO_STAGES.length ? '#10B981' : '#64748b',
                    border: filledCount === HERO_STAGES.length
                      ? '1px solid rgba(16,185,129,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {filledCount}/{HERO_STAGES.length} étapes
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
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        backgroundColor: `${phase.color}10`,
                        border: `1px solid ${phase.color}25`,
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: phase.color }}
                      />
                      <span className="text-xs font-black tracking-wide uppercase" style={{ color: phase.color }}>
                        {phase.label}
                      </span>
                      <span className="text-[10px] text-slate-600 ml-auto">
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
