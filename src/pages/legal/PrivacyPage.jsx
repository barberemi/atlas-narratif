import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-atlas-ink text-slate-200">
      <title>Politique de confidentialité — Atlas Narratif</title>
      <meta name="description" content="Découvrez comment Atlas Narratif collecte, utilise et protège vos données personnelles conformément au RGPD." />
      <link rel="canonical" href="https://DOMAIN_PLACEHOLDER/privacy" />
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
              <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Légal · confidentialité'}</p>
              <h1 className="font-serif text-4xl font-semibold text-white tracking-tight leading-none">{t('account.privacyPolicy')}</h1>
              <p className="text-sm text-atlas-soft font-serif italic mt-1">Derni&egrave;re mise &agrave; jour : avril 2026</p>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 flex flex-col gap-6">

          <section className="flex flex-col gap-3 text-sm text-slate-400 leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-white mt-4">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des donn&eacute;es personnelles collect&eacute;es via Atlas Narratif est
              Barb&eacute; R&eacute;mi, Lyon (France), contact : barbe.remi25[at]gmail[dot]com.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">2. Donn&eacute;es collect&eacute;es</h2>
            <p>Les donn&eacute;es suivantes sont stock&eacute;es lorsque vous utilisez le service :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Donn&eacute;es de compte</strong> : nom et adresse email (fournis &agrave; l&rsquo;inscription). Votre mot de passe est hash&eacute; — nous n&rsquo;y avons pas acc&egrave;s en clair.</li>
              <li><strong>Donn&eacute;es de projet</strong> : les contenus que vous saisissez dans l&rsquo;application (personnages, lieux, objets, notes, etc.). Aucune donn&eacute;e n&rsquo;est collect&eacute;e automatiquement depuis vos fichiers.</li>
              <li><strong>Donn&eacute;es techniques</strong> : identifiant de session et adresse IP (logs serveur), n&eacute;cessaires au fonctionnement de l&rsquo;authentification. Aucun outil d&rsquo;analytics ou de tracking n&rsquo;est utilis&eacute;.</li>
            </ul>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">3. Base l&eacute;gale et finalit&eacute;s</h2>
            <p>Le traitement est fond&eacute; sur :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Ex&eacute;cution du contrat</strong> (art. 6.1.b RGPD) : fournir le service Atlas Narratif.</li>
              <li><strong>Int&eacute;r&ecirc;t l&eacute;gitime</strong> (art. 6.1.f RGPD) : s&eacute;curit&eacute; et am&eacute;lioration du service.</li>
            </ul>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">4. Dur&eacute;e de conservation</h2>
            <p>
              Vos donn&eacute;es sont conserv&eacute;es tant que votre compte est actif.
              En cas de suppression de compte, toutes vos donn&eacute;es sont effac&eacute;es imm&eacute;diatement et de mani&egrave;re irr&eacute;versible.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">5. S&eacute;curit&eacute; des donn&eacute;es</h2>
            <p>
              Vos donn&eacute;es narratives (manuscrits, personnages, lieux, objets, notes) sont
              chiffr&eacute;es au repos en base de donn&eacute;es (AES-256-GCM). Chaque projet dispose
              de sa propre cl&eacute; de chiffrement. Les mots de passe sont hash&eacute;s et ne sont
              jamais stock&eacute;s en clair. Les communications sont prot&eacute;g&eacute;es par HTTPS (TLS).
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">6. Vos droits</h2>
            <p>Conform&eacute;ment au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Acc&egrave;s</strong> : obtenir une copie de vos donn&eacute;es.</li>
              <li><strong>Rectification</strong> : corriger vos donn&eacute;es personnelles.</li>
              <li><strong>Suppression</strong> : supprimer votre compte et toutes vos donn&eacute;es.</li>
              <li><strong>Portabilit&eacute;</strong> : exporter vos donn&eacute;es au format JSON.</li>
              <li><strong>Opposition / Limitation</strong> : vous opposer &agrave; certains traitements.</li>
            </ul>
            <p>
              Ces droits sont exerc&cedil;ables directement depuis la page <Link to="/account" className="text-atlas-green hover:underline">Mon compte</Link> ou
              par email &agrave; barbe.remi25[at]gmail[dot]com.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">7. Sous-traitants</h2>
            <p>
              Vos donn&eacute;es peuvent &ecirc;tre trait&eacute;es par les sous-traitants suivants :
              h&eacute;bergeur du serveur (OVHcloud, 2 rue Kellermann, 59100 Roubaix), service d&rsquo;envoi d&rsquo;emails transactionnels (Resend).
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">8. Cookies</h2>
            <p>Atlas Narratif utilise les cookies suivants :</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-1">
              <li><strong className="text-white">Cookies essentiels</strong> : session d&rsquo;authentification et pr&eacute;f&eacute;rences
                (langue, projet actif). Toujours actifs, n&eacute;cessaires au fonctionnement du service.</li>
              <li><strong className="text-white">Cookies fonctionnels</strong> : widget de chat d&rsquo;assistance Crisp. Charg&eacute;
                uniquement apr&egrave;s votre consentement. Crisp peut d&eacute;poser des cookies pour maintenir
                la session de chat (<a href="https://crisp.chat/en/privacy/" target="_blank"
                rel="noopener noreferrer" className="text-atlas-green hover:underline">politique
                de confidentialit&eacute; de Crisp</a>).</li>
            </ul>
            <p className="mt-1">
              Vous pouvez modifier votre choix de consentement &agrave; tout moment via le bouton cookie
              en bas &agrave; gauche de l&rsquo;&eacute;cran.
            </p>

            <h2 className="font-serif text-lg font-semibold text-white mt-4">9. Contact</h2>
            <p>
              Pour toute question relative &agrave; la protection de vos donn&eacute;es : barbe.remi25[at]gmail[dot]com.
              Vous pouvez &eacute;galement introduire une r&eacute;clamation aupr&egrave;s de la CNIL (www.cnil.fr).
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
