# ⏭️ MISSION SUIVANTE (session autonome de nuit) — Import de scènes/chapitres Obsidian → timeline + STC

> Lire CETTE section EN PREMIER puis exécuter en autonomie. Contexte suffisant ici.
> Branche `feat/obsidian-custom-entities` (PR #20 vers `main`). Commits atomiques, push, MAJ description PR (`gh pr edit 20`).
> ⚠️ `node --watch` dans Docker ne recharge PAS le bind mount (macOS) → **redémarrer l'API** (`docker restart atlas-narratif-api-1`) après toute modif `server/**`. Ici : normalement AUCUNE modif serveur (le seed gère déjà timelineDB/chaptersDB/eventExtras).

## Mission
Étendre l'importeur Obsidian pour que des notes « scène/chapitre » produisent des **événements timeline** (`timelineDB`) + **chapitres Save the Cat** (`chaptersDB`) + **event_entities** (qui/où/quoi présents), en réutilisant le pipeline existant `parseVault → mapToCanonical → ImportPreview (/review staging) → seedProjectViaApi`. AUCUN nouveau schéma serveur (les collections sont déjà seedées).

## Décisions PRISES par l'utilisateur (ne pas re-demander)
1. **Granularité** : note `type: scène` → 1 événement `timelineDB` ; note `type: chapitre` → 1 entrée `chaptersDB` (STC) (titre/résumé du chapitre). Les deux cohabitent.
2. **event_entities** : union du **frontmatter** (`personnages`/`lieux`/`objets` — listes de noms/wikilinks) **ET** des **wikilinks `[[...]]` du corps** de la scène. `pov` → `povCharacterId`, `lieu` (1er) → `locationId`. Résolution via l'index nom→{id,entityType} (déjà construit dans mapToCanonical) + `resolveEntityByName` si besoin.
3. **Multi-tome** : frontmatter `tome`/`volume` → `volumeId` ; créer les entrées `volumesDB` manquantes (id `vol_<slug>`, number incrémental).
4. **Périmètre** : FULL autonome — implémentation + **notes scènes/chapitres ajoutées au vault HP** (`e2e/fixtures/hp-vault/`) + tests unitaires + E2E + doc + commits atomiques + PR.

## Forme canonique cible (déjà consommée par le seed & `analysis_prompt.js`)
- `timelineDB[]` (cf. section `### timelineDB[]` de `src/data/analysis_prompt.js`) : `{ id, chapter (num), chapterTitle, title, description, locationId, volumeId, isFlashback:false, entities:[{id,entityType}], beatId?, povCharacterId?, threadIds:[], sceneGoal?, sceneConflict?, sceneOutcome? }`.
- `chaptersDB[]` : voir `### chaptersDB[]` du prompt (`{ id: 'ch_..', number, title, summary, volumeId, beats? }`).
- Id : scène `evt_<slug>`, chapitre `ch_<num>`, tome `vol_<slug>`.

## Cartographie (fichiers à toucher — re-Read avant d'éditer)
- `src/import/obsidian/fieldMap.js` : ajouter `TYPE_HINTS.scene`/`chapter` (synonymes fr/en : scène/scene, chapitre/chapter) + synonymes de champs scène (`chapitre`→chapter, `ordre`/`scène`→sceneOrder, `pov`/`point de vue`→pov, `lieu`→location, `personnages`/`objets`→entities, `tome`/`volume`→volume, `résumé`/`resume`→description, `beat`, `threads`/`fils`).
- `src/import/obsidian/mapToCanonical.js` : dans la 1re passe de classification, détecter scène/chapitre AVANT le noyau typé (une note scène n'est ni perso/lieu/objet). Construire `timelineDB` (tri par volumeId, chapter, sceneOrder), `chaptersDB` (dédup par chapitre), résoudre `entities`/`pov`/`locationId` via l'index nom→id. Générer `volumesDB` pour les tomes rencontrés. Étendre `report.counts` (scenes, chapters).
- `src/components/import/ImportPreview.jsx` : ajouter les comptages Scènes/Chapitres (Stat).
- `src/api/importFromObsidian.js` : `stampSource` sur timelineDB/chaptersDB/volumesDB ; le payload passe déjà à `seedProjectViaApi`.
- Vérifier `server/src/seed.js` : timelineDB (avec `entities` → event_entities), chaptersDB, eventExtrasDB, volumesDB sont déjà insérés (ne rien changer sauf trou avéré). `importFromAiOutputViaApi.js` construit `eventExtrasDB` depuis les champs inline de l'événement (beatId/pov/threadIds/sceneGoal…) — répliquer cette dérivation dans le flux Obsidian si le seed attend `eventExtrasDB` séparé (À VÉRIFIER : soit mettre les extras inline dans timelineDB, soit remplir eventExtrasDB).
- Fixtures : ajouter au vault HP quelques notes `type: scène` (chapitre 1-2, pov, lieu Poudlard, personnages, wikilinks corps) + 1-2 notes `type: chapitre` (titre/résumé), éventuellement `tome: 1`.
- Tests : unités `mapToCanonical`/`parseVault` (classification scène/chapitre, event_entities frontmatter+wikilinks, multi-tome) ; E2E `e2e/obsidian-hp.spec.js` étendu (après seed : /timeline montre les scènes, /review compteur Événements > 0) ou nouveau `e2e/obsidian-scenes.spec.js`.
- Docs : `ai/docs/components.md` (VaultImporter/mapToCanonical scènes) + note dans `analysis_prompt.js` (déjà OK) ; MAJ « État réel » en bas de ce HANDOFF.

## Gate (Docker uniquement — jamais npm/node local)
`make lint` (0) · `make test` (498+ actuel) · `make build` (0) · `make e2e` (ou e2e-file). Corriger avant de committer. Puis push + `gh pr edit 20` (ajouter une puce « Import de scènes → timeline + STC »).

## Repas de reprise si interrompu
`git log --oneline main..HEAD` (dernier commit poussé : `797d85d`), `git status`, reprendre à la 1re sous-étape non faite.

---

# HANDOFF — Session autonome : ingestion Obsidian + entités custom + chat

> Brief d'exécution auto-suffisant. Écrit avant un `/clear`. Après le clear, lire ce fichier
> ENTIÈREMENT puis exécuter. Tout le contexte nécessaire est ici — pas besoin de re-lancer
> les agents de recherche.

## 0. Mission

Améliorer Atlas Narratif (React + Hono API + PostgreSQL) pour :
1. Rendre le schéma **extensible** (champs custom + types d'entités custom) sans casser le noyau typé.
2. Préparer l'**ingestion de vaults Obsidian** (produire le JSON canonique existant).
3. Ajouter un **chat de requête** (niveau 1 déterministe sans IA, niveau 2 RAG mocké).

Insight central : le JSON de `src/data/analysis_prompt.js` EST déjà le modèle canonique.
Tout adaptateur (Obsidian) doit produire ce JSON → réutiliser `seedProjectViaApi` → `POST /api/seed`.

## 1. Décisions prises par l'utilisateur (NE PAS re-demander)

- **Périmètre nuit** : étapes 1→3 **implémentées + testées** ; étapes 4→6 **scaffoldées**
  (importeur en squelette+TODO ; staging squelette ; chat niveau 1 FONCTIONNEL + niveau 2 MOCKÉ).
- **Livraison Git** : branche `feat/obsidian-custom-entities` (DÉJÀ CRÉÉE et checkout), commits
  **atomiques par sous-étape**, puis **PR draft** vers `main` (push la branche + ouvrir la PR draft via `gh`).
- **Vérif** : lancer `make lint`, `make test`, `make build` au fil de l'eau et corriger les échecs.
  `make e2e` seulement si l'environnement suit. **Tout via Docker/make — jamais npm/npx/node en local.**
- **Chat (étape 6)** : abstraction `llmProvider` + `MockProvider` (réponses structurées canned) →
  AUCUNE clé requise. Niveau 1 (routeur qui/où/quoi) pleinement fonctionnel + testé ; niveau 2 câblé sur le mock.

## 2. Règles projet impératives (CLAUDE.md)

À CHAQUE étape, respecter :
- Nouvelle table SQL → mettre à jour `src/db/seed.generic.js` **+** le seed LOTR (`src/data/lotr_seed_data.js`
  ou `lotr_t2/t3`) avec des données d'exemple.
- Nouvelle collection **importable** → l'ajouter au format de sortie de `src/data/analysis_prompt.js`
  (+ règles d'ID). Confirmer au réveil (défaut = on l'ajoute).
- Toute modif `src/db/` ou serveur → **tests** (`src/db/queries.crud.test.js`, etc.).
- Feature visible → **E2E Playwright** (`e2e/*.spec.js`, `import { test, expect } from './fixtures.js'`).
- Impact archi → mettre à jour `ai/docs/data-layer.md` / `components.md` / `routes.md`.
- Conventions mémorisées : toasts (vert=création, neutre=suppression, rouge=erreur API) ;
  layout page (root `h-full flex-col overflow-hidden` + corps `flex-1 min-h-0 overflow-y-auto`, pas de sticky) ;
  i18n pour toutes les chaînes ; dark theme ; couleur principale `#3F51B5`.
- `data-testid` seulement si les locators natifs (getByRole/getByText) sont insuffisants.

## 3. Cartographie du code (FAITS VÉRIFIÉS — ne pas re-explorer, juste re-Read avant d'éditer)

### Migrations
- Système réel : `server/src/migrate.js` applique `server/db/migrations/*.sql` triés par nom,
  chacun dans `sql.begin` + insert dans `schema_migrations`. Appelé au démarrage (`server/src/index.js`).
- **Procédure** : créer `server/db/migrations/005_custom_data.sql` (DDL idempotent) **+** répliquer le DDL
  dans `server/db/init.sql` (installs Docker neuves). PAS de `SCHEMA_VERSION` (fichier `src/db/schema.js`
  N'EXISTE PLUS — legacy PGlite). ⚠️ Corriger cette règle périmée dans `CLAUDE.md` (section Migrations).

### Chiffrement (`server/src/crypto.js`)
- `encrypt(plaintext, dek)` : si non-string → `JSON.stringify` puis AES-GCM → string `enc:v1:<b64>`.
  Gère null/undefined (retourne tel quel). `decrypt(ciphertext, dek)` inverse.
- `getProjectDek(projectId)` (lecture, cache), `createProjectDek(projectId, tx)` (seed, accepte tx).
- **JSONB chiffré** : les colonnes JSONB (aliases, affiliations, traits) stockent la STRING `enc:v1:...`.
  Lecture = `parseJ(decrypt(r.col, dek), défaut)`. `parseJ` = JSON.parse safe (dans db-queries.js ~29-35).
- Donc `custom_fields` JSONB → écrire `encrypt(data.customFields ?? {}, dek)` ; lire `parseJ(decrypt(r.custom_fields, dek), {})`.
- ⚠️ Chiffré = NON requêtable en SQL. Filtrage = en mémoire après déchiffrement (cf. `findCharacterByName`).

### Validateurs (`server/src/validators.js`) — Zod
- Entités lore en `.strict()` NON : elles sont en **`.strip()`** (character, location, object, timelineEvent, group)
  → un champ inconnu comme `customFields` est **silencieusement supprimé** si non déclaré. DONC l'ajouter.
- `v.seed` = `{ meta:{id?,name,description?}, data:{...} }`, `data` en `.strict()` avec whitelist FERMÉE de
  collections : loreDB, timelineDB, incoherencesDB, chaptersDB, journeys, groupsDB, plantsDB, arcPointsDB,
  threadsDB, eventExtrasDB, characterArcsDB, heroJourneyDB, volumesDB. `loreDB` = `z.record(string, z.array(z.record(string, unknown)))` (déjà ouvert aux sous-clés).
- `v.importBackup` = `.strict()`, `version: z.literal('1.0')`, une clé array par table.
- **À faire** : ajouter `customFields: z.record(z.string(), z.unknown()).nullish()` à character/location/object ;
  créer `customEntityType` + `customEntity` ; les enregistrer dans `v.seed.data` (`customTypesDB`, `customEntitiesDB`)
  et dans `v.importBackup`.

### db-queries (`server/src/db-queries.js`)
- `makeId(prefix, projectId)` = `` `${prefix}_${projectId}_${Date.now()}` `` (~21-23).
- `SOURCE_CASE` = `"source = CASE WHEN source='import' THEN 'modified' ELSE source END"` (~19),
  injecté via `${sql.unsafe(SOURCE_CASE)}` — NE JAMAIS y mettre de variable.
- Bloc characters ~110-216 = modèle canonique : `getCharacters` (SELECT + decrypt + parseJ),
  `insertCharacter` (getProjectDek, makeId('char',...), encrypt champs, `source='manual'`),
  `updateCharacter` (UPDATE + SOURCE_CASE), `deleteCharacter` (snapshot + suppression dépendances + retour snapshot),
  `restoreCharacter`. `findCharacterByName` ~132-149 (decrypt all + filter JS sur name/aliases).
- locations ~ objects suivent le même pattern.
- **À faire étape 1** : ajouter encrypt/decrypt `custom_fields` dans insert/update/get de characters/locations/objects.
- **À faire étape 3** : dupliquer le bloc en `*CustomEntity` et `*CustomEntityType` (préfixes `cent`, `ctype`).

### Routes (`server/src/routes/api.js`)
- `wrap(async c => …)` (~82) try/catch→500. `parseBody(c, schema)` (~98) safeParse→{data}|{error:400}.
- Sécurité globale : `requireIdentity` + `requireProjectOwner` sur `/projects/:projectId/*` (pas de re-check par route).
- Bloc characters ~233-277 : POST/PUT/DELETE/POST-restore. Route seed : `POST /api/seed` ~750 → `seedProject`.
- **À faire étape 3** : blocs `/projects/:projectId/custom-types` et `/custom-entities` calqués.

### Client (`src/api/client.js`)
- helpers `get/post/put/del` (~85-88) au-dessus de `api()` (~47, injecte X-Device-Id, credentials, toasts/401).
- characters ~155-184 : getCharacters (`GET /projects/:id/lore` → .characters), insert/update/delete/restore.
- `seedProjectViaApi` ~493 → `POST /api/seed`.
- **À faire étape 3** : `get/insert/update/deleteCustomEntity(Type)`.

### Stores (`src/stores/`)
- Factory `createEntityStore.js` : `{initialState, fetchFn, insertFn, updateFn, deleteFn}` → `load/_reload/save(id,data)/remove(id)/reset`.
- `useLoreStore.js` : pattern manuel `_withSaving(fn)` (~22-35), `saveCharacter`/`removeCharacter`, `_reload` via `getLoreData`+`initEntityCache`.
- **À faire étape 3** : `useCustomEntityStore.js` via `createEntityStore`.

### UI lore (`src/components/lore/EntityEditor.jsx`)
- `TYPE_CONFIG` (~12-16) mappe type→action store. `CharacterFields`/`LocationFields`/`ObjectFields`.
- `TagInput` local (~24-64) = widget liste clé réutilisable. `initData(entityType, entity, groups)` (~373-384).
  `set(key,value)` (~416). `handleSave` → `saveAction(id, {...data})` (~418-422) — passe tout `data`.
- **À faire étape 2** : sous-composant `CustomFields({data,set,t})` (liste clé/valeur), l'afficher pour les 3 types
  après le champ Nom (~456-472) ; `initData` → `customFields: entity?.customFields ?? {}`.

### GlobalSearch (`src/components/search/GlobalSearch.jsx`)
- 100% client, en mémoire sur les stores. `match(str)=includes(q)`. characters : `match(c.name)||match(c.description)`
  (~105) — NE cherche PAS `aliases`. Résultat `{id,group,title,sub,badge,action(navigate)}`.
- **À faire étape 2** : ajouter `(c.aliases??[]).some(a=>match(a))` + valeurs `customFields`. (Étape 0 « chat d'alias » ANNULÉE par l'utilisateur — juste étendre la recherche discrètement, pas de feature dédiée.)

### ReviewPage (`src/pages/ReviewPage.jsx`)
- `SourceBadge` défini inline (~20-30), libellés `import/manual/modified`. S'exécute APRÈS le seed.
- Filtres source (~33-38). **À faire** : ajouter `'obsidian'` aux libellés/filtres.

### Contraintes CHECK (init.sql)
- `event_entities.entity_type` CHECK IN ('character','location','object') (~158) — BLOQUE les types custom.
- `stc_chapter_entities.entity_type` CHECK (~206) — idem.
- `incoherence_links.entity_type` (~179) et `plant_payoffs.entity_type` (~248) = TEXT libre (OK).
- **À faire étape 1** : DROP + recréer élargi (`…,'custom'`) ou TEXT libre.

### Seed (`server/src/seed.js`)
- `seedProject` fait tout dans `sql.begin(tx => _doSeed(...))` (transactionnel, rollback auto).
  Supprime/recrée le projet avant re-seed. `createProjectDek(projectId, tx)`.

## 4. SQL migration 005 (à créer : server/db/migrations/005_custom_data.sql + miroir init.sql)

```sql
ALTER TABLE characters ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE locations  ADD COLUMN IF NOT EXISTS custom_fields JSONB;
ALTER TABLE objects    ADD COLUMN IF NOT EXISTS custom_fields JSONB;

CREATE TABLE IF NOT EXISTS custom_entity_types (
  id TEXT, project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT, icon TEXT, color TEXT,
  field_schema JSONB, base_behavior TEXT,
  PRIMARY KEY (id, project_id)
);
CREATE TABLE IF NOT EXISTS custom_entities (
  id TEXT, project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  type_id TEXT, name TEXT, aliases JSONB,
  custom_fields JSONB, description TEXT, source TEXT DEFAULT 'import',
  PRIMARY KEY (id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_custom_entities_type ON custom_entities(project_id, type_id);

ALTER TABLE event_entities       DROP CONSTRAINT IF EXISTS event_entities_entity_type_check;
ALTER TABLE stc_chapter_entities DROP CONSTRAINT IF EXISTS stc_chapter_entities_entity_type_check;
-- recréer un CHECK élargi OU laisser TEXT libre (choisir : élargi + 'custom')
ALTER TABLE event_entities       ADD CONSTRAINT event_entities_entity_type_check
  CHECK (entity_type IN ('character','location','object','custom'));
ALTER TABLE stc_chapter_entities ADD CONSTRAINT stc_chapter_entities_entity_type_check
  CHECK (entity_type IN ('character','location','object','custom'));
```
Note : les entités custom relient via `entity_type='custom'` + `entity_id` = id de la custom_entity.

## 5. Modèle d'extensibilité (3 couches — la cible)

1. **Noyau typé** (characters/locations/objects/events…) : INCHANGÉ, alimente STC/héros/arcs/graphe. Ne pas toucher.
2. **Champs custom** sur le noyau : bag `custom_fields` JSONB chiffré (âge, signe…). Cherchable, éditable, promouvable.
3. **Types custom** (`custom_entity_types` + `custom_entities`) : catégories user (Véhicule, Langue…),
   citoyennes du graphe/recherche/wikilinks/events, mais SANS features d'analyse (normal).
   → l'ingestion Obsidian ne jette plus rien (champ inconnu→couche 2, catégorie inconnue→couche 3).

## 6. Découpage en sous-étapes (commits atomiques)

**Étape 1 — Fondations (FULL + tests)**
1.1 migration 005 + miroir init.sql.
1.2 validators.js : customFields sur character/location/object + schémas customEntityType/customEntity + enregistrement seed/backup.
1.3 db-queries.js : encrypt/decrypt custom_fields dans insert/update/get des 3 entités natives.
1.4 tests round-trip (`src/db/queries.crud.test.js`) + maj `ai/docs/data-layer.md` + fix CLAUDE.md (SCHEMA_VERSION).
→ `make lint && make test`.

**Étape 2 — Champs custom sur natives (FULL + tests + E2E)**
2.1 `CustomFields` dans EntityEditor + initData + affichage cartes/fiches.
2.2 SourceBadge 'obsidian' (ReviewPage) + filtres.
2.3 GlobalSearch : aliases + valeurs customFields.
2.4 seed LOTR : un champ custom d'exemple. E2E `e2e/custom-fields.spec.js`.
→ `make lint && make test && make build`.

**Étape 3 — Types & entités custom (FULL + tests + E2E)**
3.1 db-queries CRUD custom types + entités (calqué characters).
3.2 routes api.js (`/custom-types`, `/custom-entities`).
3.3 client.js fns + `useCustomEntityStore`.
3.4 UI : `CustomTypeEditor.jsx` + `CustomEntityBrowser.jsx` + route dans App.jsx + nav.
3.5 intégration graphe (EntityGraph) + GlobalSearch + lien events.
3.6 seed LOTR (type Langue : Quenya/Sindarin) + analysis_prompt (customTypesDB/customEntitiesDB) + tests + E2E.
→ `make lint && make test && make build`.

**Étape 4 — Importeur Obsidian (SCAFFOLD + TODO)**
- Ajouter deps via `make install` : jszip, gray-matter, remark, remark-parse, remark-frontmatter, remark-wiki-link.
  Si échec rebuild → noter dans HANDOFF et stub.
- Créer (squelettes fonctionnels partiels + TODO clairs) :
  `src/import/obsidian/parseVault.js` (unzip + frontmatter + inline `::` + tags + wikilinks + body),
  `src/import/obsidian/fieldMap.js` (dictionnaire synonymes multilingue + fuzzy),
  `src/import/obsidian/mapToCanonical.js` (classification + résolution wikilinks + enveloppe canonique + rapport liens cassés),
  `src/api/importFromObsidian.js` (→ seedProjectViaApi, source:'obsidian'),
  `src/components/import/VaultImporter.jsx` (drag zip + mapping réutilisable).
- Fixtures de vault synthétiques + tests unitaires du parser (au moins un cas vert).

**Étape 5 — /review staging (SCAFFOLD)**
- `src/components/import/ImportPreview.jsx` : lit le payload EN MÉMOIRE (pas la DB) avant `seedProjectViaApi`.
  Point d'insertion : `src/api/importFromAiOutputViaApi.js` ~32-64 (payload dispo avant l'appel seed).
  Dédup candidats (Fuse.js) + rapport liens cassés + bouton « Confirmer l'import ». TODO clairs.

**Étape 6 — Chat (niveau 1 FULL + niveau 2 MOCK)**
6.1 Abstraction : `server/src/llm/provider.js` (interface) + `MockProvider` (réponses structurées canned)
    + sélection via env (`LLM_PROVIDER=mock|anthropic`, défaut mock). Anthropic provider = stub qui lit
    `ANTHROPIC_API_KEY` (non requis cette nuit).
6.2 Niveau 1 : `src/chat/router.js` — intents (qui/où/quels) → parcours stores (lieu d'un perso, objets portés,
    events d'un chapitre, résolution alias). Déterministe, 0 IA. Tests `src/chat/router.test.js`.
6.3 Niveau 2 : route `server/src/routes/ask.js` (`POST /projects/:id/ask`) → retrieval (réutilise recherche)
    → déchiffre contexte (DEK) → `provider.ask()` (mock) → réponse citée. Câblé, testable via mock.
6.4 UI : `src/components/chat/ChatPanel.jsx` (route/entrée). E2E `e2e/chat.spec.js` (niveau 1).
6.5 `.env.example` (serveur + prod) : `ANTHROPIC_API_KEY`, `LLM_PROVIDER`. Garde-fous coût (Haiku/Sonnet, cap).

## 6bis. Tenir l'artefact plan À JOUR (demande explicite de l'utilisateur)

Après CHAQUE étape terminée (ou dès qu'un TODO / point à ajouter apparaît), mettre à jour l'artefact
du plan et le republier **en gardant le même lien** :
- Fichier source : `/private/tmp/claude-502/-Users-barbe-Sites-atlas-narratif/52aa38a8-a904-45f7-a23e-4d4f41670cbd/scratchpad/plan-implementation.html`
  (s'il n'existe plus après le clear, le recréer depuis le contenu / l'URL via WebFetch de l'artefact).
- Marquer chaque étape faite (ex. badge « ✓ FAIT » sur le bloc de phase), ajuster les sous-étapes,
  ajouter les TODO/écarts découverts en cours de route, mettre à jour la checklist de réveil si besoin.
- Republier avec le tool Artifact en passant `url=https://claude.ai/code/artifact/ad3a0c6f-4098-4db2-9582-4e3edde61e79`
  ET `file_path` du fichier ci-dessus, pour conserver le MÊME lien. Favicon inchangé : 🧭.
- Fréquence : au minimum à la fin de chaque étape (1, 2, 3) et à la fin de la session. Idéalement aussi
  quand un scaffold (4/5/6) révèle un TODO important.

## 7. Finalisation
- Mettre à jour ce HANDOFF.md avec l'état réel (fait/scaffold/TODO/échecs) à la fin.
- `make lint && make test && make build` verts (corriger sinon).
- Commits atomiques poussés ; ouvrir **PR draft** vers main via `gh pr create --draft`
  (titre : "feat: extensibilité schéma (champs+types custom) + socle ingestion Obsidian & chat").
  Corps : résumer étapes faites/scaffoldées + renvoyer à HANDOFF.md + la checklist de réveil.
- Fin de message commit/PR : `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
  et PR body : `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## 7bis. Protocole de REPRISE (si la session s'est arrêtée en cours de route)

Toute nouvelle invocation qui reprend le travail DOIT d'abord :
1. `git branch --show-current` → doit être `feat/obsidian-custom-entities` (sinon `git checkout` dessus).
2. `git log --oneline main..HEAD` → voir les sous-étapes déjà committées (chaque commit = une sous-étape §6).
3. `git status` → récupérer un éventuel travail non committé en cours.
4. Relire la section « État réel » en bas de ce fichier (mise à jour au fil de l'eau) pour savoir
   ce qui est FAIT / EN COURS / TODO.
5. Reprendre à la première sous-étape non faite, dans l'ordre du §6. Ne jamais recommencer une étape déjà committée.
6. Continuer à committer atomiquement + tenir l'artefact à jour (§6bis).

## 8. Checklist du réveil (ce que l'utilisateur doit fournir/décider)
- **Reviewer la PR draft** (branche `feat/obsidian-custom-entities`).
- **[Décision requise] Deps npm Obsidian NON ajoutées** (jszip/gray-matter/remark). Choix pris pour garder le build vert en run non-supervisé → le parser Obsidian utilise des regex + entrée fichiers `.md` (pas `.zip`). À valider : lancer `make add p="jszip gray-matter remark remark-parse remark-frontmatter remark-frontmatter remark-wiki-link fuse.js"` puis brancher les TODOs des fichiers `src/import/obsidian/*` et `ImportPreview` (Fuse.js).
- **[Décision requise] 3.5 partiel** : graphe de relations + rattachement aux events NON intégrés (vues core sensibles). Le schéma accepte déjà `event_entities.entity_type='custom'`. À faire en session supervisée (voir §10 [3.5]).
- `ANTHROPIC_API_KEY` (requis pour le chat réel ; **mocké** cette nuit, `LLM_PROVIDER=mock` par défaut, aucun appel réseau).
- Décision facturation chat : clé Atlas et/ou BYO-key (le client fournit la sienne).
- Confirmer modèle chat (défaut suggéré Haiku, escalade Sonnet) + implémenter `AnthropicProvider.ask` (stub aujourd'hui).
- Fournir un vrai vault Obsidian (anonymisé) pour caler le field-mapping (`src/import/obsidian/fieldMap.js`).
- Confirmer inclusion des collections custom dans `analysis_prompt.js` (FAIT — customTypesDB/customEntitiesDB ajoutées ; à valider).
- Valider le fix CLAUDE.md (règle Migrations réécrite, SCHEMA_VERSION périmé supprimé).

## 9. Références (survivent au clear)
- Artefact architecture : https://claude.ai/code/artifact/58dbf5ca-51a7-43ce-8d60-adf836a6caf9
- Artefact plan d'implémentation : https://claude.ai/code/artifact/ad3a0c6f-4098-4db2-9582-4e3edde61e79
- Branche : `feat/obsidian-custom-entities` (déjà créée).

## 10. État réel (mettre à jour au fil de l'eau — source de vérité pour la reprise)

> Format : `[étape.sous-étape] STATUT — note`. Statuts : TODO / EN COURS / FAIT (commit <hash>).

### Post-session (5e vague — import scènes/chapitres Obsidian → timeline + STC)
- [Scènes/chapitres Obsidian] FAIT — l'importeur Obsidian produit désormais des événements timeline et des chapitres STC.
  - `fieldMap.js` : `NARRATIVE_HINTS` (scène/chapitre, fr/en, via type/tag/dossier) + `classifyNarrative()` ; `SCENE_FIELD_SYNONYMS` + `mapSceneField()` (chapitre→chapter, ordre/scène→sceneOrder, pov/point de vue→pov, lieu→location, personnages/lieux/objets→listes d'entités, tome/volume→volume, résumé→description, beat, threads/fils, objectif/conflit/résultat→scene{Goal,Conflict,Outcome}, numéro→number).
  - `mapToCanonical.js` : classification narrative AVANT le noyau typé (une scène n'est pas une entité). Émet `timelineDB` (tri tome→chapitre→sceneOrder), `eventExtrasDB` (pov/beat/threads/goal/conflict/outcome/sceneOrder — ce que le seed consomme réellement), `chaptersDB` (le titre du chapitre alimente `chapterTitle` des scènes du même chapitre/tome), `volumesDB` (multi-tome, id `vol_<slug>`). `event_entities` = union frontmatter (personnages/lieux/objets) + wikilinks du corps ; `pov`→povCharacterId, `lieu` (1er)→locationId. Liens cassés signalés dans `report.brokenLinks`.
  - `importFromObsidian.js` : `stampSource('obsidian')` étendu à timelineDB/chaptersDB/volumesDB. Le payload (incl. eventExtrasDB/volumesDB) passe déjà à `seedProjectViaApi` — AUCUNE modif serveur (seed.js consomme déjà ces collections).
  - `ImportPreview.jsx` : comptages Scènes/Chapitres.
  - Fixtures : `e2e/fixtures/hp-vault/Scenes/*` (2 scènes : pov, lieu Poudlard, personnages, objets, wikilinks corps, tome 1) + `Chapitres/*` (2 chapitres, tome 1).
  - Tests : `src/import/obsidian/mapToCanonical.scenes.test.js` (13 verts : classification, event_entities frontmatter+wikilinks, pov/lieu, extras, multi-tome, tri, liens cassés, chapterTitle). E2E `e2e/obsidian-scenes.spec.js` (staging Scènes/Chapitres → seed → /timeline scènes + titre de chapitre → /savethecat Ch.1).
  - Gate : `make lint` 0, `make test` 511 verts, `make build` 0, `make e2e` (obsidian-scenes + obsidian-hp verts ; suite complète relancée).

### Post-session (4e vague — vault de test HP + fix id + vérif web)
- [Vault test HP] FAIT — vault Obsidian Harry Potter dans `e2e/fixtures/hp-vault/` (11 notes `.md` : 3 perso, 2 lieux, 2 objets, types custom Maison [Gryffondor, Serpentard] + Sortilège [Expelliarmus, Wingardium Leviosa], wikilinks dont 2 cassés). E2E `e2e/obsidian-hp.spec.js` : parse → staging → seed → /review (badge Obsidian ×7) + /custom (onglets Maison/Sortilège). Vérifié aussi en direct au navigateur (Chrome DevTools MCP).
- [FIX id projet Obsidian] FAIT — `seedObsidianData` (src/api/importFromObsidian.js) génère désormais un `meta.id` UNIQUE (`obsidian_<ts><rand>`). Avant : `meta.id` undefined → serveur résolvait `undefined_d_<device>` pour TOUS les imports → chaque import écrasait le précédent + id moche. Vérifié : 2 imports = 2 projets distincts.
- ⚠️ [Piège dev] `node --watch` dans le conteneur API NE recharge PAS les changements du bind mount sur macOS. Après toute modif `server/**`, faire `docker restart atlas-narratif-api-1` (sinon on teste du code périmé — c'est ce qui faisait afficher « Importé » au lieu d'« Obsidian » pour lieux/objets alors que le code sur disque était correct).
- [Wikilinks « vrais liens » — Niveau 1+2] FAIT — décidé avec l'utilisateur.
  - **N1** : `src/components/ui/WikiText.jsx` rend `[[Cible]]`/`[[Cible|alias]]` cliquables (résout nom→entité via `resolveEntityByName` dans entityUtils). Cible → **la FICHE** de l'entité, même convention que la recherche globale (Ctrl+K) : `/lore?tab=<type>&search=<nom>` (noyau typé) ou deep-link `/custom?type=<typeId>&entity=<id>` (entité custom : présélectionne l'onglet + ouvre la fiche) — PAS le graphe (le graphe reste à un clic via le bouton « Relations » de la fiche). Utilisé dans CharacterCard/LocationCard/ObjectCard + carte /custom.
    - `CustomEntityBrowser` lit `?type`/`?entity` (useSearchParams) : onglet présélectionné + éditeur ouvert.
    - **`ProjectContext.loadCore` charge désormais aussi `useCustomEntityStore`** (en plus de lore+volumes) : le cache custom est chaud partout, donc les wikilinks vers entités custom se résolvent sur toutes les pages (avant : seulement /custom et /relations). `CustomFieldChips` masque les clés `__` (plus de puce `__links`). Cible non résolue → texte brut sans crochets.
  - **N2** : `buildGraph` crée des arêtes `wikilink` (relType, couleur `#E879F9`, i18n `graph.rel_wikilink`) dans les deux sens depuis `customFields.__links` — les entités custom deviennent citoyennes du graphe /relations. Corrigé au passage : `graph.rel_event` **et** `graph.rel_wikilink` manquants (fr/en/zh) — les labels d'arêtes affichaient la clé brute.
  - **UX** : en-têtes de colonnes CLÉ/LIBELLÉ/TYPE dans `CustomTypeEditor` (i18n `customType.fieldTypeCol`) — l'import met `label=key`, d'où l'impression de « champ en double ».
  - Tests : buildGraph (+3 wikilink), entityUtils (+3 resolveEntityByName), e2e obsidian-hp étendu (N1 clic→graphe, N2 nœud custom, __links absent). Gate : 491 tests front, lint 0 erreur, build OK, `make e2e` exit 0 (45 specs).
- [Niveau 3 — relations first-class : Phase A] FAIT (décidé avec l'utilisateur : import+UI manuelle, orienté+libellé libre, commencer par A).
  - Migration 006 `entity_relations` (+ miroir init.sql) : polymorphe, `label` chiffré, `directed`, `source`.
  - Backend : validators (`entityRelation` + `relationsDB` seed/backup + `restoreRelation`), db-queries CRUD (préfixe `rel`, label chiffré), routes `/projects/:id/relations`.
  - Client/state : client fns, `useRelationStore` (factory, alimente `setRelationCache`), chargé par `loadCore` (cache chaud partout).
  - Graphe : `buildGraph` lit les relations (passe EN PREMIER → prime sur les arêtes dérivées), libellé libre affiché (ou i18n si `graph.rel_<label>` existe) ; EntityGraph `relLabel` helper + fallback couleur.
  - Import : `mapToCanonical` émet `relationsDB` (les wikilinks → relations, `source='obsidian'`) — le hack `__links` est retiré. seed.js insère `relationsDB`. Seed LOTR : 5 relations d'exemple (porte/manie/ami de/parle→Quenya custom).
  - Tests : server round-trip (4), buildGraph relations (4). Vérifié en direct (graphe LOTR : « porte », « ami de » ; import HP). Gate : 492 tests front, server-test vert, lint 0, build 0, e2e verts.
- [Niveau 3 — Phase B : UI manuelle] FAIT.
  - `src/components/relations/RelationsSection.jsx` : sur la fiche (EntityEditor natif + CustomEntityEditor, mode édition), liste des relations de l'entité (libellé éditable onBlur + toggle sens →/←/↔ + suppression undoable) et formulaire d'ajout (recherche cible parmi toutes les entités → sélection → libellé libre + sens → « Lier »). Sauvegarde immédiate (pas besoin du bouton Save de la fiche).
  - Cleanup : `deleteCharacter/Location/Object/CustomEntity` purgent les relations de l'entité (source OU cible), les incluent dans le snapshot, et `restore*` les ramènent (+ validateurs restore : `relations` autorisé ; helper `_restoreRelationRows`).
  - i18n `relations.*` + singuliers `label.character/location/object/custom` (fr/en/zh).
  - Tests : serveur (+1 : delete entité purge/restore relations) ; E2E `e2e/relations.spec.js` (ajout → persistance → suppression). Vérifié en direct (Gimli → « ami de » → Legolas : créé, visible au graphe, supprimé avec toast Annuler).
  - Gate : 492 tests front, 5 tests serveur relations, lint 0, build 0, `make e2e` exit 0 (46 specs).
- [Niveau 3 — Phase C : prompt + export/backup] FAIT.
  - `analysis_prompt.js` : `relationsDB` ajouté au format de sortie + section `### relationsDB[]` + préfixe d'ID `rel_` + règle de cohérence 13. `importFromAiOutputViaApi` : `data.relationsDB ??= []`.
  - Export/backup : `exportProject` (serveur) exporte `entityRelations` (libellé déchiffré) → hérité par `/projects/:id/export`, `exportUserData` (RGPD), et `buildMarkdown` (nouvelle section `## Relations` avec sens →/↔ + résolution des noms). `/import/backup` réinsère `entityRelations` (libellé chiffré ; validateur `entityRelations` déjà présent).
  - Tests : serveur (exportProject inclut relations), front (`buildMarkdown` section Relations). Gate : 493 tests front, 10 tests serveur (custom+relations), lint 0, build 0, e2e sanity verts.
  - **Migration des `__links` legacy : ABANDONNÉE** (jamais passé en prod → aucun projet legacy à migrer ; décision utilisateur).
  - NB cosmétique restant (optionnel) : arrowhead SVG absent pour les libellés de relation libres (markers only pour les types connus). → **Niveau 3 COMPLET (A+B+C).**
- [Obsidian prod] FAIT — deps jszip/js-yaml/fuse.js ; parseVault (js-yaml) + parseVaultZip (jszip) ; dedup Fuse.js ; VaultImporter (.md/.zip) → ImportPreview (staging mémoire) → seed ; route `/import/obsidian` + carte onboarding HomePage ; source='obsidian' jusqu'au seeder. E2E `e2e/obsidian.spec.js` bout en bout.
- [3.5 events] FAIT — EventEditor sélecteur entités custom + EventCard (via cache) ; entityUtils résout type='custom'.
- [3.5 graphe] FAIT — buildGraph : arêtes de co-apparition événementielle impliquant une entité custom ; EntityGraph charge timeline+custom, couleurs/icônes custom. (buildFullGraph = code mort, non modifié.)
- [Chat] toggle « Recherche approfondie » redesigné ; provider Groq modèle qwen/qwen3.8-27b (testé live). Reste seulement : régénérer la clé Groq + la poser en prod.
- Gate 3e vague : lint 0, 509 tests front, 111 tests serveur, build 0, E2E (obsidian/custom/chat) verts.

### Post-session (2e vague, décidée avec l'utilisateur)
- [LLM] FAIT — provider hébergé gratuit **Groq** (`OpenAICompatibleProvider`, remplace le stub Anthropic). Défaut modèle `qwen/qwen3.8-27b` (testé live : réponse FR + citations, ~300 ms). Repli mock auto si pas de clé/erreur/timeout. Garde-fous : cache réponses + rate-limit 20/min/projet (429). **Décision : pas de LLM local** (VPS 4c/7,6Go sans GPU non scalable). Clé Groq dans `server/.env` (gitignored, jamais commitée) — **à régénérer par l'utilisateur** (partagée en clair dans le chat). Tests provider (8) + rate-limit (3).
- [Disclaimer] FAIT — bandeau confidentialité sur `/chat` (niv.2 = envoi tiers) + i18n fr/en/zh + section RGPD dans PrivacyPage. E2E disclaimer.
- [Backup] FAIT — trou corrigé : `exportProject` (déchiffre custom_fields + exporte types/entités custom), `/import/backup` (colonne + 2 boucles), `exportUserData` (hérite), `exportMarkdown` (champs + section). Tests export serveur + markdown. NB : pas d'E2E fichier round-trip (l'UI n'expose pas d'export JSON mono-projet téléchargeable).
- Gate 2e vague : lint 0, 508 tests front, 111 tests serveur, build 0, E2E chat verts.

### Session initiale
- [0] FAIT — branche créée, HANDOFF rédigé, artefacts publiés (archi + plan).
- [1.1] FAIT — migration 005_custom_data.sql + miroir init.sql (custom_fields sur 3 natives, tables custom_entity_types/custom_entities, CHECK entity_type élargi 'custom'). Appliqué + vérifié en DB live. ⚠️ Note reprise : `server/db/migrations/` contenait déjà 001-004 (HANDOFF disait dir vide = faux ; les `ls` vides = filtrage rtk). `make server-test` (node --test) = tests serveur ; les tests round-trip vont là, pas dans `src/db/`.
- [1.2] FAIT — validators.js : customFields sur character/location/object + schémas customEntityType/customEntity + enregistrement seed.data (customTypesDB/customEntitiesDB) + importBackup. 66 tests validators verts.
- [1.3] FAIT — db-queries.js : encrypt/decrypt custom_fields dans get/insert/update/restore des 3 natives. + seed.js (server) : custom_fields dans les 3 INSERT. Mirror du pattern `aliases`.
- [1.4] FAIT — test round-trip chiffré `server/src/db-queries.custom.test.js` (4 tests verts, encryption ON en dev). Docs : data-layer.md (couches d'extensibilité + tables custom) + CLAUDE.md (règle Migrations réécrite, SCHEMA_VERSION supprimé). `make lint` exit 0, 96 tests serveur verts.
- [2.1] FAIT — EntityEditor: composant CustomFields (clé/valeur) sur les 3 types + initData ; cartes: ui/CustomFieldChips (lecture seule) sur Character/Location/Object ; i18n fr/en/zh.
- [2.2] FAIT — SourceBadge + filtre 'obsidian' (violet) dans ReviewPage + i18n fr/en/zh.
- [2.3] FAIT — GlobalSearch matche aliases (perso) + clés/valeurs customFields (3 entités).
- [2.4] FAIT — seed LOTR: Frodo a des customFields d'exemple (passe par server seed.js). E2E `e2e/custom-fields.spec.js` (2 tests verts). Gate: lint 0, 470 tests front, 96 tests serveur, build 0. NB reprise: DB dev re-seedée (94 vieux projets LOTR purgés) pour que l'E2E voie les nouveaux champs.
- [3.1] FAIT — db-queries CRUD custom types/entités (préfixes ctype/cent) + cascade delete + fix makeId (suffixe aléatoire anti-collision). Tests round-trip (3 cas).
- [3.2] FAIT — routes REST /custom-types + /custom-entities (+restore) + validators restore. NB: smoke curl impossible (deviceId doit être signé better-auth) → couvert par E2E.
- [3.3] FAIT — client.js + useCustomEntityStore (types+entities, manuel) + resetAll. Tests store (8 cas).
- [3.4] FAIT — CustomEntityBrowser (/custom) + CustomTypeEditor + CustomEntityEditor + route + nav « Univers » + i18n fr/en/zh.
- [3.5] PARTIEL — GlobalSearch: entités custom cherchables (FAIT). FOLLOW-UPS documentés (non faits, par prudence run non-supervisé) : (a) inclusion dans EntityGraph (arêtes dérivées du lore → entités custom seraient des nœuds isolés, nécessite un design d'arêtes event-based), (b) rattachement aux events (EventEditor/EventCard touchent la timeline D&D « à ne pas casser » → intégration additive à faire supervisée). Le schéma supporte déjà event_entities.entity_type='custom'.
- [3.6] FAIT — seed LOTR: type « Langue » (Quenya/Sindarin) via server seed.js ; analysis_prompt.js (customTypesDB/customEntitiesDB + IDs + règle 12) ; importFromAiOutputViaApi (??= []). E2E `e2e/custom-entities.spec.js` (2 tests). Gate étape 3: lint 0, 478 tests front, 99 tests serveur, build 0, E2E verts.
- [4.x] FAIT (scaffold fonctionnel) — src/import/obsidian/{parseVault,fieldMap,mapToCanonical}.js (regex, sans deps), src/api/importFromObsidian.js, src/components/import/VaultImporter.jsx. Tests unitaires `parseVault.test.js` (13 verts, bout en bout parse→classif→canonique→liens cassés). ⚠️ DÉCISION : deps npm (jszip/gray-matter/remark) NON ajoutées pour garder le build vert en run non-supervisé → parser regex + entrée fichiers .md (pas .zip). TODOs en tête de chaque fichier + checklist réveil. VaultImporter non routé (composant prêt à brancher).
- [5.x] FAIT (scaffold) — src/import/dedup.js (doublons candidats, sans Fuse.js) + tests (3 verts) ; src/components/import/ImportPreview.jsx (comptages + doublons + liens cassés + bouton Confirmer, lit le payload EN MÉMOIRE) ; commentaire + TODO au point d'insertion `importFromAiOutputViaApi.js` (avant seedProjectViaApi). TODO : Fuse.js, fusion/ignore doublon, flux /review pré-seed routé, i18n.
- [6.1] FAIT — server/src/llm/provider.js : interface + MockProvider (canned) + AnthropicProvider (stub, repli mock sans clé) + getProvider(env LLM_PROVIDER, défaut mock). Tests provider (5 cas).
- [6.2] FAIT (niveau 1 FULL) — src/chat/router.js : answerQuery déterministe (intents qui/où/objets/chapitre + résolution alias), pur & testé (12 cas verts).
- [6.3] FAIT (niveau 2 MOCK câblé) — server/src/routes/ask.js (retrieval par mots-clés sur entités déchiffrées → provider.ask) + route POST /projects/:id/ask + validator v.ask.
- [6.4] FAIT — src/components/chat/ChatPanel.jsx (route /chat, nav « Analyser », toggle « recherche approfondie » niveau 2) + client.askProject + i18n fr/en/zh. E2E `e2e/chat.spec.js` (2 tests niveau 1 verts).
- [6.5] FAIT — server/.env.example + .env.prod.example : LLM_PROVIDER + ANTHROPIC_API_KEY + note garde-fous coût. CLAUDE.md table env MAJ.
  Gate étape 6 : lint 0, 506 tests front, 104 tests serveur, build 0, E2E verts.
