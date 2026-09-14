import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getEntityMeta } from '../../utils/entityUtils';

export default function FixButton({ links, onFix }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fixable = links.filter(l => ['character', 'location', 'object'].includes(l.entityType) && getEntityMeta(l.entityId, l.entityType));
  if (fixable.length === 0) return null;

  if (fixable.length === 1) {
    return (
      <button
        onClick={() => onFix(fixable[0])}
        className="font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] px-2.5 py-1 transition-all duration-150 flex-shrink-0"
        style={{ backgroundColor: 'rgba(92,174,142,0.12)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.25)' }}
      >
        {t('inc.fix')}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] px-2.5 py-1 transition-all duration-150"
        style={{ backgroundColor: 'rgba(92,174,142,0.12)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.25)' }}
      >
        {t('inc.fixMultiple')}
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 left-0 z-20 overflow-hidden py-1"
          style={{ minWidth: 180, backgroundColor: '#1a1d22', border: '1px solid var(--color-atlas-line)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {fixable.map(link => (
            <button
              key={link.entityId}
              onClick={() => { onFix(link); setOpen(false); }}
              className="w-full text-left text-xs px-3 py-2 transition-colors"
              style={{ color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              {getEntityMeta(link.entityId, link.entityType)?.name ?? link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
