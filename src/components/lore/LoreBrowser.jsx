import { useState, useMemo, useEffect, useRef } from 'react';
import { useLoreStore } from '../../stores/useLoreStore';
import EntityEditor    from './EntityEditor';
import GroupEditor     from './GroupEditor';
import CharacterCard   from './CharacterCard';
import LocationCard    from './LocationCard';
import ObjectCard      from './ObjectCard';
import GroupCard       from './GroupCard';


const TAB_DEFS = [
  { key: 'characters', label: 'Personnages' },
  { key: 'locations',  label: 'Lieux'       },
  { key: 'objects',    label: 'Objets'      },
  { key: 'groups',     label: 'Groupes'     },
];

// ── LoreBrowser principal ─────────────────────────────────────────────────────
/**
 * Props :
 *   onBack          — retour à la carte / accueil
 *   initialTab      — 'characters' | 'locations' | 'objects'
 *   initialSearch   — texte de recherche pré-rempli (ex: "Aragorn")
 *   onEntityClick   — (id) => void — ouvre le graphe de l'entité
 */
export default function LoreBrowser({ initialTab = 'characters', initialSearch = '', onEntityClick, onCharacterClick }) {
  const { characters, locations, objects, groups, ready } = useLoreStore();
  const [activeTab,    setActiveTab]    = useState(initialTab);
  const [search,       setSearch]       = useState(initialSearch);
  // undefined = fermé, null = création, objet = édition
  const [editorEntity,  setEditorEntity]  = useState(undefined);
  const [groupEditorGrp, setGroupEditorGrp] = useState(undefined); // undefined=fermé, null=création, obj=édition

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => { setSearch(initialSearch); }, [initialSearch]);

  const TABS = useMemo(() => ready ? [
    { key: 'characters', label: 'Personnages', data: characters },
    { key: 'locations',  label: 'Lieux',       data: locations  },
    { key: 'objects',    label: 'Objets',       data: objects    },
    { key: 'groups',     label: 'Groupes',      data: groups     },
  ] : TAB_DEFS.map(t => ({ ...t, data: [] })), [ready, characters, locations, objects, groups]);

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const filtered = useMemo(() => {
    if (!search.trim()) return currentTab.data;
    const q = search.toLowerCase();
    return currentTab.data.filter((item) => {
      const searchable = [
        item.name,
        item.description,
        ...(item.aliases ?? []),
        item.type ?? '',
        item.creator ?? '',
        ...(item.inhabitants ?? []),
        ...(item.powers ?? []),
      ].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }, [currentTab, search]);

  // ID mis en surbrillance : correspond à l'initialSearch exact
  const highlightedId = useMemo(() => {
    if (!initialSearch) return null;
    const q = initialSearch.toLowerCase();
    const found = currentTab.data.find((item) =>
      item.name.toLowerCase().includes(q) ||
      (item.aliases ?? []).some((a) => a.toLowerCase().includes(q))
    );
    return found?.id ?? null;
  }, [initialSearch, currentTab]);

  if (!ready) return (
    <div className="h-full flex items-center justify-center">
      <span className="text-slate-600 font-serif italic">Chargement…</span>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-y-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Lore <span style={{ color: '#3F51B5' }}>Browser</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            Encyclopédie — La Communauté de l'Anneau
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-600">
            {filtered.length} / {currentTab.data.length}
          </span>
          <button
            onClick={() => activeTab === 'groups' ? setGroupEditorGrp(null) : setEditorEntity(null)}
            className="text-xs px-3 py-1.5 rounded-lg font-black transition-all duration-200 flex items-center gap-1.5"
            style={{ backgroundColor: 'rgba(63,81,181,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            + Ajouter
          </button>
        </div>
      </header>

      {/* ── Tabs + Search ── */}
      <div className="px-6 pt-4 pb-0 flex flex-col gap-4 flex-shrink-0">
        {/* Tabs */}
        <nav className="flex gap-1 border-b border-white/10">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                className="px-4 py-2.5 text-sm font-bold transition-all duration-200 relative"
                style={{ color: isActive ? '#fff' : '#475569' }}
              >
                {tab.label}
                <span
                  className="ml-2 text-xs font-mono"
                  style={{ color: isActive ? '#818cf8' : '#1e293b' }}
                >
                  {tab.data.length}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3F51B5]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Barre de recherche */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Rechercher dans les ${currentTab.label.toLowerCase()}…`}
            className="w-full pl-8 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 outline-none focus:border-[#3F51B5]/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Grille ── */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 bg-[#0B1621]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-600">
            <p className="text-4xl mb-4">◯</p>
            <p className="font-serif italic">
              {search ? `Aucun résultat pour « ${search} »` : 'Aucune donnée pour le moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTab === 'characters' &&
              filtered.map((item) => (
                <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => setEditorEntity(item)}>
                  <CharacterCard char={item} highlighted={item.id === highlightedId}
                    onRelations={onEntityClick ? () => onEntityClick(item.id) : undefined}
                  />
                </div>
              ))}
            {activeTab === 'locations' &&
              filtered.map((item) => (
                <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => setEditorEntity(item)}>
                  <LocationCard loc={item} highlighted={item.id === highlightedId} onCharacterClick={onCharacterClick}
                    onRelations={onEntityClick ? () => onEntityClick(item.id) : undefined}
                  />
                </div>
              ))}
            {activeTab === 'objects' &&
              filtered.map((item) => (
                <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => setEditorEntity(item)}>
                  <ObjectCard obj={item} highlighted={item.id === highlightedId} onCharacterClick={onCharacterClick}
                    onRelations={onEntityClick ? () => onEntityClick(item.id) : undefined}
                  />
                </div>
              ))}
            {activeTab === 'groups' &&
              filtered.map((item) => (
                <GroupCard
                  key={item.id}
                  group={item}
                  onEdit={g => setGroupEditorGrp(g)}
                />
              ))}
          </div>
        )}
      </main>

      {/* ── Éditeur d'entité ── */}
      {editorEntity !== undefined && (
        <EntityEditor
          entity={editorEntity}
          entityType={activeTab.replace('characters', 'character').replace('locations', 'location').replace('objects', 'object')}
          onClose={() => setEditorEntity(undefined)}
        />
      )}

      {/* ── Éditeur de groupe ── */}
      {groupEditorGrp !== undefined && (
        <GroupEditor
          group={groupEditorGrp ?? undefined}
          onClose={() => setGroupEditorGrp(undefined)}
        />
      )}
    </div>
  );
}
