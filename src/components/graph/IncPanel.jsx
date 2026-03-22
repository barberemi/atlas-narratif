import { SEVERITY_CONFIG } from '../../data/severity_config';
import { hexToRgb } from '../../utils/color';
import { getEntityInfo, getEntityMeta } from '../../utils/entityUtils';

export default function IncPanel({ incPanelId, panelIncs = [], onClose, central, satellites, navigateTo }) {
  const panelEntity = incPanelId === central?.id ? central : satellites.find(s => s.id === incPanelId);
  const entityName  = panelEntity?.name ?? incPanelId;

  return (
    <div
      className="absolute top-4 right-4 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{
        zIndex: 40, width: 320, maxHeight: 'calc(100% - 32px)',
        backgroundColor: 'rgba(10,18,28,0.96)',
        border: '1px solid rgba(239,68,68,0.25)',
        boxShadow: '0 0 40px rgba(239,68,68,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Incohérences détectées</p>
          <p className="text-sm font-bold text-white leading-tight mt-0.5">{entityName}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all text-sm flex-shrink-0"
        >✕</button>
      </div>

      {/* Liste */}
      <div className="overflow-y-auto flex-1 p-3 space-y-3">
        {panelIncs.map(inc => {
          const cfg = SEVERITY_CONFIG[inc.severity];
          return (
            <div
              key={inc.id}
              className="rounded-xl p-3"
              style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-[10px] text-slate-500 shrink-0">{inc.type}</span>
              </div>
              <p className="text-xs font-semibold text-white leading-snug mb-2">{inc.title}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-serif">{inc.explanation}</p>
              {inc.links.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {inc.links.filter(l => l.entityId !== incPanelId).map(link => {
                    const info   = getEntityInfo(link.entityId);
                    const exists = !!getEntityMeta(link.entityId);
                    return (
                      <button
                        key={link.entityId}
                        disabled={!exists}
                        onClick={() => { if (exists) { onClose(); navigateTo(link.entityId); } }}
                        className="text-[10px] px-2 py-0.5 rounded-full transition-all duration-150"
                        style={{
                          backgroundColor: exists ? `rgba(${hexToRgb(info.color)},0.1)` : 'rgba(255,255,255,0.04)',
                          color:           exists ? info.color : '#475569',
                          border:          `1px solid ${exists ? `rgba(${hexToRgb(info.color)},0.3)` : 'rgba(255,255,255,0.08)'}`,
                          cursor:          exists ? 'pointer' : 'default',
                        }}
                        title={exists ? `Explorer ${link.label}` : 'Entité non référencée'}
                      >
                        {info.icon} {link.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
