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
Sélecteur de projet actif — liste les projets depuis `useProject()`. Contient aussi l'entrée « Exporter… » qui ouvre le `DeliverablesHub`.
### `VolumePicker`
Sélecteur de tome actif — filtre global cross-stores. Lit/écrit `useVolumeStore.activeVolumeId`. Permet aussi la gestion CRUD des volumes (créer, renommer, supprimer).
### `SaveIndicator`
Indicateur de sauvegarde en cours ("Enregistrement…" / "Sauvegardé"). Lit `useSaveIndicator`.
### `Footer`
Pied de page avec liens légaux (/privacy, /terms), sélecteur de langue, et lien "Cookies" (`onCookieClick` prop) pour réouvrir le bandeau de consentement.
### `NavDropdown`
Menu déroulant d'un groupe de nav. Rendu à plat par défaut ; si les items portent des métadonnées optionnelles (`section`, `sublabelKey`, `badgeKey`), il les rend **orchestrés** : en-têtes de section, ligne d'usage sous chaque item, badge (ex. « Commence ici »). Seul le menu « Écrire » les utilise (point 16).
### `navConfig.js`
Configuration centralisée des items de navigation (routes, labels, icônes). Le groupe « Écrire » ajoute `section` / `sublabelKey` / `badgeKey` pour hiérarchiser les 5 méthodes (Fondation → Approfondir → Suivre les fils) sans en supprimer aucune.

---

## src/components/export/
### `DeliverablesHub`
Hub « Livrables » (modal via portal dans `document.body`) ouvert depuis le `ProjectPicker`. Ferme la boucle analyse → écriture : génère des documents prêts à transmettre à partir du payload d'export (`fetchProjectExport`). Trois livrables HTML imprimables (→ PDF via Cmd/Ctrl+P), ouverts dans un onglet : **Bible des personnages**, **Synopsis par tome**, **Checklist des amorces non résolues** (générateurs dans `src/utils/deliverables.js`) ; plus la **bible complète Markdown** téléchargée (`buildMarkdown`). Props : `projectId`, `projectName`, `onClose`. Utilitaires : `src/utils/download.js` (`downloadBlob`, `openHtmlDocument`).

---

## src/components/dashboard/
### `NarrativeDashboard`
Page principale de synthèse. Props : `onOpenIncoherences(filter)`, `onEntityClick(id, type)`. Le score de santé du header est cliquable et ouvre `HealthScorePanel` (recadrage du score en diagnostic + leviers). Le libellé de statut est constructif : Solide (≥80) / En construction (≥50) / À consolider (<50). Affiche `FirstRunChecklist` en tête tant que le projet est « quasi vide » (jamais sur la démo LOTR).
### `FirstRunChecklist`
Checklist « premières minutes » (point 8) pour dé-frictionner le cold-start d'un projet vide. Props : `description`, `charactersCount`, `eventsCount`. 3 étapes dérivées des données réelles (aucun state persisté, cf. `src/utils/firstRun.js`) : logline (input inline → `updateProject`), 3 personnages (ouvre `EntityEditor`), 1re scène (ouvre `EventEditor`). Barre de progression + CTA vers la démo LOTR (`/demo`). Visibilité pilotée par `shouldShowFirstRun()`.
### `HealthScorePanel`
Panneau « diagnostic » du score de santé narrative (popover ouvert depuis le header du dashboard). Recadre le score en diagnostic plutôt qu'en note : montre sa composition (chaque axe pondéré avec mini-barre) et propose les leviers à plus fort potentiel de gain, chacun navigant vers la vue concernée. Props : `parts` (axes pondérés + `gain`), `onNavigate(path)`, `onClose()`. Fermeture au clic extérieur ou Échap.
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
Formulaire d'édition inline d'une entité (création/modification manuelle). Inclut le sous-composant `CustomFields` (bag clé/valeur, couche 2) commun aux 3 types.
### `GroupEditor`
Formulaire d'édition d'un groupe (nom, description, membres).

