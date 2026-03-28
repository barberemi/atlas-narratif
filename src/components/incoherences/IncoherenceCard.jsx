import { useState } from 'react';
import { SEVERITY_CONFIG } from '../../data/severity_config';
import { useIncStore } from '../../stores/useIncStore';
import EntityChip from './EntityChip';
import FixButton from './FixButton';

const SEVERITY_LABELS = { critical: 'Critique', high: 'Élevée', medium: 'Moyenne', low: 'Faible' };

const TYPE_ICONS = {
  // critical
  'Continuité de Personnage':       '💀',
  // high
  "Continuité d'Objet":             '⚙',
  'Conflit de Lieu Intra-Chapitre': '⚡',
  'Payoff Avant Plant':             '⏪',
  'Entité Non Référencée':          '🔗',
  // medium
  'Incohérence de Porteur':         '🎒',
  'Affiliation Fantôme':            '👻',
  'Personnage POV Absent':          '👁',
  'Plant Sans Payoff':              '🌱',
  // low
  'Fil Narratif Vide':              '🧵',
  'Entité Orpheline':               '🔗',
  'Scène Vide':                     '◯',
};

export default function IncoherenceCard({ inc, resolved, onToggleResolved, onEntityClick, onEntityFilter, onFix }) {
  const cfg  = SEVERITY_CONFIG[inc.severity];
  const icon = TYPE_ICONS[inc.type] ?? '⚠';
  const setNote = useIncStore(s => s.setNote);
  const [note, setLocalNote] = useState(inc.resolutionNote ?? '');

  return (
    <div
      className="rounded-xl border transition-all duration-300 relative"
      style={{ borderColor: resolved ? 'rgba(255,255,255,0.05)' : cfg.border, backgroundColor: resolved ? 'rgba(255,255,255,0.015)' : cfg.bg }}
    >
      <div className="h-1" style={{ backgroundColor: resolved ? '#1e293b' : cfg.color }} />

      <div className="p-4 flex flex-col gap-3" style={{ opacity: resolved ? 0.35 : 1 }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wide"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: resolved ? '#475569' : cfg.color, border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {icon} {inc.type}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: resolved ? 'rgba(255,255,255,0.04)' : cfg.bg, color: resolved ? '#475569' : cfg.color, border: `1px solid ${resolved ? 'rgba(255,255,255,0.06)' : cfg.border}` }}
            >
              {SEVERITY_LABELS[inc.severity]}
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer group flex-shrink-0" title="Marquer comme résolu">
            <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">Résolu</span>
            <div
              className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: resolved ? cfg.color : 'transparent', borderColor: resolved ? cfg.color : 'rgba(255,255,255,0.2)' }}
            >
              {resolved && <span className="text-white text-xs leading-none">✓</span>}
            </div>
            <input type="checkbox" className="sr-only" checked={resolved} onChange={() => onToggleResolved(inc.id)} />
          </label>
        </div>

        <h3 className="text-sm font-black leading-snug" style={{ color: resolved ? '#475569' : '#e2e8f0' }}>{inc.title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-serif">{inc.explanation}</p>

        {inc.links?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
            {inc.links.map(link => (
              <EntityChip key={link.entityId + link.label} link={link} onEntityClick={onEntityClick} onEntityFilter={onEntityFilter} />
            ))}
            <div className="ml-auto">
              <FixButton links={inc.links} onFix={onFix} />
            </div>
          </div>
        )}
      </div>

      {resolved && (
        <div className="px-4 pb-4 flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Note de résolution</label>
          <textarea
            value={note}
            onChange={e => setLocalNote(e.target.value)}
            placeholder="Comment as-tu réglé ça dans ton manuscrit ?"
            rows={3}
            style={{ backgroundColor: '#1e2d3d', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 12, lineHeight: 1.6, padding: '8px 12px', outline: 'none', resize: 'none', width: '100%', fontFamily: 'serif' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.7)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; setNote(inc.id, note); }}
          />
          {note && <p className="text-[10px] text-slate-600 text-right">✓ Sauvegardé</p>}
        </div>
      )}
    </div>
  );
}
