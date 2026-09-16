# Calendrier éditorial du blog — Atlas Narratif

Séquence sur 6 mois (sept. 2026 → fév. 2027), rythme **2 articles/mois**, calée sur le pic **NaNoWriMo (novembre)**. Chaque article capte une intention de recherche puis renvoie vers l'outil. Règles : `ai/marketing/blog-guidelines.md`. Relecture obligatoire par les 2 agents avant publication.

Piliers : **P1** = fondation SEO (fort volume, intention claire) · **P2** = approfondissement · **P3** = conversion / social proof.

## Vue d'ensemble

| Mois | Phase | Article | Pilier | Intention / mot-clé cible | Canal d'amorçage |
|------|-------|---------|--------|---------------------------|------------------|
| **Sept.** | M1 Fondations | Comment structurer un roman : le guide complet ✅ *(publié)* | P1 | « comment structurer un roman » | r/ecriture, un Discord FR |
| **Sept.** | M1 | La méthode Save the Cat expliquée (les 15 beats) ✅ *(publié)* | P1 | « save the cat beats français » | Reddit + groupe FB écriture |
| **Oct.** | M2 Rodage | Le Voyage du Héros : les 12 étapes ✍️ *(rédigé, PR oct.)* | P1 | « voyage du héros étapes » | CoCyclics, Scribay |
| **Oct.** | M2 | Créer une timeline pour son roman : méthode + outils ✍️ *(rédigé, PR oct.)* | P1 | « timeline roman outil » | Discord + démo `/demo` en appui |
| **Nov.** | 🚀 M3 NaNoWriMo | Planifie ton NaNoWriMo avec une méthode ✍️ *(rédigé, PR nov.)* | P1 | « préparer nanowrimo plan » | Groupes NaNoWriMo FR, X #TeamÉcriture |
| **Nov.** | 🚀 M3 Lancement | La structure du Seigneur des Anneaux décortiquée *(démo déguisée)* ✍️ *(rédigé, PR nov.)* | P3 | « structure seigneur des anneaux » | Lancement : Reddit, FB, BookTok, PH/BetaList |
| **Déc.** | M4 Capitaliser | Détecter les incohérences dans son roman : la checklist ✍️ *(rédigé, PR déc.)* | P1 | « incohérences roman vérifier » | Discord (aide), newsletter |
| **Déc.** | M4 | Comment gérer plusieurs tomes sans perdre le fil ✍️ *(rédigé, PR déc.)* | P2 | « écrire une saga plusieurs tomes » | r/fantasy_fr, groupes saga |
| **Janv.** | M5 Communauté | Amorces et paiements (plant & payoff) : l'art de préparer ses révélations | P2 | « plant and payoff écriture » | Discord Atlas (si ouvert), X |
| **Janv.** | M5 | Comment créer une bible d'univers (worldbuilding) pour ta saga | P1 | « bible d'univers worldbuilding » | r/JeuxDeRole, worldbuilders |
| **Fév.** | M6 Bilan | Save the Cat vs Voyage du Héros : quelle méthode pour ton roman ? | P2 | « save the cat ou voyage du héros » | Reddit, FB |
| **Fév.** | M6 | Les meilleurs outils gratuits pour écrire un roman en 2026 | P3 | « outils gratuits écrire roman » | comparatif, capte le trafic transactionnel |

## Backlog (à caser si un créneau se libère ou en bonus)
- Pourquoi ton tome 2 part en vrille (et comment l'éviter) — P3, très partageable en communauté saga.
- Étude de cas : la carte de LOTR dans Atlas Narratif — P3, appui visuel Discord/BookTok.

## Principes de séquençage
1. **Tout le M1-M2 prépare novembre.** Les 4 premiers articles (piliers P1) doivent être en ligne avant le pic pour commencer à ranker (le SEO paie en 3 à 6 mois).
2. **Novembre = double effort** : contenu NaNoWriMo (intention chaude) + lancement coordonné (la démo LOTR sans compte est l'aimant).
3. **Chaque article = 1 amorçage communauté** : on répond à une vraie question, on ne spamme pas le lien.
4. **Un visuel minimum par article** (schéma inline, capture annotée, ou GIF/vidéo). Voir la charte.
5. **Mesure** : suivre quel article amène des inscrits qui *reviennent* (rétention W4), pas les vues brutes. Doubler la mise sur le format qui convertit.

## Process de publication (rappel)
1. Rédaction selon `ai/marketing/blog-guidelines.md`.
2. Relecture **Expert Écriture de Blog** (`ai/agents/blog-editor.md`).
3. Relecture **Écrivain** (`ai/agents/writer.md`).
4. Intégration des retours des deux, ajout à `src/data/blog/posts.js`.
5. Ajout de l'URL dans `public/sitemap.xml` (robots autorise déjà `/blog`).
6. `npm run build` (prérend l'article pour le SEO) puis déploiement.
