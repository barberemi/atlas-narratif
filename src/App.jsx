import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { analyzeAndImport, MODELS } from './db/importProject';
import { Routes, Route, NavLink, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import FilePicker from './components/upload/FilePicker';
import AtlasMapView from './components/map/AtlasMapView';
import LoreBrowser from './components/lore/LoreBrowser';
import EntityGraph from './components/graph/EntityGraph';
import IncoherencesBrowser from './components/incoherences/IncoherencesBrowser';
import NarrativeDashboard from './components/dashboard/NarrativeDashboard';
import TimelineBrowser from './components/timeline/TimelineBrowser';
import SaveTheCat from './components/savethecat/SaveTheCat';
import { findCharacterByAllyName, getEntityMeta } from './utils/entityUtils';
import { DbProvider } from './db/DbContext';
import { ProjectProvider, useProject } from './db/ProjectContext';
import { useDb } from './db/DbContext';
import { deleteProject } from './db/queries';
import { exportProject } from './db/exportProject';
import { importFromBackup } from './db/importFromBackup';

// ── Navigation items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard',        icon: '📊' },
  { path: '/map',          label: 'Carte',            icon: '🗺️' },
  { path: '/lore',         label: 'Lore',             icon: '💾' },
  { path: '/relations',    label: 'Relations',        icon: '🕸️' },
  { path: '/timeline',     label: 'Timeline',         icon: '📅' },
  { path: '/incoherences', label: 'Incohérences',     icon: '⚠️' },
];

const STRUCTURE_ITEMS = [
  { path: '/savethecat', label: 'Save the Cat', icon: '🐱' },
];

