import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoreStore } from '../../stores/useLoreStore';
import { useVolumeStore } from '../../stores/useVolumeStore';
import { useFocusFlash } from '../../hooks/useFocusFlash';
import EntityEditor    from './EntityEditor';
import Skeleton        from '../ui/Skeleton';
import { HeaderAction, HeaderSep } from '../ui/HeaderButton';
import GroupEditor     from './GroupEditor';
import CharacterCard   from './CharacterCard';
import LocationCard    from './LocationCard';
import ObjectCard      from './ObjectCard';
import GroupCard       from './GroupCard';
import Icon            from '../ui/Icon';


const TAB_KEYS = [
  { key: 'characters', i18nKey: 'label.characters' },
  { key: 'locations',  i18nKey: 'label.locations'  },
  { key: 'objects',    i18nKey: 'label.objects'     },
  { key: 'groups',     i18nKey: 'label.groups'      },
];

// ── LoreBrowser principal ─────────────────────────────────────────────────────
/**
 * Props :
 *   onBack          — retour à la carte / accueil
 *   initialTab      — 'characters' | 'locations' | 'objects'
 *   initialSearch   — texte de recherche pré-rempli (ex: "Aragorn")
 *   onEntityClick   — (id) => void — ouvre le graphe de l'entité
 */
export default function LoreBrowser({ initialTab = 'characters', initialSearch = '', onEntityClick }) {
  const { t } = useTranslation();
  const { characters, locations, objects, groups, ready } = useLoreStore();
  const volumes = useVolumeStore(s => s.volumes);
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);
  const activeVolume = activeVolumeId ? (volumes ?? []).find(v => v.id === activeVolumeId) : null;
  const [activeTab,    setActiveTab]    = useState(initialTab);
  const [search,       setSearch]       = useState(initialSearch);
  const tabNavRef = useRef(null);
  const [tabCanScroll, setTabCanScroll] = useState(false);
  // undefined = fermé, null = création, objet = édition
  const [editorEntity,  setEditorEntity]  = useState(undefined);
  const [groupEditorGrp, setGroupEditorGrp] = useState(undefined); // undefined=fermé, null=création, obj=édition

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => { setSearch(initialSearch); }, [initialSearch]);
  useEffect(() => {
    const el = tabNavRef.current;
    if (el) setTabCanScroll(el.scrollWidth > el.clientWidth);
  });

  const handleCharacterClick = (charName) => {
    setActiveTab('characters');
    setSearch(charName);
  };

  const TABS = useMemo(() => {
    const dataMap = { characters, locations, objects, groups };
    return TAB_KEYS.map(tab => ({
      key: tab.key,
      label: t(tab.i18nKey),
      data: ready ? (dataMap[tab.key] ?? []) : [],
    }));
  }, [ready, characters, locations, objects, groups, t]);

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

  // Deep-link « aller pile sur la fiche » (?focus=<id> depuis le chat) → flash.
  const flashId = useFocusFlash(ready);

  if (!ready) return <Skeleton variant="card" />;

  return (
    <div className="h-full w-full max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200 overflow-y-hidden">
      {/* ── Header ── */}
      <header data-tour="lore-tabs" className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Univers · encyclopédie'}</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            Lore <span className="italic" style={{ color: '#5cae8e' }}>Browser</span>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {t('lore.subtitle')}{activeVolume ? ` · ${activeVolume.title}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-xs font-mono text-atlas-mute">
            {filtered.length} / {currentTab.data.length}
          </span>
          <HeaderSep />
          <HeaderAction onClick={() => activeTab === 'groups' ? setGroupEditorGrp(null) : setEditorEntity(null)}>
            {t('btn.add')}
          </HeaderAction>
        </div>
      </header>

      {/* ── Tabs + Search ── */}
      <div className="px-6 pt-4 pb-0 flex flex-col gap-4 flex-shrink-0">
        {/* Tabs */}
        <div className="relative">
          <nav
            ref={tabNavRef}
            className="flex gap-1 border-b border-atlas-line overflow-x-auto no-scrollbar"
            onScroll={() => {
              const el = tabNavRef.current;
              if (el) setTabCanScroll(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
            }}
          >
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                  className="font-grotesk px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition-all duration-200 relative flex-shrink-0 whitespace-nowrap"
                  style={{ color: isActive ? '#ece7db' : 'var(--color-atlas-mute)' }}
                >
                  {tab.label}
                  <span
                    className="ml-2 text-xs font-mono"
                    style={{ color: isActive ? '#5cae8e' : '#3a352d' }}
                  >
                    {tab.data.length}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5cae8e]" />
                  )}
                </button>
              );
            })}
          </nav>
          {tabCanScroll && (
            <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, #15171b)' }} />
          )}
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-atlas-mute text-sm">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full pl-8 pr-4 py-2 text-sm bg-white/5 border border-atlas-line text-atlas-text placeholder-atlas-mute outline-none focus:border-[#5cae8e] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-atlas-soft hover:text-white transition-colors"
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Grille ── */}
      <main data-tour="lore-grid" className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 bg-atlas-ink">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-atlas-mute">
            <p className="text-4xl mb-4">◯</p>
            <p className="font-serif italic">
              {search ? t('empty.noSearch') : t('empty.noData')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTab === 'characters' &&
              filtered.map((item) => (
                <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => setEditorEntity(item)}>
                  <CharacterCard char={item} highlighted={item.id === highlightedId} flash={item.id === flashId}
                    onRelations={onEntityClick ? () => onEntityClick(item.id) : undefined}
                  />
                </div>
              ))}
            {activeTab === 'locations' &&
              filtered.map((item) => (
                <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => setEditorEntity(item)}>
                  <LocationCard loc={item} highlighted={item.id === highlightedId} flash={item.id === flashId} onCharacterClick={handleCharacterClick}
                    onRelations={onEntityClick ? () => onEntityClick(item.id) : undefined}
                  />
                </div>
              ))}
            {activeTab === 'objects' &&
              filtered.map((item) => (
                <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => setEditorEntity(item)}>
                  <ObjectCard obj={item} highlighted={item.id === highlightedId} flash={item.id === flashId} onCharacterClick={handleCharacterClick}
                    onRelations={onEntityClick ? () => onEntityClick(item.id) : undefined}
                  />
                </div>
              ))}
            {activeTab === 'groups' &&
              filtered.map((item) => (
                <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => setGroupEditorGrp(item)}>
                  <GroupCard
                    group={item}
                    onCharacterClick={handleCharacterClick}
                    onRelations={onEntityClick ? () => onEntityClick(item.id) : undefined}
                  />
                </div>
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
