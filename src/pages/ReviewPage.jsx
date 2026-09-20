import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLoreStore }     from '../stores/useLoreStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useStoreLoader }   from '../hooks/useStoreLoader';
import EntityEditor from '../components/lore/EntityEditor';
import { HeaderAction } from '../components/ui/HeaderButton';
import EventEditor  from '../components/timeline/EventEditor';
import Icon from '../components/ui/Icon';
import { filterBySource, computeStats, extractChapters } from '../utils/reviewUtils';

// ── Badge source ───────────────────────────────────────────────────────────────
const SOURCE_LABELS = {
  import:   { key: 'review.sourceImport',   fallback: 'Import\u00e9',  color: 'var(--color-atlas-soft)', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.2)'  },
  manual:   { key: 'review.sourceManual',   fallback: 'Manuel',   color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)'  },
  modified: { key: 'review.sourceModified', fallback: 'Modifi\u00e9',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)'  },
  obsidian: { key: 'review.sourceObsidian', fallback: 'Obsidian',  color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.28)'  },
};

function SourceBadge({ source, t }) {
  const cfg = SOURCE_LABELS[source] ?? SOURCE_LABELS.import;
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {t(cfg.key, cfg.fallback)}
    </span>
  );
}

// ── Filtre source ──────────────────────────────────────────────────────────────
const FILTER_IDS = [
  { id: 'all',      key: 'review.filterAll',      fallback: 'Tous' },
  { id: 'import',   key: 'review.filterImported',  fallback: 'Import\u00e9s' },
  { id: 'manual',   key: 'review.filterManual',    fallback: 'Manuels' },
  { id: 'modified', key: 'review.filterModified',  fallback: 'Modifi\u00e9s' },
  { id: 'obsidian', key: 'review.filterObsidian',  fallback: 'Obsidian' },
];

