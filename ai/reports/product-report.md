# Atlas Narratif — Rapport Produit Expert
_Analyse complète · Mars 2026_

---

## 1. Ce que fait l'application aujourd'hui

Atlas Narratif est un **outil d'architecture narrative offline-first** pour auteurs. Il repose sur PGlite (PostgreSQL embarqué dans le navigateur), sans backend, avec persistance locale via OPFS.

### Fonctionnalités existantes

| Module | Ce qu'il fait |
|---|---|
| **Dashboard** | Vue d'ensemble : compteurs d'entités, jauges de cohérence, rythme par chapitre |
| **Lore** | Base de données des entités (personnages, lieux, objets) avec fiches détaillées |
| **Relations** | Graphe interactif des liaisons entre entités (D3 canvas, navigation par entité) |
| **Timeline** | Événements triés par chapitre, détection de conflits de présence simultanée |
| **Incohérences** | Détection automatique de 8 types d'incohérences, 4 niveaux de sévérité, marquage résolu |
| **Save the Cat** | Placement des 15 beats narratifs sur les chapitres, frise réel vs idéal, alertes de déviation |
| **Carte** | Trajectoires de personnages avec slider temporel sur une carte de l'univers |
| **Import/Export** | Analyse de manuscrit via Claude API → extraction structurée, backup/restore JSON |

### État actuel : le pivot vient d'être fait

L'ancien rapport (mars 2026) notait que l'app était un démonstrateur statique LOTR. Ce n'est plus le cas. Le projet a fait le saut vers une vraie base de données multi-projets avec import IA réel, stores Zustand, CRUD des chapitres STC, et export/import JSON opérationnel. **Le prototype est devenu un vrai produit.**

---

## 2. Les deux profils utilisateurs

### Profil A — L'auteur "post-manuscrit" (Auditeur narratif)
> Il a terminé (ou bien avancé) son œuvre. Il veut **analyser ce qu'il a écrit** : vérifier la cohérence, voir si la structure tient, identifier les angles morts.

**Besoins :**
- Importer rapidement son manuscrit et obtenir une analyse fiable
- Détecter les incohérences et pouvoir les corriger
- Comprendre la distribution des personnages et lieux
- Valider que sa structure narrative correspond à son intention

**Parcours naturel :** Import → Dashboard → Incohérences → Lore → Relations

---

### Profil B — L'auteur "en cours d'écriture" (Architecte narratif)
> Il construit son histoire. Il veut **être guidé** dans ses choix : structure, équilibre des personnages, progression des beats.

**Besoins :**
- Savoir où il en est dans les 15 beats et ce qui manque
- Enrichir son univers au fil de l'écriture (ajout d'entités, d'événements)
- Être alerté en temps réel si quelque chose ne tient pas
- Avoir une vision macro de son récit en construction

**Parcours naturel :** Save the Cat → Lore (ajout progressif) → Timeline → Incohérences

---

## 3. Analyse Forces / Faiblesses

### Forces actuelles

- **Architecture technique solide** : PGlite offline, multi-projets, import IA, export/import JSON — rare sur le marché des outils auteurs
- **Détection d'incohérences automatique** : 8 types détectés algorithmiquement, niveaux de sévérité, entités cliquables — très différenciant
- **Save the Cat intégré** : le seul outil qui lie les beats narratifs à des chapitres réels avec alertes visuelles
- **Graphe de relations** : canvas D3 performant, navigation par entité avec historique
- **Timeline avec détection de conflits** : personnages simultanément à deux endroits, flagué automatiquement
- **Carte avec trajectoires** : visualisation géographique des personnages avec slider temporel
- **Design cohérent et soigné** : dark mode, palette maîtrisée, UX fluide

### Faiblesses — Profil A (post-manuscrit)

- **L'import IA est opaque** : l'auteur ne sait pas ce que Claude a extrait, ne peut pas corriger les erreurs d'interprétation avant insertion en base
- **Les incohérences ne sont pas actionnables** : marquer "résolu" n'ouvre pas l'entité concernée, pas de lien direct vers l'éditeur
- **Pas de re-scan** : après avoir corrigé une entité, impossible de relancer l'analyse d'incohérences
- **Le Dashboard est descriptif, pas prescriptif** : des chiffres sans recommandation concrète

