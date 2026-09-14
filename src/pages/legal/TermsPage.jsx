import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-atlas-ink text-slate-200">
      <title>Conditions générales d'utilisation — Atlas Narratif</title>
      <meta name="description" content="Consultez les conditions générales d'utilisation d'Atlas Narratif, l'outil d'analyse narrative pour auteurs." />
      <link rel="canonical" href="https://DOMAIN_PLACEHOLDER/terms" />
      <nav className="flex-shrink-0 flex items-center px-4 border-b border-atlas-line"
        style={{ height: 48, backgroundColor: 'rgba(21,23,27,0.97)' }}>
        <Link to="/" className="font-serif text-base font-bold tracking-tight text-atlas-text transition-opacity duration-150 hover:opacity-70">
          Atlas <span style={{ color: 'var(--color-atlas-green)' }}>Narratif</span>
        </Link>
      </nav>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="h-full max-w-[1280px] mx-auto flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
            <div className="flex-1">
              <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Légal · conditions d\'utilisation'}</p>
              <h1 className="font-serif text-4xl font-semibold text-white tracking-tight leading-none">{t('account.termsPageTitle')}</h1>
              <p className="text-sm text-atlas-soft font-serif italic mt-1">Derni&egrave;re mise &agrave; jour : avril 2026</p>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 flex flex-col gap-6">

          <section className="flex flex-col gap-3 text-sm text-slate-400 leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-white mt-4">1. Objet</h2>
            <p>
              Les pr&eacute;sentes conditions g&eacute;n&eacute;rales r&eacute;gissent l&rsquo;utilisation du service Atlas Narratif,
              outil d&rsquo;analyse et de construction narrative pour auteurs, accessible &agrave; l&rsquo;adresse atlas-narratif.com.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">2. Description du service</h2>
            <p>
              Atlas Narratif permet de structurer, analyser et visualiser des manuscrits litt&eacute;raires.
              Le service propose des outils de gestion de personnages, lieux, objets, timeline,
              arcs narratifs et d&eacute;tection d&rsquo;incoh&eacute;rences.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">3. Inscription et compte</h2>
            <p>
              L&rsquo;acc&egrave;s au service n&eacute;cessite la cr&eacute;ation d&rsquo;un compte avec une adresse email valide.
              L&rsquo;utilisateur est responsable de la confidentialit&eacute; de ses identifiants.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">4. Propri&eacute;t&eacute; intellectuelle</h2>
            <p>
              <strong>Vos contenus vous appartiennent.</strong> Les manuscrits, personnages, notes et toutes
              les donn&eacute;es que vous saisissez dans Atlas Narratif restent votre propri&eacute;t&eacute; exclusive.
              Nous ne revendiquons aucun droit sur vos cr&eacute;ations.
            </p>
            <p>
              Le code source, le design et la marque Atlas Narratif sont la propri&eacute;t&eacute; de Barb&eacute; R&eacute;mi.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">5. Obligations de l&rsquo;utilisateur</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Ne pas utiliser le service &agrave; des fins ill&eacute;gales.</li>
              <li>Ne pas tenter d&rsquo;acc&eacute;der aux donn&eacute;es d&rsquo;autres utilisateurs.</li>
              <li>Ne pas perturber le fonctionnement du service.</li>
            </ul>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">6. Responsabilit&eacute;</h2>
            <p>
              Le service est fourni &laquo; en l&rsquo;&eacute;tat &raquo;. Nous mettons tout en &oelig;uvre pour assurer
              la disponibilit&eacute; et la s&eacute;curit&eacute; du service, mais ne garantissons pas une
              disponibilit&eacute; ininterrompue. Nous vous recommandons d&rsquo;exporter r&eacute;guli&egrave;rement
              vos donn&eacute;es via la fonction d&rsquo;export.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">7. Suppression de compte</h2>
            <p>
              Vous pouvez supprimer votre compte &agrave; tout moment depuis la page
              <Link to="/account" className="text-atlas-green hover:underline ml-1">Mon compte</Link>.
              La suppression est imm&eacute;diate et irr&eacute;versible : toutes vos donn&eacute;es seront effac&eacute;es.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">8. Modification des CGU</h2>
            <p>
              Nous nous r&eacute;servons le droit de modifier les pr&eacute;sentes CGU.
              Les utilisateurs seront inform&eacute;s de toute modification substantielle.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">9. Droit applicable</h2>
            <p>
              Les pr&eacute;sentes CGU sont soumises au droit fran&ccedil;ais.
              Tout litige sera port&eacute; devant les juridictions comp&eacute;tentes de Lyon.
            </p>
          </section>

          <div className="mt-8 border-t border-atlas-line pt-4">
            <Link to="/" className="text-xs text-atlas-soft hover:text-slate-300 transition-colors">&larr; Retour</Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
