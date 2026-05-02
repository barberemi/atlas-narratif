import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLoreStore }     from '../stores/useLoreStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useStoreLoader }   from '../hooks/useStoreLoader';
import EntityEditor from '../components/lore/EntityEditor';
import EventEditor  from '../components/timeline/EventEditor';
import { filterBySource, computeStats, extractChapters } from '../utils/reviewUtils';

// ── Badge source ───────────────────────────────────────────────────────────────
const SOURCE_LABELS = {
  import:   { key: 'review.sourceImport',   fallback: 'Import\u00e9',  color: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.2)'  },
  manual:   { key: 'review.sourceManual',   fallback: 'Manuel',   color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)'  },
  modified: { key: 'review.sourceModified', fallback: 'Modifi\u00e9',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)'  },
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
];

// ── Section entités ────────────────────────────────────────────────────────────
function Section({ title, count, items, renderItem, accent }) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0) return null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      {/* Header section */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{title}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            {count}
          </span>
        </div>
        <span className="text-slate-600 text-xs">{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
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
      className="flex items-center gap-3 px-4 py-2.5 group transition-colors"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {color && (
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      )}
      <span className="text-sm text-slate-300 flex-1 truncate font-medium">{item.name ?? item.title}</span>
      {children}
      <SourceBadge source={item.source ?? 'import'} t={t} />
      <button
        onClick={() => onEdit(item)}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-[11px] transition-opacity flex-shrink-0"
        style={{ backgroundColor: 'rgba(129,140,248,0.12)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)' }}
        title={t('review.edit', 'Modifier')}
      >
        ✎
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
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{t('review.importDone', 'Import termin\u00e9')}</p>
            <h1 className="text-2xl font-black tracking-tight">
              {t('review.titlePrefix', 'R\u00e9vision du')} <span style={{ color: '#818cf8' }}>{t('review.titleHighlight', 'projet')}</span>
            </h1>
            <p className="text-sm text-slate-500 font-serif italic mt-1">
              {stats.characters} {t('label.characters')} · {stats.locations} {t('label.locations')} · {stats.objects} {t('label.objects')} · {stats.events} {t('label.events')}
              {stats.modified > 0 && (
                <span style={{ color: '#f59e0b' }}> · {stats.modified} {t('review.modifiedAdded', 'modifi\u00e9s/ajout\u00e9s')}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-150"
            style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}
          >
            {t('review.goToDashboard', 'Dashboard →')}
          </button>
        </div>

        {/* ── Filtres source ── */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        >
          {FILTER_IDS.map(f => (
            <button
              key={f.id}
              onClick={() => setSourceFilter(f.id)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150"
              style={{
                backgroundColor: sourceFilter === f.id ? 'rgba(63,81,181,0.2)'  : 'transparent',
                color:           sourceFilter === f.id ? '#818cf8'               : '#475569',
                border:          sourceFilter === f.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
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
          <div className="text-center py-12 text-slate-600 font-serif italic text-sm">
            {t('review.noFilterResult', 'Aucun \u00e9l\u00e9ment avec ce filtre')}
          </div>
        )}

        {/* ── Personnages ── */}
        <Section
          title={t('label.characters')}
          count={filteredChars.length}
          accent="#818cf8"
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
          accent="#60a5fa"
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
                <span className="text-[11px] text-slate-600 truncate hidden sm:block">{loc.type}</span>
              )}
            </EntityRow>
          )}
        />

        {/* ── Objets ── */}
        <Section
          title={t('label.objects')}
          count={filteredObjs.length}
          accent="#a78bfa"
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
                <span className="text-[11px] text-slate-600 truncate hidden sm:block">{obj.type}</span>
              )}
            </EntityRow>
          )}
        />

        {/* ── Événements ── */}
        <Section
          title={t('label.events')}
          count={filteredEvents.length}
          accent="#3F51B5"
          items={filteredEvents}
          renderItem={(evt) => (
            <EntityRow
              key={evt.id}
              item={{ ...evt, name: evt.title }}
              color={null}
              onEdit={() => setEditorState({ type: 'event', entity: evt })}
              t={t}
            >
              <span className="text-[11px] text-slate-600 flex-shrink-0 hidden sm:block">
                Ch.{evt.chapter}
              </span>
            </EntityRow>
          )}
        />

        {/* ── Bouton bas de page ── */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 rounded-xl text-sm font-black transition-all duration-200 mt-2"
          style={{ backgroundColor: 'rgba(63,81,181,0.18)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}
        >
          {t('review.startExploring', 'Commencer l\'exploration \u2192')}
        </button>

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
