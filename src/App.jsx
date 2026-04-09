import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { buildAnalysisPrompt } from './data/analysis_prompt';
import { createProject, seedProjectViaApi, claimProjects } from './api/client';
import { authClient } from './lib/authClient';
import { buildLotrSeedPayload } from './db/seed.lotr';
import { importFromAiOutputViaApi } from './api/importFromAiOutputViaApi';
import { Routes, Route, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Button from './components/ui/Button';
import GuidedTour   from './components/tour/GuidedTour';
import WelcomeModal from './components/tour/WelcomeModal';
import { shouldShowWelcome } from './components/tour/tourUtils';
import TourPageButton from './components/tour/TourPageButton';
const AtlasMapView         = lazy(() => import('./components/map/AtlasMapView'));
const LoreBrowser          = lazy(() => import('./components/lore/LoreBrowser'));
const LoginPage            = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyEmailPage      = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ForgotPasswordPage   = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage    = lazy(() => import('./pages/auth/ResetPasswordPage'));
const EntityGraph          = lazy(() => import('./components/graph/EntityGraph'));
const IncoherencesBrowser  = lazy(() => import('./components/incoherences/IncoherencesBrowser'));
const NarrativeDashboard   = lazy(() => import('./components/dashboard/NarrativeDashboard'));
const TimelineBrowser      = lazy(() => import('./components/timeline/TimelineBrowser'));
const SaveTheCat           = lazy(() => import('./components/savethecat/SaveTheCat'));
const ReviewPage           = lazy(() => import('./pages/ReviewPage'));
const EmotionalArc         = lazy(() => import('./pages/EmotionalArc'));
const HeroJourney          = lazy(() => import('./pages/HeroJourney'));
const PlantsBrowser        = lazy(() => import('./pages/PlantsBrowser'));
const ThreadsBrowser       = lazy(() => import('./pages/ThreadsBrowser'));
import { getEntityMeta } from './utils/entityUtils';
import { ProjectProvider, useProject } from './db/ProjectContext';
import GlobalSearch  from './components/search/GlobalSearch';
import TopNav        from './components/nav/TopNav';


// ── Route : Carte ─────────────────────────────────────────────────────────────
function MapRoute() {
  const navigate = useNavigate();
  return (
    <AtlasMapView
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
  const handleOpenIncoherences = useCallback(
    (filter = 'all') => navigate(`/incoherences?filter=${filter}`),
    [navigate]
  );
  const handleEntityClick = useCallback(
    (id, type) => {
      if (type === 'location') {
        const loc = getEntityMeta(id, 'location');
        navigate(`/lore?tab=locations&search=${encodeURIComponent(loc?.name ?? id)}`);
      } else {
        navigate(`/relations?entity=${id}`);
      }
    },
    [navigate]
  );
  return (
    <NarrativeDashboard
      onOpenIncoherences={handleOpenIncoherences}
      onEntityClick={handleEntityClick}
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
  const { reloadProjects, setProjectId, projects } = useProject();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // Après un redirect OAuth, claimProjects n'a pas été appelé — on le fait ici
  useEffect(() => {
    if (session?.user) {
      claimProjects().catch(() => {}).then(() => reloadProjects());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // ── Flux d'onboarding ─────────────────────────────────────────────────────
  const [flow,        setFlow]        = useState(null); // null | 'construire' | 'analyser'
  const [method,      setMethod]      = useState(null); // 'savethecat' | null

  // ── Flux construire ───────────────────────────────────────────────────────
  const [buildName,   setBuildName]   = useState('');
  const [buildStatus, setBuildStatus] = useState('idle');
  const [buildError,  setBuildError]  = useState(null);

  // ── Flux analyser ─────────────────────────────────────────────────────────
  const [mode,          setMode]          = useState('prompt');    // 'prompt' | 'import-json'
  const [projectName,   setProjectName]   = useState('');
  const [projectDesc,   setProjectDesc]   = useState('');
  const [aiJsonFile,    setAiJsonFile]    = useState(null);
  const [status,        setStatus]        = useState('idle');     // 'idle' | 'analyzing' | 'error'
  const [progress,      setProgress]      = useState('');
  const [seedPercent,   setSeedPercent]   = useState(null);
  const [error,         setError]         = useState(null);
  const [copied,        setCopied]        = useState(false);

  const analyzing = status === 'analyzing';

  const generatedPrompt = useMemo(
    () => buildAnalysisPrompt({ projectName: projectName.trim(), projectDesc: projectDesc.trim() }),
    [projectName, projectDesc],
  );

  const handleCopyPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedPrompt]);

  const handleDownloadPrompt = useCallback(() => {
    const slug = (projectName.trim() || 'atlas-narratif').toLowerCase().replace(/\s+/g, '-');
    const blob = new Blob([generatedPrompt], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `prompt-analyse-${slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedPrompt, projectName]);

  const canImportJson = aiJsonFile !== null && projectName.trim().length > 0;

  const handleImportJson = async () => {
    if (!canImportJson || analyzing) return;
    setStatus('analyzing');
    setError(null);
    try {
      const projectId = await importFromAiOutputViaApi(aiJsonFile, {
        projectName: projectName.trim(),
        projectDesc: projectDesc.trim(),
        onProgress:  setProgress,
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
      const projectId = await createProject({ name: buildName.trim() });
      await reloadProjects();
      setProjectId(projectId);
      navigate('/savethecat');
    } catch (err) {
      setBuildError(err.message);
      setBuildStatus('error');
    }
  };


  const handleLoadDemo = async () => {
    // Si l'utilisateur a déjà un projet LOTR (id commence par 'lotr'), naviguer directement
    const existingLotr = projects.find(p => p.id.startsWith('lotr'));
    if (existingLotr) {
      setProjectId(existingLotr.id);
      navigate('/dashboard');
      return;
    }
    setStatus('analyzing');
    setProgress('Préparation de la démo Le Seigneur des Anneaux…');
    setSeedPercent(0);
    setError(null);
    try {
      const payload = await buildLotrSeedPayload();
      setProgress('Envoi au serveur…');
      setSeedPercent(30);
      const lotrId = await seedProjectViaApi(payload.meta, payload.data);
      setSeedPercent(100);
      await reloadProjects();
      setProjectId(lotrId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setStatus('error');
      setSeedPercent(null);
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
      available: true,
    },
  ];

  return (
    <>
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
            <div data-tour="home-cards" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="mt-1 flex flex-col gap-1">
                    <p className="text-xs font-mono" style={{ color: '#818cf8' }}>
                      {progress || 'Chargement…'}
                      {seedPercent !== null ? ` (${seedPercent}%)` : ''}
                    </p>
                    {seedPercent !== null && (
                      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(99,102,241,0.15)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${seedPercent}%`, backgroundColor: '#6366f1' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 font-serif italic mt-0.5">
                    Le Seigneur des Anneaux — Communauté de l'Anneau · personnages, carte, timeline, incohérences…
                  </p>
                )}
              </div>

              {/* Bouton */}
              {status !== 'analyzing' && (
                <Button onClick={handleLoadDemo} size="sm" className="flex-shrink-0">
                  {projects.find(p => p.id.startsWith('lotr')) ? 'Ouvrir →' : 'Charger →'}
                </Button>
              )}
            </div>
            {status === 'error' && error && (
              <div className="rounded-xl px-4 py-3 text-xs whitespace-pre-wrap"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                {error}
              </div>
            )}
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
            <Button onClick={() => setFlow(null)} fullWidth variant="secondary">← Retour</Button>

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
              <Button
                onClick={handleBuild}
                fullWidth
                loading={buildStatus === 'creating'}
                disabled={!buildName.trim() || buildStatus === 'creating'}
              >
                {buildStatus === 'creating' ? 'Création en cours…' : 'Créer le projet →'}
              </Button>
            )}

            {buildStatus === 'error' && buildError && (
              <div className="rounded-xl px-4 py-3 text-xs"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                {buildError}
              </div>
            )}
          </div>
        )}

        {/* ── Étape 1b : flux analyser ── */}
        {flow === 'analyser' && (
          <div className="flex flex-col gap-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Importer un projet</p>

            {/* ── Onglets ── */}
            <div className="flex rounded-xl p-1 gap-1" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
              {[
                { id: 'prompt',      label: '① Générer le prompt',   desc: 'Manuscrit ou notes' },
                { id: 'import-json', label: '② Importer le résultat', desc: 'JSON généré par votre IA' },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setError(null); }}
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

            {/* ── Mode : Générer le prompt ── */}
            {mode === 'prompt' && (
              <div className="flex flex-col gap-5" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>

                {/* Nom + Description */}
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 font-semibold">Nom du projet</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                      placeholder="Mon roman"
                      className="px-3 py-2 text-sm rounded-lg text-white outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 font-semibold">Description</label>
                    <input type="text" value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
                      placeholder="Auteur — sous-titre…"
                      className="px-3 py-2 text-sm rounded-lg text-white outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                </div>

                {/* Prompt généré */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-semibold">Prompt généré</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-150"
                        style={{ backgroundColor: copied ? 'rgba(16,185,129,0.15)' : 'rgba(63,81,181,0.15)', color: copied ? '#10b981' : '#818cf8', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}` }}
                      >
                        {copied ? '✓ Copié !' : 'Copier'}
                      </button>
                      <button
                        onClick={handleDownloadPrompt}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-150"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; }}
                      >
                        ↓ .txt
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={generatedPrompt}
                    className="w-full text-xs font-mono rounded-xl outline-none resize-none"
                    style={{
                      height: 220,
                      padding: '12px 14px',
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: '#64748b',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* Instructions */}
                <div className="rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{ backgroundColor: 'rgba(63,81,181,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif italic">
                    Copiez ce prompt, ouvrez votre IA favorite (<strong className="font-bold not-italic text-slate-300">ChatGPT, Gemini, Claude…</strong>), collez le prompt puis ajoutez votre texte à la suite. Enregistrez la réponse JSON dans un fichier <code className="font-mono text-indigo-400">.json</code>, puis importez-le via l'onglet <strong className="font-bold not-italic text-slate-300">② Importer le résultat</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* ── Mode : Importer le résultat ── */}
            {mode === 'import-json' && (
              <div className="flex flex-col gap-5" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>

                {/* Nom + Description */}
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 font-semibold">Nom du projet *</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                      placeholder="Mon roman" autoFocus
                      className="px-3 py-2 text-sm rounded-lg text-white outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 font-semibold">Description</label>
                    <input type="text" value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
                      placeholder="Auteur — sous-titre…"
                      className="px-3 py-2 text-sm rounded-lg text-white outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                </div>

                {/* Upload JSON */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500 font-semibold">
                    Fichier JSON résultat <span className="font-normal text-slate-700">(réponse de votre IA)</span>
                  </label>
                  <label
                    className="flex items-center gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all duration-150"
                    style={{
                      border: aiJsonFile ? '1px solid rgba(99,102,241,0.4)' : '1px dashed rgba(255,255,255,0.1)',
                      backgroundColor: aiJsonFile ? 'rgba(63,81,181,0.08)' : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    <span className="text-xl">{aiJsonFile ? '✓' : '↑'}</span>
                    <div className="flex flex-col gap-0.5 flex-1">
                      {aiJsonFile ? (
                        <>
                          <span className="text-xs font-bold text-indigo-300">{aiJsonFile.name}</span>
                          <span className="text-[10px] text-slate-600">{(aiJsonFile.size / 1024).toFixed(1)} Ko</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-600">Choisir le fichier .json généré par votre IA…</span>
                      )}
                    </div>
                    <input type="file" accept=".json,application/json,text/plain"
                      className="hidden"
                      onChange={e => setAiJsonFile(e.target.files?.[0] ?? null)} />
                  </label>
                  {aiJsonFile && (
                    <button onClick={() => setAiJsonFile(null)}
                      className="text-[10px] text-slate-600 hover:text-red-400 transition-colors text-left">
                      Supprimer
                    </button>
                  )}
                </div>

                {/* Bouton importer */}
                <Button
                  onClick={handleImportJson}
                  fullWidth
                  loading={analyzing}
                  disabled={!canImportJson || analyzing}
                >
                  {analyzing ? (progress || 'Import en cours…') : 'Importer le projet →'}
                </Button>

                {status === 'error' && error && (
                  <div className="rounded-xl px-4 py-3 text-xs whitespace-pre-wrap"
                    style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Bouton retour */}
            <Button onClick={() => setFlow(null)} fullWidth variant="secondary">
              ← Retour
            </Button>
          </div>
        )}


      </div>
    </div>

    </>
  );
}

// ── Guard : redirige vers / si aucun projet ───────────────────────────────────
function RequireProject({ children }) {
  const { projectId, loading } = useProject();
  if (loading) return null;
  if (!projectId) return <Navigate to="/" replace />;
  return children;
}

// ── Layout principal ──────────────────────────────────────────────────────────
function AppLayout() {
  const { projects, loading, projectId, reloadProjects } = useProject();
  const hasProjects = !loading && projects.length > 0;
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  // Recharge les projets à chaque changement de session (login / logout)
  useEffect(() => {
    reloadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [showWelcome,  setShowWelcome]  = useState(false);
  const location = useLocation();

  // Affiche le modal de bienvenue quand on arrive sur /dashboard avec le projet LOTR
  useEffect(() => {
    if (location.pathname === '/dashboard' && projectId?.startsWith('lotr') && shouldShowWelcome()) {
      setShowWelcome(true);
    }
  }, [location.pathname, projectId]);

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
      <div className={`flex-1 min-h-0 overflow-y-auto${!session?.user && !loading && projects.length > 0 ? ' pb-12' : ''}`}>
        <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400 text-sm">Chargement…</div>}>
        <Routes>
          <Route path="/"                 element={<HomePage />} />
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
          <Route path="/heros"        element={<RequireProject><HeroJourney /></RequireProject>} />
          <Route path="/review"       element={<RequireProject><ReviewPage /></RequireProject>} />
        </Routes>
        </Suspense>
      </div>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      <GuidedTour />
      <TourPageButton />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {!session?.user && !loading && projects.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-3"
          style={{ backgroundColor: 'rgba(17,24,39,0.97)', borderTop: '1px solid rgba(234,179,8,0.25)' }}>
          <span className="text-xs" style={{ color: '#fbbf24' }}>
            Vos projets sont liés à ce navigateur — ils seront perdus si vous videz vos cookies.
          </span>
          <button
            onClick={() => navigate('/login')}
            className="flex-shrink-0 inline-flex items-center justify-center font-black tracking-wide transition-all duration-200 cursor-pointer text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.28)'; e.currentTarget.style.borderColor = 'rgba(234,179,8,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.15)'; e.currentTarget.style.borderColor = 'rgba(234,179,8,0.3)'; }}
          >
            Se connecter →
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <Routes>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/verify-email"    element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="*"                element={<AppLayout />} />
      </Routes>
    </ProjectProvider>
  );
}
