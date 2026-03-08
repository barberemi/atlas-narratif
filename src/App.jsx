import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import FilePicker from './components/upload/FilePicker';
import LoreCard from './components/ui/LoreCard';
import AtlasMapView from './components/map/AtlasMapView';
import LoreBrowser from './components/lore/LoreBrowser';
import EntityGraph from './components/graph/EntityGraph';
import IncoherencesBrowser from './components/incoherences/IncoherencesBrowser';
import NarrativeDashboard from './components/dashboard/NarrativeDashboard';
import TimelineBrowser from './components/timeline/TimelineBrowser';
import SaveTheCat from './components/savethecat/SaveTheCat';
import { findCharacterByAllyName, loreDB } from './data/lore_database';

// Les données de test basées sur notre JSON LOTR
const lotrTestData = {
  characters: [
    { id: "char_frodo", name: "Frodo Sacquet", role: "Porteur", description: "Un Hobbit de la Comté qui hérite de l'Unique.", traits: ["Résistant", "Humble"] },
    { id: "char_gandalf", name: "Gandalf le Gris", role: "Magicien", description: "Un Istar envoyé pour guider les peuples libres.", traits: ["Sage", "Puissant"] },
    { id: "char_aragorn", name: "Aragorn", role: "Rôdeur", description: "Héritier d'Isildur et futur roi du Gondor.", traits: ["Guerrier", "Noble"] }
  ],
  locations: [
    { id: "city_rivendell", name: "Fondcombe", description: "La dernière maison simple à l'est de la mer.", regime: "Seigneurie Elfe" },
    { id: "city_moria", name: "Moria", description: "Ancien royaume nain envahi par le Fléau de Durin.", dangerLevel: 5 }
  ]
};

// ── Navigation items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/map',          label: 'Carte',           icon: '🗺️' },
  { path: '/lore',         label: 'Base de données',  icon: '💾' },
  { path: '/graph',        label: 'Graphe',           icon: '🕸️' },
  { path: '/timeline',     label: 'Timeline',         icon: '📅' },
  { path: '/dashboard',    label: 'Santé narrative',  icon: '📊' },
  { path: '/incoherences', label: 'Incohérences',     icon: '⚠️' },
  { path: '/savethecat',   label: 'Save the Cat',     icon: '🐱' },
];

