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
| 28/09 | X | Post épinglé (carte de la démo + lien) | (à coller) | (à noter) | |

---

## 📅 À faire les prochains jours

### ⚠️ Avant jeudi 02/10
- [ ] **Merger et déployer la PR #30** (sinon l'article du 02/10 sort avec l'ancien titre « NaNoWriMo »). Faire `make prod-backup` avant. La PR #31 peut partir en même temps.

### Mardi 29/09
- [ ] **Le soir** : publier le **fil timeline** sur X (4 posts, texte prêt ci-dessous). L'article « Créer une timeline pour ton roman » sort le même jour : le post 4 pointe dessus.
- [ ] Après la sortie de l'article : redéployer (`make prod-deploy`) pour que Google le voie.
- [ ] Optionnel : bannière X (`marketing/visuels/x-banniere.png`) si ce n'est pas encore fait.

### Dans la semaine (S2)
- [ ] **Séance 2 · Discord** (45 min) : tu rejoins 2-3 serveurs (J'écris un Roman, Pluméa, Forum des Auteurs), je lis leurs règles et j'adapte ta présentation, sans lien.
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

