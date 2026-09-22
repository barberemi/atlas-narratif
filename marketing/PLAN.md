# Plan de publication & partage — Atlas Narratif

> Le pendant **opérationnel** de l'artefact stratégique « Plan de communication & marketing ».
> Ici : **où**, **quand**, **quoi** — avec des contenus prêts à copier-coller.
>
> **Fenêtre : 22 sept. 2026 → fév. 2027.** Objectif : un premier noyau d'auteurs qui *reviennent*.

---

## ⚙️ À configurer avant de commencer (2 min)

Tous les contenus utilisent des placeholders. Fais un chercher-remplacer global dans le dossier `marketing/` :

| Placeholder | Remplacer par | Exemple |
|-------------|---------------|---------|
| `{{SITE_URL}}` | L'URL de prod (sans slash final) | `https://atlas-narratif.com` |
| `{{DEMO_URL}}` | Le lien démo LOTR | `{{SITE_URL}}/demo` |
| `{{PRENOM}}` | Comment tu te présentes | `Rémi` |
| `{{X_HANDLE}}` | Ton @ sur X | `@atlasnarratif` |

> ⚠️ Rappel de l'artefact : figer **« Atlas Narratif »** en deux mots partout, et corriger le `<title>` de l'app (dette SEO à chaque contenu publié avec la mauvaise graphie).

---

## 🎯 Les 3 règles qui gouvernent tout

1. **Aide d'abord, vends jamais.** Dans les communautés, on répond à des questions, on partage un article utile, on montre une démo *quand c'est pertinent*. Le lien vient en bonus, pas en accroche. Un post « regardez mon outil » = mort sociale + ban.
2. **Le lien qu'on partage = la démo, pas l'inscription.** `{{DEMO_URL}}` se voit en 10 s sans compte. On envoie les curieux vers ça en priorité, l'inscription vient après le « waouh ».
3. **Une seule voix : le pote scénariste.** Tutoiement, enthousiaste, jamais corporate. On parle *histoire* (« ton monde », « ta saga »), jamais *données*. Voir la charte de voix plus bas.

---

## 📍 OÙ — les canaux, par température

### 🔥 Canaux chauds (tu y es déjà, tu peux agir cette semaine)

