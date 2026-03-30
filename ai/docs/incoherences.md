# Système d'incohérences — Atlas Narratif

Détection client-side, 100% in-browser, sans appel IA.

## Architecture

- **Détection** : `src/db/detectIncoherences.js` — `runDetection(data)` + export `DETECTOR_CATALOG`
- **Store** : `src/stores/useIncStore.js` — `rescan()`, `toggle()`, `setNote()`
- **UI** : `src/components/incoherences/`
  - `IncoherencesBrowser.jsx` — vue principale, filtres par sévérité, bouton "? Guide"
  - `IncoherenceCard.jsx` — carte individuelle avec badge type/sévérité
  - `DetectorCatalog.jsx` — modal listant tous les détecteurs disponibles
  - `FixButton.jsx` / `EntityChip.jsx` — actions rapides et liens entités

## Données passées à `runDetection`

```js
runDetection({ characters, locations, objects, events, plants, threads, groups })
```

| Champ | Source store |
|-------|-------------|
| `characters` | `useLoreStore` |
| `locations` | `useLoreStore` |
| `objects` | `useLoreStore` |
| `groups` | `useLoreStore` |
| `events` | `useTimelineStore` |
| `plants` | `usePlantStore` |
| `threads` | `useThreadStore` |

## Catalogue des 16 détecteurs

### Critique

| Type | Détecteur | Déclencheur |
|------|-----------|-------------|
| `Continuité de Personnage` | `detectDeadCharacterReappearance` | `character.deathEventId` + apparition après |

### Élevée

| Type | Détecteur | Déclencheur |
|------|-----------|-------------|
| `Continuité d'Objet` | `detectUsedInactiveObject` | `object.status ≠ active` + `statusChangedAtChapter` |
| `Conflit de Lieu Intra-Chapitre` | `detectIntraChapterConflict` | Même personnage, même `chapter_num`, lieux différents |
| `Payoff Avant Plant` | `detectPayoffBeforePlant` | `payoffChapterNum < plantChapterNum` |
| `Entité Non Référencée` | `detectBrokenReferences` | Entité dans `event_entities` mais absente du lore |

### Moyenne

| Type | Détecteur | Déclencheur |
|------|-----------|-------------|
| `Incohérence de Porteur` | `detectBrokenHolders` | `object.currentHolder` introuvable dans `characters` |
| `Téléportation de Personnage` | `detectTeleportation` | Chapitres consécutifs X→X+1, lieux différents |
| `Affiliation Fantôme` | `detectGhostAffiliations` | `group.members[].characterId` introuvable |
| `Personnage POV Absent` | `detectMissingPovInScene` | `event.povCharacterId` absent de `event.entities` |
| `Plant Sans Payoff` | `detectOpenPlants` | `status=open`, pas de payoff, chapitres après la plant |

### Faible

| Type | Détecteur | Déclencheur |
|------|-----------|-------------|
| `Lieu d'Origine Inexistant` | `detectInvalidOrigin` | `character.origin` introuvable dans `locations.name` |
| `Créateur Non Référencé` | `detectUnknownCreator` | `object.creator` introuvable dans `characters.name` |
| `Fil Narratif Vide` | `detectEmptyThreads` | Thread ID absent de tous les `event.threadIds` |
| `Entité Orpheline` | `detectOrphanCharacters` / `detectOrphanLocations` | Entité sans aucun événement |
| `Scène Vide` | `detectEmptyScenes` | `event.entities.length === 0 && !event.locationId` |

## IDs des incohérences scannées

Les incohérences détectées localement ont un ID préfixé `scan_` et sont stockées dans la table `incoherences` avec les mêmes colonnes que les incohérences IA. `deleteScanIncoherences()` purge les anciennes avant chaque scan.

## Ajouter un nouveau détecteur

1. Implémenter `detectXxx(...)` dans `detectIncoherences.js`
2. L'ajouter dans `runDetection()` (ordonné par sévérité décroissante)
3. Ajouter son entrée dans `DETECTOR_CATALOG`
4. Ajouter son icône dans `TYPE_ICONS` de `IncoherenceCard.jsx`
5. Écrire les tests dans `detectIncoherences.test.js`
6. Mettre à jour ce fichier
