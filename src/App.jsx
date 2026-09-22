import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { createProject, seedProjectViaApi, claimProjects } from './api/client';
import { authClient } from './lib/authClient';
import { importFromAiOutputViaApi } from './api/importFromAiOutputViaApi';
import { Routes, Route, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './components/ui/Button';
import Icon from './components/ui/Icon';
const GuidedTour   = lazy(() => import('./components/tour/GuidedTour'));
const WelcomeModal = lazy(() => import('./components/tour/WelcomeModal'));
import { shouldShowWelcome } from './components/tour/tourUtils';
const CookieConsent = lazy(() => import('./components/ui/CookieConsent'));
import { loadCrisp } from './utils/crisp';
import { useLotrReseed } from './hooks/useLotrReseed';
const AtlasMapView         = lazy(() => import('./components/map/AtlasMapView'));
const LoreBrowser          = lazy(() => import('./components/lore/LoreBrowser'));
const CustomEntityBrowser  = lazy(() => import('./components/custom/CustomEntityBrowser'));
const ChatPanel            = lazy(() => import('./components/chat/ChatPanel'));
const VaultImporter        = lazy(() => import('./components/import/VaultImporter'));
const LoginPage            = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyEmailPage      = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ForgotPasswordPage   = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage    = lazy(() => import('./pages/auth/ResetPasswordPage'));
const BlogIndexPage        = lazy(() => import('./pages/blog/BlogIndexPage'));
const BlogPostPage         = lazy(() => import('./pages/blog/BlogPostPage'));
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
const PrivacyPage          = lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage            = lazy(() => import('./pages/legal/TermsPage'));
const AccountPage          = lazy(() => import('./pages/AccountPage'));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'));
import { getEntityMeta } from './utils/entityUtils';
import { ProjectProvider, useProject } from './db/ProjectContext';
const GlobalSearch  = lazy(() => import('./components/search/GlobalSearch'));
import TopNav        from './components/nav/TopNav';
import Footer        from './components/nav/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { INDEX_ITEMS, HERO_SHOT } from './components/home/homeIndexItems';
import Skeleton from './components/ui/Skeleton';
import { Toaster } from 'sonner';
import { toast } from './lib/toast';


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

// ── Route : Démo partageable (/demo) ──────────────────────────────────────────
// Lien public sans friction : dépose le visiteur directement dans la démo LOTR.
// Réutilise la même logique de seed que le bouton « Charger » de la HomePage.
function DemoRoute() {
  const { t, i18n } = useTranslation();
  const { reloadProjects, setProjectId, projects, loading } = useProject();
  const navigate = useNavigate();
  const [error,    setError]    = useState(null);
  const [progress, setProgress] = useState('');
  const [percent,  setPercent]  = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (loading || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const existingLotr = projects.find(p => p.id.startsWith('lotr'));
        if (existingLotr) {
          setProjectId(existingLotr.id);
          navigate('/dashboard', { replace: true });
          return;
        }
        setProgress(t('home.demoLoading'));
        setPercent(10);
        const lang = i18n.language?.split('-')[0] || 'fr';
        const { buildLotrSeedPayload } = await import('./db/seed.lotr');
        const payload = await buildLotrSeedPayload({ lang });
        setProgress(t('home.demoSending'));
        setPercent(40);
        const lotrId = await seedProjectViaApi(payload.meta, payload.data);
        setPercent(100);
        await reloadProjects();
        setProjectId(lotrId);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err.message);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        {error ? (
          <>
            <span className="text-3xl">💍</span>
            <p className="text-sm text-red-400 whitespace-pre-wrap">{error}</p>
            <Button onClick={() => navigate('/')} variant="secondary" size="sm">← {t('home.back', 'Retour')}</Button>
          </>
        ) : (
          <>
            <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(92,174,142,0.2)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#5cae8e" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-black text-slate-300">{t('home.demoTitle')}</p>
            <p className="text-xs font-mono" style={{ color: '#5cae8e' }}>
              {progress || t('home.demoLoading')} ({percent}%)
            </p>
            <div className="w-48 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(92,174,142,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${percent}%`, backgroundColor: '#5cae8e' }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page d'accueil / Import ───────────────────────────────────────────────────
function HomePage() {
  const { t, i18n } = useTranslation();
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
  const [buildName,    setBuildName]    = useState('');
  const [buildLogline, setBuildLogline] = useState('');
  const [buildStatus,  setBuildStatus]  = useState('idle');
  const [buildError,   setBuildError]   = useState(null);

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

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const buildPromptRef = useRef(null);

  // Ancre « Commencer » : le hero et le closer y ramènent (template Maison d'édition)
  const startRef = useRef(null);
  const scrollToStart = useCallback(() => {
    startRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (mode !== 'prompt') return;
    let cancelled = false;
    (async () => {
      if (!buildPromptRef.current) {
        const mod = await import('./data/analysis_prompt');
        buildPromptRef.current = mod.buildAnalysisPrompt;
      }
      const text = buildPromptRef.current({ projectName: projectName.trim(), projectDesc: projectDesc.trim() });
      if (!cancelled) setGeneratedPrompt(text);
    })();
    return () => { cancelled = true; };
  }, [mode, projectName, projectDesc]);

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
      toast.success(t('toast.projectImported'));
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
      const projectId = await createProject({
        name: buildName.trim(),
        description: buildLogline.trim() || undefined,
      });
      await reloadProjects();
      setProjectId(projectId);
      toast.success(t('toast.projectCreated'));
      navigate('/dashboard');
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
    setProgress(t('home.demoLoading'));
    setSeedPercent(0);
    setError(null);
    try {
      const lang = i18n.language?.split('-')[0] || 'fr';
      const { buildLotrSeedPayload } = await import('./db/seed.lotr');
      const payload = await buildLotrSeedPayload({ lang });
      setProgress(t('home.demoSending'));
      setSeedPercent(30);
      const lotrId = await seedProjectViaApi(payload.meta, payload.data);
      setSeedPercent(100);
      await reloadProjects();
      setProjectId(lotrId);
      toast.success(t('toast.projectImported'));
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
      desc:    t('home.methodSaveTheCat'),
      hint:    t('home.methodSaveTheCatHint'),
      icon:    'cat',
      available: true,
    },
    {
      id:      'heros',
      label:   'Voyage du Héros',
      desc:    t('home.methodHeroJourney'),
      hint:    t('home.methodHeroJourneyHint'),
      icon:    'object',
      available: true,
    },
  ];

  return (
    <>
      <title>Atlas Narratif — Outil d'analyse narrative pour auteurs</title>
      <meta name="description" content="Atlas Narratif aide les auteurs à construire et analyser leurs histoires : timeline, carte, personnages, incohérences et arcs narratifs. Structurez votre roman avec Save the Cat ou le Voyage du Héros." />
      <meta property="og:title" content="Atlas Narratif — Outil d'analyse narrative pour auteurs" />
      <meta property="og:description" content="Construisez et analysez vos histoires : timeline, carte, personnages, incohérences et arcs narratifs." />
      <meta property="og:url" content="https://DOMAIN_PLACEHOLDER/" />
      <meta property="og:image" content="https://DOMAIN_PLACEHOLDER/og-image.png" />
      <meta name="twitter:title" content="Atlas Narratif — Outil d'analyse narrative pour auteurs" />
      <meta name="twitter:description" content="Construisez et analysez vos histoires : timeline, carte, personnages, incohérences et arcs narratifs." />
      <meta name="twitter:image" content="https://DOMAIN_PLACEHOLDER/og-image.png" />
      <link rel="canonical" href="https://DOMAIN_PLACEHOLDER/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Mes données restent-elles privées ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Vos données narratives sont stockées dans une base PostgreSQL sécurisée. Les mots de passe sont hashés et les données sensibles sont chiffrées au repos (AES-256-GCM). Aucun outil d'analytics ou de tracking n'est utilisé." } },
          { "@type": "Question", "name": "Quels outils narratifs sont disponibles ?", "acceptedAnswer": { "@type": "Answer", "text": "Atlas Narratif propose une timeline interactive, un graphe de relations, une carte des lieux, la structure Save the Cat (15 beats), le Voyage du Héros (12 étapes), un arc émotionnel, un détecteur d'incohérences, un tracker d'amorces narratives et la gestion de fils narratifs." } },
          { "@type": "Question", "name": "Puis-je importer un manuscrit existant ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Générez un prompt d'analyse avec Atlas Narratif, envoyez-le à votre IA favorite (ChatGPT, Gemini, Claude), puis importez le résultat JSON pour extraire automatiquement la timeline, les personnages et les lieux." } },
          { "@type": "Question", "name": "Atlas Narratif supporte-t-il les séries en plusieurs tomes ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Le support multi-tomes permet de filtrer par volume, de suivre les amorces narratives entre les tomes et de visualiser les arcs sur l'ensemble de la série." } },
        ],
      }) }} />
    {/* Pas de `no-scrollbar` ici, contrairement au reste de l'app : la home
        fait plus de trois écrans et son premier écran ne déborde pas
        visuellement. Sans barre de défilement, plus rien n'indique au
        visiteur qu'il y a une suite. Ailleurs, la masquer reste voulu. */}
    <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-atlas-ink)' }}>
      <div className="max-w-5xl mx-auto px-6 md:px-10">

        {/* ── Hero éditorial (split) ── */}
        <section
          className="grid md:grid-cols-2 gap-10 md:gap-14 items-end py-14 md:py-20"
          style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
        >
          <div>
            <p className="font-grotesk text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-atlas-green mb-5">
              {t('home.kicker')}
            </p>
            <h1
              className="font-serif font-semibold tracking-tight text-atlas-text"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.03, textWrap: 'balance' }}
            >
              {t('home.heroTitle')}{' '}
              <span className="italic" style={{ color: 'var(--color-atlas-green)' }}>
                {t('home.heroTitleAccent')}
              </span>
            </h1>
          </div>
          <div>
            <p className="font-serif text-atlas-soft leading-relaxed mb-7" style={{ fontSize: '1.125rem' }}>
              <span className="block italic text-atlas-green mb-3" style={{ fontSize: '1.35rem' }}>
                {t('home.signature')}
              </span>
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <button
                onClick={scrollToStart}
                className="font-grotesk text-[13px] font-bold uppercase tracking-[0.08em] px-6 py-3 transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}
              >
                {t('home.ctaStart')}
              </button>
              {/* Même encombrement que « Commencer » : pour un visiteur venu
                  d'un lien, explorer la démo sans rien créer est le chemin le
                  moins coûteux — il ne doit pas passer pour un lien secondaire. */}
              <button
                onClick={handleLoadDemo}
                className="font-grotesk text-[13px] font-bold uppercase tracking-[0.08em] px-6 py-3 text-atlas-text transition-colors hover:border-atlas-green hover:text-atlas-green"
                style={{ border: '2px solid var(--color-atlas-gold)' }}
              >
                {t('home.ctaDemo')}
              </button>
            </div>
            <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute mt-6">
              {t('home.reassure')}
            </p>
          </div>
        </section>

        {/* ── Preuve : l'app, démo LOTR chargée ──
            La home ne montrait aucune capture de l'outil ; sur un produit dont
            l'argument est « ton roman sous tes yeux », c'est la première chose
            qui manquait. Pas de lazy-loading : cette image est juste sous le
            hero et candidate au LCP. */}
        <section className="py-12 md:py-16" style={{ borderBottom: '1px solid var(--color-atlas-line)' }}>
          <figure>
            <img
              src={HERO_SHOT.src}
              alt={t(HERO_SHOT.altKey)}
              width={HERO_SHOT.width}
              height={HERO_SHOT.height}
              className="w-full h-auto"
              style={{ border: '1px solid var(--color-atlas-line)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
            />
            <figcaption className="font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-mute mt-4">
              {t(HERO_SHOT.captionKey)}
            </figcaption>
          </figure>
        </section>

        {/* ── Bande citation ── */}
        <section
          className="py-14 md:py-20"
          style={{ borderTop: '1px solid var(--color-atlas-line)', borderBottom: '1px solid var(--color-atlas-line)' }}
        >
          <p
            className="font-serif font-medium text-atlas-text"
            style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.1rem)', lineHeight: 1.4, maxWidth: '26ch' }}
          >
            <span style={{ color: 'var(--color-atlas-green)' }}>{t('home.bandQuoteLead')}</span>{' '}
            {t('home.bandQuoteRest')}
          </p>
        </section>

        {/* ── Sommaire : ce que fait l'outil ── */}
        <section className="py-14 md:py-16">
          <div
            className="flex items-center justify-between font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute pb-3 mb-2"
            style={{ borderBottom: '1px solid var(--color-atlas-soft)' }}
          >
            <span>{t('home.indexLabel')}</span>
            <span>{t('home.indexToc')}</span>
          </div>
          {INDEX_ITEMS.map(({ no, titleKey, catKey, descKey, shot, shotW, shotH, altKey }) => (
            <div key={no} className="py-7" style={{ borderBottom: '1px solid var(--color-atlas-line)' }}>
              <div className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_14rem] gap-x-6 gap-y-2 items-baseline">
                <div className="font-grotesk text-2xl font-semibold" style={{ color: 'var(--color-atlas-gold)' }}>{no}</div>
                <div>
                  <h3 className="font-serif font-semibold text-atlas-text leading-tight" style={{ fontSize: '1.5rem' }}>
                    {t(titleKey)}
                  </h3>
                  <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-green mt-2">
                    {t(catKey)}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1 text-sm text-atlas-soft font-serif leading-relaxed">
                  {t(descKey)}
                </div>
              </div>
              <img
                src={shot}
                alt={t(altKey)}
                loading="lazy"
                width={shotW}
                height={shotH}
                className="w-full h-auto mt-6 md:ml-16 md:w-[calc(100%-4rem)]"
                style={{ border: '1px solid var(--color-atlas-line)' }}
              />
            </div>
          ))}
        </section>

        {/* ── Commencer : onboarding ── */}
        <section id="commencer" ref={startRef} className="max-w-2xl mx-auto py-14 md:py-16 flex flex-col gap-10">

        {/* ── Étape 0 : choix du flux ── */}
        {flow === null && (
          <div className="flex flex-col">
            <div
              className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute pb-3"
              style={{ borderBottom: '1px solid var(--color-atlas-soft)' }}
            >
              {t('home.startQuestion')}
            </div>

            <div data-tour="home-cards" className="flex flex-col">
              {/* Choix construire */}
              <button
                onClick={() => setFlow('construire')}
                className="group grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_9rem] gap-x-5 gap-y-1 items-baseline text-left py-6"
                style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
              >
                <div className="font-grotesk text-2xl font-semibold" style={{ color: 'var(--color-atlas-gold)' }}>01</div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-atlas-text leading-snug transition-colors group-hover:text-atlas-green">{t('home.buildTitle')}</h3>
                  <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1">{t('home.buildDesc')}</p>
                </div>
                <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-green whitespace-nowrap md:justify-self-end md:self-center">{t('home.buildAction')}</span>
              </button>

              {/* Choix analyser */}
              <button
                onClick={() => setFlow('analyser')}
                className="group grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_9rem] gap-x-5 gap-y-1 items-baseline text-left py-6"
                style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
              >
                <div className="font-grotesk text-2xl font-semibold" style={{ color: 'var(--color-atlas-gold)' }}>02</div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-atlas-text leading-snug transition-colors group-hover:text-atlas-green">{t('home.analyzeTitle')}</h3>
                  <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1">{t('home.analyzeDesc')}</p>
                </div>
                <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-gold whitespace-nowrap md:justify-self-end md:self-center">{t('home.analyzeAction')}</span>
              </button>

              {/* Choix importer un vault Obsidian */}
              <button
                onClick={() => navigate('/import/obsidian')}
                className="group grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_9rem] gap-x-5 gap-y-1 items-baseline text-left py-6"
                style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
              >
                <div className="font-grotesk text-2xl font-semibold" style={{ color: 'var(--color-atlas-gold)' }}>03</div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-atlas-text leading-snug transition-colors group-hover:text-atlas-green">{t('home.obsidianTitle')}</h3>
                  <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1">{t('home.obsidianDesc')}</p>
                </div>
                <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap md:justify-self-end md:self-center" style={{ color: '#a78bfa' }}>{t('home.obsidianAction')}</span>
              </button>
            </div>

            {/* Démo LOTR */}
            <div className="flex items-center gap-4 py-6">
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
                {status === 'analyzing' ? (
                  <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(92,174,142,0.2)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#5cae8e" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <span className="text-2xl">💍</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-serif text-base font-semibold text-atlas-text">{t('home.demoTitle')}</p>
                {status === 'analyzing' ? (
                  <div className="mt-1 flex flex-col gap-1">
                    <p className="text-xs font-mono text-atlas-green">
                      {progress || t('home.demoLoading')}
                      {seedPercent !== null ? ` (${seedPercent}%)` : ''}
                    </p>
                    {seedPercent !== null && (
                      <div className="h-1 overflow-hidden" style={{ backgroundColor: 'rgba(92,174,142,0.15)' }}>
                        <div
                          className="h-full transition-all duration-300"
                          style={{ width: `${seedPercent}%`, backgroundColor: 'var(--color-atlas-green)' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-atlas-soft font-serif italic mt-0.5">
                    {t('home.demoDesc')}
                  </p>
                )}
              </div>

              {status !== 'analyzing' && (
                <Button onClick={handleLoadDemo} size="sm" className="flex-shrink-0">
                  {projects.find(p => p.id.startsWith('lotr')) ? t('home.demoOpen') : t('home.demoAction')}
                </Button>
              )}
            </div>
            {status === 'error' && error && (
              <div className="pl-4 py-1 text-xs whitespace-pre-wrap"
                style={{ borderLeft: '2px solid rgba(239,68,68,0.6)', color: '#f87171' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Étape 1a : flux construire ── */}
        {flow === 'construire' && (
          <div className="flex flex-col gap-6">
            <div
              className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute pb-3"
              style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
            >
              Choisir une méthode
            </div>

            {/* Sélecteur de méthode */}
            <div className="flex flex-col">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => m.available && setMethod(m.id)}
                  className="flex items-center gap-4 py-4 text-left transition-colors"
                  style={{
                    borderBottom: '1px solid var(--color-atlas-line)',
                    opacity: m.available ? 1 : 0.45,
                    cursor: m.available ? 'pointer' : 'default',
                  }}
                >
                  <Icon name={m.icon} size={16} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-base font-semibold" style={{ color: method === m.id ? 'var(--color-atlas-green)' : 'var(--color-atlas-text)' }}>{m.label}</p>
                      {!m.available && (
                        <span
                          className="font-grotesk text-[10px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 flex-shrink-0 border border-atlas-line text-atlas-mute"
                        >
                          Bientôt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-atlas-soft mt-0.5">{m.desc}</p>
                    {m.hint && <p className="text-[11px] text-atlas-mute mt-1 font-serif italic">{m.hint}</p>}
                  </div>
                  {m.available && (
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 border-2 transition-all"
                      style={{
                        backgroundColor: method === m.id ? 'var(--color-atlas-green)' : 'transparent',
                        borderColor:     method === m.id ? 'var(--color-atlas-green)' : 'var(--color-atlas-mute)',
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
                <label className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">{t('home.projectName')}</label>
                <input
                  type="text"
                  value={buildName}
                  onChange={e => setBuildName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBuild()}
                  placeholder={t('home.projectNamePlaceholder')}
                  autoFocus
                  className="px-0 py-2 text-sm text-atlas-text bg-transparent border-0 border-b border-atlas-line outline-none focus:border-atlas-green transition-colors"
                />
              </div>
            )}

            {/* Logline (pitch en une phrase) */}
            {method && (
              <div className="flex flex-col gap-2">
                <label className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">{t('home.buildLoglineLabel')}</label>
                <textarea
                  value={buildLogline}
                  onChange={e => setBuildLogline(e.target.value)}
                  placeholder={t('home.buildLoglinePlaceholder')}
                  rows={2}
                  className="px-0 py-2 text-sm text-atlas-text bg-transparent border-0 border-b border-atlas-line outline-none focus:border-atlas-green transition-colors resize-none"
                />
                <p className="text-[11px] text-atlas-mute font-serif italic">{t('home.buildLoglineHint')}</p>
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
                {buildStatus === 'creating' ? t('home.creating') : t('home.createProject')}
              </Button>
            )}

            {buildStatus === 'error' && buildError && (
              <div className="pl-4 py-1 text-xs"
                style={{ borderLeft: '2px solid rgba(239,68,68,0.6)', color: '#f87171' }}>
                {buildError}
              </div>
            )}
          </div>
        )}

        {/* ── Étape 1b : flux analyser ── */}
        {flow === 'analyser' && (
          <div className="flex flex-col gap-6">
            <div
              className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute pb-3"
              style={{ borderBottom: '1px solid var(--color-atlas-soft)' }}
            >
              Importer un projet
            </div>

            {/* ── Onglets (soulignés) ── */}
            <div className="flex gap-8" style={{ borderBottom: '1px solid var(--color-atlas-line)' }}>
              {[
                { id: 'prompt',      label: '① Générer le prompt',   desc: 'Manuscrit ou notes' },
                { id: 'import-json', label: '② Importer le résultat', desc: 'JSON généré par votre IA' },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setError(null); }}
                  className="flex flex-col items-start pb-3 -mb-px text-left transition-colors"
                  style={{
                    borderBottom: `2px solid ${mode === id ? 'var(--color-atlas-green)' : 'transparent'}`,
                    color: mode === id ? 'var(--color-atlas-green)' : 'var(--color-atlas-mute)',
                  }}
                >
                  <span className="font-grotesk text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
                  <span className="text-[10px] opacity-70 mt-0.5">{desc}</span>
                </button>
              ))}
            </div>

            {/* ── Mode : Générer le prompt ── */}
            {mode === 'prompt' && (
              <div className="flex flex-col gap-5">

                {/* Nom + Description */}
                <div className="flex gap-6">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">Nom du projet</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                      placeholder="Mon roman"
                      className="px-0 py-2 text-sm text-atlas-text bg-transparent border-0 border-b border-atlas-line outline-none focus:border-atlas-green transition-colors" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">Description</label>
                    <input type="text" value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
                      placeholder="Auteur, sous-titre…"
                      className="px-0 py-2 text-sm text-atlas-text bg-transparent border-0 border-b border-atlas-line outline-none focus:border-atlas-green transition-colors" />
                  </div>
                </div>

                {/* Prompt généré */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">Prompt généré</p>
                    <div className="flex gap-5">
                      <button
                        onClick={handleCopyPrompt}
                        className="inline-flex items-center gap-1 font-grotesk text-[11px] font-bold uppercase tracking-[0.08em] transition-colors"
                        style={{ color: copied ? '#10b981' : 'var(--color-atlas-green)' }}
                      >
                        {copied ? <><Icon name="checkmark" size={12} /> Copié !</> : 'Copier'}
                      </button>
                      <button
                        onClick={handleDownloadPrompt}
                        className="font-grotesk text-[11px] font-bold uppercase tracking-[0.08em] text-atlas-mute hover:text-atlas-soft transition-colors"
                      >
                        ↓ .txt
                      </button>
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={generatedPrompt}
                    className="w-full text-xs font-mono outline-none resize-none text-atlas-mute bg-black/30"
                    style={{ height: 220, padding: '12px 14px', lineHeight: 1.6 }}
                  />
                </div>

                {/* Instructions (note à filet) */}
                <div className="pl-4 flex items-start gap-3" style={{ borderLeft: '2px solid var(--color-atlas-gold)' }}>
                  <Icon name="idea" size={16} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-atlas-soft leading-relaxed font-serif italic">
                    Copiez ce prompt, ouvrez votre IA favorite (<strong className="font-bold not-italic text-atlas-text">ChatGPT, Gemini, Claude…</strong>), collez le prompt puis ajoutez votre texte à la suite. Enregistrez la réponse JSON dans un fichier <code className="font-mono text-atlas-green">.json</code>, puis importez-le via l'onglet <strong className="font-bold not-italic text-atlas-text">② Importer le résultat</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* ── Mode : Importer le résultat ── */}
            {mode === 'import-json' && (
              <div className="flex flex-col gap-5">

                {/* Nom + Description */}
                <div className="flex gap-6">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">Nom du projet *</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                      placeholder="Mon roman" autoFocus
                      className="px-0 py-2 text-sm text-atlas-text bg-transparent border-0 border-b border-atlas-line outline-none focus:border-atlas-green transition-colors" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">Description</label>
                    <input type="text" value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
                      placeholder="Auteur, sous-titre…"
                      className="px-0 py-2 text-sm text-atlas-text bg-transparent border-0 border-b border-atlas-line outline-none focus:border-atlas-green transition-colors" />
                  </div>
                </div>

                {/* Upload JSON */}
                <div className="flex flex-col gap-2">
                  <label className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute">
                    Fichier JSON résultat <span className="font-normal normal-case tracking-normal text-atlas-mute">(réponse de votre IA)</span>
                  </label>
                  <label
                    className="flex items-center gap-3 py-3 cursor-pointer transition-colors"
                    style={{ borderBottom: aiJsonFile ? '1px solid var(--color-atlas-green)' : '1px dashed var(--color-atlas-line)' }}
                  >
                    <span className="text-xl">{aiJsonFile ? <Icon name="checkmark" size={18} /> : '↑'}</span>
                    <div className="flex flex-col gap-0.5 flex-1">
                      {aiJsonFile ? (
                        <>
                          <span className="text-xs font-bold text-atlas-green">{aiJsonFile.name}</span>
                          <span className="text-[10px] text-atlas-mute">{(aiJsonFile.size / 1024).toFixed(1)} Ko</span>
                        </>
                      ) : (
                        <span className="text-xs text-atlas-mute">Choisir le fichier .json généré par votre IA…</span>
                      )}
                    </div>
                    <input type="file" accept=".json,application/json,text/plain"
                      className="hidden"
                      onChange={e => setAiJsonFile(e.target.files?.[0] ?? null)} />
                  </label>
                  {aiJsonFile && (
                    <button onClick={() => setAiJsonFile(null)}
                      className="text-[10px] text-atlas-mute hover:text-red-400 transition-colors text-left">
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
                  <div className="pl-4 py-1 text-xs whitespace-pre-wrap"
                    style={{ borderLeft: '2px solid rgba(239,68,68,0.6)', color: '#f87171' }}>
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

        </section>

        {/* ── Closer ── */}
        <section className="text-center py-16 md:py-20">
          <p className="font-serif italic text-atlas-green mb-2" style={{ fontSize: '1.15rem' }}>
            {t('home.signature')}
          </p>
          <h2 className="font-serif font-semibold text-atlas-text mb-7" style={{ fontSize: 'clamp(1.9rem, 4.4vw, 2.9rem)' }}>
            {t('home.closerTitle')}
          </h2>
          <button
            onClick={scrollToStart}
            className="font-grotesk text-[13px] font-bold uppercase tracking-[0.08em] px-7 py-3 transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}
          >
            {t('home.closerCta')}
          </button>
          <p className="font-grotesk text-[11px] uppercase tracking-[0.14em] text-atlas-mute mt-6">
            {t('home.closerTrust')}
          </p>
        </section>

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
  const { t } = useTranslation();
  const { projects, loading, projectId, reloadProjects } = useProject();
  const hasProjects = !loading && projects.length > 0;
  const { data: session } = authClient.useSession();
  const { reseeding } = useLotrReseed();
  const [openCookieBanner, setOpenCookieBanner] = useState(null);
  const navigate = useNavigate();

  // Recharge les projets uniquement quand la session change réellement (pas au mount)
  const prevUserRef = useRef(session?.user?.id);
  const mountedRef  = useRef(false);
  useEffect(() => {
    const prev = prevUserRef.current;
    const curr = session?.user?.id;
    // Session expirée : l'utilisateur était connecté et ne l'est plus
    if (prev && !curr) {
      toast('Session expirée');
      navigate('/login');
    }
    prevUserRef.current = curr;
    // Au mount initial, ProjectContext charge déjà les projets → skip
    if (!mountedRef.current) { mountedRef.current = true; return; }
    // Recharge uniquement si la session a réellement changé
    if (prev !== curr) reloadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [showWelcome,  setShowWelcome]  = useState(false);
  const [authBarDismissed, setAuthBarDismissed] = useState(false);
  const showAuthBar = !session?.user && !loading && projects.length > 0 && !authBarDismissed;
  const location = useLocation();

  // Affiche le modal de bienvenue uniquement pour la démo LOTR
  useEffect(() => {
    if (location.pathname === '/dashboard' && projectId?.startsWith('lotr') && shouldShowWelcome(projectId)) {
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
    <div className="h-screen w-full flex flex-col bg-atlas-ink text-slate-200 selection:bg-[#5cae8e]/30 overflow-hidden">
      <TopNav onSearchOpen={() => setSearchOpen(true)} />
      {reseeding && (
        <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(21,23,27,0.85)' }}>
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(92,174,142,0.2)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#5cae8e" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-sm text-[#7bc4a6] font-semibold">{t('home.demoReloading')}</span>
          </div>
        </div>
      )}
      <div className={`flex-1 min-h-0 overflow-y-auto${!session?.user && !loading && projects.length > 0 ? ' pb-12' : ''}`}>
        <ErrorBoundary>
        <Suspense fallback={<Skeleton variant="list" />}>
        <Routes>
          <Route path="/"                 element={<HomePage />} />
          <Route path="/demo"         element={<DemoRoute />} />
          <Route path="/import/obsidian" element={<VaultImporter />} />
          <Route path="/map"          element={<RequireProject><MapRoute /></RequireProject>} />
          <Route path="/lore"         element={<RequireProject><LoreRoute /></RequireProject>} />
          <Route path="/custom"       element={<RequireProject><CustomEntityBrowser /></RequireProject>} />
          <Route path="/chat"         element={<RequireProject><ChatPanel /></RequireProject>} />
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
          <Route path="/account"     element={<AccountPage />} />
          <Route path="*"            element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>
      <Footer onCookieClick={openCookieBanner} />
      {searchOpen && <Suspense fallback={null}><GlobalSearch onClose={() => setSearchOpen(false)} /></Suspense>}
      <Suspense fallback={null}><GuidedTour /></Suspense>
      <Suspense fallback={null}><CookieConsent hasAuthBar={showAuthBar} onReady={setOpenCookieBanner} /></Suspense>
      {showWelcome && <Suspense fallback={null}><WelcomeModal projectId={projectId} onClose={() => setShowWelcome(false)} /></Suspense>}
      {showAuthBar && (
        <div className="fixed bottom-0 left-0 right-0 z-20"
          style={{ backgroundColor: 'rgba(21,23,27,0.97)', borderTop: '1px solid rgba(92,174,142,0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 px-6 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex-shrink-0" style={{ color: '#5cae8e' }} aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 16l-4-4-4 4"/><path d="M12 12v9"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
              </span>
              <p className="text-xs text-atlas-soft truncate">
                <span className="font-grotesk uppercase tracking-[0.16em] font-bold mr-2" style={{ color: '#5cae8e' }}>{t('auth.localMode')}</span>
                {t('auth.cookieWarning')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}
                style={{ backgroundColor: '#5cae8e', color: '#15171b', borderColor: '#5cae8e' }}>
                {t('authPages.createAccount')}
              </Button>
              <button
                onClick={() => setAuthBarDismissed(true)}
                className="w-7 h-7 flex items-center justify-center text-sm text-atlas-mute hover:text-atlas-soft transition-colors cursor-pointer"
                aria-label={t('btn.close', 'Fermer')}
                title={t('btn.close', 'Fermer')}
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Charger Crisp sur toutes les pages si le consentement est accepté
  useEffect(() => {
    try {
      const raw = localStorage.getItem('atlas_cookie_consent');
      if (raw && JSON.parse(raw).accepted) loadCrisp(import.meta.env.VITE_CRISP_WEBSITE_ID);
    } catch { /* JSON invalide — ignorer */ }
  }, []);

  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
      <ProjectProvider>
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/verify-email"    element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/privacy"         element={<PrivacyPage />} />
          <Route path="/terms"           element={<TermsPage />} />
          <Route path="/blog"            element={<BlogIndexPage />} />
          <Route path="/blog/:slug"      element={<BlogPostPage />} />
          <Route path="*"                element={<AppLayout />} />
        </Routes>
      </ProjectProvider>
    </ErrorBoundary>
  );
}
