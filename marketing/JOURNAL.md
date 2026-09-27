# Journal de bord

Notre seule « mesure » (pas d'analytics dans le code) : ce qu'on a fait, ce qu'on a publié, ce que ça a donné. Je le mets à jour après chaque séance.

---

## ✅ Déjà fait

### Préparation (sept. 2026)
- **Plan de com'** : plan, calendrier, canaux et tous les contenus rédigés dans `marketing/` (PR #28).
- **Plan copilote réseaux** validé le 27/09 (`COPILOTE-RESEAUX.md`), avec la règle n°1 : on écrit comme un humain.
- **Calendrier** réaligné le 27/09 sur les articles programmés : on ne « publie » plus les articles, on les **partage** le jour de leur sortie.
- **Product Hunt** : formulation corrigée, on ne demande jamais d'upvotes (interdit par PH).

### Blog : 14 articles écrits et programmés
- **En ligne** : Comment structurer un roman (10/09), Save the Cat (15/09), Voyage du Héros (25/09).
- **Programmés, ils sortent tout seuls** : timeline (29/09), roman de novembre (02/10), structure du Seigneur des Anneaux (06/10), incohérences (09/10), plusieurs tomes (13/10), Save the Cat ou Voyage du Héros (20/10), amorces et paiements (03/11), syndrome du tome 2 (17/11), bible d'univers (01/12), outils gratuits (15/12), carte du Seigneur des Anneaux (12/01).
- **Article du 02/10 renommé** : « NaNoWriMo » (l'association a fermé en 2025) devient « Planifie ton roman de novembre » (PR #30).
- 6 nouvelles captures annotées de la démo, un schéma par article, deux relectures (SEO puis plume).

### Démo et base de données
- **Démo LOTR corrigée** (PR #30) : amorces en double supprimées, les Ents femelles comme vraie amorce en suspens, Merry retiré de la Porte Noire, Armée des Morts libérée à Pelargir, trajet d'Aragorn par le Marais des Moucherons.
- **Base** (PR #31) : cascade des tables de jonction (migration 007, sans effet en prod qui est saine) et correctifs des 24 démos déjà chargées en prod (migration 008).

### Réseaux
| Date | Canal | Quoi | Lien | Réactions à J+2 | Notes |
|------|-------|------|------|-----------------|-------|
| 28/09 | X | Bio mise à jour | profil `@Rem_Barbe` | (à noter) | Bio de 160 car. (`reseaux-sociaux.md`) |
| 28/09 | X | Bannière | profil `@Rem_Barbe` | | `marketing/visuels/x-banniere.png` |
| 28/09 | X | Post épinglé (carte de la démo + lien) | https://x.com/Rem_Barbe/status/2104329449588109525 | (à noter) | |
| 28/09 | Discord · Pluméa | Présentation (forum vos-présentations, titre `cromelu`, sans lien) | https://discord.com/channels/1027089727360344144/1553906254424838294 | (à noter) | Angle « j'écris une saga fantasy en 3 tomes, plein de notes, peu de structure », outil cité en une ligne |

---

## 🌙 Bilan de la séance du 28/09 (soir)

**Fait**
- X : lien du post épinglé noté.
- Discord : 3 serveurs rejoints (Pluméa, J'écris un Roman, Forum des Auteurs), règlements lus (tableau plus bas).
- Pluméa : présentation postée, coucou dans #bienvenue, accueil 3/3 terminé, réponses aux présentations de Soren-L et Sakyuma.

**Ce qu'on a appris**
- Le ton qui passe : familier, oral, « t'as », « ahah », une question à la fin. Les petites phrases perso que tu ajoutes toi-même (« si il y a bien une partie sur laquelle je suis nul… ») sont ce qui marche le mieux.
- Pluméa est le serveur le plus vivant : une présentation reçoit vite 3 à 6 réponses. C'est là qu'il faut s'installer en priorité.
- Pluméa progresse au donnant-donnant : bêta-lectures (1 000 mots lus = 1 jeton = 1 000 mots postés) et participation aux forums pour obtenir le rôle @Pluméen (liens, images, fichiers).
- Autopromo : la transparence est obligatoire (voir l'épisode plume-locale plus bas) et rien avant d'être connu.

**Demain matin (mardi 29/09), dans l'ordre**
1. Pluméa : lire les réponses à ta présentation et à tes commentaires (Soren, Sakyuma), y répondre. Je peux préparer les brouillons.
2. Pluméa : jeter un œil à **forum-écriture** et répondre à 1 ou 2 questions de structure / d'arcs / d'intrigue, sans parler de l'outil.
3. J'écris un Roman : poster la présentation (texte en bas du journal).
4. Le soir : fil timeline sur X, puis `make prod-deploy` après la sortie de l'article.

**Idée pour plus tard** : Atlas importe déjà les vaults Obsidian, et beaucoup d'auteurs sur Pluméa gardent leur univers dans Obsidian. C'est l'angle le plus naturel pour le premier partage de l'outil (S3), et peut-être un futur article de blog (« Ton univers est dans Obsidian ? Voilà comment le structurer »).

---

## 📅 À faire les prochains jours

### ⚠️ Avant jeudi 02/10
- [x] **PRs #30 et #31 mergées** (28/09).
- [ ] **Vérifier qu'elles sont bien déployées en prod** (`make prod-deploy` si ce n'est pas fait), sinon l'article du 02/10 sort avec l'ancien titre « NaNoWriMo ».

### Mardi 29/09
- [ ] **Discord · J'écris un Roman** : poster la présentation dans #presentez-vous (texte prêt en bas, **rien sur l'outil**).
- [ ] **Le soir** : publier le **fil timeline** sur X (4 posts, texte prêt ci-dessous). L'article « Créer une timeline pour ton roman » sort le même jour : le post 4 pointe dessus.
- [ ] Après la sortie de l'article : redéployer (`make prod-deploy`) pour que Google le voie.

### Mercredi 30/09
- [ ] **Discord · Forum des Auteurs** : cliquer « Terminer » (étapes d'accueil), puis poster la présentation dans #présentation-nouveaux (texte prêt en bas).

### Dans la semaine (S2)
- [ ] **Séance 2 · Discord** (commencée le 28/09) : 3 serveurs rejoints, règlements lus, présentation Pluméa postée. Reste J'écris un Roman (mar. 29/09) et Forum des Auteurs (mer. 30/09), détail ci-dessous.
- [ ] **Séance 3 · Reddit** (30 min) : vérifier ton compte, lire les règles de r/ecriture, 3 commentaires vraiment utiles, sans lien.
- [ ] **Séance 4 · Facebook + CoCyclics** (30 min) : 1-2 gros groupes d'auteurs (repérer leur jour « promo ») et présentation sur CoCyclics.
- [ ] **Vidéo démo** (30 min) : je déroule la démo, tu enregistres l'écran (`Cmd + Shift + 5`), je te donne les sous-titres.

### Jeudi 02/10
- [ ] **Rituel « jour de sortie »** : partager « Planifie ton roman de novembre » sur X et dans les communautés du défi de novembre. L'article le plus important d'octobre (Preptober).

### Décisions en attente
- [ ] **LinkedIn** : 3 posts aux moments clés (maintenant, au lancement, bilan en février), ou rien ?
- [ ] **Product Hunt** : dimanche 1er novembre (jour 1 du défi d'écriture) ou mardi 3 (meilleur trafic) ?

### Chaque semaine
- [ ] **Séance réponses** (20 min, le lundi par exemple) : on lit tes notifications et je te propose des réponses.
- [ ] Remplir la colonne « Réactions à J+2 » ci-dessus.

---

## 💬 Discord : ce qu'on sait des serveurs (lu le 28/09)

| Serveur | Activité | Parler de l'outil ? | À savoir |
|---------|----------|---------------------|----------|
| **Pluméa** | Très actif (plusieurs présentations par jour, ~10 réponses chacune) | Oui **dans la présentation** uniquement. Pub interdite ailleurs, même en MP | Titre du post = identifiant Discord. Mode lent (1 post / 6 h). Liens et fichiers bloqués jusqu'à ~100 messages (hors catégorie « Espace pluméen »). Salons verrouillés à viser : **logiciels-et-outils**, **question-spécifique-cohérence**. Commentaires générés par IA interdits. |
| **J'écris un Roman** | Calme (1 présentation tous les 3-4 jours) | **Non** : « auto-promotion, liens et posts hors écriture » interdits | Serveur d'une école d'écriture payante (qui y place ses formations). Pas de conseil non sollicité. Salons utiles : #brainstorming-public, #ecriture-public, #espressmot (lives le mercredi 20 h). |
| **Forum des Auteurs** | Faible (1-2 présentations / mois), beaucoup de scénaristes | Oui, avec retenue : un membre qui présentait son app a été renvoyé vers le salon **logiciels** | Étapes d'accueil à terminer avant de pouvoir écrire. |

**Suite Discord (S2 → S3)**
- [x] Pluméa : coucou posté dans #bienvenue (28/09).
- [ ] Pluméa : répondre à chaque commentaire sur la présentation.
- [x] Pluméa : réponses aux présentations de Soren-L (saga 3-4 tomes) et Sakyuma (univers fantasy depuis le collège), 28/09.
- [x] Pluméa : accueil terminé (3/3). Les salons Écriture sont **lisibles et on peut y répondre** ; il faut le rôle @Pluméen pour les liens, images et fichiers.
- **Salon logiciels-et-outils (lu le 28/09)** : peu actif (6 posts, le dernier le 24/09). Beaucoup d'utilisateurs d'**Obsidian** (notes, univers, cohérence), sinon Word / GDoc. En mai, un membre a posté le lien de son propre outil (plume-locale) comme s'il n'en était pas l'auteur : un membre l'a repris publiquement (« ne fais pas semblant que c'est pas de toi ») et DraftBot a réagi. **Règle : toujours dire que c'est ton outil**, et pas avant d'être connu sur le serveur.
- [ ] Plus tard (S3, rôle Pluméen) : un post « partage & témoignage » dans logiciels-et-outils, transparent (« j'ai codé ça pour ma saga »). Angle : l'import de vault Obsidian, puisque beaucoup y gardent leur univers.
- [ ] Être présent quelques minutes par jour : répondre à des questions de structure, d'arcs, d'amorces (ton terrain), sans parler de l'outil.
- [ ] Viser ~100 messages utiles sur Pluméa pour débloquer les liens et les salons logiciels / cohérence.
- [ ] S3 : premier partage (appel à beta-testeurs, `communautes.md` § 2) **seulement** sur Pluméa (salon logiciels-et-outils) et Forum des Auteurs (salon logiciels). Jamais sur J'écris un Roman.

---

## 📝 Prêt à publier

### Fil timeline (X, mardi 29/09 au soir)
Écrire le post 1, puis « + » pour ajouter les suivants, et tout publier d'un coup.

**Post 1** (image : `timeline-roman.png`, dossier `~/Desktop/atlas-x/`)
```
À un moment, j'ai perdu le fil de ma propre histoire. Qui savait quoi, qui était où, depuis quand un perso avait disparu…

Alors j'ai tout mis sur une timeline : un chapitre par colonne, les scènes dedans, les persos sur chaque scène.

Je raconte ici comment je construis l'outil.
```

**Post 2**
```
Le truc qui me sert le plus : filtrer par personnage.

Tu vois d'un coup les chapitres où il disparaît. Sur la démo Seigneur des Anneaux, Gandalf s'efface après la Moria (ch. 7) et revient au ch. 13.

Chez Tolkien, ce trou est voulu. Dans mon manuscrit, pas toujours.
```

**Post 3**
```
Côté code, le plus dur a été le glisser-déposer des scènes.

Bouger une scène dans son chapitre, facile. La faire passer au chapitre suivant sans casser l'ordre de tout le reste, beaucoup moins. Ça m'a pris bien plus longtemps que prévu.
```

**Post 4**
```
J'ai écrit un article sur la méthode, outil ou pas (le papier marche aussi) :
https://atlas-narratif.com/blog/creer-une-timeline-roman

Et pour voir la timeline du Seigneur des Anneaux en entier, sans créer de compte :
https://atlas-narratif.com
```

À vérifier avant : les tournures perso (« j'ai perdu le fil », « dans mon manuscrit », « plus longtemps que prévu ») doivent être vraies pour toi.

### Présentation J'écris un Roman (mardi 29/09, #presentez-vous)
```
Salut tout le monde ! Moi c'est Rémi, je bosse sur une saga de fantasy en trois tomes. J'ai des carnets entiers sur mes persos et mon monde, mais côté structure c'est le gros bazar ahah 😅 Je passe pour les espressmots et le brainstorming, faut que je transforme tout ça en vraie histoire. Et vous, vous êtes sur quoi en ce moment ?
```

### Présentation Forum des Auteurs (mercredi 30/09, #présentation-nouveaux)
```
Salut à tous ! Moi c'est Rémi, je bosse sur une saga de fantasy en trois tomes. De la matière j'en ai à revendre, de la structure beaucoup moins ahah. Du coup je suis devenu un peu maniaque des beats, des arcs et des amorces qu'il faut bien payer un jour. Je suis dev à côté, alors j'ai fini par me bricoler un outil pour m'y retrouver, je le montrerai dans le salon logiciels quand j'aurai pris mes marques. Vous vous organisez comment, vous ?
```