---

## src/components/custom/ (types & entités custom — couche 3)
### `CustomEntityBrowser`
Page `/custom` : onglets par type, grille d'entités, états vides guidés. Store `useCustomEntityStore`.
### `CustomTypeEditor`
Éditeur d'un type custom : label, icône, couleur, constructeur de `field_schema`.
### `CustomEntityEditor`
Éditeur d'une entité custom : nom, alias, description, champs du schéma du type + champs custom libres.

## src/components/ui/ (extrait)
### `CustomFieldChips`
Affichage lecture seule des champs custom d'une entité (puces clé:valeur). Utilisé par les cartes lore et custom. Masque les clés internes préfixées `__` (ex. `__links`).
### `RelationsSection` (relations/)
Édition manuelle des relations explicites (Niveau 3) d'une entité, embarquée dans les fiches (`EntityEditor`, `CustomEntityEditor`, mode édition). Liste (libellé éditable + toggle sens →/←/↔ + suppression undoable) + formulaire d'ajout (recherche d'une cible parmi toutes les entités, libellé libre, orienté/symétrique). Sauvegarde immédiate via `useRelationStore`.
### `WikiText`
Rend un texte en transformant les wikilinks `[[Cible]]` / `[[Cible|alias]]` (hérités d'un import Obsidian) en liens cliquables vers la **fiche** de l'entité, même convention que la recherche globale : `/lore?tab=<type>&search=<nom>` (noyau typé) ou `/custom?type=<typeId>&entity=<id>` (deep-link entité custom : onglet présélectionné + fiche ouverte). Résolution via `resolveEntityByName` (entityUtils ; le cache custom est chargé partout via `ProjectContext.loadCore`). Cible non résolue → texte brut sans crochets. Utilisé dans les descriptions des cartes lore (Character/Location/Object) et custom.

## src/components/chat/
### `ChatPanel`
Page `/chat`, **multi-discussions** : colonne gauche `ChatThreadList` (threads persistés par projet via `useChatStore`/localStorage), colonne droite la conversation active. Niveau 1 : réponses déterministes locales via `src/chat/router.js` (les noms d'entités cités sont émis en wikilinks `[[Nom]]` → liens cliquables) ; niveau 2 (toggle « recherche approfondie ») : `POST /projects/:id/ask` (provider mock par défaut). Les deux niveaux rendent le texte via `AnswerText` et affichent les **sources** (entités citées) en chips cliquables → fiche de l'entité.
### `ChatThreadList` (chat/)
Liste des discussions : sélection, création (`+ Nouvelle`), renommage inline, suppression (confirmation en deux temps), horodatage relatif + compteur de messages.
### `AnswerText` (chat/)
Rendu enrichi d'une réponse de chat : `**gras**`, wikilinks `[[Nom]]` (résolus par nom) et citations `[entity_id]` / `[id1, id2]` (résolues par id, affichent le nom) → liens cliquables vers la fiche (`hrefForEntity`/`entityHrefById`). Références non résolues → texte brut.

## src/components/import/ (import Obsidian)
### `VaultImporter`
Drag-drop de fichiers `.md` / `.zip` d'un vault Obsidian → aperçu (`previewObsidianImport` / `previewObsidianZip`) → import (`seedObsidianData`).
### `ImportPreview`
Staging avant seed : lit le payload EN MÉMOIRE, affiche comptages (personnages, lieux, objets, entités custom, **scènes, chapitres**) / doublons candidats (`src/import/dedup.js`) / liens cassés + panneau **« Ajuster le mapping des champs »** + bouton « Confirmer l'import ».

Le panneau de mapping (repliable) liste les champs frontmatter/inline détectés (`collectFields`) avec exemple, fréquence et cible auto devinée ; un `<select>` par champ permet de forcer un champ du noyau (`CANONICAL_FIELDS`), un champ personnalisé (`__custom`) ou l'ignorer (`__ignore`). Les choix (`overrideMap`) sont passés à `mapToCanonical` et l'aperçu se recalcule à la volée (VaultImporter garde les notes parsées et re-mappe via `useMemo`).

### Pipeline `src/import/obsidian/`
`parseVault(Zip)` → notes structurées (frontmatter YAML, champs inline Dataview `::`, tags, wikilinks, corps) → `mapToCanonical` → JSON canonique (`analysis_prompt.js`) → `seedProjectViaApi`.

`mapToCanonical` classifie chaque note dans cet ordre : **narrative** (`classifyNarrative` → `scene`/`chapter`) → **noyau typé** (`classifyType` → character/location/object) → **type custom** (couche 3). Les notes narratives produisent :
- `type: scène` → 1 événement `timelineDB` + `eventExtrasDB[id]` (pov, beat, threads, goal/conflict/outcome, sceneOrder). `event_entities` = union du frontmatter (`personnages`/`lieux`/`objets`) ET des wikilinks `[[…]]` du corps ; `pov` → `povCharacterId`, `lieu` (1er) → `locationId`.
- `type: chapitre` → 1 entrée `chaptersDB` (Save the Cat) ; son titre alimente le `chapterTitle` des scènes du même chapitre/tome.
- Multi-tome : frontmatter `tome`/`volume` → `volumesDB` (id `vol_<slug>`, numéro incrémental ou valeur numérique). Timeline triée par tome → chapitre → ordre de scène.
Synonymes de champs scène/chapitre : `src/import/obsidian/fieldMap.js` (`SCENE_FIELD_SYNONYMS`, `NARRATIVE_HINTS`).

`mapToCanonical(notes, { overrideMap })` : l'auto-mapping reste le défaut ; `overrideMap` (clé normalisée → champ canonique / `__custom` / `__ignore`) permet à l'utilisateur de corriger le mapping depuis `ImportPreview`. `collectFields(notes)` recense les champs remappables (lore/custom, hors notes narratives) ; `CANONICAL_FIELDS` liste les cibles du noyau.

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
Vue principale carte. **Layout une-page** (piste 6) : `h-full flex flex-col` qui remplit la zone de contenu — header + sélecteur en haut, **carte en héros** (`flex-1`, remplit la hauteur, jamais de scroll de page), **dock bas** (frise de présence + curseur) en bas. **Mode plein écran** (état `isFullscreen`) : bouton ⤢ → la racine passe en `fixed inset-0 z-[60]` (couvre la nav, pleine largeur), le gros header est masqué au profit d'une barre slim ; `Échap` ou le bouton pour sortir. Le **cadre de la carte** est dimensionné au ratio de l'image (`absolute inset:0; margin:auto; aspect-ratio` + `max-w/h:100%`) : la carte remplit son cadre sans halo flou autour, avec un fin liseré + ombre (rendu « carte encadrée »). NB : ratio figé sur celui de la carte LOTR par défaut ; un fond importé d'un autre ratio retombe sur le letterbox interne de `MapCanvas`. Affiche l'image de carte du projet + trajets. Le temps est piloté par un **curseur de chapitres partagé** (`ChapterCursor`) : glisser le curseur déplace tous les personnages affichés au chapitre choisi (étape courante = dernière étape du trajet dont `chapterNum ≤ curseur` ; un personnage n'apparaît qu'à partir du chapitre où son récit commence). Header **compact** (titre `text-2xl`, une ligne) et **frise de présence repliée par défaut** (`stripOpen` init `false`) pour maximiser la taille de la carte. Le dock contient une **frise de présence** (`PresenceStrip`) **pliable** (état `stripOpen`) : dépliée via « ▸ PRÉSENCE », elle apparaît ; repliée, la carte récupère la place. En mode manuel (trajets sans chapitre), le trajet complet est affiché ; curseur et frise sont masqués (l'éditeur est plafonné en hauteur avec scroll interne). Sélecteur « Suivre » = un personnage focalisé + cases œil pour la visibilité (multi-affichage possible). Props : `onLocationClick(locationName)`.
### `ChapterCursor`
Curseur de chapitres partagé (footer, mode auto). Piste temporelle avec **bandes d'acte** (I/II/III) alignées sur le modèle partagé `utils/acts.js` (mêmes bandes que la frise Save the Cat / la Timeline). **Repères de convergence/divergence** (piste 4) : losange plein ◆ (rassemblement) / creux ◇ (scission) sur la piste, aux chapitres concernés, + légende du chapitre courant (« qui est ensemble, où »). Interactions : glisser (pointer), flèches ‹/›, clavier (←/→/Home/End), `role="slider"` accessible. **Lecture animée** (piste 7) : bouton ▶/⏸ qui déroule les chapitres tout seul (l'avancement du curseur fait glisser les personnages via la transition de `MapCanvas`) ; toute interaction manuelle met en pause ; s'arrête au dernier chapitre. Props : `chapters` (`[{number,title}]`), `index`, `onChange(index)`, `markers` (repères par chapitre, cf. `utils/gatherings.js`), `currentInfo` (légende texte), `playing`, `onTogglePlay`.
### `PresenceStrip`
Frise de présence — comparatif « qui est où, quand » (remplace l'ancienne matrice persos×chapitres). Une barre fine par personnage affiché, une cellule par chapitre, **colorée par le lieu** (`utils/color.js` → `locationColor`, hash stable en attendant les régions/piste 5). Le dernier lieu connu est reporté entre deux apparitions ; chapitres POV marqués d'un point. Cliquer une cellule déplace le curseur partagé ; la colonne du chapitre courant est surlignée. **Pliable** (props `open`/`onToggle`, piste 6) : en-tête cliquable, barres plafonnées en hauteur (scroll interne au-delà). S'appuie sur les champs `locationId` / `isPov` désormais exposés par `computeAutoJourneys` (`utils/journeyUtils.js`). Props : `chapters`, `characters` (affichés), `index`, `onChange(index)`, `open`, `onToggle`.
### `MapCanvas`
Canvas SVG pour le rendu des trajets et marqueurs. Prop `gatherings` (piste 4) : liste `[{x,y,count}]` de lieux où ≥2 personnages affichés sont réunis au chapitre courant → dessine un **anneau de convergence** avec badge du nombre.
### `JourneyGrid`
Mode **mini-cartes / small multiples** (piste 3) : grille responsive de vignettes, une par personnage affiché, chacune montrant son **trajet complet**. Scroll interne au-delà de quelques persos (page sans scroll). Activé par le toggle « Mini-cartes / Carte » du header d'`AtlasMapView` (état `viewMode` : `'single' | 'grid'`) ; en mode grille le dock (frise + curseur) est masqué. Props : `characters` (affichés), `mapSrc`.
### `MiniJourneyMap`
Vignette légère utilisée par `JourneyGrid` : fond de carte (object-contain, même transformation que `MapCanvas`, répliquée pour rester autonome/sans marqueurs animés) + trajet complet d'UN personnage (polyline, départ, étapes, marqueur de fin ou de mort). Props : `journey`, `color`, `deathStepIndex`, `mapSrc`.
### `JourneyEditor`
Éditeur de trajet : ajout/modification/suppression d'étapes.

---

## src/components/timeline/
### `TimelineBrowser`
Timeline narrative avec filtres, drag-and-drop (réordonnancement intra et inter-chapitre via @dnd-kit). Lit `useTimelineStore`. Colonnes de chapitres (290px) surmontées de **bandes d'acte** partagées avec la frise Save the Cat (modèle `src/utils/acts.js`, label d'acte collant au scroll) — les deux pages sont des « sœurs visuelles » (même axe chapitres, mêmes couleurs d'acte).
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
Éditeur des 15 beats Save the Cat. Lit/écrit `useStcStore`. En mode série (plusieurs tomes, pas de filtre global), une **bande compacte** (sélecteur T1·T2·T3 + couverture) affiche **une seule frise à la fois** au lieu de frises empilées. Cliquer un beat sur la frise ouvre son détail dans le `BeatDrawer`.
### `Frise`
Visualisation linéaire des beats : positions réelles vs idéales (losanges), **bandes de tolérance** par beat, beats cliquables (`onSelectBeat`) et surlignés (`selectedBeat`).
### `BeatDrawer`
Tiroir de détail d'un beat sélectionné : statut, position idéale/tolérance, note(s) de craft, scènes qui le portent (par tome, éditables), exemple canonique, action créer/éditer.
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
Overlay spotlight pour le tour guidé. Masque SVG, tooltip repositionnable, auto-scroll vers l'élément cible. Boutons prev/next/skip + barre de progression. Lit/écrit `useTourStore`. Les étapes (route + `dataKey` d'ancre `data-tour` + titre/desc) sont définies dans `src/data/tour_steps.js` ; textes traduits sous `narrative:tour.steps.<dataKey>`. Pages couvertes : `/dashboard`, `/timeline`, `/lore`, `/custom`, `/map`, `/savethecat`, `/heros`, `/arc`, `/plants`, `/threads`, `/incoherences`, `/chat`, puis `/` (étape finale). Si l'ancre est absente (ex. état vide de `/custom`), la tooltip s'affiche centrée sans spotlight.
### `WelcomeModal`
Modal d'accueil affichée au premier chargement d'un projet (4 features présentées). Boutons "Lancer le tour" / "Explorer seul". Persisté dans localStorage (`atlas_tour_seen_${projectId}`). Le bouton pour relancer le tour d'une page est rendu par `TopNav` (le « ? », visible si la page courante a des étapes).
### `tourUtils.js`
Helpers : `shouldShowWelcome(projectId)`, `markWelcomeSeen(projectId)`.

---

## src/components/search/
### `GlobalSearch`
Modale de recherche globale (Ctrl+K / Cmd+K). Cherche dans personnages, lieux, objets. Props : `onClose()`.

---

## src/components/ui/
Composants réutilisables sans logique métier :
- `CraftDiagnostics` — bandeau « Ce que je remarque » : 1 à 3 constats de craft actionnables, communs à toutes les vues (arc, Save the Cat, dashboard). Alimenté par les moteurs purs de `src/utils/craftDiagnostics.js` (`diagnoseArc`, `diagnoseStc`, `diagnoseRhythm`, `diagnosePov`, `diagnosePresence`). Constats cliquables → le parent décide de l'effet via `onPick(finding)` (surligner un chapitre/beat, naviguer vers la vue). Props : `findings`, `onPick`, `dataTour`, `title` (`null` masque l'en-tête interne). Le dashboard agrège les constats les plus forts (max 2/vue, 5 au total) au-dessus de « À faire maintenant ».
- `Button` — bouton stylisé avec variants
- `DarkCard` — conteneur carte dark avec border subtile
- `EmptyState` — placeholder pour listes vides (icône + message)
- `FormFields` — inputs, textareas stylisés
- `Skeleton` — placeholder de chargement (utilisé par Suspense)
- `Term` — filet terminologique : `<Term id="stc">Save the Cat</Term>` affiche la définition du glossaire (`src/data/glossary.js`) dans une bulle au survol/focus. Sans enfant, affiche le `label` du terme ; id inconnu → rend les enfants sans décoration. Piloté sur le dashboard (section « Couverture des méthodes »).
- `SidePanel` — panneau latéral sliding
- **CookieConsent** — Bandeau cookie RGPD (style Axeptio). Mascotte cookie, boutons Accepter/Refuser, lien footer "Cookies" pour réouvrir. Gate le chargement de Crisp (chat).

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
