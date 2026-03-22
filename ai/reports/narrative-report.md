# Rapport narratif — Atlas Narratif
*Audit des fonctionnalités manquantes — perspective agent narratif*
*Mise à jour : 2026-03-26*

---

## État actuel (ce qui est bien couvert)

L'app couvre correctement :
- **Structure** : Save the Cat 15 beats avec alertes et frise visuelle, Arc émotionnel par chapitre
- **Univers** : Lore (personnages, lieux, objets), Carte avec trajets, Graphe de relations
- **Analyse** : Détection d'incohérences algorithmique, Dashboard, Review/source tracking
- **Timeline** : Événements par chapitre, tagging entités, beats STC sur les events, calque arc émotionnel
- **Mort des personnages** : suivi via `deathEventId`, représentation sur la carte (💀)

---

## Manques majeurs (hors nouveaux modèles d'écriture)

### 1. Arc des personnages (évolution individuelle) -> FAIT
**Ce qui manque** : les personnages sont décrits statiquement (traits, rôle, origine). Un personnage *change* au fil du récit — ses convictions, sa morale, sa vision du monde. Il n'y a aucun outil pour tracer cette transformation.

**Ce que ça donnerait** : pour chaque personnage, une ligne d'évolution chapitre par chapitre sur des axes qualitatifs choisis par l'auteur (ex : "confiance en soi", "rapport à la violence", "loyauté"). Comparable à l'Arc émotionnel mais par personnage.

**Impact narratif** : ★★★★★ — Un bon roman, c'est d'abord l'arc d'un personnage.

---

### 2. Anatomie de scène (objectif / conflit / issue) -> FAIT
**Ce qui manque** : les événements timeline ont un titre et une description libre. Mais la mécanique narrative d'une scène — *quel est l'objectif du POV ? quel est l'obstacle ? comment ça se résout ?* — n'est pas structurée.

**Ce que ça donnerait** : des champs optionnels sur chaque événement — Objectif, Conflit, Issue (succès / échec / révélation / désastre). Le désastre à la fin d'une scène crée la tension vers la suivante. Une scène sans objectif est une scène molle.

**Impact narratif** : ★★★★★ — Faible effort d'implémentation, impact immédiat sur la qualité de la timeline.

---

### 3. POV et ordre intra-chapitre -> FAIT
**Ce qui manque** : on ne sait pas *qui* est le point de vue d'un événement. Deux événements dans le chapitre 5 — lequel se passe en premier ? La timeline montre des cartes côte à côte sans ordre établi.

**Ce que ça donnerait** : un champ POV (personnage focalisateur) et un champ d'ordre au sein du chapitre. Vue filtrée par POV pour suivre l'arc d'un personnage spécifique dans la chronologie.

**Impact narratif** : ★★★★☆ — Critique pour les récits multi-POV.

---

### 4. Tracker plant / payoff (amorces narratives) -> FAIT
**Ce qui manque** : aucun outil pour lier une **amorce** (la cicatrice est mentionnée ch.2) à son **payoff** (la cicatrice révèle son origine ch.14). C'est le principe de Tchekhov — toute arme montrée doit servir.

**Ce que ça donnerait** : une liste d'amorces avec statut (planté / payoff fait / orphelin). Chaque amorce pointe vers l'événement source et l'événement de résolution. Les amorces sans payoff sont des alertes, comme les beats STC.

**Impact narratif** : ★★★★☆ — Comble un vide que les incohérences ne couvrent pas (elles détectent des erreurs, pas les intentions non honorées).

---

### 5. Gestion des fils narratifs (subplots) -> FAIT
**Ce qui manque** : tout est sur une timeline plate. Un récit a une intrigue principale, une intrigue B, parfois C. Save the Cat mentionne la "B Story" mais sans outil dédié pour la suivre.

**Ce que ça donnerait** : des "fils narratifs" nommés. Chaque événement peut être tagué à un ou plusieurs fils. Vue filtrée par fil : voir uniquement l'évolution de l'intrigue amoureuse, ou uniquement la trahison en arrière-plan.

**Impact narratif** : ★★★★☆ — Indispensable dès qu'il y a plusieurs personnages actifs en parallèle.

---

### 6. Évolution des relations entre personnagesœ
**Ce qui manque** : le graphe de relations est statique (A est allié de B). Mais les relations évoluent — deux ennemis deviennent alliés, une amitié se brise au ch.8. Cette dynamique est invisible.

**Ce que ça donnerait** : sur une relation, des états horodatés par chapitre. Le graphe pourrait afficher l'état des relations à un moment T de la timeline (comme la carte montre les personnages à l'étape T).

**Impact narratif** : ★★★☆☆ — Très utile pour les sagas longues avec évolution politique.

---

### 7. Suivi des thèmes et motifs -> NOPE
**Ce qui manque** : Save the Cat a "Theme Stated" (beat 2) mais aucun espace pour définir et suivre les thèmes du récit ni les motifs récurrents (symboliques, visuels, textuels).

**Ce que ça donnerait** : une liste de thèmes (ex : "la trahison comme acte d'amour") et de motifs (ex : "la pluie annonce une mort"). Possibilité de taguer des événements à un thème. Vue de densité thématique par chapitre.

**Impact narratif** : ★★★☆☆ — Crucial pour la cohérence symbolique d'une œuvre ambitieuse.

---

### 9. Glossaire / terminologie -> NOPE
**Ce qui manque** : pour les univers fantastiques, les mots inventés (noms de magie, races, institutions, monnaies) existent dans les descriptions d'entités mais pas comme entrées autonomes consultables et cohérentes.

**Ce que ça donnerait** : un glossaire — terme, définition, entités liées, première apparition dans la timeline. Permettrait aussi de détecter des variantes orthographiques (incohérence de nom).

**Impact narratif** : ★★☆☆☆ — Élevé pour la world-building dense, dispensable pour un roman contemporain.

---

## Tableau de priorisation

| Fonctionnalité | Impact narratif | Complexité |
|---|---|---|
| Anatomie de scène (objectif/conflit/issue) | ★★★★★ | Faible |
| Arc des personnages | ★★★★★ | Moyenne |
| POV + ordre intra-chapitre | ★★★★☆ | Faible |
| Plant / payoff tracker | ★★★★☆ | Moyenne |
| Fils narratifs (subplots) | ★★★★☆ | Moyenne |
| Évolution des relations | ★★★☆☆ | Élevée |
| Thèmes et motifs | ★★★☆☆ | Moyenne |
| Notes libres par chapitre | ★★★☆☆ | Faible |
| Glossaire | ★★☆☆☆ | Faible |

---

## Recommandation — 3 chantiers prioritaires

1. **Anatomie de scène** — ajout de champs sur les événements timeline existants. Effort minimal, impact immédiat sur la profondeur narrative.
2. **Arc des personnages** — c'est le cœur du métier de romancier et la lacune la plus visible par rapport à ce qui existe (arc émotionnel global existe, arc par personnage non).
3. **Plant / payoff tracker** — fonctionnalité unique à cet outil, que ni les incohérences ni Save the Cat ne couvrent, et qui répond à un vrai besoin d'auteur.
