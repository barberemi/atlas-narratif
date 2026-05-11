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

  const enforce = () => {
    const r = document.querySelector('.crisp-client');
    if (!r) return;
    // 60px si bandeau auth présent (fixed z-20 en bas), 20px sinon
    const authBar = document.querySelector('.fixed.bottom-0.z-20');
    const offset = authBar ? '60px' : '20px';
    for (const el of r.querySelectorAll('*')) {
      if (getComputedStyle(el).position === 'fixed' && el.style.bottom !== offset) {
        el.style.setProperty('bottom', offset, 'important');
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