### Faiblesses — Profil B (en cours d'écriture)

- **Pas de CRUD entités** : impossible d'ajouter un personnage, un lieu ou un événement sans réimporter tout le manuscrit — bloquant pour un auteur qui construit progressivement
- **Pas de CRUD événements Timeline** : la timeline est en lecture seule
- **Save the Cat ne guide pas assez** : les alertes signalent un problème mais n'expliquent pas ce qu'est chaque beat ni comment le traiter
- **Pas de mode "planning"** : impossible d'anticiper les chapitres futurs et d'y assigner des beats avant de les écrire

### Faiblesses structurelles

- **Onboarding inexistant** : un nouvel utilisateur face à une page vide sans projet ne sait pas quoi faire
- **Pas de recherche globale** : impossible de chercher "Frodon" dans tous les modules simultanément
- **La carte est difficilement généralisable** : les trajets viennent de l'import IA, non éditables manuellement
- **Pas de progression visible** : aucun indicateur "tu en es à X% de ton histoire"

---

## 4. Recommandations produit (priorisées)

### PRIORITÉ 1 — Onboarding et deux parcours distincts _(bloquant pour l'adoption)_

**Problème** : La page d'accueil est identique pour les deux profils. Un auteur qui commence son histoire et un auteur qui analyse un manuscrit terminé ont des besoins opposés.

**Recommandations :**
- **Page d'accueil bifurquée** : deux chemins explicites — "Analyser mon manuscrit" (Profil A) et "Construire mon histoire" (Profil B)
- **Checklist post-import** : après l'analyse IA, afficher "3 choses à faire en premier" guidant vers les incohérences critiques, les beats manquants, les entités orphelines
- **Projet exemple** inclus et clairement labelisé : permet d'explorer les fonctionnalités sans importer quoi que ce soit

---

### PRIORITÉ 2 — CRUD des entités dans le Lore _(critique pour le Profil B)_

**Problème** : Impossible d'ajouter ou modifier un personnage, lieu ou objet sans réimporter tout le manuscrit.

**Recommandations :**
- **Formulaires d'ajout** dans chaque onglet du Lore (même UX que ChapterEditor déjà en place pour Save the Cat)
- **Édition inline** des fiches entités existantes
- **Suppression avec vérification des dépendances** : alerter si l'entité est référencée dans des événements ou des incohérences
- **CRUD événements Timeline** : ajouter, modifier, supprimer des événements directement dans la timeline

---

### PRIORITÉ 3 — Import IA avec écran de révision _(confiance utilisateur)_

**Problème** : L'auteur confie son manuscrit à l'IA et obtient un résultat sans savoir comment il a été interprété. Les erreurs d'extraction sont invisibles jusqu'à ce qu'on les découvre dans le Lore.

**Recommandations :**
- **Écran de révision post-import** : liste structurée de tout ce qui a été extrait (X personnages, Y lieux, Z événements), avec possibilité de valider/modifier/supprimer avant insertion
- **Indicateur de confiance** par entité : Claude sait s'il est "certain" ou "probable" — l'afficher
- **Import incrémental** : ajouter de nouveaux chapitres à un projet existant sans tout réimporter
- **Rapport d'import permanent** : accessible après coup dans les paramètres du projet

---

### PRIORITÉ 4 — Incohérences actionnables _(valeur core du produit)_

**Problème** : Les incohérences sont bien détectées mais pas exploitables. Marquer "résolu" est une note sans impact sur les données.

**Recommandations :**
- **Bouton "Aller corriger"** : depuis une incohérence, ouvrir directement la fiche entité ou l'événement concerné en mode édition
- **Note de résolution** : champ texte optionnel pour documenter comment le problème a été réglé dans le texte
- **Re-scan automatique** : après modification d'une entité, proposer de relancer l'analyse
- **Historique des incohérences résolues** : voir les corrections passées avec dates

---

### PRIORITÉ 5 — Dashboard prescriptif _(de l'observation à l'action)_

**Problème** : Le Dashboard affiche des métriques mais ne dit pas à l'auteur ce qu'il doit faire ensuite.

