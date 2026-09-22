import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlantStore } from '../stores/usePlantStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useLoreStore } from '../stores/useLoreStore';
import { useVolumeStore } from '../stores/useVolumeStore';
import { useStcStore } from '../stores/useStcStore';
import { useStoreLoader } from '../hooks/useStoreLoader';
import { useFocusFlash, useFlashScroll } from '../hooks/useFocusFlash';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import Term from '../components/ui/Term';
import { HeaderToggle, HeaderAction, HeaderSep } from '../components/ui/HeaderButton';
import { getEntityMeta } from '../utils/entityUtils';
import { extractChapters } from '../utils/reviewUtils';
import { VIZ_STATUS } from '../data/viz_palette';

// ── Config types ──────────────────────────────────────────────────────────────

export const PLANT_TYPES = [
  { id: 'object',      label: 'Objet',       color: '#f59e0b', icon: 'object' },
  { id: 'character',   label: 'Personnage',  color: '#3b82f6', icon: 'user'   },
  { id: 'information', label: 'Information', color: '#a855f7', icon: 'dot'    },
  { id: 'dialogue',    label: 'Dialogue',    color: '#22c55e', icon: 'chat'   },
  { id: 'theme',       label: 'Thème',       color: 'var(--color-atlas-soft)', icon: 'arc' },
];

const PLANT_TYPE_MAP = Object.fromEntries(PLANT_TYPES.map(t => [t.id, t]));

