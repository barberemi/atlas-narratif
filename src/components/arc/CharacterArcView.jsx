import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCharacterArcStore } from '../../stores/useCharacterArcStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { CHART_H, PAD, xToSvg, smoothPath } from '../../utils/arcUtils';

// ── Composant chart multi-lignes ──────────────────────────────────────────────

function MultiLineChart({ chapters, lines, svgW, activeChapter, onChapterClick, volumeSeparators = [] }) {
  if (!svgW || !chapters.length) return null;
  const chartW = svgW - PAD.left - PAD.right;
  const svgH   = CHART_H + PAD.top + PAD.bottom;

  return (
    <svg width={svgW} height={svgH}>
      {/* Grille Y */}
      {[0, 2, 4, 6, 8, 10].map(v => {
        const y = PAD.top + ((10 - v) / 10) * CHART_H;
        return (
          <g key={v}>
            <line x1={PAD.left} y1={y} x2={svgW - PAD.right} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#334155">{v}</text>
          </g>
        );
      })}

      {/* Labels X */}
      {(() => {
        const step = Math.max(1, Math.ceil(chapters.length / 16));
        return chapters
          .filter((_, i) => i % step === 0 || i === chapters.length - 1)
          .map((ch) => {
            const idx = chapters.indexOf(ch);
            const x = xToSvg(idx, chapters.length, chartW);
            return (
              <text key={ch.number} x={x} y={svgH - PAD.bottom + 16}
                textAnchor="middle" fontSize="10" fill="#334155">
                {ch.number}
              </text>
            );
          });
      })()}

      {/* Zone cliquable chapitres */}
      {chapters.map((ch, i) => {
        const x = xToSvg(i, chapters.length, chartW);
        return (
          <rect
            key={ch.number}
            x={x - (chartW / Math.max(chapters.length - 1, 1)) / 2}
            y={PAD.top}
            width={chartW / Math.max(chapters.length - 1, 1)}
            height={CHART_H}
            fill={activeChapter === ch.number ? 'rgba(255,255,255,0.03)' : 'transparent'}
            style={{ cursor: 'pointer' }}
            onClick={() => onChapterClick(ch.number)}
          />
        );
      })}

      {/* Ligne verticale chapitre actif */}
      {activeChapter != null && (() => {
        const idx = chapters.findIndex(c => c.number === activeChapter);
        if (idx < 0) return null;
        const x = xToSvg(idx, chapters.length, chartW);
        return (
          <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + CHART_H}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
        );
      })()}

      {/* Séparateurs de tomes */}
      {volumeSeparators.map(sep => {
        const idx = chapters.findIndex(c => c.number === sep.chapterNum);
        if (idx < 0) return null;
        const x = idx === 0 ? PAD.left : xToSvg(idx, chapters.length, chartW);
        return (
          <g key={sep.chapterNum}>
            <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + CHART_H}
              stroke="rgba(99,102,241,0.35)" strokeWidth="1" strokeDasharray="4,3" />
            <text x={x + 4} y={PAD.top + 13} fontSize="9" fill="rgba(129,140,248,0.7)" fontWeight="bold">
              {sep.label}
            </text>
          </g>
        );
      })}

      {/* Lignes par axe/personnage */}
      {lines.map(({ id, color, pointsMap }) => {
        const pts = chapters
          .map((ch, i) => {
            const v = pointsMap.get(ch.number);
            if (v == null) return null;
            return { x: xToSvg(i, chapters.length, chartW), y: PAD.top + ((10 - v) / 10) * CHART_H };
          })
          .filter(Boolean);

        const path = smoothPath(pts);
        return (
          <g key={id}>
            {path && (
              <path d={path} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
            )}
            {pts.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r={3.5}
                fill="#0B1621" stroke={color} strokeWidth="2" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Autocomplétion label ──────────────────────────────────────────────────────

function LabelAutocomplete({ value, onChange, suggestions, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = useMemo(
    () => suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value),
    [suggestions, value],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative flex-1" ref={ref}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50"
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden"
          style={{ minWidth: '100%', backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
        >
          {filtered.map(s => (
            <button
              key={s}
              onMouseDown={e => { e.preventDefault(); onSelect(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Vue principale ────────────────────────────────────────────────────────────

export default function CharacterArcView({ chapters, chapterOffset = 0, volumes = [], activeVolumeId = null, volumeSeparators = [] }) {
  const { t } = useTranslation();
  const axes       = useCharacterArcStore(s => s.axes);
  const points     = useCharacterArcStore(s => s.points);
  const axisLabels = useCharacterArcStore(s => s.axisLabels);
  const addAxis    = useCharacterArcStore(s => s.addAxis);
  const removeAxis = useCharacterArcStore(s => s.removeAxis);
  const setPoint   = useCharacterArcStore(s => s.setPoint);

  const characters = useLoreStore(s => s.characters) ?? [];

  const [mode,           setMode]          = useState('char');   // 'char' | 'axis'
  const [selectedCharId, setSelectedCharId] = useState(null);
  const [selectedLabel,  setSelectedLabel]  = useState(null);
  const [activeChapter,  setActiveChapter]  = useState(null);

  // Formulaire ajout d'axe
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#818cf8');
  const [adding,   setAdding]   = useState(false);

  // Sélecteur personnage
  const [charMenuOpen, setCharMenuOpen] = useState(false);
  const charMenuRef = useRef(null);
  useEffect(() => {
    if (!charMenuOpen) return;
    const handler = (e) => { if (charMenuRef.current && !charMenuRef.current.contains(e.target)) setCharMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [charMenuOpen]);

  // SVG width
  const [svgW, setSvgW] = useState(0);
  const [containerEl, setContainerEl] = useState(null);
  useEffect(() => {
    if (!containerEl) return;
    const obs = new ResizeObserver(entries => setSvgW(entries[0].contentRect.width));
    obs.observe(containerEl);
    return () => obs.disconnect();
  }, [containerEl]);

  // ── Vue série (read-only) ─────────────────────────────────────────────────
  const isSeriesView = activeVolumeId === null && volumes.length >= 2;

  // ── Données pour le chart ─────────────────────────────────────────────────

  const charAxes = useMemo(
    () => (selectedCharId ? (axes[selectedCharId] ?? []) : []),
    [axes, selectedCharId],
  );

  /**
   * Construit une Map locale (numéro de chapitre affiché → valeur) pour un axe.
   * En vue tome : filtre par volumeId et soustrait l'offset (local = global - offset).
   * En vue série : toutes les données, clé = chapter_num global (déjà cohérent avec `chapters`).
   */
  const buildPointsMap = (axisPoints) => {
    if (isSeriesView) {
      return new Map(axisPoints.map(p => [p.chapterNum, p.value]));
    }
    return new Map(
      axisPoints
        .filter(p => p.volumeId == null || p.volumeId === activeVolumeId)
        .map(p => [p.chapterNum - chapterOffset, p.value])
    );
  };

  // Mode char: une ligne par axe du personnage sélectionné
  const charLines = useMemo(() => charAxes.map(ax => ({
    id:        ax.id,
    label:     ax.label,
    color:     ax.color,
    pointsMap: buildPointsMap(points[ax.id] ?? []),
  })), [charAxes, points, isSeriesView, activeVolumeId, chapterOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tous les labels d'axes du projet
  const allLabels = useMemo(() => axisLabels, [axisLabels]);

  // Mode axis: une ligne par personnage qui a cet axe
  const axisLines = useMemo(() => {
    if (!selectedLabel) return [];
    const lines = [];
    for (const char of characters) {
      const charAx = (axes[char.id] ?? []).find(ax => ax.label === selectedLabel);
      if (!charAx) continue;
      lines.push({
        id:        char.id,
        label:     char.name,
        color:     char.color ?? '#64748b',
        pointsMap: buildPointsMap(points[charAx.id] ?? []),
        axisId:    charAx.id,
      });
    }
    return lines;
  }, [selectedLabel, characters, axes, points, isSeriesView, activeVolumeId, chapterOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeLines = mode === 'char' ? charLines : axisLines;

  // Chapitre actif
  const activeChapterData = activeChapter != null ? chapters.find(c => c.number === activeChapter) : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddAxis = async () => {
    if (!newLabel.trim() || !selectedCharId) return;
    setAdding(true);
    await addAxis(selectedCharId, newLabel.trim(), newColor);
    setNewLabel('');
    setAdding(false);
  };

  const handleSetPoint = async (axisId, localChapterNum, value) => {
    await setPoint(axisId, localChapterNum + chapterOffset, value, null);
  };

  const selectedChar = characters.find(c => c.id === selectedCharId);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* Barre de mode */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest">{t('arc.mode')}</span>
        {[
          { id: 'char', label: t('arc.modeChar') },
          { id: 'axis', label: t('arc.modeAxis') },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: mode === m.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              border:          mode === m.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color:           mode === m.id ? '#818cf8' : '#64748b',
              boxShadow:       mode === m.id ? '0 0 12px rgba(99,102,241,0.2)' : 'none',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Sélecteur */}
      {mode === 'char' ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-widest flex-shrink-0">{t('label.characters', { count: 1 })}</span>
          <div className="relative" ref={charMenuRef}>
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
                </>
              ) : (
                <>
                  <span className="text-slate-500">👤</span>
                  {t('arc.chooseCharacter')}
                </>
              )}
              <span className="ml-auto text-slate-600 text-[10px]">{charMenuOpen ? '▲' : '▼'}</span>
            </button>
            {charMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
                style={{ minWidth: 220, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              >
                {characters.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCharId(c.id); setCharMenuOpen(false); setActiveChapter(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all hover:bg-white/5"
                    style={{ color: selectedCharId === c.id ? c.color : '#64748b' }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    {c.name}
                    {selectedCharId === c.id && <span className="ml-auto text-[10px]" style={{ color: c.color }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-widest flex-shrink-0">{t('arc.axis')}</span>
          {allLabels.length === 0 ? (
            <span className="text-xs text-slate-600 italic">{t('arc.noAxes')}</span>
          ) : allLabels.map(lbl => (
            <button
              key={lbl}
              onClick={() => { setSelectedLabel(lbl); setActiveChapter(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: selectedLabel === lbl ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border:          selectedLabel === lbl ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color:           selectedLabel === lbl ? '#818cf8' : '#64748b',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      )}

      {/* Légende des lignes */}
      {activeLines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeLines.map(l => (
            <span key={l.id} className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${l.color}15`, color: l.color, border: `1px solid ${l.color}30` }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}

      {/* Chart */}
      {activeLines.length > 0 && chapters.length > 0 && (
        <div
          ref={setContainerEl}
          className="relative rounded-2xl overflow-hidden"
          style={{ height: CHART_H + PAD.top + PAD.bottom, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {svgW > 0 && (
            <MultiLineChart
              chapters={chapters}
              lines={activeLines}
              svgW={svgW}
              activeChapter={activeChapter}
              onChapterClick={n => setActiveChapter(prev => prev === n ? null : n)}
              volumeSeparators={volumeSeparators}
            />
          )}
          {isSeriesView && (
            <div className="absolute bottom-2 right-3 text-[10px] text-slate-600 italic pointer-events-none">
              {t('arc.seriesViewHint')}
            </div>
          )}
        </div>
      )}

      {/* Panel chapitre actif (mode char) — masqué en vue série */}
      {mode === 'char' && !isSeriesView && activeChapterData && charAxes.length > 0 && (
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-sm font-black text-slate-200">
            {t('arc.chapter')} {activeChapterData.number}{activeChapterData.localNumber != null ? ` (ch.${activeChapterData.localNumber})` : ''} — {activeChapterData.title}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charAxes.map(ax => {
              const line = charLines.find(l => l.id === ax.id);
              const val  = line?.pointsMap.get(activeChapterData.number) ?? null;
              return (
                <div key={ax.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: ax.color }}>{ax.label}</span>
                    <span className="text-sm font-black" style={{ color: ax.color }}>{val ?? '—'}</span>
                  </div>
                  <input
                    type="range"
                    min={0} max={10} step={1}
                    value={val ?? 0}
                    onChange={e => handleSetPoint(ax.id, activeChapterData.number, Number(e.target.value))}
                    className="w-full"
                    style={{ cursor: 'pointer', accentColor: ax.color }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grille chapitres (mode char) */}
      {mode === 'char' && selectedCharId && charAxes.length > 0 && chapters.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 text-slate-600 font-normal border-b border-white/5 sticky left-0 bg-[#0B1621]">Ch.</th>
                {charAxes.map(ax => (
                  <th key={ax.id} className="px-2 py-1.5 font-semibold border-b border-white/5 text-center"
                    style={{ color: ax.color }}>
                    {ax.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chapters.map(ch => {
                const isActive = activeChapter === ch.number;
                return (
                  <tr
                    key={ch.number}
                    onClick={() => !isSeriesView && setActiveChapter(prev => prev === ch.number ? null : ch.number)}
                    className={isSeriesView ? '' : 'cursor-pointer hover:bg-white/3 transition-colors'}
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.04)' : undefined }}
                  >
                    <td className="px-2 py-1.5 text-slate-500 border-b border-white/5 sticky left-0 bg-inherit font-mono">
                      {ch.localNumber ?? ch.number}
                      {ch.volumeId && <span className="ml-1 text-[9px] text-indigo-600">T{volumes.findIndex(v => v.id === ch.volumeId) + 1}</span>}
                    </td>
                    {charAxes.map(ax => {
                      const line = charLines.find(l => l.id === ax.id);
                      const val  = line?.pointsMap.get(ch.number);
                      return (
                        <td key={ax.id} className="px-2 py-1.5 text-center border-b border-white/5">
                          {val != null ? (
                            <span className="font-bold" style={{ color: ax.color }}>{val}</span>
                          ) : (
                            <span className="text-slate-700">·</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Gestion des axes (mode char) — masqué en vue série */}
      {mode === 'char' && selectedCharId && !isSeriesView && (
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">{t('arc.axesOf', { name: selectedChar?.name ?? '…' })}</p>

          {/* Liste des axes existants */}
          {charAxes.length > 0 && (
            <div className="flex flex-col gap-1">
              {charAxes.map(ax => (
                <div key={ax.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ backgroundColor: `${ax.color}10`, border: `1px solid ${ax.color}25` }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ax.color }} />
                  <span className="text-xs font-semibold flex-1" style={{ color: ax.color }}>{ax.label}</span>
                  <button
                    onClick={() => removeAxis(ax.id, selectedCharId)}
                    className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors text-xs flex-shrink-0"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter un axe */}
          <div className="flex items-center gap-2">
            <LabelAutocomplete
              value={newLabel}
              onChange={setNewLabel}
              suggestions={axisLabels}
              onSelect={setNewLabel}
              placeholder={t('arc.axisNamePlaceholder')}
            />
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
              title={t('arc.axisColor')}
            />
            <button
              onClick={handleAddAxis}
              disabled={adding || !newLabel.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 disabled:opacity-30"
              style={{ backgroundColor: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
            >
              {adding ? '…' : `+ ${t('arc.axis')}`}
            </button>
          </div>
        </div>
      )}

      {/* État vide */}
      {mode === 'char' && !selectedCharId && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600 font-serif italic text-sm">{t('arc.selectCharHint')}</p>
        </div>
      )}
      {mode === 'axis' && !selectedLabel && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600 font-serif italic text-sm">
            {allLabels.length === 0
              ? t('arc.noAxesHint')
              : t('arc.selectAxisHint')}
          </p>
        </div>
      )}
    </div>
  );
}