// ── Section entités ────────────────────────────────────────────────────────────
function Section({ title, count, items, renderItem, accent }) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col">
      {/* Header section (filet) */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between pb-2 pt-2 transition-colors"
        style={{ borderBottom: '1px solid var(--color-atlas-soft)' }}
      >
        <div className="flex items-baseline gap-2">
          <span className="font-grotesk text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{title}</span>
          <span className="font-grotesk text-[11px] font-bold" style={{ color: accent }}>{count}</span>
        </div>
        <Icon name={collapsed ? 'chevronRight' : 'chevronDown'} size={12} className="text-atlas-mute" />
      </button>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

// ── Ligne d'entité ─────────────────────────────────────────────────────────────
function EntityRow({ item, color, onEdit, children, t }) {
  return (
    <div
      key={item.id}
      className="flex items-center gap-3 py-3 group"
      style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
    >
      {color && (
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      )}
      <span className="text-sm text-atlas-soft flex-1 truncate font-medium">{item.name ?? item.title}</span>
      {children}
      <SourceBadge source={item.source ?? 'import'} t={t} />
      <button
        onClick={() => onEdit(item)}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-[11px] transition-opacity flex-shrink-0"
        style={{ backgroundColor: 'rgba(92,174,142,0.12)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.25)' }}
        title={t('review.edit', 'Modifier')}
      >
        <Icon name="edit" size={14} />
      </button>
    </div>
  );
}

// ── ReviewPage ─────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useStoreLoader([useTimelineStore]);

  const characters = useLoreStore(s => s.characters);
  const locations  = useLoreStore(s => s.locations);
  const objects    = useLoreStore(s => s.objects);
  const _events    = useTimelineStore(s => s.events);
  const events     = useMemo(() => _events ?? [], [_events]);

  const [sourceFilter, setSourceFilter] = useState('all');
  const [editorState,  setEditorState]  = useState(null);
  // editorState: null | { type: 'character'|'location'|'object'|'event', entity }

  const stats          = useMemo(() => computeStats(characters, locations, objects, events), [characters, locations, objects, events]);
  const filteredChars  = useMemo(() => filterBySource(characters, sourceFilter), [characters,  sourceFilter]);
  const filteredLocs   = useMemo(() => filterBySource(locations,  sourceFilter), [locations,   sourceFilter]);
  const filteredObjs   = useMemo(() => filterBySource(objects,    sourceFilter), [objects,     sourceFilter]);
  const filteredEvents = useMemo(() => filterBySource(events,     sourceFilter), [events,      sourceFilter]);
  const totalFiltered  = filteredChars.length + filteredLocs.length + filteredObjs.length + filteredEvents.length;
  const chapters       = useMemo(() => extractChapters(events), [events]);

  const closeEditor = () => setEditorState(null);

  return (
    <div className="h-full overflow-hidden no-scrollbar">
      <div className="h-full max-w-[1280px] mx-auto flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="flex items-center justify-between gap-4 px-6 py-5 border-b border-atlas-line flex-shrink-0">
          <div className="flex-1">
            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Import \u00b7 r\u00e9vision du projet'}</p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
              {t('review.titlePrefix', 'R\u00e9vision du')} <span className="italic" style={{ color: '#5cae8e' }}>{t('review.titleHighlight', 'projet')}</span>
            </h1>
            <p className="text-sm text-atlas-soft font-serif italic mt-1">
              {stats.characters} {t('label.characters')} · {stats.locations} {t('label.locations')} · {stats.objects} {t('label.objects')} · {stats.events} {t('label.events')}
              {stats.modified > 0 && (
                <span style={{ color: '#f59e0b' }}> · {stats.modified} {t('review.modifiedAdded', 'modifi\u00e9s/ajout\u00e9s')}</span>
              )}
            </p>
          </div>
          <HeaderAction onClick={() => navigate('/dashboard')}>
            {t('review.goToDashboard', 'Dashboard →')}
          </HeaderAction>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pt-6 pb-10 flex flex-col gap-6">
        {/* ── Filtres source ── */}
        <div className="flex gap-6" style={{ borderBottom: '1px solid var(--color-atlas-line)' }}>
          {FILTER_IDS.map(f => (
            <button
              key={f.id}
              onClick={() => setSourceFilter(f.id)}
              className="pb-3 -mb-px font-grotesk text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-150"
              style={{
                borderBottom: `2px solid ${sourceFilter === f.id ? 'var(--color-atlas-green)' : 'transparent'}`,
                color:        sourceFilter === f.id ? '#5cae8e' : 'var(--color-atlas-mute)',
              }}
            >
              {t(f.key, f.fallback)}
              {f.id !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({[...characters, ...locations, ...objects, ...events].filter(i => (i.source ?? 'import') === f.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Message si filtre vide ── */}
        {totalFiltered === 0 && (
          <div className="text-center py-12 text-atlas-mute font-serif italic text-sm">
            {t('review.noFilterResult', 'Aucun \u00e9l\u00e9ment avec ce filtre')}
          </div>
        )}

        {/* ── Personnages ── */}
        <Section
          title={t('label.characters')}
          count={filteredChars.length}
          accent="#cba15e"
          items={filteredChars}
          renderItem={(char) => (
            <EntityRow
              key={char.id}
              item={char}
              color={char.color}
              onEdit={() => setEditorState({ type: 'character', entity: char })}
              t={t}
            >
            </EntityRow>
          )}
        />

        {/* ── Lieux ── */}
        <Section
          title={t('label.locations')}
          count={filteredLocs.length}
          accent="#5cae8e"
          items={filteredLocs}
          renderItem={(loc) => (
            <EntityRow
              key={loc.id}
              item={loc}
              color={null}
              onEdit={() => setEditorState({ type: 'location', entity: loc })}
              t={t}
            >
              {loc.type && (
                <span className="text-[11px] text-atlas-mute truncate hidden sm:block">{loc.type}</span>
              )}
            </EntityRow>
          )}
        />

        {/* ── Objets ── */}
        <Section
          title={t('label.objects')}
          count={filteredObjs.length}
          accent="#cba15e"
          items={filteredObjs}
          renderItem={(obj) => (
            <EntityRow
              key={obj.id}
              item={obj}
              color={null}
              onEdit={() => setEditorState({ type: 'object', entity: obj })}
              t={t}
            >
              {obj.type && (
                <span className="text-[11px] text-atlas-mute truncate hidden sm:block">{obj.type}</span>
              )}
            </EntityRow>
          )}
        />

        {/* ── Événements ── */}
        <Section
          title={t('label.events')}
          count={filteredEvents.length}
          accent="#5cae8e"
          items={filteredEvents}
          renderItem={(evt) => (
            <EntityRow
              key={evt.id}
              item={{ ...evt, name: evt.title }}
              color={null}
              onEdit={() => setEditorState({ type: 'event', entity: evt })}
              t={t}
            >
              <span className="text-[11px] text-atlas-mute flex-shrink-0 hidden sm:block">
                Ch.{evt.chapter}
              </span>
            </EntityRow>
          )}
        />

        {/* ── Bouton bas de page ── */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 font-grotesk text-xs font-bold uppercase tracking-[0.08em] transition-opacity hover:opacity-90 mt-2"
          style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}
        >
          {t('review.startExploring', 'Commencer l\'exploration \u2192')}
        </button>

        </div>
      </div>

      {/* ── Éditeurs slide-in ── */}
      {editorState && editorState.type !== 'event' && (
        <EntityEditor
          entity={editorState.entity}
          entityType={editorState.type}
          onClose={closeEditor}
        />
      )}
      {editorState?.type === 'event' && (
        <EventEditor
          event={editorState.entity}
          chapters={chapters}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}
