# Routes & navigation — Atlas Narratif

## Structure de l'app (App.jsx)

```
<ProjectProvider>          ← projet actif context (pas de DbProvider)
  <AppLayout>              ← layout + TopNav + GlobalSearch
    <Routes>
      /                    ← HomePage (pas de guard)
      /review              ← RequireProject
      /dashboard           ← RequireProject
      /map                 ← RequireProject
      /lore                ← RequireProject
      /relations           ← RequireProject
      /timeline            ← RequireProject
      /savethecat          ← RequireProject
      /arc                 ← RequireProject
      /plants              ← RequireProject
      /threads             ← RequireProject
      /heros               ← RequireProject
      /incoherences        ← RequireProject
      /login               ← public
      /register            ← public
      /verify-email        ← public
      /forgot-password     ← public
      /reset-password      ← public
    </Routes>
  </AppLayout>
</ProjectProvider>
```

`<RequireProject>` : si `projects.length === 0`, redirige vers `/`.

## Routes détaillées

### `/` — HomePage

Onboarding à 2 flux :

1. **Construire** → choisir méthode (Save the Cat / Voyage du héros / 3 actes) → nommer → `createProject()` → navigate `/savethecat`
2. **Analyser** (import IA) :
   - Copier/télécharger le prompt → l'utilisateur l'envoie à son IA → importer le JSON → `importFromAiOutputViaApi()` → navigate `/review`

Bouton **"Charger la démo"** : `buildLotrSeedPayload()` + `seedProjectViaApi()` → navigate `/dashboard`.

**Bandeau anonyme** : si l'utilisateur n'est pas connecté et a des projets, un bandeau fixe en bas l'avertit que ses données sont liées au navigateur (risque de perte si cookies vidés) avec un lien vers `/login`.

### `/review` — ReviewPage

Validation post-import IA. Résumé de l'extraction.

### `/dashboard` — NarrativeDashboard

Stats générales du projet. Navigation sortante :
- → `/incoherences?filter=X`
- → `/lore?tab=locations&search=X`
- → `/relations?entity=X`

### `/map` — AtlasMapView

Carte interactive + trajets personnages. Navigation sortante :
- clic personnage → `/lore?tab=characters&search=X`
- clic lieu → `/lore?tab=locations&search=X`

### `/lore` — LoreBrowser

Query params : `?tab=characters|locations|objects`, `?search=X`
Navigation sortante : clic entité → `/relations?entity=X`

### `/relations` — EntityGraph

Query params : `?entity=<entityId>`
Navigation interne : clic nœud → update `?entity=`

### `/timeline` — TimelineBrowser

Pas de navigation sortante directe.

### `/savethecat` — SaveTheCat

Structure Save the Cat — 15 beats narratifs.

### `/arc` — EmotionalArc

Arc émotionnel par chapitre.

### `/plants` — PlantsBrowser

Tracker plant / payoff (amorces narratives).

### `/threads` — ThreadsBrowser

Gestion des fils narratifs (subplots).

### `/heros` — HeroJourney

Voyage du Héros — 12 étapes de Joseph Campbell.

### `/incoherences` — IncoherencesBrowser

Query params : `?filter=all|critical|high|medium|low|resolved`
Navigation sortante :
- clic character/object → `/relations?entity=X`
- clic location → `/lore?tab=locations&search=X`

## Routes auth (Better Auth)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | Email + mot de passe, lien Google OAuth |
| `/register` | `RegisterPage` | Création de compte + envoi email de vérification |
| `/verify-email` | `VerifyEmailPage` | Écran "vérifiez votre boîte mail" |
| `/forgot-password` | `ForgotPasswordPage` | Demande de reset password |
| `/reset-password` | `ResetPasswordPage` | Saisie du nouveau mot de passe (token en query param) |

Client auth : `src/lib/authClient.js` (Better Auth React, `baseURL = VITE_API_URL`, `basePath = '/auth'`)

Le `TopNav` affiche le nom de l'utilisateur connecté + bouton "Déconnexion" via `authClient.useSession()`. Les pages `/login` et `/register` proposent également un bouton "Continuer avec Google" (`authClient.signIn.social({ provider: 'google' })`).

Au logout, `reloadProjects()` est appelé automatiquement dans `AppLayout` (via `useEffect` sur `session?.user?.id`) — la liste des projets est vidée immédiatement sans refresh.

## Navigation cross-vues (pattern général)

- La navigation est gérée dans les **route wrappers** de `App.jsx`, pas dans les composants feuilles
- Les composants exposent des callbacks (`onEntityClick`, `onCharacterClick`…)
- Les query params transmettent l'état de navigation (tab actif, entité sélectionnée, filtre)

## GlobalSearch (Ctrl+K / Cmd+K)

- Disponible depuis n'importe quelle route si `hasProjects`
- Résultats : personnages, lieux, objets
- Navigation vers `/lore?tab=X&search=X` ou `/relations?entity=X`
