import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEVERITY_CONFIG } from '../../data/severity_config';
import { useIncStore } from '../../stores/useIncStore';
import { useFlashScroll } from '../../hooks/useFocusFlash';
import EntityChip from './EntityChip';
import FixButton from './FixButton';
import Icon, { ICONS } from '../ui/Icon';

const TYPE_ICONS = {
  // critical
  'Continuité de Personnage':       'death',
  // high
  "Continuité d'Objet":             'settings',
  'Conflit de Lieu Intra-Chapitre': 'zap',
  'Payoff Avant Plant':             'clock',
  'Entité Non Référencée':          'link',
  // medium
  'Incohérence de Porteur':         'inventory',
  'Affiliation Fantôme':            'ghost',
  'Personnage POV Absent':          'pov',
  'Plant Sans Payoff':              'plant',
  // low
  'Fil Narratif Vide':              'thread',
  'Entité Orpheline':               'link',
  'Scène Vide':                     'ghost',
  // cross-tomes
  'Mort Cross-Tomes':               'death',
  'Objet Cross-Tomes':              'settings',
  'Plant Cross-Tomes':              'plant',
};

export default function IncoherenceCard({ inc, resolved, flash, onToggleResolved, onEntityClick, onEntityFilter, onFix }) {
  const { t } = useTranslation();
  const cfg      = SEVERITY_CONFIG[inc.severity];
  const iconName = TYPE_ICONS[inc.type] ?? 'warning';
  const setNote = useIncStore(s => s.setNote);
  const [note, setLocalNote] = useState(inc.resolutionNote ?? '');
  const { ref: flashRef, flashing } = useFlashScroll(flash);

  return (
    <div
      ref={flashRef}
      className={`transition-all duration-300 relative${flashing ? ' atlas-flash' : ''}`}
      style={{ border: '1px solid var(--color-atlas-line)', backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[2px] z-10" style={{ backgroundColor: resolved ? 'var(--color-atlas-line)' : cfg.color }} />

      <div className="pl-5 pr-4 py-4 flex flex-col gap-3" style={{ opacity: resolved ? 0.35 : 1 }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wide"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: resolved ? 'var(--color-atlas-mute)' : cfg.color, border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {ICONS[iconName] ? <Icon name={iconName} size={13} /> : iconName} {t(`incType.${inc.type}`, { defaultValue: inc.type })}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: resolved ? 'rgba(255,255,255,0.04)' : cfg.bg, color: resolved ? 'var(--color-atlas-mute)' : cfg.color, border: `1px solid ${resolved ? 'rgba(255,255,255,0.06)' : cfg.border}` }}
            >
              {t(`severity.${inc.severity}`)}
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer group flex-shrink-0" title={t('inc.markResolved')}>
            <span className="text-xs text-atlas-mute group-hover:text-slate-400 transition-colors">{t('inc.resolved')}</span>
            <div
              className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: resolved ? cfg.color : 'transparent', borderColor: resolved ? cfg.color : 'rgba(255,255,255,0.2)' }}
            >
              {resolved && <Icon name="checkmark" size={12} className="text-white" />}
            </div>
            <input type="checkbox" className="sr-only" checked={resolved} onChange={() => onToggleResolved(inc.id)} />
          </label>
        </div>

        <h3 className="font-serif text-base font-semibold leading-snug" style={{ color: resolved ? 'var(--color-atlas-mute)' : '#ece7db' }}>{inc.title}</h3>
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
        <div className="pl-5 pr-4 pb-4 flex flex-col gap-1.5">
          <label className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('inc.resolutionNote')}</label>
          <textarea
            value={note}
            onChange={e => setLocalNote(e.target.value)}
            placeholder={t('inc.resolutionPlaceholder')}
            rows={3}
            style={{ backgroundColor: '#1a1d22', border: '1px solid var(--color-atlas-line)', color: '#e2e8f0', fontSize: 12, lineHeight: 1.6, padding: '8px 12px', outline: 'none', resize: 'none', width: '100%', fontFamily: 'serif' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#5cae8e'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-atlas-line)'; setNote(inc.id, note); }}
          />
          {note && <p className="text-[10px] text-atlas-mute text-right"><Icon name="checkmark" size={12} className="inline align-text-bottom mr-1" />{t('saveIndicator.saved')}</p>}
        </div>
      )}
    </div>
  );
}