**Recommandations :**
- **Score global "Santé narrative"** : un seul chiffre composite visible en premier (incohérences non résolues × sévérité + beats manquants + entités orphelines)
- **Top 3 recommandations** générées automatiquement : "2 incohérences critiques à corriger", "Beat Midpoint manquant", "Frodon absent des chapitres 4-7"
- **Vue densité par chapitre** : visualiser les chapitres vides vs surchargés en événements
- **Évolution dans le temps** : si l'auteur revient après corrections, montrer la progression du score

---

### PRIORITÉ 6 — Save the Cat enrichi _(différenciateur clé pour Profil B)_

**Problème** : Le module alerte sur les déviations mais ne guide pas l'auteur qui ne connaît pas bien le framework.

**Recommandations :**
- **Description expandable de chaque beat** : définition, questions à se poser, exemples dans des œuvres connues (Harry Potter, Star Wars, etc.)
- **Suggestion de placement** : "D'après votre structure actuelle, ce beat devrait idéalement être au chapitre N"
- **Lien bidirectionnel Beat ↔ Timeline** : depuis un beat, voir les événements du chapitre correspondant ; depuis un événement, voir à quel beat il appartient
- **Mode "planning"** : créer des chapitres futurs avec beats pré-assignés avant d'avoir le contenu, pour structurer l'écriture à venir
- **Templates alternatifs** : au-delà de Save the Cat, proposer Le Voyage du Héros, la structure en 3 actes

---

### PRIORITÉ 7 — Recherche globale _(confort d'utilisation)_

**Problème** : Trouver toutes les occurrences d'une entité dans l'application nécessite de naviguer module par module.

**Recommandations :**
- **Barre de recherche globale** (raccourci ⌘K / Ctrl+K) : chercher "Frodon" et voir ses apparitions dans le Lore, la Timeline, les Incohérences et le Save the Cat
- **Résultats groupés par module** avec navigation directe en un clic
- **Recherche dans les descriptions** et pas seulement les noms

---

## 5. Idées différenciantes à explorer (moyen terme)

Ces fonctionnalités pourraient constituer un avantage concurrentiel fort sur le marché des outils auteurs :

