# Composants — Atlas Narratif

## Conventions générales
- Tous les composants sont en **JSX** (pas TypeScript)
- Styling : **Tailwind CSS** + inline styles pour couleurs dynamiques
- Dark theme systématique — fond `#0B1621`, texte `slate-200`
- Les composants de page reçoivent des callbacks de navigation (`onEntityClick`, `onCharacterClick`…) — la navigation elle-même est gérée dans `App.jsx`

---

## src/components/nav/
### `TopNav`
Barre de navigation principale en haut. Contient le `ProjectPicker` et le bouton de recherche (Ctrl+K).
### `NavDropdown`
Menu déroulant de la nav.
### `ProjectPicker`
Sélecteur de projet actif — liste les projets depuis `useProject()`.

---

## src/components/dashboard/
### `NarrativeDashboard`
Page principale de synthèse. Props : `onOpenIncoherences(filter)`, `onEntityClick(id, type)`.
### `StatCard`
Carte de statistique simple (nombre, label, icône).
### `CircularGauge`
Jauge circulaire SVG pour scores (cohérence, complétude…).

---

## src/components/lore/
### `LoreBrowser`
Navigateur du lore avec onglets (characters / locations / objects). Props : `initialTab`, `initialSearch`, `onEntityClick(id)`, `onCharacterClick(allyName)`.
### `CharacterCard`, `LocationCard`, `ObjectCard`
Cartes d'affichage d'une entité. Cliquables pour ouvrir le détail.
### `EntityEditor`
Formulaire d'édition inline d'une entité (création/modification manuelle).

---

## src/components/graph/
### `EntityGraph`
Graphe de relations entre entités (D3 ou SVG custom). Props : `entityId` (entité centrale), `onNodeClick(id)`.

---

## src/components/map/
### `AtlasMapView`
Vue principale carte. Affiche l'image de carte du projet + trajets. Props : `onCharacterClick(allyName)`, `onLocationClick(locationName)`.
### `MapCanvas`
Canvas SVG/Canvas pour le rendu des trajets.
### `JourneySidebar`
Panneau latéral listant les personnages et leurs trajets sur la carte.

---

## src/components/timeline/
### `TimelineBrowser`
Timeline narrative avec filtres. Lit `useTimelineStore`.
### `EventCard`
Carte d'un événement de la timeline.
### `ArcStrip`
Visualisation de l'arc émotionnel en frise sous la timeline.
### `EntityChip`
Chip cliquable représentant une entité dans un événement.

---

## src/components/savethecat/
### `SaveTheCat`
Éditeur des 15 beats Save the Cat. Lit/écrit `useStcStore`.
### `BeatRow`
Ligne d'un beat : numéro, nom, description, chapitres associés.
### `Frise`
Visualisation linéaire des beats dans l'ordre narratif.
### `AlertCard`
Alerte contextuelle (beat manquant, incohérence…).

---

## src/components/incoherences/
### `IncoherencesBrowser`
Liste filtrée des incohérences. Props : `initialFilter`, `onEntityClick(id, type)`.
### `IncoherenceCard`
Carte d'une incohérence avec sévérité, entités liées.
### `FixButton`
Bouton de résolution d'une incohérence (marque comme résolue en DB).

---

## src/components/search/
### `GlobalSearch`
Modale de recherche globale (Ctrl+K / Cmd+K). Cherche dans personnages, lieux, objets. Props : `onClose()`.

---

## src/components/upload/
### `FilePicker`
Zone drag-and-drop pour importer un fichier texte (manuscrit). Props : `onContent(text)`. Accepte `.txt`, `.md`, `.docx` (conversion côté client).

---

## src/components/ui/
Composants réutilisables sans logique métier :
- `Button` — bouton stylisé avec variants
- `DarkCard` — conteneur carte dark avec border subtile
- `SidePanel` — panneau latéral sliding
- `SourceBadge` — badge `import` vs `manual`
- `FormFields` — inputs, textareas stylisés

---

## src/pages/
### `ReviewPage`
Page de validation post-import. Affiche un résumé de ce que l'IA a extrait avant de confirmer.
### `EmotionalArc`
Page pleine dédiée à l'édition de l'arc émotionnel chapitre par chapitre. Lit/écrit `useArcStore`.
