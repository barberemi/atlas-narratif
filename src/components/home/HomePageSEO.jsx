/**
 * HomePageSEO — Version SSR-only de la homepage pour le prerendering.
 *
 * Reproduit le contenu SEO-visible de HomePage (App.jsx) dans son état initial
 * (flow=null, pas de session). Utilisé uniquement par scripts/prerender.mjs.
 *
 * ⚠️  Si tu modifies les meta tags, le h1, le FAQ JSON-LD ou les cartes dans
 *     App.jsx (HomePage), mets à jour ce fichier aussi.
 */
import { useTranslation } from 'react-i18next';
import FeaturesShowcase from './FeaturesShowcase';

export default function HomePageSEO() {
  const { t } = useTranslation();

  return (
    <>
      <title>AtlasNarratif — Outil d'analyse narrative pour auteurs</title>
      <meta name="description" content="AtlasNarratif aide les auteurs à construire et analyser leurs histoires : timeline, carte, personnages, incohérences et arcs narratifs. Structurez votre roman avec Save the Cat ou le Voyage du Héros." />
      <meta property="og:title" content="AtlasNarratif — Outil d'analyse narrative pour auteurs" />
      <meta property="og:description" content="Construisez et analysez vos histoires : timeline, carte, personnages, incohérences et arcs narratifs." />
      <meta property="og:url" content="https://DOMAIN_PLACEHOLDER/" />
      <meta property="og:image" content="https://DOMAIN_PLACEHOLDER/og-image.png" />
      <meta name="twitter:title" content="AtlasNarratif — Outil d'analyse narrative pour auteurs" />
      <meta name="twitter:description" content="Construisez et analysez vos histoires : timeline, carte, personnages, incohérences et arcs narratifs." />
      <meta name="twitter:image" content="https://DOMAIN_PLACEHOLDER/og-image.png" />
      <link rel="canonical" href="https://DOMAIN_PLACEHOLDER/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Mes données restent-elles privées ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Vos données narratives sont stockées dans une base PostgreSQL sécurisée. Les mots de passe sont hashés et les données sensibles sont chiffrées au repos (AES-256-GCM). Aucun outil d'analytics ou de tracking n'est utilisé." } },
          { "@type": "Question", "name": "Quels outils narratifs sont disponibles ?", "acceptedAnswer": { "@type": "Answer", "text": "AtlasNarratif propose une timeline interactive, un graphe de relations, une carte des lieux, la structure Save the Cat (15 beats), le Voyage du Héros (12 étapes), un arc émotionnel, un détecteur d'incohérences, un tracker d'amorces narratives et la gestion de fils narratifs." } },
          { "@type": "Question", "name": "Puis-je importer un manuscrit existant ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Générez un prompt d'analyse avec AtlasNarratif, envoyez-le à votre IA favorite (ChatGPT, Gemini, Claude), puis importez le résultat JSON pour extraire automatiquement la timeline, les personnages et les lieux." } },
          { "@type": "Question", "name": "AtlasNarratif supporte-t-il les séries en plusieurs tomes ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Le support multi-tomes permet de filtrer par volume, de suivre les amorces narratives entre les tomes et de visualiser les arcs sur l'ensemble de la série." } },
        ],
      }) }} />

      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-10">

          {/* Header */}
          <header className="text-center">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">
              {t('app.h1Prefix')} <span className="text-[#3F51B5] drop-shadow-[0_0_20px_rgba(63,81,181,0.4)]">AtlasNarratif</span>
            </h1>
          </header>

          {/* Choix du flux (statique) */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
              {t('home.startQuestion')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carte construire */}
              <div
                className="flex flex-col gap-3 p-6 rounded-2xl text-left"
                style={{ backgroundColor: 'rgba(63,81,181,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <svg viewBox="0 0 64 64" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4 L54 14 L22 46 L8 50 L12 36 Z" fill="rgba(63,81,181,0.15)" stroke="#3F51B5" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  <line x1="38" y1="10" x2="48" y2="20" stroke="#3F51B5" strokeWidth="1.5" opacity="0.4" />
                  <line x1="12" y1="36" x2="22" y2="46" stroke="#3F51B5" strokeWidth="1.5" opacity="0.4" />
                  <path d="M8 50 L12 36 L22 46 Z" fill="rgba(63,81,181,0.3)" />
                  <line x1="8" y1="58" x2="56" y2="58" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-sm font-black text-slate-200">{t('home.buildTitle')}</p>
                  <p className="text-xs text-slate-500 mt-1 font-serif italic">{t('home.buildDesc')}</p>
                </div>
                <span className="text-xs font-bold text-indigo-400 mt-auto">{t('home.buildAction')}</span>
              </div>

              {/* Carte analyser */}
              <div
                className="flex flex-col gap-3 p-6 rounded-2xl text-left"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <svg viewBox="0 0 64 64" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12 Q8 8, 12 8 L30 8 Q32 8, 32 10 L32 52 Q32 50, 30 50 L12 50 Q8 50, 8 46 Z" fill="rgba(63,81,181,0.1)" stroke="#3F51B5" strokeWidth="1.5" />
                  <path d="M56 12 Q56 8, 52 8 L34 8 Q32 8, 32 10 L32 52 Q32 50, 34 50 L52 50 Q56 50, 56 46 Z" fill="rgba(63,81,181,0.15)" stroke="#3F51B5" strokeWidth="1.5" />
                  <line x1="18" y1="18" x2="26" y2="18" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="18" y1="24" x2="24" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="18" y1="30" x2="26" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="38" y1="18" x2="48" y2="18" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="38" y1="24" x2="46" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="38" y1="30" x2="48" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-sm font-black text-slate-200">{t('home.analyzeTitle')}</p>
                  <p className="text-xs text-slate-500 mt-1 font-serif italic">{t('home.analyzeDesc')}</p>
                </div>
                <span className="text-xs font-bold text-slate-400 mt-auto">{t('home.analyzeAction')}</span>
              </div>
            </div>

            {/* Démo LOTR (statique) */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: 'rgba(63,81,181,0.04)', border: '1px solid rgba(63,81,181,0.15)' }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <span className="text-3xl">&#128141;</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-300">{t('home.demoTitle')}</p>
                <p className="text-xs text-slate-600 font-serif italic mt-0.5">{t('home.demoDesc')}</p>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-white/5" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('home.featuresLabel', 'Fonctionnalités')}</span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          {/* Features */}
          <FeaturesShowcase />

        </div>
      </div>
    </>
  );
}