// ── TopNav ────────────────────────────────────────────────────────────────────
function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="flex-shrink-0 flex items-center px-4 border-b border-white/10 gap-1"
      style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)', backdropFilter: 'blur(12px)', zIndex: 50 }}
    >
      <button
        onClick={() => navigate('/')}
        className="text-sm font-black tracking-tight mr-3 flex-shrink-0 transition-opacity duration-150 hover:opacity-70"
      >
        Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
      </button>

      <div className="w-px h-5 bg-white/10 mr-2 flex-shrink-0" />

      {NAV_ITEMS.map(({ path, label, icon }) => {
        const isActive  = location.pathname === path;
        const isWarning = path === '/incoherences';
        const activeColor  = isWarning ? '#EF4444' : '#818cf8';
        const activeBg     = isWarning ? 'rgba(239,68,68,0.12)' : 'rgba(63,81,181,0.18)';
        const activeBorder = isWarning ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.35)';
        return (
          <NavLink
            key={path}
            to={path}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 flex-shrink-0"
            style={{
              backgroundColor: isActive ? activeBg     : 'transparent',
              color:           isActive ? activeColor  : '#475569',
              border:          isActive ? `1px solid ${activeBorder}` : '1px solid transparent',
              textDecoration:  'none',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#475569'; }}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

// ── Route : Carte ─────────────────────────────────────────────────────────────
function MapRoute() {
  const navigate = useNavigate();
  return (
    <AtlasMapView
      onCharacterClick={(allyName) => {
        const found = findCharacterByAllyName(allyName);
        const search = found ? found.name : allyName.split('(')[0].trim();
        navigate(`/lore?tab=characters&search=${encodeURIComponent(search)}`);
      }}
      onLocationClick={(locationName) => {
        navigate(`/lore?tab=locations&search=${encodeURIComponent(locationName)}`);
      }}
    />
  );
}

// ── Route : Lore Browser ──────────────────────────────────────────────────────
function LoreRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab    = searchParams.get('tab')    || 'characters';
  const search = searchParams.get('search') || '';
  return (
    <LoreBrowser
      initialTab={tab}
      initialSearch={search}
      onEntityClick={(id) => navigate(`/graph?entity=${id}`)}
      onCharacterClick={(allyName) => {
        const found = findCharacterByAllyName(allyName);
        const s = found ? found.name : allyName.split('(')[0].trim();
        navigate(`/lore?tab=characters&search=${encodeURIComponent(s)}`);
      }}
    />
  );
}

// ── Route : Graphe ────────────────────────────────────────────────────────────
function GraphRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const entityId = searchParams.get('entity');
  return (
    <EntityGraph
      entityId={entityId ?? 'char_frodo'}
      initialMode={entityId ? 'centered' : 'full'}
      onNodeClick={(id) => setSearchParams({ entity: id })}
    />
  );
}

// ── Route : Dashboard ─────────────────────────────────────────────────────────
function DashboardRoute({ resolvedIds }) {
  const navigate = useNavigate();
  return (
    <NarrativeDashboard
      resolvedIds={resolvedIds}
      onOpenIncoherences={(filter = 'all') => navigate(`/incoherences?filter=${filter}`)}
      onEntityClick={(id, type) => {
        if (type === 'location') {
          const loc = loreDB.locations.find(l => l.id === id);
          navigate(`/lore?tab=locations&search=${encodeURIComponent(loc?.name ?? id)}`);
        } else {
          navigate(`/graph?entity=${id}`);
        }
      }}
    />
  );
}

// ── Route : Incohérences ──────────────────────────────────────────────────────
function IncoherencesRoute({ resolvedIds, toggleResolved }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = searchParams.get('filter') || 'all';
  return (
    <IncoherencesBrowser
      resolvedIds={resolvedIds}
      onToggleResolved={toggleResolved}
      initialFilter={filter}
      onEntityClick={(id, type) => {
        if (type === 'character' || type === 'object') {
          navigate(`/graph?entity=${id}`);
        } else if (type === 'location') {
          const loc = loreDB.locations.find(l => l.id === id);
          navigate(`/lore?tab=locations&search=${encodeURIComponent(loc?.name ?? id)}`);
        }
      }}
    />
  );
}

// ── Page d'accueil ────────────────────────────────────────────────────────────
function HomePage() {
  const [file, setFile]             = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData]             = useState(null);
  const [progress, setProgress]     = useState(0);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setData(lotrTestData);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="h-full flex flex-col items-center justify-center overflow-y-auto p-6">
      <header className="text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
          Atlas<span className="text-[#3F51B5] drop-shadow-[0_0_20px_rgba(63,81,181,0.4)]">Narratif</span>
        </h1>
        <p className="text-slate-500 font-serif italic text-lg md:text-xl opacity-80">
          Architecte de cohérence narrative
        </p>
      </header>

      <main className="w-full max-w-6xl flex flex-col items-center">
        {!file && !data && (
          <div className="animate-in fade-in zoom-in duration-700">
            <FilePicker onFileSelect={handleFileSelect} />
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center space-y-8 w-full max-w-md">
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-[#3F51B5] shadow-[0_0_15px_#3F51B5] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white animate-pulse">Analyse de {file?.name}</h2>
              <p className="text-slate-500 mt-2 font-mono text-sm">Extraction du lore : {progress}%</p>
            </div>
          </div>
        )}

        {data && !isAnalyzing && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold">Lore extrait du manuscrit</h2>
              <button
                onClick={() => { setFile(null); setData(null); }}
                className="text-xs uppercase tracking-[0.2em] text-slate-500 hover:text-[#3F51B5] transition-colors"
              >
                Nouvelle Analyse
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.characters.map((char) => <LoreCard key={char.id} item={char} type="character" />)}
              {data.locations.map((loc)  => <LoreCard key={loc.id}  item={loc}  type="location"  />)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function App() {
  const [resolvedIds, setResolvedIds] = useState(new Set());
  const toggleResolved = (id) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#0B1621] text-slate-200 selection:bg-[#3F51B5]/30">
      <TopNav />
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/map"          element={<MapRoute />} />
          <Route path="/lore"         element={<LoreRoute />} />
          <Route path="/graph"        element={<GraphRoute />} />
          <Route path="/timeline"     element={<TimelineBrowser />} />
          <Route path="/dashboard"    element={<DashboardRoute resolvedIds={resolvedIds} toggleResolved={toggleResolved} />} />
          <Route path="/incoherences" element={<IncoherencesRoute resolvedIds={resolvedIds} toggleResolved={toggleResolved} />} />
          <Route path="/savethecat"   element={<SaveTheCat />} />
        </Routes>
      </div>
    </div>
  );
}
