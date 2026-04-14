# Composants — Atlas Narratif

## Conventions générales
- Tous les composants sont en **JSX** (pas TypeScript)
- Styling : **Tailwind CSS** + inline styles pour couleurs dynamiques
- Dark theme systématique — fond `#0B1621`, texte `slate-200`
- Les composants de page reçoivent des callbacks de navigation (`onEntityClick`, `onCharacterClick`…) — la navigation elle-même est gérée dans `App.jsx`
- Toutes les pages protégées sont chargées en **lazy** (`React.lazy`) + `<Suspense fallback={<Skeleton />}>`
- Textes UI via `useTranslation()` (i18next) — namespaces `common` et `narrative`

---

## src/components/nav/
### `TopNav`
Barre de navigation principale en haut. Contient le `ProjectPicker`, le `VolumePicker`, le `SaveIndicator`, le bouton de recherche (Ctrl+K), et le bouton `?` (tour guidé — visible uniquement si la page courante a des étapes de tour et qu'un projet est actif). Affiche le nom de l'utilisateur connecté + bouton Déconnexion via `authClient.useSession()`. Recharge les projets automatiquement au changement de session (login/logout).
### `NavDropdown`
Menu déroulant de la nav. Configuration des items dans `navConfig.js`.
### `ProjectPicker`
Sélecteur de projet actif — liste les projets depuis `useProject()`. Contient aussi le bouton "Exporter ce projet" (`exportProject`).
### `VolumePicker`
Sélecteur de tome actif — filtre global cross-stores. Lit/écrit `useVolumeStore.activeVolumeId`. Permet aussi la gestion CRUD des volumes (créer, renommer, supprimer).
### `SaveIndicator`
Indicateur de sauvegarde en cours ("Enregistrement…" / "Sauvegardé"). Lit `useSaveIndicator`.
### `Footer`
Pied de page avec liens légaux (/privacy, /terms) et sélecteur de langue.
### `navConfig.js`
Configuration centralisée des items de navigation (routes, labels, icônes).

---

## src/components/dashboard/
### `NarrativeDashboard`
Page principale de synthèse. Props : `onOpenIncoherences(filter)`, `onEntityClick(id, type)`.
### `StatCard`
Carte de statistique simple (nombre, label, icône).
### `CircularGauge`
Jauge circulaire SVG pour scores (cohérence, complétude…).
### `RecommendationRow`
Ligne de recommandation contextuelle dans le dashboard.
### `SectionTitle`
Titre de section stylisé avec icône.

---

## src/components/lore/
### `LoreBrowser`
Navigateur du lore avec onglets (characters / locations / objects). Props : `initialTab`, `initialSearch`, `onEntityClick(id)`.
### `CharacterCard`, `LocationCard`, `ObjectCard`
Cartes d'affichage d'une entité. Cliquables pour ouvrir le détail.
### `GroupCard`
Carte d'un groupe / faction avec liste de membres.
### `EntityEditor`
Formulaire d'édition inline d'une entité (création/modification manuelle).
### `GroupEditor`
Formulaire d'édition d'un groupe (nom, description, membres).

---

## src/components/graph/
### `EntityGraph`
Graphe de relations entre entités (SVG custom + simulation physique). Props : `entityId` (entité centrale), `onNodeClick(id)`.
### `IncPanel`
Panneau latéral affichant les incohérences liées à l'entité sélectionnée dans le graphe.
### `useGraphSimulation`
Hook custom pour la simulation de force D3-like (calcul des positions des nœuds).

---

## src/components/map/
### `AtlasMapView`
Vue principale carte. Affiche l'image de carte du projet + trajets. Props : `onLocationClick(locationName)`.
### `MapCanvas`
Canvas SVG pour le rendu des trajets et marqueurs.
### `JourneySidebar`
Panneau latéral listant les personnages et leurs trajets sur la carte.
### `JourneyTimeline`
Frise chronologique des étapes d'un trajet par personnage.
### `JourneyEditor`
Éditeur de trajet : ajout/modification/suppression d'étapes.

---

## src/components/timeline/
### `TimelineBrowser`
Timeline narrative avec filtres, drag-and-drop (réordonnancement intra et inter-chapitre via @dnd-kit). Lit `useTimelineStore`.
### `EventCard`
Carte d'un événement de la timeline (résumé, entités, beat, POV).
### `SortableEventCard`
Wrapper @dnd-kit pour le drag-and-drop des EventCard.
### `EventEditor`
Formulaire complet d'édition d'un événement (texte, entités, beat, POV, goal/conflict/outcome, threads).
### `SeriesTimeline`
Vue timeline multi-tomes (série complète).
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

## src/components/arc/
### `CharacterArcView`
Vue des arcs de personnages — axes d'évolution (0-10) par chapitre. Lit/écrit `useCharacterArcStore`.

---

## src/components/incoherences/
### `IncoherencesBrowser`
Liste filtrée des incohérences. Props : `initialFilter`, `onEntityClick(id, type)`.
### `IncoherenceCard`
Carte d'une incohérence avec sévérité, entités liées.
### `DetectorCatalog`
Modal listant tous les détecteurs disponibles avec description.
### `FixButton`
Bouton de résolution d'une incohérence (marque comme résolue en DB).
### `EntityChip`
Chip cliquable vers une entité liée à une incohérence.

---

## src/components/tour/
### `GuidedTour`
Overlay spotlight pour le tour guidé. Masque SVG, tooltip repositionnable, auto-scroll vers l'élément cible. Boutons prev/next/skip + barre de progression. Lit/écrit `useTourStore`.
### `WelcomeModal`
Modal d'accueil affichée au premier chargement d'un projet (4 features présentées). Boutons "Lancer le tour" / "Explorer seul". Persisté dans localStorage (`atlas_tour_seen_${projectId}`).
### `TourPageButton`
Bouton contextuel pour relancer le tour sur la page courante (stub actuellement).
### `tourUtils.js`
Helpers : `shouldShowWelcome(projectId)`, `markWelcomeSeen(projectId)`.

---

## src/components/search/
### `GlobalSearch`
Modale de recherche globale (Ctrl+K / Cmd+K). Cherche dans personnages, lieux, objets. Props : `onClose()`.

---

## src/components/ui/
Composants réutilisables sans logique métier :
- `Button` — bouton stylisé avec variants
- `DarkCard` — conteneur carte dark avec border subtile
- `EmptyState` — placeholder pour listes vides (icône + message)
- `FormFields` — inputs, textareas stylisés
- `LoreCard` — carte générique pour entité lore (utilisée par CharacterCard, etc.)
- `Skeleton` — placeholder de chargement (utilisé par Suspense)
- `SidePanel` — panneau latéral sliding
- `SourceBadge` — badge `import` vs `manual`

---

## src/components/ErrorBoundary.jsx
Catch global des erreurs React. Affiche un écran de fallback avec option de reload.

---

## src/pages/
### `ReviewPage`
Page de validation post-import. Affiche un résumé de ce que l'IA a extrait avant de confirmer.
### `EmotionalArc`
Page pleine dédiée à l'édition de l'arc émotionnel chapitre par chapitre. Lit/écrit `useArcStore`.
### `PlantsBrowser`
Tracker des amorces narratives (plant / payoff). Lit/écrit `usePlantStore`.
### `ThreadsBrowser`
Gestion des fils narratifs (subplots). Lit/écrit `useThreadStore`.
### `HeroJourney`
Voyage du Héros — 12 étapes de Joseph Campbell. Lit/écrit `useHeroJourneyStore`.
### `AccountPage`
Gestion du compte : informations personnelles, export des données, suppression du compte.
### `NotFoundPage`
Page 404 avec lien retour vers l'accueil.

## src/pages/auth/
### `LoginPage`
Connexion email + mot de passe. Bouton "Continuer avec Google" (`authClient.signIn.social`).
### `RegisterPage`
Création de compte. Même bouton Google. Redirige vers `/verify-email` après inscription.
### `VerifyEmailPage`
Écran d'attente de vérification email.
### `ForgotPasswordPage`
Formulaire de demande de reset password.
### `ResetPasswordPage`
Saisie du nouveau mot de passe (token en query param `?token=`).

## src/pages/legal/
### `PrivacyPage`
Politique de confidentialité (RGPD).
### `TermsPage`
Conditions générales d'utilisation.
