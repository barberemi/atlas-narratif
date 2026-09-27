# Calendrier de publication : semaine par semaine

Dates réelles, du 22 sept. 2026 à fin février 2027. Coche au fur et à mesure.
Chaque contenu référencé est rédigé dans `contenus/`.

**Légende :** 🔴 priorité absolue · 🟠 important · ⚪ bonus · 📝 contenu à publier · 📣 partager un article · 💬 présence communautaire · 🛠️ tâche dev

## 📰 Blog : les articles sortent tout seuls

Les 14 articles sont déjà écrits et programmés dans le code (`src/data/blog/posts.js`, PR #18 et #30) : chacun apparaît sur `/blog` à sa date, **sans rien faire**. Ton travail n'est plus de *publier* mais de **partager** chaque article le jour de sa sortie (lignes 📣 ci-dessous), et de **redéployer** après chaque sortie pour que Google le voie (prerender + sitemap calculés au build).

| Sortie | Article | Où le partager en priorité |
|--------|---------|----------------------------|
| 10/09 ✅ | Comment structurer un roman | r/ecriture, Discord |
| 15/09 ✅ | La méthode Save the Cat (15 beats) | Reddit, groupe FB |
| 25/09 ✅ | Le Voyage du Héros : les 12 étapes | CoCyclics, X |
| 29/09 | Créer une timeline pour ton roman | Discord |
| 02/10 | Planifie ton roman de novembre | communautés du défi de novembre, X |
| 06/10 | La structure du Seigneur des Anneaux décortiquée | r/fantasy_fr, FB |
| 09/10 | Détecter les incohérences : la checklist | Discord (réponse à une question) |
| 13/10 | Gérer plusieurs tomes sans perdre le fil | r/fantasy_fr, groupes saga |
| 20/10 | Save the Cat ou Voyage du Héros ? | Reddit, FB |
| 03/11 | Amorces et paiements (plant & payoff) | Discord, X |
| 17/11 | Syndrome du tome 2 | groupes saga, r/fantasy_fr |
| 01/12 | Créer une bible d'univers | r/JeuxDeRole, worldbuilders |
| 15/12 | Outils gratuits pour écrire un roman en 2026 | X, FB |
| 12/01 | Créer la carte de ton roman (LOTR trajet par trajet) | Discord, BookTok |

---

## 🏗️ M1 : Fondations (fin sept. → oct.)

*But : que le produit se vende tout seul dès que tu le découvres, et s'installer dans les communautés en ami.*

### Semaine 1 · 22-28 sept.
- [x] 🔴 Config placeholders + vérifier démo sans compte + `<title>` (voir `PLAN.md`)
- [ ] 🔴 💬 Se présenter (sans vendre) dans : 1 Discord écriture FR, r/ecriture, 1 gros groupe FB, CoCyclics
- [ ] 🟠 Créer/soigner le compte X + bio (`reseaux-sociaux.md` § bio)
- [ ] 🟠 📣 Partager « Voyage du Héros » (sorti le 25/09) sur X ; garder « Structurer un roman » et « Save the Cat » (déjà en ligne) pour répondre aux questions en communauté
- [ ] ⚪ 🛠️ Remplacer l'`og-image.png` générique (« Structure ton roman. Garde ta plume. » + capture)

### Semaine 2 · 29 sept. - 5 oct.
- [ ] 🔴 Enregistrer la **vidéo démo 60-90 s** (script dans `reseaux-sociaux.md`)
- [ ] 🟠 📝 Poster la démo sur X + Instagram/TikTok (post « une histoire, 4 vues »)
- [ ] 🟠 💬 Reddit : 2-3 commentaires *utiles* (pas de lien) pour chauffer le compte
- [ ] ⚪ 📝 Programmer 3 posts X de la semaine (`reseaux-sociaux.md` § banque)
- [ ] 🟠 📣 29/09 : partager « Créer une timeline pour ton roman »
- [ ] 🔴 📣 02/10 : partager « Planifie ton roman de novembre » (X + communautés du défi : c'est le cœur du Preptober)
- [ ] ⚪ 🛠️ Redéployer après le 29/09 et le 02/10 (SEO)

### Semaine 3 · 6-12 oct. : *Preptober commence*
- [ ] 🔴 💬 Recruter 5-10 beta-testeurs dans les communautés (message dans `communautes.md` § beta)
- [ ] 🟠 📣 06/10 : partager « La structure du Seigneur des Anneaux décortiquée » (r/fantasy_fr, démo en lien)
- [ ] 🟠 📣 09/10 : « Détecter les incohérences » en réponse à une vraie question sur Discord
- [ ] 🟠 📝 X : mini-thread « Preptober : planifie ton roman avec une méthode »
- [ ] ⚪ 💬 Facebook : partager « Comment structurer un roman » dans 1-2 groupes (jour promo autorisé)

### Semaine 4 · 13-19 oct.
- [ ] 🔴 Récolter le feedback beta → lister les frictions d'onboarding
- [ ] 🟠 📝 Reddit r/ecriture : post « valeur » (retour d'expérience, pas pub : `communautes.md`)
- [ ] 🟠 📝 TikTok/Reels : 2e vidéo courte (angle « détecter les incohérences »)
- [ ] ⚪ 🛠️ Corriger les 2-3 pires frictions d'onboarding remontées
- [ ] 🟠 📣 13/10 : partager « Gérer plusieurs tomes sans perdre le fil » (groupes saga)

### Semaine 5 · 20-26 oct. : *cœur du Preptober*
- [ ] 🔴 📣 20/10 : partager « Save the Cat ou Voyage du Héros ? » (le choix de méthode juste avant novembre)
- [ ] 🔴 📝 Thread X « Planifie ton roman de novembre » (reprend l'article du 02/10) + post communautés
- [ ] 🟠 Récolter 3-4 témoignages beta → les mettre sur la landing
- [ ] 🟠 Préparer le kit de lancement (`lancement-produit.md`) : textes, visuels, comptes créés

---

## 🚀 PIC : Lancement public (fin oct. → nov.)

*But : capter la vague du défi d'écriture de novembre (ex-NaNoWriMo → Novel November & défis des communautés FR). Des milliers d'auteurs FR planifient un roman.*

### Semaine 6 · 27 oct. - 2 nov. : *veille du lancement*
- [ ] 🔴 Finaliser le kit Product Hunt (visuels, tagline, 1er commentaire prêt)
- [ ] 🔴 Programmer le post de lancement pour le **1er nov.** (jour 1 du défi d'écriture de novembre)
- [ ] 🟠 Prévenir les beta-testeurs → leur demander un upvote/partage le jour J
- [ ] 🟠 💬 Chauffer : teaser « demain je lance » sur X + Discord

### Semaine 7 · 3-9 nov. : 🎉 **LANCEMENT**
- [ ] 🔴 📝 **Product Hunt / BetaList / IndieHackers** (`lancement-produit.md`)
- [ ] 🔴 📝 Posts de lancement soignés : r/ecriture, gros groupes FB, Discords (`communautes.md` § lancement)
- [ ] 🔴 📝 Thread de lancement X (`reseaux-sociaux.md` § thread lancement)
- [ ] 🟠 💬 Répondre à TOUS les commentaires le jour J (dispo max)
- [ ] 🟠 Solliciter 1-2 BookTubeurs/créateurs FR pour une démo
- [ ] 🟠 📣 03/11 : partager « Amorces et paiements » (Discord, X) : bon contenu de valeur en pleine semaine de lancement

### Semaine 8 · 10-16 nov.
- [ ] 🟠 💬 Partager les premiers retours/chiffres du lancement (build-in-public)
- [ ] ⚪ 📝 Reddit : « la structure de LOTR décortiquée » (démo déguisée : `communautes.md`)

### Semaine 9 · 17-23 nov.
- [ ] 🟠 Activer la **séquence email onboarding** (`emails-onboarding.md`) pour les nouveaux
- [ ] ⚪ 📝 X : retours d'usage, captures d'utilisateurs (avec accord)
- [ ] ⚪ 💬 Répondre aux questions dans les communautés (le trafic de novembre bat son plein)
- [ ] 🟠 📣 17/11 : partager « Syndrome du tome 2 » (groupes saga, r/fantasy_fr)

### Semaine 10 · 24-30 nov.
- [ ] ⚪ Bilan intermédiaire : quels canaux ont amené des inscrits qui *reviennent* ?

---

## 🌱 M2 : Convertir la vague en habitude (déc. → fév.)

*But : transformer l'afflux de novembre en rétention et en ambassadeurs.*

### Déc. (S11-14)
- [ ] 🟠 Vérifier/roder la séquence email (bienvenue → 1er atlas → détection)
- [ ] 🟠 📣 01/12 : partager « Créer une bible d'univers » (r/JeuxDeRole, worldbuilders)
- [ ] 🟠 📣 15/12 : partager « Outils gratuits pour écrire un roman en 2026 » (X, FB)
- [ ] ⚪ 🛠️ Boucle 2 : partage public d'une carte/bible avec badge « Créé avec Atlas Narratif »
- [ ] ⚪ Analyser la 1re rétention W4 des inscrits de novembre

### Janv. (S15-18)
- [ ] 🟠 Envisager un espace communautaire (canal Discord Atlas + roadmap ouverte)
- [ ] 🟠 📣 12/01 : partager « Créer la carte de ton roman » (Discord, BookTok : très visuel)
- [ ] 🟠 Mesurer le trafic des 1ers articles (ils commencent à ranker) ; décider des prochains sujets
- [ ] ⚪ 📝 Contenu social proof « La structure de LOTR dans Atlas »

### Fév. (S19-22) : *Bilan & décision*
- [ ] 🔴 Bilan KPIs : nb d'actifs récurrents ? rétention W4 ? canaux qui retiennent ?
- [ ] 🟠 Doubler la mise sur le canal qui marche, **couper** le reste
- [ ] ⚪ Si noyau engagé → commencer à réfléchir à la monétisation (freemium)

---

## 📊 Les chiffres à noter (1 ligne/mois dans un tableur suffit)

| Métrique | Cible 6 mois |
|----------|--------------|
| Activation (inscrits → vrai projet) | ≥ 40 % |
| Rétention W4 | ≥ 20 % |
| Noyau actif (revient ≥ 2×/mois) | 50-100 |
| Time-to-value (inscription → 1er projet) | < 10 min |
| Part d'inscrits via lien de partage/démo | en hausse |

> 50 auteurs qui reviennent chaque semaine valent plus que 5 000 inscriptions mortes.
