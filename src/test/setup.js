/**
 * Setup global des tests unitaires (Vitest).
 *
 * Fixe la langue de l'application à `fr` de façon déterministe.
 *
 * Pourquoi : `src/i18n` utilise i18next-browser-languagedetector avec
 * `order: ['localStorage', 'navigator']`. Sous jsdom, `navigator.language`
 * vaut `en-US`, donc i18next bascule sur `en` et charge `en/common.json` via
 * un import dynamique **asynchrone**. Selon que cet import a résolu ou non au
 * moment où un test s'exécute, `t()` renvoie l'anglais ou retombe sur le `fr`
 * bundlé — ce qui rend flaky tout test assertant sur du texte traduit
 * (ex : detectIncoherences `.toContain('détruit')`).
 *
 * En posant `atlas_lang=fr` dans localStorage AVANT que `src/i18n` ne
 * s'initialise, le détecteur choisit `fr` (déjà bundlé, chargement synchrone) :
 * plus aucun import async, langue stable pour toute la suite.
 */

// Exécuté au chargement du fichier de setup, donc avant l'import de `src/i18n`
// par les fichiers de test → le détecteur lira bien cette valeur à l'init.
globalThis.localStorage?.setItem('atlas_lang', 'fr');
