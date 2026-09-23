/**
 * HomePageSEO — Version SSR-only de la homepage pour le prerendering.
 *
 * Reproduit le contenu SEO-visible de HomePage (App.jsx) dans son état initial
 * (flow=null, pas de session), au design « Piste 3 » éditorial. Utilisé
 * uniquement par scripts/prerender.mjs.
 *
 * ⚠️  Si tu modifies les meta tags, le h1, le FAQ JSON-LD, le hero éditorial,
 *     le sommaire de choix, la bande citation, l'index ou le closer dans
 *     App.jsx (HomePage), mets à jour ce fichier aussi.
 */
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { INDEX_ITEMS, HERO_SHOT, FAQ_KEYS } from './homeIndexItems';
import HomeBlogTeaser from './HomeBlogTeaser';



export default function HomePageSEO() {
  const { t } = useTranslation();

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
        "mainEntity": FAQ_KEYS.map(({ q, a }) => ({
          "@type": "Question",
          "name": t(q),
          "acceptedAnswer": { "@type": "Answer", "text": t(a) },
        })),
      }) }} />

      {/* Pas de `no-scrollbar` : miroir de App.jsx, voir le commentaire là-bas. */}
      <div className="h-full overflow-y-auto bg-atlas-ink text-atlas-text">
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
                <span
                  className="font-grotesk text-[13px] font-bold uppercase tracking-[0.08em] px-6 py-3"
                  style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}
                >
                  {t('home.ctaStart')}
                </span>
                <span
                  className="font-grotesk text-[13px] font-bold uppercase tracking-[0.08em] px-6 py-3 text-atlas-text"
                  style={{ border: '2px solid var(--color-atlas-gold)' }}
                >
                  {t('home.ctaDemo')}
                </span>
              </div>
              <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute mt-6">
                {t('home.reassure')}
              </p>
            </div>
          </section>

          {/* ── Preuve : l'app, démo LOTR chargée (miroir de App.jsx) ── */}
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

          {/* ── Commencer : choix du flux (statique) ── */}
          <section className="max-w-2xl mx-auto py-14 md:py-16 flex flex-col gap-10">
            <div className="flex flex-col">
              <div
                className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute pb-3"
                style={{ borderBottom: '1px solid var(--color-atlas-soft)' }}
              >
                {t('home.startQuestion')}
              </div>

              <div className="flex flex-col">
                <div
                  className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_9rem] gap-x-5 gap-y-1 items-baseline text-left py-6"
                  style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
                >
                  <div className="text-lg leading-none pt-1" style={{ color: 'var(--color-atlas-gold)' }} aria-hidden="true">◆</div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-atlas-text leading-snug">{t('home.buildTitle')}</h2>
                    <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1">{t('home.buildDesc')}</p>
                  </div>
                  <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-green whitespace-nowrap md:justify-self-end md:self-center">{t('home.buildAction')}</span>
                </div>

                <div
                  className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_9rem] gap-x-5 gap-y-1 items-baseline text-left py-6"
                  style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
                >
                  <div className="text-lg leading-none pt-1" style={{ color: 'var(--color-atlas-gold)' }} aria-hidden="true">◆</div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-atlas-text leading-snug">{t('home.analyzeTitle')}</h2>
                    <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1">{t('home.analyzeDesc')}</p>
                  </div>
                  <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-gold whitespace-nowrap md:justify-self-end md:self-center">{t('home.analyzeAction')}</span>
                </div>

                {/* Import de vault Obsidian : manquait au prerender alors que la
                    home cliente l'expose. En <Link> plutôt qu'en <div> : c'est
                    une vraie route, autant qu'elle soit crawlable. */}
                <Link
                  to="/import/obsidian"
                  className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_9rem] gap-x-5 gap-y-1 items-baseline text-left py-6"
                  style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
                >
                  <div className="text-lg leading-none pt-1" style={{ color: 'var(--color-atlas-gold)' }} aria-hidden="true">◆</div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-atlas-text leading-snug">{t('home.obsidianTitle')}</h2>
                    <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1">{t('home.obsidianDesc')}</p>
                  </div>
                  <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap md:justify-self-end md:self-center" style={{ color: '#a78bfa' }}>{t('home.obsidianAction')}</span>
                </Link>
              </div>

              {/* Démo LOTR (statique) */}
              <div className="flex items-center gap-4 py-6">
                <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
                  <span className="text-2xl">&#128141;</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base font-semibold text-atlas-text">{t('home.demoTitle')}</p>
                  <p className="text-xs text-atlas-mute font-serif italic mt-0.5">{t('home.demoDesc')}</p>
                </div>
              </div>
            </div>
          </section>


          {/* ── Pourquoi cet outil (D4) ── */}
          <section className="py-14 md:py-16" style={{ borderTop: '1px solid var(--color-atlas-line)' }}>
            <div className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute mb-6">
              {t('home.whyLabel')}
            </div>
            <div className="grid md:grid-cols-[1fr_1fr] gap-8 md:gap-14 items-start">
              <h2 className="font-serif font-semibold text-atlas-text leading-tight" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)' }}>
                {t('home.whyTitle')}
              </h2>
              <p className="font-serif text-atlas-soft leading-relaxed" style={{ fontSize: '1.05rem' }}>
                {t('home.whyBody')}
              </p>
            </div>
          </section>

          {/* ── FAQ (D2) ──
              Ces quatre questions existaient déjà en JSON-LD : Google les lisait,
              pas le visiteur. Le JSON-LD est maintenant construit depuis les mêmes
              clés i18n, les deux ne peuvent plus diverger. */}
          <section className="py-14 md:py-16" style={{ borderTop: '1px solid var(--color-atlas-line)' }}>
            <div className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute pb-3 mb-2"
              style={{ borderBottom: '1px solid var(--color-atlas-soft)' }}>
              {t('home.faqLabel')}
            </div>
            {FAQ_KEYS.map(({ q, a }) => (
              <div key={q} className="grid md:grid-cols-[1fr_1.3fr] gap-x-10 gap-y-2 py-6"
                style={{ borderBottom: '1px solid var(--color-atlas-line)' }}>
                <h3 className="font-serif font-semibold text-atlas-text leading-snug" style={{ fontSize: '1.15rem' }}>
                  {t(q)}
                </h3>
                <p className="text-sm text-atlas-soft font-serif leading-relaxed">{t(a)}</p>
              </div>
            ))}
          </section>

          <HomeBlogTeaser />

          {/* ── Closer ── */}
          <section className="text-center py-16 md:py-20">
            <p className="font-serif italic text-atlas-green mb-2" style={{ fontSize: '1.15rem' }}>
              {t('home.signature')}
            </p>
            <h2 className="font-serif font-semibold text-atlas-text mb-7" style={{ fontSize: 'clamp(1.9rem, 4.4vw, 2.9rem)' }}>
              {t('home.closerTitle')}
            </h2>
            <span
              className="inline-block font-grotesk text-[13px] font-bold uppercase tracking-[0.08em] px-7 py-3"
              style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}
            >
              {t('home.closerCta')}
            </span>
            <p className="font-grotesk text-[11px] uppercase tracking-[0.14em] text-atlas-mute mt-6">
              {t('home.closerTrust')}
            </p>
          </section>

          {/* ── Footer : liens + maillage interne (blog, légal) ── */}
          <footer className="text-center pb-14 pt-4" style={{ borderTop: '1px solid var(--color-atlas-line)' }}>
            <nav className="flex items-center justify-center gap-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute mt-8">
              <Link to="/blog" target="_blank" rel="noopener noreferrer" className="hover:text-atlas-text transition-colors">Le blog</Link>
              <span aria-hidden="true">·</span>
              <Link to="/privacy" className="hover:text-atlas-text transition-colors">Confidentialité</Link>
              <span aria-hidden="true">·</span>
              <Link to="/terms" className="hover:text-atlas-text transition-colors">CGU</Link>
            </nav>
          </footer>

        </div>
      </div>
    </>
  );
}
