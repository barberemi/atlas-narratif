import { Link } from 'react-router-dom';

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-black text-white tracking-tight">Politique de confidentialit&eacute;</h1>
          <p className="text-xs text-slate-500">Derni&egrave;re mise &agrave; jour : avril 2026</p>

          <section className="flex flex-col gap-3 text-sm text-slate-400 leading-relaxed">
            <h2 className="text-base font-bold text-white mt-4">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des donn&eacute;es personnelles collect&eacute;es via Atlas Narratif est
              [NOM / RAISON SOCIALE], [ADRESSE], contact : [EMAIL].
            </p>

            <h2 className="text-base font-bold text-white mt-4">2. Donn&eacute;es collect&eacute;es</h2>
            <p>Nous collectons les donn&eacute;es suivantes :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Donn&eacute;es de compte</strong> : nom, adresse email, mot de passe (hash&eacute;).</li>
              <li><strong>Donn&eacute;es de projet</strong> : manuscrits, personnages, lieux, objets, notes et toute donn&eacute;e saisie dans l&rsquo;application.</li>
              <li><strong>Donn&eacute;es techniques</strong> : identifiant de session, identifiant d&rsquo;appareil (deviceId), adresse IP (logs serveur).</li>
            </ul>

            <h2 className="text-base font-bold text-white mt-4">3. Base l&eacute;gale et finalit&eacute;s</h2>
            <p>Le traitement est fond&eacute; sur :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Ex&eacute;cution du contrat</strong> (art. 6.1.b RGPD) : fournir le service Atlas Narratif.</li>
              <li><strong>Int&eacute;r&ecirc;t l&eacute;gitime</strong> (art. 6.1.f RGPD) : s&eacute;curit&eacute; et am&eacute;lioration du service.</li>
            </ul>

            <h2 className="text-base font-bold text-white mt-4">4. Dur&eacute;e de conservation</h2>
            <p>
              Vos donn&eacute;es sont conserv&eacute;es tant que votre compte est actif.
              En cas de suppression de compte, toutes vos donn&eacute;es sont effac&eacute;es imm&eacute;diatement et de mani&egrave;re irr&eacute;versible.
            </p>

            <h2 className="text-base font-bold text-white mt-4">5. Vos droits</h2>
            <p>Conform&eacute;ment au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Acc&egrave;s</strong> : obtenir une copie de vos donn&eacute;es.</li>
              <li><strong>Rectification</strong> : corriger vos donn&eacute;es personnelles.</li>
              <li><strong>Suppression</strong> : supprimer votre compte et toutes vos donn&eacute;es.</li>
              <li><strong>Portabilit&eacute;</strong> : exporter vos donn&eacute;es au format JSON.</li>
              <li><strong>Opposition / Limitation</strong> : vous opposer &agrave; certains traitements.</li>
            </ul>
            <p>
              Ces droits sont exerc&cedil;ables directement depuis la page <Link to="/account" className="text-indigo-400 hover:underline">Mon compte</Link> ou
              par email &agrave; [EMAIL].
            </p>

            <h2 className="text-base font-bold text-white mt-4">6. Sous-traitants</h2>
            <p>
              Vos donn&eacute;es peuvent &ecirc;tre trait&eacute;es par les sous-traitants suivants :
              h&eacute;bergeur du serveur ([H&Eacute;BERGEUR]), service d&rsquo;envoi d&rsquo;emails transactionnels (Resend).
            </p>

            <h2 className="text-base font-bold text-white mt-4">7. Cookies</h2>
            <p>
              Atlas Narratif utilise uniquement des cookies de session essentiels au fonctionnement
              de l&rsquo;authentification. Aucun cookie publicitaire ou de tracking n&rsquo;est utilis&eacute;.
            </p>

            <h2 className="text-base font-bold text-white mt-4">8. Contact</h2>
            <p>
              Pour toute question relative &agrave; la protection de vos donn&eacute;es : [EMAIL].
              Vous pouvez &eacute;galement introduire une r&eacute;clamation aupr&egrave;s de la CNIL (www.cnil.fr).
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
