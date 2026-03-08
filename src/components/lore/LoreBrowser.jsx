import { useState, useMemo, useEffect, useRef } from 'react';
import { loreDB } from '../../data/lore_database';
import { getEntityIncoherences, getMaxSeverity, SEVERITY_CONFIG } from '../../data/incoherences_database';

// ── Badge incohérences ────────────────────────────────────────────────────────
function IncBadge({ entityId }) {
  const incs = useMemo(() => getEntityIncoherences(entityId), [entityId]);
  if (!incs.length) return null;
  const sev = getMaxSeverity(incs);
  const cfg = SEVERITY_CONFIG[sev];
  return (
    <div
      className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold z-10"
      style={{ backgroundColor: cfg.color, color: '#fff', fontSize: '10px', lineHeight: 1 }}
      title={`${incs.length} incohérence${incs.length > 1 ? 's' : ''} détectée${incs.length > 1 ? 's' : ''}`}
    >
      ⚠ {incs.length}
    </div>
  );
}

const TABS = [
  { key: 'characters', label: 'Personnages', data: loreDB.characters },
  { key: 'locations',  label: 'Lieux',       data: loreDB.locations  },
  { key: 'objects',    label: 'Objets',       data: loreDB.objects    },
];

// ── Carte Personnage ─────────────────────────────────────────────────────────
function CharacterCard({ char, highlighted }) {
  const ref = useRef(null);
  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  const hex = (char.color || '#64748b').replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  return (
    <div
      ref={ref}
      className="rounded-xl border overflow-hidden transition-all duration-300 relative"
      style={{
        borderColor: highlighted ? char.color : 'rgba(255,255,255,0.08)',
        backgroundColor: highlighted
          ? `rgba(${rgb},0.08)`
          : 'rgba(255,255,255,0.03)',
        boxShadow: highlighted ? `0 0 20px rgba(${rgb},0.25)` : 'none',
      }}
    >
      <IncBadge entityId={char.id} />
      {/* Bandeau couleur */}
      <div className="h-1" style={{ backgroundColor: char.color }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Nom + race */}
        <div>
          <h3 className="text-base font-black text-white leading-tight">{char.name}</h3>
          {char.aliases?.length > 0 && (
            <p className="text-xs text-slate-500 italic mt-0.5">
              {char.aliases.slice(0, 2).join(' · ')}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `rgba(${rgb},0.15)`,
                color: char.color,
                border: `1px solid rgba(${rgb},0.3)`,
              }}
            >
              {char.race}
            </span>
            <span className="text-xs text-slate-500">{char.role}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed font-serif line-clamp-3">
          {char.description}
        </p>

        {/* Traits */}
        {char.traits?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {char.traits.map((t, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded text-slate-300"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Origine */}
        <p className="text-xs text-slate-600 italic">{char.origin}</p>
      </div>
    </div>
  );
}

// ── Carte Lieu ────────────────────────────────────────────────────────────────
function LocationCard({ loc, highlighted, onCharacterClick }) {
  const ref = useRef(null);
  const [hoveredChar, setHoveredChar] = useState(null);
  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  return (
    <div
      ref={ref}
      className="rounded-xl border overflow-hidden transition-all duration-300 relative"
      style={{
        borderColor: highlighted ? '#818cf8' : 'rgba(255,255,255,0.08)',
        backgroundColor: highlighted ? 'rgba(129,140,248,0.06)' : 'rgba(255,255,255,0.03)',
        boxShadow: highlighted ? '0 0 20px rgba(129,140,248,0.2)' : 'none',
      }}
    >
      <IncBadge entityId={loc.id} />
      <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-700" />
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
              {loc.type}
            </span>
          </div>
          <h3 className="text-base font-black text-white">{loc.name}</h3>
          <p className="text-xs text-slate-500 italic mt-0.5">{loc.regime}</p>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-serif line-clamp-3">
          {loc.description}
        </p>

        {loc.inhabitants?.filter(Boolean).length > 0 && (
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Habitants</p>
            <div className="flex flex-wrap gap-1.5">
              {loc.inhabitants.map((h, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded text-slate-300 bg-white/5 border border-white/8"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {loc.keyPlaces?.length > 0 && (
          <p className="text-xs text-slate-600 italic">
            {loc.keyPlaces.join(' · ')}
          </p>
        )}

        {loc.visitedBy?.length > 0 && (
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1.5">Passés par ici</p>
            <div className="flex flex-wrap gap-1.5">
              {loc.visitedBy.map((char) => {
                const hex = char.color.replace('#', '');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return (
                  <button
                    key={char.id}
                    onClick={(e) => { e.stopPropagation(); onCharacterClick?.(char.name); }}
                    onMouseEnter={() => setHoveredChar(char.id)}
                    onMouseLeave={() => setHoveredChar(null)}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-all duration-150"
                    style={{
                      backgroundColor: hoveredChar === char.id ? `rgba(${r},${g},${b},0.25)` : `rgba(${r},${g},${b},0.12)`,
                      color: char.color,
                      border: `1px solid rgba(${r},${g},${b},${hoveredChar === char.id ? '0.6' : '0.3'})`,
                      cursor: onCharacterClick ? 'pointer' : 'default',
                      transform: hoveredChar === char.id ? 'translateY(-1px)' : 'none',
                      boxShadow: hoveredChar === char.id ? `0 3px 8px rgba(${r},${g},${b},0.3)` : 'none',
                    }}
                    title={`Voir la fiche de ${char.name}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: char.color }}
                    />
                    {char.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Carte Objet ───────────────────────────────────────────────────────────────
function ObjectCard({ obj, highlighted, onCharacterClick }) {
  const ref = useRef(null);
  const [hoveredChar, setHoveredChar] = useState(null);
  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  return (
    <div
      ref={ref}
      className="rounded-xl border overflow-hidden transition-all duration-300 relative"
      style={{
        borderColor: highlighted ? '#F59E0B' : 'rgba(255,255,255,0.08)',
        backgroundColor: highlighted ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
        boxShadow: highlighted ? '0 0 20px rgba(245,158,11,0.2)' : 'none',
      }}
    >
      <IncBadge entityId={obj.id} />
      <div className="h-1 bg-gradient-to-r from-amber-600 to-amber-400" />
      <div className="p-4 flex flex-col gap-3">
        <div>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 border border-amber-800/40">
            {obj.type}
          </span>
          <h3 className="text-base font-black text-white mt-1">{obj.name}</h3>
          {obj.creator && (
            <p className="text-xs text-slate-500 italic mt-0.5">Forgé par {obj.creator}</p>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-serif line-clamp-3">
          {obj.description}
        </p>

        {obj.powers?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {obj.powers.map((p, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded text-amber-300 bg-amber-900/20 border border-amber-800/30"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        {obj.holders?.length > 0 && (
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1.5">Porteur(s)</p>
            <div className="flex flex-wrap gap-1.5">
              {obj.holders.map((char) => {
                const hex = char.color.replace('#', '');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return (
                  <button
                    key={char.id}
                    onClick={(e) => { e.stopPropagation(); onCharacterClick?.(char.name); }}
                    onMouseEnter={() => setHoveredChar(char.id)}
                    onMouseLeave={() => setHoveredChar(null)}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-all duration-150"
                    style={{
                      backgroundColor: hoveredChar === char.id ? `rgba(${r},${g},${b},0.25)` : `rgba(${r},${g},${b},0.12)`,
                      color: char.color,
                      border: `1px solid rgba(${r},${g},${b},${hoveredChar === char.id ? '0.6' : '0.3'})`,
                      cursor: onCharacterClick ? 'pointer' : 'default',
                      transform: hoveredChar === char.id ? 'translateY(-1px)' : 'none',
                      boxShadow: hoveredChar === char.id ? `0 3px 8px rgba(${r},${g},${b},0.3)` : 'none',
                    }}
                    title={`Voir la fiche de ${char.name}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: char.color }}
                    />
                    {char.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {obj.inscription && (
          <p className="text-xs text-amber-600/70 font-serif italic border-l-2 border-amber-800/40 pl-2">
            {obj.inscription}
          </p>
        )}
      </div>
    </div>
  );
}

// ── LoreBrowser principal ─────────────────────────────────────────────────────
/**
 * Props :
 *   onBack          — retour à la carte / accueil
 *   initialTab      — 'characters' | 'locations' | 'objects'
 *   initialSearch   — texte de recherche pré-rempli (ex: "Aragorn")
 *   onEntityClick   — (id) => void — ouvre le graphe de l'entité
 */
export default function LoreBrowser({ initialTab = 'characters', initialSearch = '', onEntityClick, onCharacterClick }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState(initialSearch);

  // Sync si les props changent (navigation depuis la carte)
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => { setSearch(initialSearch); }, [initialSearch]);

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const filtered = useMemo(() => {
    if (!search.trim()) return currentTab.data;
    const q = search.toLowerCase();
    return currentTab.data.filter((item) => {
      const searchable = [
        item.name,
        item.description,
        ...(item.aliases ?? []),
        item.race ?? '',
        item.role ?? '',
        item.type ?? '',
        item.creator ?? '',
        ...(item.traits ?? []),
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

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Lore <span style={{ color: '#3F51B5' }}>Browser</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            Encyclopédie — La Communauté de l'Anneau
          </p>
        </div>

        {/* Compteur */}
        <span className="text-xs font-mono text-slate-600">
          {filtered.length} / {currentTab.data.length}
        </span>
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
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-600">
            <p className="text-4xl mb-4">◯</p>
            <p className="font-serif italic">Aucun résultat pour « {search} »</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTab === 'characters' &&
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onEntityClick?.(item.id)}
                  className="relative group"
                  style={{ cursor: onEntityClick ? 'pointer' : 'default' }}
                >
                  <CharacterCard char={item} highlighted={item.id === highlightedId} />
                  {onEntityClick && (
                    <span className="absolute top-3 right-3 text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors select-none pointer-events-none">
                      Voir graphe →
                    </span>
                  )}
                </div>
              ))}
            {activeTab === 'locations' &&
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onEntityClick?.(item.id)}
                  className="relative group"
                  style={{ cursor: onEntityClick ? 'pointer' : 'default' }}
                >
                  <LocationCard loc={item} highlighted={item.id === highlightedId} onCharacterClick={onCharacterClick} />
                  {onEntityClick && (
                    <span className="absolute top-3 right-3 text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors select-none pointer-events-none">
                      Voir graphe →
                    </span>
                  )}
                </div>
              ))}
            {activeTab === 'objects' &&
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onEntityClick?.(item.id)}
                  className="relative group"
                  style={{ cursor: onEntityClick ? 'pointer' : 'default' }}
                >
                  <ObjectCard obj={item} highlighted={item.id === highlightedId} onCharacterClick={onCharacterClick} />
                  {onEntityClick && (
                    <span className="absolute top-3 right-3 text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors select-none pointer-events-none">
                      Voir graphe →
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
