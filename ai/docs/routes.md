# Routes & navigation — Atlas Narratif

## Structure de l'app (App.jsx)

```
<DbProvider>               ← PGlite context
  <ProjectProvider>        ← projet actif context
    <AppLayout>            ← layout + TopNav + GlobalSearch
      <Routes>
        /                  ← HomePage (pas de guard)
        /review            ← RequireProject
        /dashboard         ← RequireProject
        /map               ← RequireProject
        /lore              ← RequireProject
        /relations         ← RequireProject
        /timeline          ← RequireProject
        /savethecat        ← RequireProject
        /arc               ← RequireProject
        /incoherences      ← RequireProject
      </Routes>
    </AppLayout>
  </ProjectProvider>
</DbProvider>
```

`<RequireProject>` : si `projects.length === 0`, redirige vers `/`.

## Routes détaillées

### `/` — HomePage
**Onboarding à 2 flux :**
1. **Construire** → choisir méthode (Save the Cat / Voyage du héros / 3 actes) → nommer le projet → `createEmptyProject()` → navigate `/savethecat`
2. **Analyser** → 3 modes :
   - `manuscript` : drag-drop fichier → `analyzeAndImport()` → navigate `/review`
   - `notes` : saisie texte libre → idem
   - `backup` : fichier `atlas_*.json` → `importFromBackup()` → navigate `/dashboard`

### `/review` — ReviewPage
Validation post-import IA. Résumé de l'extraction.

### `/dashboard` — DashboardRoute → NarrativeDashboard
Stats générales du projet. Navigation sortante :
- → `/incoherences?filter=X`
- → `/lore?tab=locations&search=X`
- → `/relations?entity=X`

### `/map` — MapRoute → AtlasMapView
Carte interactive. Navigation sortante :
- clic personnage → `/lore?tab=characters&search=X`
- clic lieu → `/lore?tab=locations&search=X`

### `/lore` — LoreRoute → LoreBrowser
Query params : `?tab=characters|locations|objects`, `?search=X`
Navigation sortante :
- clic entité → `/relations?entity=X`

### `/relations` — GraphRoute → EntityGraph
Query params : `?entity=<entityId>`
Navigation interne : clic nœud → update `?entity=`

### `/timeline` — TimelineBrowser
Pas de navigation sortante directe (autonome).

### `/savethecat` — SaveTheCat
Pas de navigation sortante.

### `/arc` — EmotionalArc
Pas de navigation sortante.

### `/incoherences` — IncoherencesRoute → IncoherencesBrowser
Query params : `?filter=all|critical|high|medium|low|resolved`
Navigation sortante :
- clic character/object → `/relations?entity=X`
- clic location → `/lore?tab=locations&search=X`

## Navigation cross-vues (pattern général)
- La navigation est toujours gérée dans les **route wrappers** de `App.jsx`, pas dans les composants feuilles
- Les composants exposent des callbacks (`onEntityClick`, `onCharacterClick`…)
- Les query params sont utilisés pour passer l'état de navigation (tab actif, entité sélectionnée, filtre)

## GlobalSearch (Ctrl+K / Cmd+K)
- Disponible depuis n'importe quelle route si `hasProjects`
- Résultats : personnages, lieux, objets
- Navigation vers `/lore?tab=X&search=X` ou `/relations?entity=X`
