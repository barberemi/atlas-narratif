import { useState, useEffect, useCallback, useMemo } from 'react';
import { analyzeAndImport, MODELS } from './db/importProject';
import { seedLotr } from './db/seed.lotr';
import { createEmptyProject }       from './db/createEmptyProject';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
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
import { importFromBackup } from './db/importFromBackup';
import ReviewPage    from './pages/ReviewPage';
import EmotionalArc  from './pages/EmotionalArc';
import PlantsBrowser   from './pages/PlantsBrowser';
import ThreadsBrowser  from './pages/ThreadsBrowser';
import GlobalSearch  from './components/search/GlobalSearch';
import TopNav        from './components/nav/TopNav';


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

  // ── Flux d'onboarding ─────────────────────────────────────────────────────
  const [flow,   setFlow]   = useState(null); // null | 'construire' | 'analyser'
  const [method, setMethod] = useState(null); // 'savethecat' | null

  // ── Flux construire ───────────────────────────────────────────────────────
  const [buildName,   setBuildName]   = useState('');
  const [buildStatus, setBuildStatus] = useState('idle');
  const [buildError,  setBuildError]  = useState(null);

  // ── Flux analyser ─────────────────────────────────────────────────────────
  const [mode,        setMode]        = useState('manuscript'); // 'manuscript' | 'notes' | 'backup'
  const [fileContent, setFileContent] = useState('');
  const [notes,       setNotes]       = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [mapImage,    setMapImage]    = useState(null);
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
      navigate('/review');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleBuild = async () => {
    if (!buildName.trim() || !method || buildStatus === 'creating') return;
    setBuildStatus('creating');
    setBuildError(null);
    try {
      const projectId = await createEmptyProject(db, { name: buildName.trim() });
      await reloadProjects();
      setProjectId(projectId);
      navigate('/savethecat');
    } catch (err) {
      setBuildError(err.message);
      setBuildStatus('error');
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

  const handleLoadDemo = async () => {
    setStatus('analyzing');
    setProgress('Chargement de la démo Le Seigneur des Anneaux…');
    setError(null);
    try {
      await seedLotr(db);
      await reloadProjects();
      setProjectId('lotr');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const METHODS = [
    {
      id:      'savethecat',
      label:   'Save the Cat',
      desc:    '15 beats narratifs pour structurer votre histoire de A à Z',
      icon:    '🐱',
      available: true,
    },
    {
      id:      'heros',
      label:   'Voyage du Héros',
      desc:    '12 étapes archétypales de Joseph Campbell',
      icon:    '⚔️',
      available: false,
    },
    {
      id:      'trois_actes',
      label:   'Structure en 3 actes',
      desc:    'Exposition, confrontation, résolution',
      icon:    '🎭',
      available: false,
    },
  ];

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

        {/* ── Étape 0 : choix du flux ── */}
        {flow === null && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
              Par où commencer ?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carte construire */}
              <button
                onClick={() => setFlow('construire')}
                className="flex flex-col gap-3 p-6 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: 'rgba(63,81,181,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <span className="text-3xl">✍️</span>
                <div>
                  <p className="text-sm font-black text-slate-200">Je construis mon histoire</p>
                  <p className="text-xs text-slate-500 mt-1 font-serif italic">
                    Planifier avec une méthode narrative, créer mes personnages et lieux
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-400 mt-auto">Démarrer →</span>
              </button>

              {/* Carte analyser */}
              <button
                onClick={() => setFlow('analyser')}
                className="flex flex-col gap-3 p-6 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-3xl">📖</span>
                <div>
                  <p className="text-sm font-black text-slate-200">J'ai un texte à analyser</p>
                  <p className="text-xs text-slate-500 mt-1 font-serif italic">
                    Importer un manuscrit ou des notes pour extraire timeline, carte, incohérences…
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 mt-auto">Importer →</span>
              </button>
            </div>

            {/* Lien sauvegarde discret */}
            <p className="text-center">
              <button
                onClick={() => { setFlow('analyser'); setMode('backup'); }}
                className="text-xs text-slate-700 hover:text-slate-500 transition-colors"
              >
                Restaurer une sauvegarde JSON →
              </button>
            </p>

            {/* Démo LOTR */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-300"
              style={{
                backgroundColor: status === 'analyzing' ? 'rgba(63,81,181,0.08)' : 'rgba(63,81,181,0.04)',
                border: `1px solid ${status === 'analyzing' ? 'rgba(99,102,241,0.35)' : 'rgba(63,81,181,0.15)'}`,
              }}
            >
              {/* Icône / Spinner */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {status === 'analyzing' ? (
                  <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(99,102,241,0.2)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#818cf8" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <span className="text-3xl">💍</span>
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-300">Découvrir avec la démo</p>
                {status === 'analyzing' ? (
                  <p className="text-xs font-mono mt-0.5" style={{ color: '#818cf8' }}>
                    {progress || 'Chargement…'}
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 font-serif italic mt-0.5">
                    Le Seigneur des Anneaux — Communauté de l'Anneau · personnages, carte, timeline, incohérences…
                  </p>
                )}
              </div>

              {/* Bouton */}
              {status !== 'analyzing' && (
                <button
                  onClick={handleLoadDemo}
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-black transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(63,81,181,0.2)',
                    color: '#818cf8',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  Charger →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Étape 1a : flux construire ── */}
        {flow === 'construire' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Choisir une méthode</p>
            </div>

            {/* Sélecteur de méthode */}
            <div className="flex flex-col gap-3">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => m.available && setMethod(m.id)}
                  className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-150"
                  style={{
                    backgroundColor: method === m.id
                      ? 'rgba(63,81,181,0.15)'
                      : 'rgba(255,255,255,0.02)',
                    border: method === m.id
                      ? '1px solid rgba(99,102,241,0.4)'
                      : '1px solid rgba(255,255,255,0.06)',
                    opacity: m.available ? 1 : 0.45,
                    cursor: m.available ? 'pointer' : 'default',
                  }}
                >
                  <span className="text-2xl flex-shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-200">{m.label}</p>
                      {!m.available && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#475569' }}
                        >
                          Bientôt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-serif italic">{m.desc}</p>
                  </div>
                  {m.available && (
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 border-2 transition-all"
                      style={{
                        backgroundColor: method === m.id ? '#818cf8' : 'transparent',
                        borderColor:     method === m.id ? '#818cf8' : '#334155',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Bouton retour */}
            <button
              onClick={() => setFlow(null)}
              className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: 'rgba(63,81,181,0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              ← Retour
            </button>

            {/* Nom du projet */}
            {method && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 font-semibold">Nom du projet *</label>
                <input
                  type="text"
                  value={buildName}
                  onChange={e => setBuildName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBuild()}
                  placeholder="Mon roman"
                  autoFocus
                  className="px-3 py-2 text-sm rounded-lg text-white outline-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            )}

            {/* Bouton démarrer */}
            {method && (
              <button
                onClick={handleBuild}
                disabled={!buildName.trim() || buildStatus === 'creating'}
                className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: buildName.trim() && buildStatus !== 'creating' ? 'rgba(63,81,181,0.25)' : 'rgba(255,255,255,0.03)',
                  color:            buildName.trim() && buildStatus !== 'creating' ? '#818cf8'              : '#334155',
                  border:           buildName.trim() && buildStatus !== 'creating' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.05)',
                  cursor:           buildName.trim() && buildStatus !== 'creating' ? 'pointer' : 'default',
                }}
              >
                {buildStatus === 'creating' ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full" />
                    Création en cours…
                  </>
                ) : 'Créer le projet →'}
              </button>
            )}

            {buildStatus === 'error' && buildError && (
              <div className="rounded-xl px-4 py-3 text-xs"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                {buildError}
              </div>
            )}
          </div>
        )}

        {/* ── Étape 1b : flux analyser (formulaire d'import existant) ── */}
        {flow === 'analyser' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Importer un projet</p>
            </div>

          {/* ── Formulaire d'import ── */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Onglets mode */}
            <div
              className="flex rounded-xl p-1 gap-1"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              {[
                { id: 'manuscript', label: 'Manuscrit',         desc: 'J\'ai écrit le livre' },
                { id: 'notes',      label: 'Notes structurées', desc: 'Je suis en cours d\'écriture' },
                { id: 'backup',     label: 'Sauvegarde JSON',   desc: 'Restaurer un export' },
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

          {/* Bouton retour */}
          <button
            onClick={() => setFlow(null)}
            className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              backgroundColor: 'rgba(63,81,181,0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            ← Retour
          </button>
        </div>
        )}

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
function AppLayout() {
  const { projects, loading } = useProject();
  const hasProjects = !loading && projects.length > 0;
  const [searchOpen, setSearchOpen] = useState(false);

  // Listener ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (hasProjects) setSearchOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasProjects]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#0B1621] text-slate-200 selection:bg-[#3F51B5]/30 overflow-hidden">
      <TopNav onSearchOpen={() => setSearchOpen(true)} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/map"          element={<RequireProject><MapRoute /></RequireProject>} />
          <Route path="/lore"         element={<RequireProject><LoreRoute /></RequireProject>} />
          <Route path="/relations"    element={<RequireProject><GraphRoute /></RequireProject>} />
          <Route path="/timeline"     element={<RequireProject><TimelineBrowser /></RequireProject>} />
          <Route path="/dashboard"    element={<RequireProject><DashboardRoute /></RequireProject>} />
          <Route path="/incoherences" element={<RequireProject><IncoherencesRoute /></RequireProject>} />
          <Route path="/savethecat"   element={<RequireProject><SaveTheCat /></RequireProject>} />
          <Route path="/arc"          element={<RequireProject><EmotionalArc /></RequireProject>} />
          <Route path="/plants"       element={<RequireProject><PlantsBrowser /></RequireProject>} />
          <Route path="/threads"      element={<RequireProject><ThreadsBrowser /></RequireProject>} />
          <Route path="/review"       element={<RequireProject><ReviewPage /></RequireProject>} />
        </Routes>
      </div>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <DbProvider>
      <ProjectProvider>
        <AppLayout />
      </ProjectProvider>
    </DbProvider>
  );
}