| Canal | Ce qu'on y fait | Rythme | Règle d'or |
|-------|-----------------|--------|------------|
| **Discord** (serveurs écriture FR : Plume & Café, NaNoWriMo FR, BookTok) | Présence humaine, entraide, partage de la démo au bon moment | Quasi quotidien (léger) | Être un membre, pas une pub ambulante |
| **Reddit** (r/ecriture, r/fantasy_fr, r/Fantasy, r/worldbuilding) | Commentaires utiles + 1-2 posts « valeur » par mois | 2-3 commentaires/sem, 1 post/mois | Lis les règles self-promo de CHAQUE sub |
| **X / Twitter** (#TeamÉcriture, #ProjetÉcriture) | Démos visuelles, GIFs, threads, build-in-public | 3-5 posts/sem | Le visuel fait tout le travail |
| **Instagram / TikTok / BookTok** | Vidéos courtes « une histoire, 4 vues » | 1-2/sem | Format vertical, 15-30 s, hook en 2 s |
| **Facebook** (groupes « Écrire un roman », auteurs indés FR) | Partage d'articles + réponses | 1-2 posts/mois par groupe | Respecter les jours « promo » des groupes |

### ❄️ Canaux à activer sur un événement précis (pas en continu)

| Canal | Quand | Contenu |
|-------|-------|---------|
| **Product Hunt / BetaList / IndieHackers** | Lancement (début nov.) | Voir `contenus/lancement-produit.md` |
| **Blog SEO** (`{{SITE_URL}}/blog`) | Dès S2, 2 articles/mois | Voir `contenus/blog-seo.md` |
| **BookTubeurs / créateurs FR** | Oct.-nov. (Preptober/NaNo) | Démo offerte, angle « outil gratuit FR » |

---

## 🗓️ QUAND — la logique du calendrier

Détail semaine par semaine dans **[`CALENDRIER.md`](./CALENDRIER.md)**. La colonne vertébrale :

```
SEPT  ──▶  OCT (PREPTOBER)  ──▶  NOV (NaNoWriMo)  ──▶  DÉC-FÉV
prêt       LE moment de l'année   lancement public    convertir
           où les auteurs         + pic de trafic      l'afflux en
           PLANIFIENT un roman                          rétention
```

> 💡 **L'insight timing le plus important :** on parle toujours de *novembre* (NaNoWriMo = écriture), mais **octobre = « Preptober »**, le mois où les auteurs *planifient* leur roman. Or Atlas est un outil de **planification/structure**. **Octobre est donc encore plus sur-mesure que novembre.** On charge fort dès mi-octobre.

- **M1 (fin sept → oct)** : être prêt (landing, démo sans compte, 2 articles), s'installer dans les communautés *sans vendre*, recruter 5-10 beta-testeurs.
- **PIC (mi-oct → début nov)** : Preptober + lancement public coordonné.
- **M2 (déc → fév)** : convertir la vague en habitude (emails, partage de cartes, SEO qui commence à ranker), puis bilan.

---

## ✍️ QUOI — l'index des contenus (tout est rédigé, prêt à poster)

| Fichier | Contient |
|---------|----------|
| [`contenus/communautes.md`](./contenus/communautes.md) | Posts Discord / Reddit / Facebook : présentation, partage d'article, lancement |
| [`contenus/reseaux-sociaux.md`](./contenus/reseaux-sociaux.md) | X / Instagram / TikTok : posts courts, thread de lancement, scripts de vidéos |
| [`contenus/lancement-produit.md`](./contenus/lancement-produit.md) | Product Hunt / BetaList / IndieHackers : titre, tagline, description, 1er commentaire |
| [`contenus/emails-onboarding.md`](./contenus/emails-onboarding.md) | Séquence de 3 emails (bienvenue → 1er atlas → détection) |
| [`contenus/blog-seo.md`](./contenus/blog-seo.md) | Calendrier éditorial + 1er article rédigé en entier + plan du 2e |

---

## 🔎 Autres détails

### Mesurer sans tracker (cohérent avec la promesse privacy)
On n'installe **aucun** Google Analytics. On ajoute un suffixe `?ref=` aux liens partagés, lisible côté serveur (logs / PostgreSQL) :

| Lien à partager | Suffixe |
|-----------------|---------|
| Discord | `{{DEMO_URL}}?ref=discord` |
| Reddit | `{{DEMO_URL}}?ref=reddit` |
| X | `{{DEMO_URL}}?ref=x` |
| Facebook | `{{DEMO_URL}}?ref=fb` |
| Product Hunt | `{{SITE_URL}}?ref=ph` |
| Blog (CTA) | `{{SITE_URL}}?ref=blog` |

> 🛠️ *Petite tâche dev optionnelle mais rentable : logguer le param `ref` à l'inscription pour savoir quel canal amène des gens qui **restent** (pas juste qui cliquent).*

### La charte de voix — on dit / on ne dit pas
| ✅ On dit | ✕ On ne dit pas |
|-----------|-----------------|
| « Ne pars plus de la page blanche. » | « Notre solution optimise ton workflow. » |
| « Ton roman, enfin sous tes yeux. » | « Visualisez vos données narratives. » |
| « L'outil structure, c'est toi qui écris. » | « Notre IA génère ton intrigue. » |
| « Ton IA, tes données, ta plume. » | « Powered by AI. » |

Personnalité : **le pote scénariste qui a lu tous les bouquins de dramaturgie.** Érudit sur le craft (beats, arcs, amorces/payoffs), jamais professoral. Enjoué, direct, un peu complice.

### Les 3 objections à toujours désamorcer
1. **« Encore un truc qui écrit à ma place »** → *L'outil structure, tu écris. Zéro texte généré.*
2. **« Mes données / mon manuscrit »** → *Chiffré au repos, ton texte ne transite pas par nos serveurs pour l'analyse (c'est ton IA).*
3. **« C'est payant / freemium piège »** → *Gratuit, sans carte bancaire, auto-hébergeable.*

---

## ✅ Checklist Semaine 1 (22-28 sept.)

- [ ] Chercher-remplacer les placeholders (`{{SITE_URL}}`, `{{DEMO_URL}}`, etc.)
- [ ] Vérifier que `{{DEMO_URL}}` s'ouvre **sans compte** (sinon → priorité dev n°1)
- [ ] Figer « Atlas Narratif » + corriger le `<title>`
- [ ] Créer/soigner le compte X + bio (voir `reseaux-sociaux.md`)
- [ ] Rejoindre (ou réveiller) 3-4 communautés et s'y **présenter sans vendre**
- [ ] Enregistrer la démo vidéo 60-90 s (script dans `reseaux-sociaux.md`)
- [ ] Publier le 1er article de blog (rédigé dans `blog-seo.md`)

*(Le suivi complet est dans la description de la PR et dans `CALENDRIER.md`.)*
