import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
      <nav className="flex-shrink-0 flex items-center px-4 border-b border-white/10"
        style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)' }}>
        <Link to="/" className="text-sm font-black tracking-tight transition-opacity duration-150 hover:opacity-70">
          Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
        </Link>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <h1 className="text-2xl font-black text-white tracking-tight">Conditions g&eacute;n&eacute;rales d&rsquo;utilisation</h1>
          <p className="text-xs text-slate-500">Derni&egrave;re mise &agrave; jour : avril 2026</p>

          <section className="flex flex-col gap-3 text-sm text-slate-400 leading-relaxed">
            <h2 className="text-base font-bold text-white mt-4">1. Objet</h2>
            <p>
              Les pr&eacute;sentes conditions g&eacute;n&eacute;rales r&eacute;gissent l&rsquo;utilisation du service Atlas Narratif,
              outil d&rsquo;analyse et de construction narrative pour auteurs, accessible &agrave; l&rsquo;adresse [URL].
            </p>

            <h2 className="text-base font-bold text-white mt-4">2. Description du service</h2>
            <p>
              Atlas Narratif permet de structurer, analyser et visualiser des manuscrits litt&eacute;raires.
              Le service propose des outils de gestion de personnages, lieux, objets, timeline,
              arcs narratifs et d&eacute;tection d&rsquo;incoh&eacute;rences.
            </p>

            <h2 className="text-base font-bold text-white mt-4">3. Inscription et compte</h2>
            <p>
              L&rsquo;acc&egrave;s au service n&eacute;cessite la cr&eacute;ation d&rsquo;un compte avec une adresse email valide.
              L&rsquo;utilisateur est responsable de la confidentialit&eacute; de ses identifiants.
            </p>

            <h2 className="text-base font-bold text-white mt-4">4. Propri&eacute;t&eacute; intellectuelle</h2>
            <p>
              <strong>Vos contenus vous appartiennent.</strong> Les manuscrits, personnages, notes et toutes
              les donn&eacute;es que vous saisissez dans Atlas Narratif restent votre propri&eacute;t&eacute; exclusive.
              Nous ne revendiquons aucun droit sur vos cr&eacute;ations.
            </p>
            <p>
              Le code source, le design et la marque Atlas Narratif sont la propri&eacute;t&eacute; de [NOM / RAISON SOCIALE].
            </p>

            <h2 className="text-base font-bold text-white mt-4">5. Obligations de l&rsquo;utilisateur</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Ne pas utiliser le service &agrave; des fins ill&eacute;gales.</li>
              <li>Ne pas tenter d&rsquo;acc&eacute;der aux donn&eacute;es d&rsquo;autres utilisateurs.</li>
              <li>Ne pas perturber le fonctionnement du service.</li>
            </ul>

            <h2 className="text-base font-bold text-white mt-4">6. Responsabilit&eacute;</h2>
            <p>
              Le service est fourni &laquo; en l&rsquo;&eacute;tat &raquo;. Nous mettons tout en &oelig;uvre pour assurer
              la disponibilit&eacute; et la s&eacute;curit&eacute; du service, mais ne garantissons pas une
              disponibilit&eacute; ininterrompue. Nous vous recommandons d&rsquo;exporter r&eacute;guli&egrave;rement
              vos donn&eacute;es via la fonction d&rsquo;export.
            </p>

            <h2 className="text-base font-bold text-white mt-4">7. Suppression de compte</h2>
            <p>
              Vous pouvez supprimer votre compte &agrave; tout moment depuis la page
              <Link to="/account" className="text-indigo-400 hover:underline ml-1">Mon compte</Link>.
              La suppression est imm&eacute;diate et irr&eacute;versible : toutes vos donn&eacute;es seront effac&eacute;es.
            </p>

            <h2 className="text-base font-bold text-white mt-4">8. Modification des CGU</h2>
            <p>
              Nous nous r&eacute;servons le droit de modifier les pr&eacute;sentes CGU.
              Les utilisateurs seront inform&eacute;s de toute modification substantielle.
            </p>

            <h2 className="text-base font-bold text-white mt-4">9. Droit applicable</h2>
            <p>
              Les pr&eacute;sentes CGU sont soumises au droit fran&ccedil;ais.
              Tout litige sera port&eacute; devant les juridictions comp&eacute;tentes de [VILLE].
            </p>
          </section>

          <div className="mt-8 border-t border-white/10 pt-4">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">&larr; Retour</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
