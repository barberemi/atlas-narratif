# Rapport Narratif — AtlasNarratif

> Généré le 2026-03-19 par l'Agent Narratif

## 1. Évaluation Save the Cat

### Forces
- Les 15 beats sont correctement définis avec des positions idéales cohérentes avec la théorie de Blake Snyder (catalyst à 10%, midpoint à 50%, all_is_lost à 75%).
- Les messages d'alerte sont rédigés en langage auteur, non en jargon technique.
- L'algorithme `generateAlerts()` distingue correctement "warning" et "critical" (seuil = 2× la tolérance).
- La frise (cercles pour position réelle, diamants pour position idéale) est intuitive.

### Lacunes
- Le positionnement est calculé au milieu du chapitre, ce qui crée des faux positifs avec peu de chapitres (9 dans la démo = résolution de ~11% par chapitre).
- La `description` de chaque beat n'est accessible qu'en tooltip `title` : pas d'exemples concrets, pas de distinction "fausse victoire / fausse défaite" au midpoint. Un auteur novice manque d'accompagnement pédagogique.
- Aucun indicateur de ratio par acte (Acte I : X%, Acte II : Y%, Acte III : Z%).
- Une seule méthode narrative disponible. Hero's Journey (Vogler), Story Circle (Harmon) et Sequence Approach sont absentes.

---

## 2. Évaluation du Détecteur d'Incohérences

### Forces
- Les 8 types d'incohérences couvrent les cas les plus courants et impactants.
- La hiérarchie de sévérité est bien calibrée.
- Le marquage "Résolu" avec propagation d'état est une bonne décision UX.
- Les chips d'entités cliquables assurent une navigation cohérente vers le graphe ou le lore.

### Lacunes
- Toutes les incohérences sont saisies manuellement : aucune détection algorithmique depuis les données lore existantes (affiliations orphelines, entités citées sans `id`, objets avec porteurs contradictoires).
- Aucune suggestion de résolution : l'explication est bonne mais le "quoi faire" est absent.
- Pas de filtre par entité (uniquement par sévérité).
- Pas de lien retour depuis une incohérence vers les événements de timeline correspondants (alors que `incoherenceIds` existe dans `timelineDB`).

---

## 3. Évaluation de la Timeline Narrative

### Forces
- Layout en colonnes par chapitre très lisible.
- La détection de conflits (`detectConflicts()`) est algorithmique et correctement intégrée visuellement.
- Le filtre par personnage (opacité réduite sur les événements non concernés) est un excellent outil pour suivre un arc de personnage.

### Lacunes
- Conflits uniquement intra-chapitre : un personnage mort au chapitre 7 qui réapparaît au chapitre 9 sans explication n'est pas signalé.
- Pas de notion de mort/statut : aucun champ `deathChapter`, `status` ou `alive` dans les entités.
- Pas de trajectoire géographique continue : impossible de voir "où est tel personnage à tel moment" comme une ligne de vie.
- Pas de marqueurs temporels ou de durée fictive.
- Pas de pont vers Save the Cat : les chapitres sont le référentiel commun, mais les beats ne sont pas visibles dans la timeline.

---

## 4. Évaluation du Dashboard (Santé Narrative)

### Forces
- Jauge circulaire avec score pondéré pertinent (critical×4, high×3, medium×2, low×1).
- Progression par sévérité avec barres.
- Top 6 entités impliquées, cliquables.
- Répartition par type d'incohérence.

### Lacunes
- Le score ne reflète que les incohérences : ni les beats Save the Cat manquants, ni les conflits de timeline, ni la complétude du lore ne sont intégrés. Il ne s'agit pas d'un vrai score de santé narrative.
- Pas d'historique (état perdu au rechargement, aucune persistance).
- Pas de recommandations prioritaires : le Dashboard informe mais ne prescrit pas d'action.
- La vue Summary Save the Cat (beats manquants, alertes) est absente du Dashboard.

---

## 5. Suggestions d'enrichissement narratif

### Priorités à fort impact narratif

1. **Connexion Save the Cat ↔ Timeline** : voir quels événements correspondent à quel beat.
2. **Détection automatique d'incohérences** depuis les données existantes (affiliations orphelines, porteurs contradictoires).
3. **Score de santé composite** intégrant beats manquants + conflits timeline + incohérences.
4. **Arc de personnage** : vue dédiée à l'évolution d'un personnage sur l'ensemble du récit (statut, arc émotionnel, relations).
5. **Persistance `localStorage`** pour les incohérences résolues.
6. **Enrichissement pédagogique des beats** : exemples, contre-exemples, lien avec le thème.

### Métriques narratives non intégrées
- Densité de personnages par chapitre
- Fréquence d'apparition par personnage
- Nombre de scènes par lieu
- Couverture du lore (% d'entités avec description complète)

### Méthodes narratives à intégrer
- Hero's Journey (Vogler, 12 étapes — particulièrement pertinente pour la fantasy)
- Story Circle (Harmon, 8 étapes)
- Avec choix de méthode par l'auteur
