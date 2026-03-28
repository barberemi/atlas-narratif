import { useState, useMemo, useEffect, useRef } from 'react';
import { useCharacterArcStore } from '../../stores/useCharacterArcStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { CHART_H, PAD, yToSvg, xToSvg, smoothPath } from '../../utils/arcUtils';

// ── Composant chart multi-lignes ──────────────────────────────────────────────

function MultiLineChart({ chapters, lines, svgW, activeChapter, onChapterClick }) {
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
          .map((ch, _, arr) => {
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

function LabelAutocomplete({ value, onChange, suggestions, onSelect }) {
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
        placeholder="Nom de l'axe…"
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

export default function CharacterArcView({ chapters }) {
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

  // ── Données pour le chart ─────────────────────────────────────────────────

  const charAxes = useMemo(
    () => (selectedCharId ? (axes[selectedCharId] ?? []) : []),
    [axes, selectedCharId],
  );

  // Mode char: une ligne par axe du personnage sélectionné
  const charLines = useMemo(() => charAxes.map(ax => ({
    id:        ax.id,
    label:     ax.label,
    color:     ax.color,
    pointsMap: new Map((points[ax.id] ?? []).map(p => [p.chapterNum, p.value])),
  })), [charAxes, points]);

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
        pointsMap: new Map((points[charAx.id] ?? []).map(p => [p.chapterNum, p.value])),
        axisId:    charAx.id,
      });
    }
    return lines;
  }, [selectedLabel, characters, axes, points]);

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

  const handleSetPoint = async (axisId, chapterNum, value) => {
    await setPoint(axisId, chapterNum, value, null);
  };

  const selectedChar = characters.find(c => c.id === selectedCharId);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* Barre de mode */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest">Mode</span>
        {[
          { id: 'char', label: '1 personnage · tous ses axes' },
          { id: 'axis', label: '1 axe · tous les personnages' },
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
          <span className="text-xs text-slate-500 uppercase tracking-widest flex-shrink-0">Personnage</span>
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
          <span className="text-xs text-slate-500 uppercase tracking-widest flex-shrink-0">Axe</span>
          {allLabels.length === 0 ? (
            <span className="text-xs text-slate-600 italic">Aucun axe créé dans ce projet.</span>
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
            />
          )}
        </div>
      )}

      {/* Panel chapitre actif (mode char) */}
      {mode === 'char' && activeChapterData && charAxes.length > 0 && (
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-sm font-black text-slate-200">
            Chapitre {activeChapterData.number} — {activeChapterData.title}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charAxes.map(ax => {
              const pm = new Map((points[ax.id] ?? []).map(p => [p.chapterNum, p.value]));
              const val = pm.get(activeChapterData.number) ?? null;
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
                    onClick={() => setActiveChapter(prev => prev === ch.number ? null : ch.number)}
                    className="cursor-pointer hover:bg-white/3 transition-colors"
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.04)' : undefined }}
                  >
                    <td className="px-2 py-1.5 text-slate-500 border-b border-white/5 sticky left-0 bg-inherit font-mono">
                      {ch.number}
                    </td>
                    {charAxes.map(ax => {
                      const pm = new Map((points[ax.id] ?? []).map(p => [p.chapterNum, p.value]));
                      const val = pm.get(ch.number);
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

      {/* Gestion des axes (mode char) */}
      {mode === 'char' && selectedCharId && (
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">Axes de {selectedChar?.name ?? '…'}</p>

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
            />
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
              title="Couleur de l'axe"
            />
            <button
              onClick={handleAddAxis}
              disabled={adding || !newLabel.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 disabled:opacity-30"
              style={{ backgroundColor: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
            >
              {adding ? '…' : '+ Axe'}
            </button>
          </div>
        </div>
      )}

      {/* État vide */}
      {mode === 'char' && !selectedCharId && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600 font-serif italic text-sm">Sélectionnez un personnage pour voir ses axes d'évolution.</p>
        </div>
      )}
      {mode === 'axis' && !selectedLabel && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600 font-serif italic text-sm">
            {allLabels.length === 0
              ? 'Aucun axe créé — ajoutez des axes depuis le mode "1 personnage".'
              : 'Sélectionnez un axe pour comparer les personnages.'}
          </p>
        </div>
      )}
    </div>
  );
}
