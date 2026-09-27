# Calendrier éditorial du blog — Atlas Narratif

Séquence sur 6 mois (sept. 2026 → fév. 2027), rythme **2 articles/mois**, calée sur le pic du **défi d'écriture de novembre** (ex-NaNoWriMo, l'association a fermé en 2025). Chaque article capte une intention de recherche puis renvoie vers l'outil. Règles : `ai/marketing/blog-guidelines.md`. Relecture obligatoire par les 2 agents avant publication.

Piliers : **P1** = fondation SEO (fort volume, intention claire) · **P2** = approfondissement · **P3** = conversion / social proof.

## Vue d'ensemble

Toutes les dates sont les dates de sortie réelles (champ `date` de `src/data/blog/posts.js`, garde-fou `isPublished`).

| Sortie | Phase | Article | Pilier | Intention / mot-clé cible | Canal d'amorçage |
|--------|-------|---------|--------|---------------------------|------------------|
| 10/09 | M1 Fondations | Comment structurer un roman : le guide complet | P1 | « comment structurer un roman » | r/ecriture, un Discord FR |
| 15/09 | M1 | La méthode Save the Cat expliquée (les 15 beats) | P1 | « save the cat beats français » | Reddit + groupe FB écriture |
| 25/09 | M1 | Le Voyage du Héros : les 12 étapes | P1 | « voyage du héros étapes » | CoCyclics, Scribay |
| 29/09 | M1 | Créer une timeline pour son roman | P1 | « timeline roman outil » | Discord + démo en appui |
| 02/10 | M2 Preptober | Planifie ton roman de novembre (ex-« NaNoWriMo », renommé : l'orga a fermé en 2025) | P1 | « préparer défi écriture novembre » | Communautés du défi de novembre, X |
| 06/10 | M2 | La structure du Seigneur des Anneaux décortiquée *(démo déguisée)* | P3 | « structure seigneur des anneaux » | r/fantasy_fr, FB |
| 09/10 | M2 | Détecter les incohérences dans son roman : la checklist | P1 | « incohérences roman vérifier » | Discord (aide) |
| 13/10 | M2 | Comment gérer plusieurs tomes sans perdre le fil | P2 | « écrire une saga plusieurs tomes » | r/fantasy_fr, groupes saga |
| 20/10 | M2 Preptober | Save the Cat ou Voyage du Héros : quelle méthode ? | P2 | « save the cat ou voyage du héros » | Reddit, FB (choix de méthode avant novembre) |
| 03/11 | 🚀 M3 Lancement | Amorces et paiements (plant & payoff) | P2 | « plant and payoff écriture » | Discord, X |
| 17/11 | 🚀 M3 | Syndrome du tome 2 : pourquoi ta suite s'enlise | P3 | « syndrome du tome 2 » | Groupes saga, r/fantasy_fr |
| 01/12 | M4 Capitaliser | Créer une bible d'univers (worldbuilding) | P1 | « bible d'univers worldbuilding » | r/JeuxDeRole, worldbuilders |
| 15/12 | M4 | Les meilleurs outils gratuits pour écrire un roman en 2026 | P3 | « outils gratuits écrire roman » | comparatif, trafic transactionnel |
| 12/01 | M5 Communauté | Créer la carte de ton roman : le Seigneur des Anneaux, trajet par trajet | P3 | « carte de son roman » | Discord/BookTok, worldbuilders |

Rythme : ~2 articles/mois, avec un effort resserré autour du défi d'écriture de novembre (pas de trou pendant le lancement).

## Backlog (à caser si un créneau se libère ou en bonus)
- (vide : tous les sujets du plan initial sont rédigés et programmés. Pistes suivantes : « Écrire un bon antagoniste », « Les fils narratifs (subplots) », « Rythmer ses chapitres avec l'arc émotionnel ».)

## Principes de séquençage
1. **Tout le M1-M2 prépare novembre.** Les 4 premiers articles (piliers P1) doivent être en ligne avant le pic pour commencer à ranker (le SEO paie en 3 à 6 mois).
2. **Novembre = double effort** : contenu « roman de novembre » (intention chaude) + lancement coordonné (la démo LOTR sans compte est l'aimant).
3. **Chaque article = 1 amorçage communauté** : on répond à une vraie question, on ne spamme pas le lien.
4. **Un visuel minimum par article** (schéma inline, capture annotée, ou GIF/vidéo). Voir la charte.
5. **Mesure** : suivre quel article amène des inscrits qui *reviennent* (rétention W4), pas les vues brutes. Doubler la mise sur le format qui convertit.

## Process de publication (rappel)
1. Rédaction selon `ai/marketing/blog-guidelines.md`.
2. Relecture **Expert Écriture de Blog** (`ai/agents/blog-editor.md`).
3. Relecture **Écrivain** (`ai/agents/writer.md`).
4. Intégration des retours des deux, ajout à `src/data/blog/posts.js` avec la **date de publication** voulue (champ `date`).
5. **Pas de sitemap à éditer à la main** : les entrées d'articles sont générées au build par `scripts/prerender.mjs` (seuls les articles publiés). Le `public/sitemap.xml` ne contient que les routes statiques.
6. `make build` (prérend l'article pour le SEO) puis déploiement.

### Publication programmée (garde-fou par date)
Un article n'apparaît que lorsque sa `date` est atteinte (garde-fou `isPublished` dans `posts.js`). On peut donc **tout committer d'avance** : chaque article sort tout seul à sa date.
- **Index `/blog`** : gate évalué au runtime → l'article apparaît à sa date **sans redéploiement**.
- **Prerender + sitemap (SEO)** : gate évalué au build → l'article entre au **premier build/déploiement postérieur à sa date**. Prévoir un déploiement (ou un rebuild planifié) pour que le référencement suive.
- **Brouillon** : `draft: true` masque l'article partout, quelle que soit la date.
