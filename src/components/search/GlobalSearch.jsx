import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLoreStore }     from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useIncStore }      from '../../stores/useIncStore';

// ── Config des groupes ─────────────────────────────────────────────────────────
const GROUP_DEFS = [
  { id: 'character', i18nKey: 'label.characters', icon: '👤', color: '#818cf8' },
  { id: 'location',  i18nKey: 'label.locations',  icon: '📍', color: '#60a5fa' },
  { id: 'object',    i18nKey: 'label.objects',     icon: '⚔️', color: '#a78bfa' },
  { id: 'event',     i18nKey: 'label.events',      icon: '📅', color: '#6366f1' },
  { id: 'inco',      i18nKey: 'label.incoherences',icon: '⚠️', color: '#ef4444' },
];

const SEVERITY_COLORS = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#64748b',
};

// ── Highlight du terme recherché ───────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-black" style={{ color: '#818cf8' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Ligne de résultat ─────────────────────────────────────────────────────────
function ResultRow({ result, query, isActive, onSelect, onHover, groups }) {
  const group = groups.find(g => g.id === result.group);
  return (
    <button
      onMouseEnter={onHover}
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75"
      style={{ backgroundColor: isActive ? 'rgba(129,140,248,0.1)' : 'transparent' }}
    >
      <span className="text-base flex-shrink-0 w-5 text-center leading-none">{group?.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate font-medium">
          <Highlight text={result.title} query={query} />
        </p>
        {result.sub && (
          <p className="text-[11px] text-slate-600 truncate mt-0.5">
            <Highlight text={result.sub} query={query} />
          </p>
        )}
      </div>
      {result.badge && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ color: result.badgeColor, backgroundColor: `${result.badgeColor}15`, border: `1px solid ${result.badgeColor}30` }}
        >
          {result.badge}
        </span>
      )}
      <span className="text-slate-700 text-xs flex-shrink-0">↵</span>
    </button>
  );
}