// ── Sélecteur de projet ────────────────────────────────────────────────────────
function ProjectPicker() {
  const db = useDb();
  const { projectId, setProjectId, projects, reloadProjects } = useProject();
  const [open,        setOpen]       = useState(false);
  const [confirmDel,  setConfirmDel] = useState(null);
  const [exporting,   setExporting]  = useState(false);
  const ref = useRef(null);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setConfirmDel(null); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const active = projects.find(p => p.id === projectId);

  const handleExport = async () => {
    if (!db || exporting) return;
    setExporting(true);
    try {
      await exportProject(db, projectId);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!db) return;
    await deleteProject(db, id);
    await reloadProjects();
    if (id === projectId) {
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length) setProjectId(remaining[0].id);
    }
    setConfirmDel(null);
  };

  if (!active) return null;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => { setOpen(v => !v); setCreating(false); setConfirmDel(null); }}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-150"
        style={{
          backgroundColor: open ? 'rgba(63,81,181,0.18)' : 'rgba(255,255,255,0.04)',
          color: open ? '#818cf8' : '#64748b',
          border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
          maxWidth: 180,
        }}
      >
        <span className="truncate">{active.name}</span>
        <span style={{ fontSize: 8, opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 rounded-xl overflow-hidden z-50"
          style={{
            width: 260,
            backgroundColor: '#0d1b2a',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Liste des projets */}
          <div className="p-2 space-y-0.5">
            {projects.map(p => {
              const isActive = p.id === projectId;
              const isDel    = confirmDel === p.id;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg group"
                  style={{ backgroundColor: isActive ? 'rgba(63,81,181,0.15)' : 'transparent' }}
                >
                  <button
                    onClick={() => { if (!isActive) { setProjectId(p.id); setOpen(false); } }}
                    className="flex-1 text-left text-xs font-semibold truncate transition-colors"
                    style={{ color: isActive ? '#818cf8' : '#94a3b8', cursor: isActive ? 'default' : 'pointer' }}
                  >
                    {isActive && <span className="mr-1.5" style={{ fontSize: 9 }}>✓</span>}
                    {p.name}
                  </button>

                  {!isActive && !isDel && (
                    <button
                      onClick={() => setConfirmDel(p.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-600 hover:text-red-400 transition-all w-5 h-5 flex items-center justify-center rounded"
                      title="Supprimer ce projet"
                    >
                      🗑
                    </button>
                  )}

                  {isDel && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-red-400">Supprimer ?</span>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-[9px] font-black text-red-400 hover:text-red-300 px-1"
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setConfirmDel(null)}
                        className="text-[9px] text-slate-600 hover:text-slate-400 px-1"
                      >
                        Non
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Exporter le projet actif */}
          <div className="px-2 pb-1">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center gap-2 text-left text-xs px-2 py-2 rounded-lg transition-all font-semibold"
              style={{ color: exporting ? '#334155' : '#64748b' }}
              onMouseEnter={e => { if (!exporting) e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={e => { if (!exporting) e.currentTarget.style.color = '#64748b'; }}
            >
              <span style={{ fontSize: 12 }}>↓</span>
              {exporting ? 'Export en cours…' : 'Exporter ce projet'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

// ── Sous-menu déroulant ───────────────────────────────────────────────────────
function NavDropdown({ label, icon, items }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isChildActive = items.some(i => location.pathname === i.path);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150"
        style={{
          backgroundColor: isChildActive || open ? 'rgba(63,81,181,0.18)' : 'transparent',
          color:            isChildActive || open ? '#818cf8'              : '#475569',
          border:           isChildActive || open ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
        }}
        onMouseEnter={e => { if (!isChildActive && !open) e.currentTarget.style.color = '#94a3b8'; }}
        onMouseLeave={e => { if (!isChildActive && !open) e.currentTarget.style.color = '#475569'; }}
      >
        <span>{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        <span style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 rounded-xl overflow-hidden z-50"
          style={{
            minWidth: 180,
            backgroundColor: '#0d1b2a',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {items.map(({ path, label: itemLabel, icon: itemIcon }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? 'rgba(63,81,181,0.18)' : 'transparent',
                    color:           isActive ? '#818cf8'              : '#94a3b8',
                    textDecoration:  'none',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span>{itemIcon}</span>
                  <span>{itemLabel}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TopNav ────────────────────────────────────────────────────────────────────
function TopNav() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { projects, loading } = useProject();
  const hasProjects  = !loading && projects.length > 0;
  const [mobileOpen, setMobileOpen] = useState(false);


  const allMobileItems = [
    ...NAV_ITEMS,
    ...STRUCTURE_ITEMS.map(i => ({ ...i, group: 'Structure narrative' })),
  ];

  return (
    <>
      <nav
        className="flex-shrink-0 flex items-center px-4 border-b border-white/10 gap-1"
        style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)', backdropFilter: 'blur(12px)', zIndex: 50 }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-sm font-black tracking-tight flex-shrink-0 transition-opacity duration-150 hover:opacity-70"
        >
          Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
        </button>

        {hasProjects && (
          <>
            <div className="w-px h-5 bg-white/10 mx-2 flex-shrink-0" />
            <ProjectPicker />
            <div className="w-px h-5 bg-white/10 mx-2 flex-shrink-0" />
          </>
        )}

        {/* ── Desktop nav ── */}
        {hasProjects && NAV_ITEMS.map(({ path, label, icon }) => {
          const isActive  = location.pathname === path;
          const isWarning = path === '/incoherences';
          const activeColor  = isWarning ? '#EF4444' : '#818cf8';
          const activeBg     = isWarning ? 'rgba(239,68,68,0.12)' : 'rgba(63,81,181,0.18)';
          const activeBorder = isWarning ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.35)';
          return (
            <NavLink
              key={path}
              to={path}
              className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 flex-shrink-0"
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
              <span>{label}</span>
            </NavLink>
          );
        })}

        {hasProjects && (
          <div className="hidden md:block">
            <NavDropdown label="Structure narrative" icon="📐" items={STRUCTURE_ITEMS} />
          </div>
        )}

        {/* ── Hamburger mobile ── */}
        {hasProjects && (
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden ml-auto flex flex-col gap-1.5 p-2 rounded-lg transition-all"
            style={{ color: mobileOpen ? '#818cf8' : '#475569' }}
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : 'none' }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', opacity: mobileOpen ? 0 : 1 }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }} />
          </button>
        )}
      </nav>

      {/* ── Menu mobile déroulant ── */}
      {mobileOpen && hasProjects && (
        <div
          className="md:hidden flex-shrink-0 border-b border-white/10"
          style={{ backgroundColor: 'rgba(11,22,33,0.98)', zIndex: 49 }}
        >
          <div className="px-3 py-2 flex flex-col gap-0.5">
            {allMobileItems.map(({ path, label, icon, group }) => {
              const isActive  = location.pathname === path;
              const isWarning = path === '/incoherences';
              const activeColor  = isWarning ? '#EF4444' : '#818cf8';
              const activeBg     = isWarning ? 'rgba(239,68,68,0.1)'  : 'rgba(63,81,181,0.15)';
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: isActive ? activeBg    : 'transparent',
                    color:           isActive ? activeColor : '#64748b',
                    textDecoration:  'none',
                  }}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                  {group && <span className="ml-auto text-[10px] text-slate-700 font-normal">{group}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </>
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
      onEntityClick={(id) => navigate(`/relations?entity=${id}`)}
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
function DashboardRoute() {
  const navigate = useNavigate();
  return (
    <NarrativeDashboard
      onOpenIncoherences={(filter = 'all') => navigate(`/incoherences?filter=${filter}`)}
      onEntityClick={(id, type) => {
        if (type === 'location') {
          const loc = getEntityMeta(id, 'location');
          navigate(`/lore?tab=locations&search=${encodeURIComponent(loc?.name ?? id)}`);
        } else {
          navigate(`/relations?entity=${id}`);
        }
      }}
    />
  );
}

// ── Route : Incohérences ──────────────────────────────────────────────────────
function IncoherencesRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = searchParams.get('filter') || 'all';
  return (
    <IncoherencesBrowser
      initialFilter={filter}
      onEntityClick={(id, type) => {
        if (type === 'character' || type === 'object') {
          navigate(`/relations?entity=${id}`);
        } else if (type === 'location') {
          const loc = getEntityMeta(id, 'location');
          navigate(`/lore?tab=locations&search=${encodeURIComponent(loc?.name ?? id)}`);
        }
      }}
    />
  );
}

// ── Page d'accueil / Import ───────────────────────────────────────────────────
function HomePage() {
  const db = useDb();
  const { reloadProjects, setProjectId } = useProject();
  const navigate = useNavigate();

  const [mode,        setMode]        = useState('manuscript'); // 'manuscript' | 'notes' | 'backup'
  const [fileContent, setFileContent] = useState('');
  const [notes,       setNotes]       = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [mapImage,    setMapImage]    = useState(null); // data URL base64 optionnel
  const [model,       setModel]       = useState('sonnet');
  const [status,      setStatus]      = useState('idle');   // 'idle' | 'analyzing' | 'error'
  const [progress,    setProgress]    = useState('');
  const [error,       setError]       = useState(null);
  const [backupFile,  setBackupFile]  = useState(null);

  const analyzing  = status === 'analyzing';

  // Ne pas appeler .trim() sur potentiellement 500k+ caractères à chaque render
  const hasContent = useMemo(
    () => mode === 'backup'
      ? backupFile !== null
      : (mode === 'manuscript' ? fileContent.length > 0 : notes.trim().length > 0),
    [mode, fileContent, notes, backupFile],
  );
  const canAnalyze = mode === 'backup' ? hasContent : (hasContent && projectName.trim().length > 0);

  const handleFileContent = useCallback((text) => {
    setFileContent(text);
  }, []);

  const handleMapFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMapImage(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = async () => {
    if (!canAnalyze || analyzing) return;
    setStatus('analyzing');
    setError(null);
    const content = mode === 'manuscript' ? fileContent : notes;
    try {
      const projectId = await analyzeAndImport(db, {
        content,
        mode,
        projectName: projectName.trim(),
        projectDesc: projectDesc.trim(),
        mapImage,
        model,
        onProgress: setProgress,
      });
      await reloadProjects();
      setProjectId(projectId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupFile || analyzing) return;
    setStatus('analyzing');
    setError(null);
    try {
      const projectId = await importFromBackup(db, backupFile, { onProgress: setProgress });
      await reloadProjects();
      setProjectId(projectId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* ── Header ── */}
        <header className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-3">
            Atlas<span className="text-[#3F51B5] drop-shadow-[0_0_20px_rgba(63,81,181,0.4)]">Narratif</span>
          </h1>
          <p className="text-slate-500 font-serif italic opacity-80">
            Architecte de cohérence narrative
          </p>
        </header>

        {/* ── Formulaire d'import ── */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Importer un projet
          </p>

          {/* Onglets mode */}
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            {[
              { id: 'manuscript', label: 'Manuscrit',       desc: 'Post-écriture' },
              { id: 'notes',      label: 'Notes structurées', desc: 'En cours d\'écriture' },
              { id: 'backup',     label: 'Sauvegarde JSON',  desc: 'Restaurer un export' },
            ].map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className="flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all duration-150 text-center"
                style={{
                  backgroundColor: mode === id ? 'rgba(63,81,181,0.2)' : 'transparent',
                  border: `1px solid ${mode === id ? 'rgba(99,102,241,0.35)' : 'transparent'}`,
                  color: mode === id ? '#818cf8' : '#475569',
                }}
              >
                <span className="text-xs font-bold">{label}</span>
                <span className="text-[10px] opacity-60 mt-0.5">{desc}</span>
              </button>
            ))}
          </div>

          {/* Zone de contenu selon le mode */}
          {mode === 'manuscript' ? (
            <FilePicker onContent={handleFileContent} />
          ) : mode === 'notes' ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-500">
                Décrivez votre livre (personnages, lieux, chronologie, scènes clés…)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={`Ex:\nPersonnages : Alice (protagoniste, détective), Marc (antagoniste, avocat corrompu)…\nLieux : Paris années 30, cabinet d'avocat, gare de Lyon…\nChapitre 1 : Alice reçoit un dossier anonyme…`}
                rows={10}
                className="w-full px-4 py-3 text-sm rounded-xl text-slate-200 placeholder-slate-700 outline-none resize-none"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                }}
              />
            </div>
          ) : (
            /* ── Mode backup ── */
            <div className="flex flex-col gap-3">
              <label className="text-xs text-slate-500">
                Sélectionne un fichier <code className="text-indigo-400">atlas_*.json</code> exporté depuis AtlasNarratif
              </label>
              <label
                className="flex items-center gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  border: backupFile
                    ? '1px solid rgba(99,102,241,0.4)'
                    : '1px dashed rgba(255,255,255,0.1)',
                  backgroundColor: backupFile ? 'rgba(63,81,181,0.08)' : 'rgba(0,0,0,0.15)',
                }}
              >
                <span className="text-xl">{backupFile ? '✓' : '↑'}</span>
                <div className="flex flex-col gap-0.5">
                  {backupFile ? (
                    <>
                      <span className="text-xs font-bold text-indigo-300">{backupFile.name}</span>
                      <span className="text-[10px] text-slate-600">
                        {(backupFile.size / 1024).toFixed(1)} Ko
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-600">Choisir un fichier JSON…</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={e => setBackupFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {backupFile && (
                <button
                  onClick={() => setBackupFile(null)}
                  className="text-[10px] text-slate-600 hover:text-red-400 transition-colors text-left"
                >
                  Supprimer
                </button>
              )}
            </div>
          )}

          {/* Carte optionnelle — masquée en mode backup */}
          {mode !== 'backup' && (
            <div className="flex flex-col gap-2">
              <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500 font-semibold">
                  Carte du livre <span className="font-normal text-slate-700">(optionnel)</span>
                </label>
                {mapImage && (
                  <button onClick={() => setMapImage(null)} className="text-[10px] text-slate-600 hover:text-red-400 transition-colors">
                    Supprimer
                  </button>
                )}
              </div>
              {mapImage ? (
                <div className="relative rounded-xl overflow-hidden" style={{ height: 120 }}>
                  <img src={mapImage} alt="Carte" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-end p-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                    <p className="text-[10px] text-white/70">Claude placera les trajets des personnages sur cette carte</p>
                  </div>
                </div>
              ) : (
                <label
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 hover:border-slate-600"
                  style={{ border: '1px dashed rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.15)' }}
                >
                  <span className="text-xl">🗺️</span>
                  <span className="text-xs text-slate-600">Ajouter une image de carte (.jpg, .png…)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
                </label>
              )}
            </div>
          )}

          {/* Métadonnées du projet — masquées en mode backup */}
          {mode !== 'backup' && (
            <div className="flex flex-col gap-3">
              <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Nom du projet *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="Mon roman"
                    className="px-3 py-2 text-sm rounded-lg text-white outline-none"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Description</label>
                  <input
                    type="text"
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                    placeholder="Auteur — sous-titre…"
                    className="px-3 py-2 text-sm rounded-lg text-white outline-none"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sélecteur de modèle — masqué en mode backup */}
          {mode !== 'backup' && (
            <div className="flex flex-col gap-2">
              <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <p className="text-xs text-slate-500 font-semibold">Modèle d'analyse</p>
              <div className="flex gap-2">
                {Object.entries(MODELS).map(([key, m]) => {
                  const active = model === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setModel(key)}
                      className="flex-1 flex flex-col gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                      style={{
                        backgroundColor: active ? 'rgba(63,81,181,0.18)' : 'rgba(0,0,0,0.2)',
                        border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: active ? '#818cf8' : '#64748b' }}>
                        {m.label}
                      </span>
                      <span className="text-[10px]" style={{ color: active ? '#94a3b8' : '#475569' }}>
                        {m.desc}
                      </span>
                      {m.hint && (
                        <span className="text-[10px] mt-0.5" style={{ color: active ? '#f59e0b' : '#374151' }}>
                          {m.hint}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bouton principal */}
          <button
            onClick={mode === 'backup' ? handleRestoreBackup : handleAnalyze}
            disabled={!canAnalyze || analyzing}
            className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: canAnalyze && !analyzing ? 'rgba(63,81,181,0.25)' : 'rgba(255,255,255,0.03)',
              color:            canAnalyze && !analyzing ? '#818cf8'              : '#334155',
              border:           canAnalyze && !analyzing ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.05)',
              cursor:           canAnalyze && !analyzing ? 'pointer'             : 'default',
            }}
          >
            {analyzing ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full" />
                {progress || (mode === 'backup' ? 'Import en cours…' : 'Analyse en cours…')}
              </>
            ) : (
              mode === 'backup' ? 'Restaurer la sauvegarde →' : 'Analyser avec l\'IA →'
            )}
          </button>

          {/* Erreur */}
          {status === 'error' && error && (
            <div
              className="rounded-xl px-4 py-3 text-xs"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
            >
              {error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Guard : redirige vers / si aucun projet ───────────────────────────────────
function RequireProject({ children }) {
  const { projects, loading } = useProject();
  if (loading) return null;
  if (projects.length === 0) return <Navigate to="/" replace />;
  return children;
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <DbProvider>
      <ProjectProvider>
        <div className="h-screen w-full flex flex-col bg-[#0B1621] text-slate-200 selection:bg-[#3F51B5]/30 overflow-hidden">
          <TopNav />
          <div className="flex-1 min-h-0 overflow-hidden">
            <Routes>
              <Route path="/"             element={<HomePage />} />
              <Route path="/map"          element={<RequireProject><MapRoute /></RequireProject>} />
              <Route path="/lore"         element={<RequireProject><LoreRoute /></RequireProject>} />
              <Route path="/relations"        element={<RequireProject><GraphRoute /></RequireProject>} />
              <Route path="/timeline"     element={<RequireProject><TimelineBrowser /></RequireProject>} />
              <Route path="/dashboard"    element={<RequireProject><DashboardRoute /></RequireProject>} />
              <Route path="/incoherences" element={<RequireProject><IncoherencesRoute /></RequireProject>} />
              <Route path="/savethecat"   element={<RequireProject><SaveTheCat /></RequireProject>} />
            </Routes>
          </div>
        </div>
      </ProjectProvider>
    </DbProvider>
  );
}
