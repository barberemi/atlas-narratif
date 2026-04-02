import { useState, useMemo, useRef, useEffect } from 'react';
import { usePlantStore } from '../stores/usePlantStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useLoreStore } from '../stores/useLoreStore';
import { useVolumeStore } from '../stores/useVolumeStore';
import { getEntityMeta } from '../utils/entityUtils';
import { extractChapters } from '../utils/reviewUtils';

// ── Config types ──────────────────────────────────────────────────────────────

export const PLANT_TYPES = [
  { id: 'object',      label: 'Objet',       color: '#f59e0b', icon: '⚔️' },
  { id: 'character',   label: 'Personnage',  color: '#3b82f6', icon: '👤' },
  { id: 'information', label: 'Information', color: '#a855f7', icon: '◉'  },
  { id: 'dialogue',    label: 'Dialogue',    color: '#22c55e', icon: '💬' },
  { id: 'theme',       label: 'Thème',       color: '#64748b', icon: '〰️' },
];

const PLANT_TYPE_MAP = Object.fromEntries(PLANT_TYPES.map(t => [t.id, t]));

const STATUS_CFG = {
  open:     { label: 'En suspens', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
  resolved: { label: 'Résolu',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  dropped:  { label: 'Abandonné',  color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)' },
};

// ── Vue arc SVG ───────────────────────────────────────────────────────────────

function ArcView({ plants, chapters, volumes }) {
  const [containerEl, setContainerEl] = useState(null);
  const [svgW, setSvgW] = useState(0);

  useEffect(() => {
    if (!containerEl) return;
    const obs = new ResizeObserver(entries => setSvgW(entries[0].contentRect.width));
    obs.observe(containerEl);
    return () => obs.disconnect();
  }, [containerEl]);

  if (!chapters.length) return (
    <div className="flex items-center justify-center py-16">
      <p className="text-slate-600 italic text-sm">Aucun chapitre dans la timeline.</p>
    </div>
  );

  const PAD = { left: 32, right: 32, bottom: 40, top: 16 };
  const chartW = svgW - PAD.left - PAD.right;
  const minCh  = chapters[0].number;
  const maxCh  = chapters[chapters.length - 1].number;
  const range  = Math.max(maxCh - minCh, 1);

  function xOf(chNum) {
    return PAD.left + ((chNum - minCh) / range) * chartW;
  }

  // Hauteur dynamique selon le nombre d'amorces
  const plantsWithPos = plants.filter(p => p.plantChapterNum != null);
  const ARC_ROW_H = 28;
  const svgH = PAD.top + plantsWithPos.length * ARC_ROW_H + 16 + PAD.bottom;

  return (
    <div ref={setContainerEl} className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {svgW > 0 && (
        <svg width={svgW} height={svgH}>
          {/* Ligne de base */}
          <line
            x1={PAD.left} y1={svgH - PAD.bottom}
            x2={svgW - PAD.right} y2={svgH - PAD.bottom}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1"
          />

          {/* Ticks chapitres */}
          {(() => {
            const step = Math.max(1, Math.ceil(chapters.length / 16));
            return chapters
              .filter((_, i) => i % step === 0 || i === chapters.length - 1)
              .map(ch => {
                const x = xOf(ch.number);
                return (
                  <g key={ch.number}>
                    <line x1={x} y1={svgH - PAD.bottom} x2={x} y2={svgH - PAD.bottom + 4}
                      stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <text x={x} y={svgH - PAD.bottom + 14} textAnchor="middle" fontSize="9" fill="#334155">
                      {ch.number}
                    </text>
                  </g>
                );
              });
          })()}

          {/* Arcs */}
          {plantsWithPos.map((plant, i) => {
            const typeCfg  = PLANT_TYPE_MAP[plant.type] ?? PLANT_TYPE_MAP.information;
            const color    = plant.status === 'dropped' ? '#334155' : typeCfg.color;
            const x1 = xOf(plant.plantChapterNum);
            const x2 = plant.payoffChapterNum != null ? xOf(plant.payoffChapterNum) : svgW - PAD.right;
            const y  = svgH - PAD.bottom;
            const arcH = ARC_ROW_H * (i + 1);
            const mx = (x1 + x2) / 2;
            const isOpen = plant.payoffChapterNum == null;

            const plantVol  = plant.plantVolumeId  ? volumes?.find(v => v.id === plant.plantVolumeId)  : null;
            const payoffVol = plant.payoffVolumeId ? volumes?.find(v => v.id === plant.payoffVolumeId) : null;
            const isCross   = plantVol && payoffVol && plantVol.id !== payoffVol.id;
            const crossLabel = isCross ? ` T${plantVol.number}→T${payoffVol.number}` : '';

            return (
              <g key={plant.id}>
                {/* Arc quadratique */}
                <path
                  d={`M ${x1},${y} Q ${mx},${y - arcH} ${x2},${y}`}
                  fill="none"
                  stroke={isCross ? '#fbbf24' : color}
                  strokeWidth={isCross ? 2 : 1.5}
                  strokeOpacity={plant.status === 'dropped' ? 0.3 : 0.7}
                  strokeDasharray={isOpen ? '4,3' : undefined}
                />
                {/* Point plant */}
                <circle cx={x1} cy={y} r={3.5} fill={isCross ? '#fbbf24' : color} fillOpacity={0.8} />
                {/* Point payoff */}
                {plant.payoffChapterNum != null && (
                  <circle cx={x2} cy={y} r={3.5} fill={isCross ? '#fbbf24' : color} fillOpacity={0.8} />
                )}
                {/* Label au sommet de l'arc */}
                <text
                  x={mx} y={y - arcH - 4}
                  textAnchor="middle" fontSize="9" fill={isCross ? '#fbbf24' : color} fillOpacity={0.85}
                >
                  {plant.label.slice(0, 20)}{plant.label.length > 20 ? '…' : ''}{crossLabel}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// ── Formulaire create/edit ────────────────────────────────────────────────────

function PlantForm({ initial, chapters, events, onSave, onCancel, volumes, defaultVolumeId }) {
  const characters = useLoreStore(s => s.characters) ?? [];
  const objects    = useLoreStore(s => s.objects)    ?? [];

  const [form, setForm] = useState({
    label:            initial?.label            ?? '',
    type:             initial?.type             ?? 'information',
    plantChapterNum:  initial?.plantChapterNum  ?? '',
    plantEventId:     initial?.plantEventId     ?? '',
    plantVolumeId:    initial?.plantVolumeId    ?? defaultVolumeId ?? '',
    payoffChapterNum: initial?.payoffChapterNum ?? '',
    payoffEventId:    initial?.payoffEventId    ?? '',
    payoffVolumeId:   initial?.payoffVolumeId   ?? '',
    entityId:         initial?.entityId         ?? '',
    entityType:       initial?.entityType       ?? '',
    status:           initial?.status           ?? 'open',
    notes:            initial?.notes            ?? '',
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.label.trim()) return;
    onSave({
      ...form,
      plantChapterNum:  form.plantChapterNum  ? Number(form.plantChapterNum)  : null,
      payoffChapterNum: form.payoffChapterNum ? Number(form.payoffChapterNum) : null,
      plantEventId:     form.plantEventId     || null,
      payoffEventId:    form.payoffEventId    || null,
      plantVolumeId:    form.plantVolumeId    || null,
      payoffVolumeId:   form.payoffVolumeId   || null,
      entityId:         form.entityId         || null,
      entityType:       form.entityType       || null,
      notes:            form.notes            || null,
    });
  };

  const chapterEvents = form.plantChapterNum
    ? events.filter(e => e.chapter === Number(form.plantChapterNum))
    : [];
  const payoffEvents = form.payoffChapterNum
    ? events.filter(e => e.chapter === Number(form.payoffChapterNum))
    : [];

  const entityOptions = [
    ...characters.map(c => ({ id: c.id, type: 'character', name: c.name })),
    ...objects.map(o => ({ id: o.id, type: 'object', name: o.name })),
  ];

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Label */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-slate-500 uppercase tracking-widest">Amorce *</label>
        <input
          type="text"
          value={form.label}
          onChange={e => set('label', e.target.value)}
          placeholder="Ex : La dague de cristal, La promesse de Valerian…"
          className="px-3 py-2 rounded-lg text-sm text-slate-200 bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50"
          autoFocus
        />
      </div>

      {/* Type + Statut */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Type</label>
          <div className="flex flex-wrap gap-1">
            {PLANT_TYPES.map(t => (
              <button key={t.id} onClick={() => set('type', t.id)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: form.type === t.id ? `${t.color}22` : 'rgba(255,255,255,0.04)',
                  border:          form.type === t.id ? `1px solid ${t.color}55` : '1px solid rgba(255,255,255,0.08)',
                  color:           form.type === t.id ? t.color : '#64748b',
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Statut</label>
          <div className="flex gap-1">
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <button key={k} onClick={() => set('status', k)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: form.status === k ? v.bg : 'rgba(255,255,255,0.04)',
                  border:          form.status === k ? `1px solid ${v.border}` : '1px solid rgba(255,255,255,0.08)',
                  color:           form.status === k ? v.color : '#64748b',
                }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plant + Payoff */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Chapitre amorce</label>
          {volumes.length > 0 && (
            <select value={form.plantVolumeId} onChange={e => set('plantVolumeId', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0d1b2a] border border-white/10 outline-none">
              <option value="">— Tome (optionnel)</option>
              {volumes.map(v => <option key={v.id} value={v.id}>Tome {v.number} — {v.title}</option>)}
            </select>
          )}
          <select value={form.plantChapterNum} onChange={e => set('plantChapterNum', e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0d1b2a] border border-white/10 outline-none">
            <option value="">—</option>
            {chapters.map(ch => <option key={ch.number} value={ch.number}>Ch.{ch.number} — {ch.title}</option>)}
          </select>
          {chapterEvents.length > 0 && (
            <select value={form.plantEventId} onChange={e => set('plantEventId', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0d1b2a] border border-white/10 outline-none">
              <option value="">Événement (optionnel)</option>
              {chapterEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Chapitre payoff</label>
          {volumes.length > 0 && (
            <select value={form.payoffVolumeId} onChange={e => set('payoffVolumeId', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0d1b2a] border border-white/10 outline-none">
              <option value="">— Tome (optionnel)</option>
              {volumes.map(v => <option key={v.id} value={v.id}>Tome {v.number} — {v.title}</option>)}
            </select>
          )}
          <select value={form.payoffChapterNum} onChange={e => set('payoffChapterNum', e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0d1b2a] border border-white/10 outline-none">
            <option value="">— non résolu</option>
            {chapters.map(ch => <option key={ch.number} value={ch.number}>Ch.{ch.number} — {ch.title}</option>)}
          </select>
          {payoffEvents.length > 0 && (
            <select value={form.payoffEventId} onChange={e => set('payoffEventId', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0d1b2a] border border-white/10 outline-none">
              <option value="">Événement (optionnel)</option>
              {payoffEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Entité liée */}
      {entityOptions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Entité liée (optionnel)</label>
          <select
            value={form.entityId}
            onChange={e => {
              const opt = entityOptions.find(o => o.id === e.target.value);
              set('entityId', e.target.value);
              set('entityType', opt?.type ?? '');
            }}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-200 bg-[#0d1b2a] border border-white/10 outline-none"
          >
            <option value="">—</option>
            {characters.map(c => <option key={c.id} value={c.id}>👤 {c.name}</option>)}
            {objects.map(o => <option key={o.id} value={o.id}>⚔️ {o.name}</option>)}
          </select>
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-slate-500 uppercase tracking-widest">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          rows={2} placeholder="Contexte, intention narrative…"
          className="px-3 py-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none resize-none font-serif" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Annuler
        </button>
        <button onClick={handleSave} disabled={!form.label.trim()}
          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
          style={{ backgroundColor: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}>
          Enregistrer
        </button>
      </div>
    </div>
  );
}

// ── Carte amorce ──────────────────────────────────────────────────────────────

function PlantCard({ plant, onEdit, onDelete, volumes }) {
  const typeCfg   = PLANT_TYPE_MAP[plant.type] ?? PLANT_TYPE_MAP.information;
  const statusCfg = STATUS_CFG[plant.status]   ?? STATUS_CFG.open;
  const entity    = plant.entityId ? getEntityMeta(plant.entityId, plant.entityType) : null;

  const plantVol  = plant.plantVolumeId  ? volumes?.find(v => v.id === plant.plantVolumeId)  : null;
  const payoffVol = plant.payoffVolumeId ? volumes?.find(v => v.id === plant.payoffVolumeId) : null;
  const isCross   = plantVol && payoffVol && plantVol.id !== payoffVol.id;

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${typeCfg.color}20` }}>
      {/* Barre couleur latérale */}
      <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: typeCfg.color }} />

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Header */}
        <div className="flex items-start gap-2 justify-between">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-200 leading-snug">{plant.label}</p>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${typeCfg.color}18`, color: typeCfg.color, border: `1px solid ${typeCfg.color}30` }}>
                {typeCfg.icon} {typeCfg.label}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                {statusCfg.label}
              </span>
              {entity && (
                <span className="text-[10px] text-slate-500">· {entity.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onEdit}
              className="w-6 h-6 flex items-center justify-center rounded-md opacity-40 hover:opacity-100 transition-all"
              style={{ backgroundColor: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={onDelete}
              className="w-6 h-6 flex items-center justify-center rounded-md opacity-40 hover:opacity-100 transition-all"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              ×
            </button>
          </div>
        </div>

        {/* Flèche plant → payoff */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-slate-400 font-mono">
            {plant.plantChapterNum != null ? `Ch.${plant.plantChapterNum}` : '?'}
          </span>
          {plantVol && !isCross && (
            <span className="text-[9px] px-1 py-0.5 rounded font-bold"
              style={{ backgroundColor: 'rgba(63,81,181,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
              T{plantVol.number}
            </span>
          )}
          <span className="text-slate-600">→</span>
          <span style={{ color: plant.payoffChapterNum != null ? '#22c55e' : '#64748b' }}
            className="font-mono">
            {plant.payoffChapterNum != null ? `Ch.${plant.payoffChapterNum}` : 'non résolu'}
          </span>
          {isCross && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' }}>
              T{plantVol.number} → T{payoffVol.number}
            </span>
          )}
          {payoffVol && !isCross && plant.payoffChapterNum != null && (
            <span className="text-[9px] px-1 py.5 rounded font-bold"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
              T{payoffVol.number}
            </span>
          )}
        </div>

        {/* Notes */}
        {plant.notes && (
          <p className="text-xs text-slate-500 font-serif italic leading-snug">{plant.notes}</p>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function PlantsBrowser() {
  const plants      = usePlantStore(s => s.plants)    ?? [];
  const addPlant    = usePlantStore(s => s.addPlant);
  const editPlant   = usePlantStore(s => s.editPlant);
  const removePlant = usePlantStore(s => s.removePlant);

  const volumes        = useVolumeStore(s => s.volumes) ?? [];
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);

  const events   = useTimelineStore(s => s.events) ?? [];
  const chapters = useMemo(() => extractChapters(events), [events]);

  const [view,         setView]         = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);

  // Filtre cross-tome : visible si plant OU payoff appartient au tome actif
  const visiblePlants = useMemo(() => {
    if (!activeVolumeId) return plants;
    return plants.filter(p =>
      p.plantVolumeId  == null || p.plantVolumeId  === activeVolumeId ||
      p.payoffVolumeId === activeVolumeId
    );
  }, [plants, activeVolumeId]);

  // Stats sur les plants visibles
  const stats = useMemo(() => ({
    total:    visiblePlants.length,
    open:     visiblePlants.filter(p => p.status === 'open').length,
    resolved: visiblePlants.filter(p => p.status === 'resolved').length,
    dropped:  visiblePlants.filter(p => p.status === 'dropped').length,
  }), [visiblePlants]);

  // Filtrage statut + type
  const filtered = useMemo(() => visiblePlants.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (typeFilter   !== 'all' && p.type   !== typeFilter)   return false;
    return true;
  }), [visiblePlants, statusFilter, typeFilter]);

  const editingPlant = editingId ? plants.find(p => p.id === editingId) : null;

  const handleSaveNew = async (data) => {
    await addPlant(data);
    setShowForm(false);
  };

  const handleSaveEdit = async (data) => {
    await editPlant(editingId, data);
    setEditingId(null);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-hidden">

      {/* Header */}
      <header data-tour="plants-list" className="flex items-center px-6 py-3 border-b border-white/10 flex-shrink-0 gap-4">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Amorces <span style={{ color: '#3F51B5' }}>Narratives</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            {stats.total} amorce{stats.total !== 1 ? 's' : ''} · {stats.open} en suspens · {stats.resolved} résolue{stats.resolved !== 1 ? 's' : ''}
            {stats.dropped > 0 ? ` · ${stats.dropped} abandonnée${stats.dropped !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {/* Onglets vue */}
        <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[{ id: 'list', label: 'Liste' }, { id: 'arc', label: 'Arc' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: view === v.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                border:          view === v.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                color:           view === v.id ? '#818cf8' : '#64748b',
              }}>
              {v.label}
            </button>
          ))}
        </div>
        {/* Bouton ajouter */}
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0"
          style={{ backgroundColor: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}>
          + Amorce
        </button>
      </header>

      {/* Contenu */}
      <div data-tour="plants-content" className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 py-6">
        <div className="flex flex-col gap-5 max-w-4xl mx-auto">

          {/* Formulaire ajout */}
          {showForm && (
            <PlantForm
              chapters={chapters}
              events={events}
              volumes={volumes}
              defaultVolumeId={activeVolumeId}
              onSave={handleSaveNew}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Filtres */}
          {plants.length > 0 && (
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filtre statut */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'all',      label: 'Tous' },
                  { id: 'open',     label: 'En suspens' },
                  { id: 'resolved', label: 'Résolus' },
                  { id: 'dropped',  label: 'Abandonnés' },
                ].map(f => (
                  <button key={f.id} onClick={() => setStatusFilter(f.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                    style={{
                      backgroundColor: statusFilter === f.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                      border:          statusFilter === f.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color:           statusFilter === f.id ? '#818cf8' : '#64748b',
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-white/10" />
              {/* Filtre type */}
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setTypeFilter('all')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                  style={{
                    backgroundColor: typeFilter === 'all' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: typeFilter === 'all' ? '#94a3b8' : '#64748b',
                  }}>
                  Tous types
                </button>
                {PLANT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setTypeFilter(t.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                    style={{
                      backgroundColor: typeFilter === t.id ? `${t.color}18` : 'rgba(255,255,255,0.04)',
                      border:          typeFilter === t.id ? `1px solid ${t.color}40` : '1px solid rgba(255,255,255,0.08)',
                      color:           typeFilter === t.id ? t.color : '#64748b',
                    }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vue arc */}
          {view === 'arc' && (
            <ArcView plants={filtered} chapters={chapters} volumes={volumes} />
          )}

          {/* Vue liste */}
          {view === 'list' && (
            <>
              {filtered.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-600 font-serif italic text-sm">
                    {plants.length === 0
                      ? 'Aucune amorce — cliquez sur "+ Amorce" pour commencer.'
                      : 'Aucune amorce ne correspond aux filtres.'}
                  </p>
                </div>
              )}
              {filtered.map(plant => (
                editingId === plant.id ? (
                  <PlantForm
                    key={plant.id}
                    initial={plant}
                    chapters={chapters}
                    events={events}
                    volumes={volumes}
                    defaultVolumeId={activeVolumeId}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    volumes={volumes}
                    onEdit={() => { setEditingId(plant.id); setShowForm(false); }}
                    onDelete={() => removePlant(plant.id)}
                  />
                )
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