// ── GlobalSearch ───────────────────────────────────────────────────────────────
export default function GlobalSearch({ onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const characters = useLoreStore(s => s.characters);
  const locations  = useLoreStore(s => s.locations);
  const objects    = useLoreStore(s => s.objects);
  const events     = useTimelineStore(s => s.events);
  const incos      = useIncStore(s => s.data);

  const GROUPS = useMemo(() => GROUP_DEFS.map(g => ({ ...g, label: t(g.i18nKey) })), [t]);

  const [query,       setQuery]       = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Focus à l'ouverture
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Construction des résultats
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const match = (str) => (str ?? '').toLowerCase().includes(q);
    const out = [];

    characters.forEach(c => {
      if (match(c.name) || match(c.description)) {
        out.push({
          id:    c.id,
          group: 'character',
          title: c.name,
          sub:   null,
          badge: c.source !== 'import' ? (c.source === 'manual' ? t('review.sourceManual') : t('review.sourceModified')) : null,
          badgeColor: c.source === 'manual' ? '#34d399' : '#f59e0b',
          action: () => navigate(`/lore?tab=characters&search=${encodeURIComponent(c.name)}`),
        });
      }
    });

    locations.forEach(l => {
      if (match(l.name) || match(l.type) || match(l.description)) {
        out.push({
          id:    l.id,
          group: 'location',
          title: l.name,
          sub:   l.type ?? null,
          badge: l.source !== 'import' ? (l.source === 'manual' ? t('review.sourceManual') : t('review.sourceModified')) : null,
          badgeColor: l.source === 'manual' ? '#34d399' : '#f59e0b',
          action: () => navigate(`/lore?tab=locations&search=${encodeURIComponent(l.name)}`),
        });
      }
    });

    objects.forEach(o => {
      if (match(o.name) || match(o.type) || match(o.description)) {
        out.push({
          id:    o.id,
          group: 'object',
          title: o.name,
          sub:   o.type ?? null,
          badge: o.source !== 'import' ? (o.source === 'manual' ? t('review.sourceManual') : t('review.sourceModified')) : null,
          badgeColor: o.source === 'manual' ? '#34d399' : '#f59e0b',
          action: () => navigate(`/lore?tab=objects&search=${encodeURIComponent(o.name)}`),
        });
      }
    });

    (events ?? []).forEach(e => {
      if (match(e.title) || match(e.description) || match(e.chapterTitle)) {
        out.push({
          id:    e.id,
          group: 'event',
          title: e.title,
          sub:   `Ch.${e.chapter}${e.chapterTitle ? ` · ${e.chapterTitle}` : ''}`,
          badge: null,
          action: () => navigate('/timeline'),
        });
      }
    });

    (incos ?? []).forEach(i => {
      const translatedType = i.type ? t(`incType.${i.type}`, { defaultValue: i.type }) : '';
      if (match(i.title) || match(i.explanation) || match(i.type) || match(translatedType)) {
        out.push({
          id:         i.id,
          group:      'inco',
          title:      i.title,
          sub:        translatedType || null,
          badge:      t(`severity.${i.severity}`, { defaultValue: i.severity }),
          badgeColor: SEVERITY_COLORS[i.severity] ?? '#64748b',
          action:     () => navigate(`/incoherences?filter=${i.severity}`),
        });
      }
    });

    return out;
  }, [query, characters, locations, objects, events, incos, navigate, t]);

  // Reset activeIndex quand les résultats changent
  useEffect(() => { setActiveIndex(0); }, [results]);

  // Scroll de la ligne active dans la vue
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = useCallback((result) => {
    result.action();
    onClose();
  }, [onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Groupes présents dans les résultats
  const presentGroups = useMemo(
    () => GROUPS.filter(g => results.some(r => r.group === g.id)),
    [results, GROUPS],
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panneau */}
      <div
        className="fixed z-50 left-1/2 -translate-x-1/2 flex flex-col overflow-hidden"
        style={{
          top: '15vh',
          width: '100%',
          maxWidth: 580,
          backgroundColor: '#0d1b2a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 flex-shrink-0">
          <span className="text-slate-500 text-base">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.globalSearch')}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-slate-600"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-600 hover:text-slate-400 transition-colors text-xs"
            >
              {t('btn.close')}
            </button>
          )}
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#475569', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Esc
          </kbd>
        </div>

        {/* Résultats */}
        {query.trim() && (
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: '60vh' }}
          >
            {results.length === 0 ? (
              <p className="text-slate-600 font-serif italic text-sm text-center py-10">
                {t('empty.noSearch')}
              </p>
            ) : (
              presentGroups.map(group => {
                const groupResults = results.filter(r => r.group === group.id);
                const startIndex   = results.findIndex(r => r.group === group.id);
                return (
                  <div key={group.id}>
                    {/* Header groupe */}
                    <div
                      className="flex items-center gap-2 px-4 py-1.5 sticky top-0"
                      style={{ backgroundColor: '#0d1b2a', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: group.color }}>
                        {group.label}
                      </span>
                      <span className="text-[10px] text-slate-700">{groupResults.length}</span>
                    </div>

                    {groupResults.map((result, idx) => {
                      const globalIdx = startIndex + idx;
                      return (
                        <div key={result.id} data-active={globalIdx === activeIndex ? 'true' : 'false'}>
                          <ResultRow
                            result={result}
                            query={query}
                            isActive={globalIdx === activeIndex}
                            onSelect={() => handleSelect(result)}
                            onHover={() => setActiveIndex(globalIdx)}
                            groups={GROUPS}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer hint */}
        {!query.trim() && (
          <div className="px-4 py-4 text-center">
            <p className="text-xs text-slate-700 font-serif italic">
              {t('search.placeholder')}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div
            className="flex items-center justify-between px-4 py-2 border-t border-white/5 flex-shrink-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          >
            <span className="text-[10px] text-slate-700">{t('search.resultCount', { count: results.length })}</span>
            <div className="flex items-center gap-3 text-[10px] text-slate-700">
              <span><kbd className="font-mono">↑↓</kbd> {t('search.navigate')}</span>
              <span><kbd className="font-mono">↵</kbd> {t('search.open')}</span>
              <span><kbd className="font-mono">Esc</kbd> {t('search.close')}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
