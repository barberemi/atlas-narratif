import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Éditeur de trajet manuel pour un personnage.
 * Permet d'ordonner une liste de lieux localisés.
 */
export default function JourneyEditor({ characters, locations, journeys, onSave }) {
  const { t } = useTranslation();
  const [charKey,     setCharKey]     = useState(null);
  const [steps,       setSteps]       = useState([]);   // [{ locId, lieu, x, y }]
  const [dirty,       setDirty]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [addOpen,     setAddOpen]     = useState(false);
  const [charDropOpen, setCharDropOpen] = useState(false);
  const charDropRef = useRef(null);

  useEffect(() => {
    if (!charDropOpen) return;
    const handler = (e) => { if (charDropRef.current && !charDropRef.current.contains(e.target)) setCharDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [charDropOpen]);

  const localized = locations.filter(l => l.coordinates);

  // Initialise les steps quand on change de personnage
  useEffect(() => {
    if (!charKey) return;
    const key      = characters.find(c => c.id === charKey)?.journeyKey ?? charKey;
    const existing = journeys?.[key] ?? [];
    setSteps(existing.map((s, i) => ({
      locId: localized.find(l => l.name === s.lieu)?.id ?? null,
      lieu:  s.lieu,
      x:     s.x,
      y:     s.y,
      etape: i + 1,
    })));
    setDirty(false);
  }, [charKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const addStep = (loc) => {
    setSteps(prev => [...prev, { locId: loc.id, lieu: loc.name, x: loc.coordinates.x, y: loc.coordinates.y, etape: prev.length + 1 }]);
    setDirty(true);
    setAddOpen(false);
  };

  const removeStep = (i) => {
    setSteps(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, etape: idx + 1 })));
    setDirty(true);
  };

  const moveStep = (i, dir) => {
    const next = [...steps];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next.map((s, idx) => ({ ...s, etape: idx + 1 })));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!charKey || !dirty) return;
    setSaving(true);
    const char = characters.find(c => c.id === charKey);
    const key  = char?.journeyKey ?? charKey;
    const fullSteps = steps.map((s, i) => ({
      etape: i + 1, lieu: s.lieu, x: s.x, y: s.y,
      sous_lieu: '', action: '', allies: [], isMissing: false,
    }));
    await onSave(key, fullSteps);
    setDirty(false);
    setSaving(false);
  };

  return (
    <div
      className="px-6 py-5 flex flex-col gap-4"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(5,10,18,0.97)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black tracking-tight text-slate-200">{t('map.manualJourneys')}</h2>
          <p className="text-xs text-slate-500 font-serif italic mt-0.5">
            {t('map.manualJourneysDesc')}
          </p>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{ backgroundColor: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
          >
            {saving ? '…' : t('btn.save')}
          </button>
        )}
      </div>

      {/* Sélecteur de personnage */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 uppercase tracking-widest flex-shrink-0">{t('label.characters', { count: 1 })}</span>
        <div className="relative" ref={charDropRef}>
          <button
            onClick={() => setCharDropOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{
              minWidth: 180,
              backgroundColor: charKey ? `${characters.find(c => c.id === charKey)?.color ?? '#94a3b8'}22` : 'rgba(255,255,255,0.06)',
              color:           charKey ? (characters.find(c => c.id === charKey)?.color ?? '#94a3b8') : '#94a3b8',
              border:          charKey ? `1px solid ${characters.find(c => c.id === charKey)?.color ?? '#94a3b8'}55` : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {charKey ? (
              <>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: characters.find(c => c.id === charKey)?.color }} />
                {characters.find(c => c.id === charKey)?.name ?? '—'}
              </>
            ) : (
              <>
                <span className="text-slate-500">👤</span>
                {t('map.chooseCharacter')}
              </>
            )}
            <span className="ml-auto text-slate-600 text-[10px]">{charDropOpen ? '▲' : '▼'}</span>
          </button>

          {charDropOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
              style={{ minWidth: 200, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
            >
              {characters.map(c => (
                <button
                  key={c.id}
                  onClick={() => { if (charKey !== c.id) setCharKey(c.id); setCharDropOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all duration-100 hover:bg-white/5"
                  style={{ color: charKey === c.id ? c.color : '#64748b' }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  {c.name}
                  {charKey === c.id && <span className="ml-auto text-[10px]" style={{ color: c.color }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Liste des étapes */}
      {charKey && (
        <div className="flex flex-col gap-1.5">
          {steps.length === 0 && (
            <p className="text-xs text-slate-600 font-serif italic py-2">
              {t('map.noSteps')}
            </p>
          )}
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-[10px] text-slate-600 font-mono w-5 flex-shrink-0">{i + 1}.</span>
              <span className="text-xs text-slate-300 flex-1 truncate">{s.lieu}</span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => moveStep(i, -1)} disabled={i === 0}
                  className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors text-xs">↑</button>
                <button onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}
                  className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors text-xs">↓</button>
                <button onClick={() => removeStep(i)}
                  className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors text-xs">×</button>
              </div>
            </div>
          ))}

          {/* Ajouter un lieu */}
          <div className="relative">
            <button
              onClick={() => setAddOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors w-full text-left"
              style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
            >
              + {t('map.addLocation')}
            </button>
            {addOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden w-64 max-h-48 overflow-y-auto"
                style={{ backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
              >
                {localized.length === 0 ? (
                  <p className="text-xs text-slate-600 p-3 italic">{t('map.noLocalizedLocations')}</p>
                ) : (
                  <div className="p-1">
                    {localized.map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => addStep(loc)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