| Idée | Valeur | Difficulté |
|---|---|---|
| **Arc émotionnel** | Courbe de tension dramatique chapitre par chapitre, générée ou saisie manuellement | Moyenne |
| **Voix des personnages** | Analyser si chaque personnage a un registre distinct dans les dialogues | Haute |
| **Comparaison de structures** | Overlay de la structure réelle vs la structure idéale STC sur un même graphe | Faible |
| **Timeline réelle** | Frise avec dates dans l'univers fictif (ex: "Jour 3 du Voyage") en plus du découpage chapitres | Moyenne |
| **Import incrémental IA** | Analyser un nouveau chapitre et l'ajouter au projet sans tout réimporter | Moyenne |
| **Export vers Scrivener/Notion** | Sync bidirectionnelle avec les outils d'écriture existants | Haute |
| **Mode collaboratif** | Plusieurs auteurs sur un même projet via partage de backup JSON | Faible (déjà 90% du chemin fait avec l'export) |

---

## 6. Traçabilité de la source des entités (décision produit)

### Contexte de la décision

Le produit cible à la fois la pré-écriture et la post-écriture. Cela implique que des entités peuvent être :
- **extraites automatiquement** du manuscrit par l'IA (ce qui est dans le texte)
- **ajoutées manuellement** par l'auteur dans l'outil (idées, personnages planifiés, corrections)
- **modifiées à la main** après un import (corrections de l'interprétation IA, ou mise à jour intentionnelle)

**Principe directeur : le manuscrit est la source de vérité.** Tout ce qui en est extrait est "canonique". Tout ce qui est ajouté ou modifié manuellement est une "intention" de l'auteur, distincte du texte réel.

### Modèle de provenance proposé

Ajouter un champ `source` sur chaque entité (personnage, lieu, objet, événement) :

| Valeur | Signification | Icône suggérée |
|---|---|---|
| `import` | Extrait automatiquement du manuscrit par l'IA | `📄 Import IA` |
| `manual` | Créé manuellement dans l'outil par l'auteur | `✏️ Ajout manuel` |
| `modified` | Importé puis modifié à la main (au moins un champ) | `📄✏️ Modifié` |

### Valeur par profil

**Profil A (post-manuscrit)** : les entités `modified` constituent une **liste de corrections à reporter dans le manuscrit réel**. L'auteur voit immédiatement ce qu'il a corrigé dans l'outil mais n'a pas encore mis à jour dans son fichier texte. C'est un pont entre l'analyse et la réécriture.

**Profil B (en écriture)** : les entités `manual` sont les "idées encore dans la tête" — personnages planifiés, lieux imaginés mais pas encore écrits. Les entités `import` sont ce qui existe dans le texte. La distinction permet de savoir à tout moment : *"qu'est-ce qui est dans mon manuscrit vs ce qui est encore un projet ?"*

### Question de design à trancher

Deux niveaux de granularité possibles pour `modified` :

- **Simple** : dès qu'un champ est modifié, le statut passe à `modified`. Rapide à implémenter, suffit pour 80% des cas.
- **Diff champ par champ** : stocker la valeur originale extraite par l'IA et la comparer à la valeur actuelle. Permet d'afficher exactement ce qui a changé ("nom original : Gandalf le Gris → modifié en : Gandalf le Blanc"). Plus riche, plus complexe.

**Recommandation** : commencer par la version simple (`source` = import / manual / modified), avec un champ `original_data` JSON stockant le snapshot au moment de l'import. Le diff précis peut être calculé à la demande sans complexifier le modèle de données.

### Implications UI

- **Badge de source** sur chaque fiche entité dans le Lore (discret, en haut à droite)
- **Filtre par source** dans le Lore browser : `Tous / Importés / Manuels / Modifiés`
- **Section dédiée dans le Dashboard** : "X entités modifiées depuis l'import" → liste des corrections à reporter dans le texte
- **Indicateur sur le menu Lore** : un badge `N modifiés` pour signaler qu'il y a des écarts entre l'outil et le manuscrit

---

## 7. Métriques à suivre (si analytics implémentées)

- **Taux de complétion de l'onboarding** : % d'utilisateurs avec au moins 1 projet avec des données réelles
- **Incohérences résolues** : % d'incohérences marquées résolues par projet (proxy de l'engagement)
- **Rétention à J+7** : l'auteur revient-il après l'analyse initiale ?
- **Beats placés** : % de projets avec au moins 10/15 beats placés (indique un usage actif du STC)
- **Entités ajoutées manuellement** (après implémentation du CRUD) : signal que l'auteur construit activement son univers

---

## 7. Feuille de route recommandée

```
Phase 1 — Fondations utilisateur (bloquant pour usage réel)
├── CRUD entités dans le Lore (personnages, lieux, objets)
├── CRUD événements dans la Timeline
├── Onboarding bifurqué (2 parcours distincts dès la home)
└── Écran de révision post-import IA

Phase 2 — Valeur core (ce qui fidélise)
├── Incohérences actionnables (lien direct vers édition)
├── Dashboard prescriptif (recommandations, score global)
├── Recherche globale (⌘K)
└── Re-scan d'incohérences après modification

Phase 3 — Différenciation (ce qui crée l'attachement)
├── Save the Cat enrichi (descriptions beats, mode planning)
├── Import incrémental (nouveaux chapitres sur projet existant)
└── Arc émotionnel / courbe de tension narrative
```

---

## 8. Synthèse

Atlas Narratif a franchi le cap le plus difficile : passer d'un démonstrateur statique à un vrai produit avec base de données, import IA fonctionnel et persistence locale. La fondation est solide et différenciante.

Le **principal levier de croissance** est de passer d'un outil d'**observation** ("voici ce que votre histoire contient") à un outil de **guidance** ("voici ce que vous devriez faire ensuite, et voici comment le faire depuis ici"). Ce passage — notamment via le CRUD des entités et les incohérences actionnables — transformera Atlas Narratif en compagnon d'écriture indispensable plutôt qu'en tableau de bord consultatif.

Le deuxième levier est l'**onboarding** : les deux profils utilisateurs doivent se reconnaître dès la page d'accueil et trouver immédiatement leur chemin. Aujourd'hui, un auteur qui commence son roman depuis zéro est aussi perdu qu'un auteur qui veut analyser un manuscrit terminé.

---

_Rapport généré automatiquement par analyse du codebase — Mars 2026_
