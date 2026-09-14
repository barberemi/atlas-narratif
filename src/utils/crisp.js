/**
 * Dynamically loads the Crisp chat widget.
 * Idempotent — safe to call multiple times.
 * @param {string} websiteId — Crisp website ID (from VITE_CRISP_WEBSITE_ID)
 */

let _observer = null;

export function unloadCrisp() {
  // Masquer via l'API Crisp (le script en mémoire ne peut pas être arrêté)
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:hide']);
    window.$crisp.push(['off', 'chat:opened']);
    window.$crisp.push(['off', 'chat:closed']);
  }
  // Cacher le conteneur entier
  const root = document.querySelector('.crisp-client');
  if (root) root.style.display = 'none';
  _observer?.disconnect();
  _observer = null;
}

export function loadCrisp(websiteId) {
  if (!websiteId) return;

  // Si Crisp est déjà chargé mais masqué → le réafficher
  const root = document.querySelector('.crisp-client');
  if (root) {
    root.style.display = '';
    window.$crisp?.push(['do', 'chat:show']);
    return;
  }

  if (window.$crisp) return;
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = websiteId;

  if (!document.getElementById('crisp-offset')) {
    const style = document.createElement('style');
    style.id = 'crisp-offset';
    document.head.appendChild(style);
  }

  // Accent Atlas (vert sauge) pour thémer Crisp à la palette de l'app.
  // Crisp génère des classes hachées (cc-xxxxx) instables entre builds : on
  // cible donc par la COULEUR réelle (bleu de marque Crisp) plutôt que par un
  // sélecteur fragile. Fix « propre » côté produit : régler la couleur dans le
  // dashboard Crisp (Chatbox → Apparence → Couleur = #5cae8e).
  const ACCENT = '#5cae8e';

  const isCrispBlue = (bg) => {
    const m = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return false;
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    return b > 150 && b > r + 40 && b > g + 20; // bleu dominant façon Crisp
  };

  const enforce = () => {
    const r = document.querySelector('.crisp-client');
    if (!r) return;
    // 60px si bandeau auth présent (fixed z-20 en bas), 20px sinon
    const authBar = document.querySelector('.fixed.bottom-0.z-20');
    const offset = authBar ? '60px' : '20px';
    for (const el of r.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' && el.style.bottom !== offset) {
        el.style.setProperty('bottom', offset, 'important');
      }
      // Recolore le launcher / en-tête / boutons bleus de Crisp vers l'accent.
      if (isCrispBlue(cs.backgroundColor) && el.dataset.atlasThemed !== 'bg') {
        el.style.setProperty('background-color', ACCENT, 'important');
        el.style.setProperty('background-image', 'none', 'important');
        el.dataset.atlasThemed = 'bg';
        // Le launcher (grande bulle ronde ~54px) est vert comme certains fonds
        // de l'app : on lui ajoute un contour clair pour qu'il ne s'y fonde pas.
        const size  = Math.max(parseFloat(cs.width) || 0, parseFloat(cs.height) || 0);
        const round = cs.borderRadius === '100%' || cs.borderRadius === '50%'
          || parseFloat(cs.borderRadius) >= size / 2;
        if (round && size >= 40) {
          el.style.setProperty(
            'box-shadow',
            '0 4px 14px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.9)',
            'important'
          );
        }
      }
    }
  };

  _observer?.disconnect();
  _observer = new MutationObserver(() => requestAnimationFrame(enforce));
  _observer.observe(document.body, { childList: true, subtree: true });

  const s = document.createElement('script');
  s.src = 'https://client.crisp.chat/l.js';
  s.async = true;
  document.head.appendChild(s);
}
