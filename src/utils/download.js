/**
 * Utilitaires de téléchargement / ouverture de documents côté client.
 * Factorise le pattern Blob + <a download> jusque-là dupliqué (AccountPage,
 * exportProject) et ajoute l'ouverture d'un document HTML imprimable (→ PDF).
 */

// Télécharge un contenu texte sous forme de fichier.
export function downloadBlob(content, filename, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Ouvre un document HTML autonome dans un nouvel onglet, prêt à être imprimé
// puis enregistré en PDF (Cmd/Ctrl+P). Retourne la fenêtre ouverte (ou null si
// le navigateur a bloqué le popup). L'URL blob est révoquée après un délai pour
// laisser le temps au nouvel onglet de la charger.
export function openHtmlDocument(html) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return win;
}