const STATUS_CFG = {
  open:     { label: 'En suspens', color: '#cba15e', bg: 'rgba(203,161,94,0.12)', border: 'rgba(203,161,94,0.3)' },
  resolved: { label: 'Résolu',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  dropped:  { label: 'Abandonné',  color: 'var(--color-atlas-soft)', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)' },
};

// ── Vue arc SVG ───────────────────────────────────────────────────────────────

function ArcView({ plants, chapters, volumes, t }) {
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
      <p className="text-atlas-mute italic text-sm">{t('empty.noEvents', 'Aucun chapitre dans la timeline.')}</p>
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
    <div ref={setContainerEl} className="overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
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

function PlantForm({ initial, chapters, events, onSave, onCancel, volumes, defaultVolumeId, t }) {
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
  const [entityDropOpen, setEntityDropOpen] = useState(false);

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
    <div className="flex flex-col gap-4 p-4"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--color-atlas-green)' }}>

      {/* Label */}
      <div className="flex flex-col gap-1.5">
        <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('plants.plant', 'Amorce')} *</label>
        <input
          type="text"
          value={form.label}
          onChange={e => set('label', e.target.value)}
          placeholder={t('plants.labelPlaceholder')}
          className="px-3 py-2 rounded-none text-sm text-slate-200 bg-white/5 border border-white/10 outline-none focus:border-[#5cae8e]"
          autoFocus
        />
      </div>

      {/* Type + Statut */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('label.type')}</label>
          <div className="flex flex-wrap gap-1">
            {PLANT_TYPES.map(pt => (
              <button key={pt.id} onClick={() => set('type', pt.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-none text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: form.type === pt.id ? `${pt.color}22` : 'rgba(255,255,255,0.04)',
                  border:          form.type === pt.id ? `1px solid ${pt.color}55` : '1px solid rgba(255,255,255,0.08)',
                  color:           form.type === pt.id ? pt.color : 'var(--color-atlas-soft)',
                }}>
                <Icon name={pt.icon} size={13} /> {t(`plants.type${pt.id[0].toUpperCase()}${pt.id.slice(1)}`, pt.label)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('label.status')}</label>
          <div className="flex gap-1">
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <button key={k} onClick={() => set('status', k)}
                className="px-2 py-1 rounded-none text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: form.status === k ? v.bg : 'rgba(255,255,255,0.04)',
                  border:          form.status === k ? `1px solid ${v.border}` : '1px solid rgba(255,255,255,0.08)',
                  color:           form.status === k ? v.color : 'var(--color-atlas-soft)',
                }}>
                {t(`plants.status${k[0].toUpperCase()}${k.slice(1)}`, v.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plant + Payoff */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('plants.plantChapter', 'Chapitre amorce')}</label>
          {volumes.length > 0 && (
            <select value={form.plantVolumeId} onChange={e => set('plantVolumeId', e.target.value)}
              className="px-3 py-1.5 rounded-none text-xs text-slate-200 bg-atlas-ink border border-white/10 outline-none">
              <option value="">{t('plants.volumeOptional', '\u2014 Tome (optionnel)')}</option>
              {volumes.map(v => <option key={v.id} value={v.id}>{t('plants.volumeLabel', 'Tome {{number}} \u2014 {{title}}', { number: v.number, title: v.title })}</option>)}
            </select>
          )}
          <select value={form.plantChapterNum} onChange={e => set('plantChapterNum', e.target.value)}
            className="px-3 py-1.5 rounded-none text-xs text-slate-200 bg-atlas-ink border border-white/10 outline-none">
            <option value="">{t('plants.noChapter', '\u2014')}</option>
            {chapters.map(ch => <option key={ch.number} value={ch.number}>Ch.{ch.number} · {ch.title}</option>)}
          </select>
          {chapterEvents.length > 0 && (
            <select value={form.plantEventId} onChange={e => set('plantEventId', e.target.value)}
              className="px-3 py-1.5 rounded-none text-xs text-slate-200 bg-atlas-ink border border-white/10 outline-none">
              <option value="">{t('plants.eventOptional', '\u00c9v\u00e9nement (optionnel)')}</option>
              {chapterEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]"><Term id="payoff">{t('plants.payoffChapter', 'Chapitre payoff')}</Term></label>
          {volumes.length > 0 && (
            <select value={form.payoffVolumeId} onChange={e => set('payoffVolumeId', e.target.value)}
              className="px-3 py-1.5 rounded-none text-xs text-slate-200 bg-atlas-ink border border-white/10 outline-none">
              <option value="">{t('plants.volumeOptional', '\u2014 Tome (optionnel)')}</option>
              {volumes.map(v => <option key={v.id} value={v.id}>{t('plants.volumeLabel', 'Tome {{number}} \u2014 {{title}}', { number: v.number, title: v.title })}</option>)}
            </select>
          )}
          <select value={form.payoffChapterNum} onChange={e => set('payoffChapterNum', e.target.value)}
            className="px-3 py-1.5 rounded-none text-xs text-slate-200 bg-atlas-ink border border-white/10 outline-none">
            <option value="">{t('plants.unresolved', '\u2014 non r\u00e9solu')}</option>
            {chapters.map(ch => <option key={ch.number} value={ch.number}>Ch.{ch.number} · {ch.title}</option>)}
          </select>
          {payoffEvents.length > 0 && (
            <select value={form.payoffEventId} onChange={e => set('payoffEventId', e.target.value)}
              className="px-3 py-1.5 rounded-none text-xs text-slate-200 bg-atlas-ink border border-white/10 outline-none">
              <option value="">{t('plants.eventOptional', '\u00c9v\u00e9nement (optionnel)')}</option>
              {payoffEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Entite liee */}
      {entityOptions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('plants.linkedEntity', 'Entit\u00e9 li\u00e9e (optionnel)')}</label>
          {/* dropdown custom : icônes lucide au lieu d'emojis dans un <select> natif */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setEntityDropOpen(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-none text-xs text-slate-200 bg-atlas-ink border border-white/10 outline-none transition-colors hover:border-white/20"
            >
              {(() => {
                const sel = entityOptions.find(o => o.id === form.entityId);
                return sel
                  ? (<><Icon name={sel.type === 'character' ? 'user' : 'object'} size={14} className="text-atlas-soft flex-shrink-0" /><span className="truncate">{sel.name}</span></>)
                  : (<span className="text-atlas-mute">—</span>);
              })()}
              <span className="ml-auto text-atlas-mute"><Icon name={entityDropOpen ? 'chevronUp' : 'chevronDown'} size={12} /></span>
            </button>

            {entityDropOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-1 z-30 rounded-none overflow-y-auto"
                style={{ maxHeight: 260, backgroundColor: 'var(--color-atlas-ink)', border: '1px solid var(--color-atlas-line)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              >
                <button
                  type="button"
                  onClick={() => { set('entityId', ''); set('entityType', ''); setEntityDropOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-atlas-mute transition-colors duration-100 hover:bg-white/5"
                >
                  <span className="text-atlas-mute">—</span>
                  {!form.entityId && <Icon name="checkmark" size={12} className="ml-auto" />}
                </button>
                {entityOptions.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => { set('entityId', o.id); set('entityType', o.type); setEntityDropOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-atlas-soft transition-colors duration-100 hover:bg-white/5"
                  >
                    <Icon name={o.type === 'character' ? 'user' : 'object'} size={14} className="flex-shrink-0" />
                    <span className="truncate">{o.name}</span>
                    {form.entityId === o.id && <Icon name="checkmark" size={12} className="ml-auto text-atlas-green" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('plants.notes', 'Notes')}</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          rows={2} placeholder={t('plants.notesPlaceholder', 'Contexte, intention narrative\u2026')}
          className="px-3 py-2 rounded-none text-xs text-slate-300 bg-white/5 border border-white/10 outline-none resize-none font-serif" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={onCancel}
          className="px-3 py-1.5 font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] text-atlas-mute hover:text-atlas-soft transition-colors">
          {t('btn.cancel')}
        </button>
        <button onClick={handleSave} disabled={!form.label.trim()}
          className="px-4 py-1.5 font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] transition-opacity disabled:opacity-30 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}>
          {t('btn.save')}
        </button>
      </div>
    </div>
  );
}

// ── Carte amorce ──────────────────────────────────────────────────────────────

function PlantCard({ plant, flash, onEdit, onDelete, volumes, t }) {
  const typeCfg   = PLANT_TYPE_MAP[plant.type] ?? PLANT_TYPE_MAP.information;
  const statusCfg = STATUS_CFG[plant.status]   ?? STATUS_CFG.open;
  const entity    = plant.entityId ? getEntityMeta(plant.entityId, plant.entityType) : null;
  const { ref: flashRef, flashing } = useFlashScroll(flash);

  const plantVol  = plant.plantVolumeId  ? volumes?.find(v => v.id === plant.plantVolumeId)  : null;
  const payoffVol = plant.payoffVolumeId ? volumes?.find(v => v.id === plant.payoffVolumeId) : null;
  const isCross   = plantVol && payoffVol && plantVol.id !== payoffVol.id;

  return (
    <div ref={flashRef} className={`flex items-start gap-3 py-3${flashing ? ' atlas-flash' : ''}`}
      style={{ borderBottom: '1px solid var(--color-atlas-line)' }}>
      {/* Barre couleur latérale */}
      <div className="w-0.5 self-stretch flex-shrink-0" style={{ backgroundColor: typeCfg.color }} />

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Header */}
        <div className="flex items-start gap-2 justify-between">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <p className="font-serif text-base font-semibold text-atlas-text leading-snug">{plant.label}</p>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${typeCfg.color}18`, color: typeCfg.color, border: `1px solid ${typeCfg.color}30` }}>
                <Icon name={typeCfg.icon} size={13} /> {t(`plants.type${plant.type[0].toUpperCase()}${plant.type.slice(1)}`, typeCfg.label)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                {t(`plants.status${plant.status[0].toUpperCase()}${plant.status.slice(1)}`, statusCfg.label)}
              </span>
              {entity && (
                <span className="text-[10px] text-atlas-soft">· {entity.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onEdit}
              aria-label={t('btn.edit')} title={t('btn.edit')}
              className="w-6 h-6 flex items-center justify-center rounded-none opacity-40 hover:opacity-100 transition-all"
              style={{ backgroundColor: 'rgba(92,174,142,0.15)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.3)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={onDelete}
              aria-label={t('btn.delete')} title={t('btn.delete')}
              className="w-6 h-6 flex items-center justify-center rounded-none opacity-40 hover:opacity-100 transition-all"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: VIZ_STATUS.crit, border: '1px solid rgba(239,68,68,0.2)' }}>
              <Icon name="close" size={12} />
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
              style={{ backgroundColor: 'rgba(92,174,142,0.15)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.25)' }}>
              T{plantVol.number}
            </span>
          )}
          <span className="text-atlas-mute">→</span>
          <span style={{ color: plant.payoffChapterNum != null ? VIZ_STATUS.ok : 'var(--color-atlas-soft)' }}
            className="font-mono">
            {plant.payoffChapterNum != null ? `Ch.${plant.payoffChapterNum}` : t('plants.unresolvedShort', 'non r\u00e9solu')}
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
          <p className="text-xs text-atlas-soft font-serif italic leading-snug">{plant.notes}</p>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function PlantsBrowser() {
  const { t } = useTranslation();
  useStoreLoader([usePlantStore, useTimelineStore, useStcStore]);
  const _plants     = usePlantStore(s => s.plants);
  const plants      = useMemo(() => _plants ?? [], [_plants]);
  const addPlant    = usePlantStore(s => s.addPlant);
  const editPlant   = usePlantStore(s => s.editPlant);
  const removePlant = usePlantStore(s => s.removePlant);

  const volumes        = useVolumeStore(s => s.volumes) ?? [];
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);

  const _events  = useTimelineStore(s => s.events);
  const events   = useMemo(() => _events ?? [], [_events]);
  const chapters = useMemo(() => extractChapters(events), [events]);

  const [view,         setView]         = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);

  // Deep-link « aller pile sur une amorce » (?focus=<id> depuis le chat).
  const flashId = useFocusFlash(_plants != null);
  useEffect(() => {
    if (!flashId) return;
    // Vue liste + filtres neutres pour garantir que l'amorce ciblée est visible.
    setView('list');
    setStatusFilter('all');
    setTypeFilter('all');
  }, [flashId]);

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


  const handleSaveNew = async (data) => {
    await addPlant(data);
    setShowForm(false);
  };

  const handleSaveEdit = async (data) => {
    await editPlant(editingId, data);
    setEditingId(null);
  };

  return (
    <div className="h-full w-full max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200 overflow-hidden">

      {/* Header */}
      <header data-tour="plants-list" className="flex items-center px-6 py-5 border-b border-atlas-line flex-shrink-0 gap-5">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Écrire · amorces & payoffs'}</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            <Term id="plant">{t('plants.titlePrefix', 'Amorces')}</Term> <span className="italic" style={{ color: '#5cae8e' }}>{t('plants.titleHighlight', 'Narratives')}</span>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {t('plants.statsLine', '{{total}} amorce(s) \u00b7 {{open}} en suspens \u00b7 {{resolved}} r\u00e9solue(s)', { total: stats.total, open: stats.open, resolved: stats.resolved })}
            {stats.dropped > 0 ? ` \u00b7 ${t('plants.droppedCount', '{{count}} abandonn\u00e9e(s)', { count: stats.dropped })}` : ''}
          </p>
        </div>
        {/* Onglets vue */}
        <div className="flex items-center gap-5 flex-shrink-0">
          {[{ id: 'list', label: t('plants.viewList', 'Liste') }, { id: 'arc', label: t('plants.viewArc', 'Arc') }].map(v => (
            <HeaderToggle key={v.id} active={view === v.id} onClick={() => setView(v.id)}>
              {v.label}
            </HeaderToggle>
          ))}
        </div>
        <HeaderSep />
        {/* Bouton ajouter */}
        <HeaderAction onClick={() => { setShowForm(true); setEditingId(null); }}>
          + {t('plants.plant', 'Amorce')}
        </HeaderAction>
      </header>

      {/* Contenu */}
      <div data-tour="plants-content" className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 py-6">
        <div className="flex flex-col gap-5 max-w-5xl">

          {/* Formulaire ajout */}
          {showForm && (
            <PlantForm
              chapters={chapters}
              events={events}
              volumes={volumes}
              defaultVolumeId={activeVolumeId}
              onSave={handleSaveNew}
              onCancel={() => setShowForm(false)}
              t={t}
            />
          )}

          {/* Filtres */}
          {plants.length > 0 && (
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filtre statut */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'all',      label: t('plants.filterAll', 'Tous') },
                  { id: 'open',     label: t('plants.filterOpen', 'En suspens') },
                  { id: 'resolved', label: t('plants.filterResolved', 'R\u00e9solus') },
                  { id: 'dropped',  label: t('plants.filterDropped', 'Abandonn\u00e9s') },
                ].map(f => (
                  <button key={f.id} onClick={() => setStatusFilter(f.id)}
                    className="px-2.5 py-1 rounded-none text-[10px] font-semibold transition-all"
                    style={{
                      backgroundColor: statusFilter === f.id ? 'rgba(92,174,142,0.2)' : 'rgba(255,255,255,0.04)',
                      border:          statusFilter === f.id ? '1px solid rgba(92,174,142,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color:           statusFilter === f.id ? '#5cae8e' : 'var(--color-atlas-soft)',
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-white/10" />
              {/* Filtre type */}
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setTypeFilter('all')}
                  className="px-2.5 py-1 rounded-none text-[10px] font-semibold transition-all"
                  style={{
                    backgroundColor: typeFilter === 'all' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: typeFilter === 'all' ? '#94a3b8' : 'var(--color-atlas-soft)',
                  }}>
                  {t('plants.allTypes', 'Tous types')}
                </button>
                {PLANT_TYPES.map(pt => (
                  <button key={pt.id} onClick={() => setTypeFilter(pt.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-semibold transition-all"
                    style={{
                      backgroundColor: typeFilter === pt.id ? `${pt.color}18` : 'rgba(255,255,255,0.04)',
                      border:          typeFilter === pt.id ? `1px solid ${pt.color}40` : '1px solid rgba(255,255,255,0.08)',
                      color:           typeFilter === pt.id ? pt.color : 'var(--color-atlas-soft)',
                    }}>
                    <Icon name={pt.icon} size={13} /> {t(`plants.type${pt.id[0].toUpperCase()}${pt.id.slice(1)}`, pt.label)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vue arc */}
          {view === 'arc' && (
            <ArcView plants={filtered} chapters={chapters} volumes={volumes} t={t} />
          )}

          {/* Vue liste */}
          {view === 'list' && (
            <>
              {filtered.length === 0 && (
                plants.length === 0
                  ? <EmptyState icon={<Icon name="plant" size={40} className="text-atlas-mute" />} title={t('plants.emptyTitle', 'Aucune amorce narrative')} hint={t('plants.emptyHint', 'Cliquez sur \u00ab + Amorce \u00bb pour commencer \u00e0 tracker vos plants et payoffs.')} />
                  : <EmptyState icon={<Icon name="search" size={40} className="text-atlas-mute" />} title={t('plants.noFilterMatch', 'Aucune amorce ne correspond aux filtres')} />
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
                    t={t}
                  />
                ) : (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    flash={plant.id === flashId}
                    volumes={volumes}
                    onEdit={() => { setEditingId(plant.id); setShowForm(false); }}
                    onDelete={() => removePlant(plant.id)}
                    t={t}
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
