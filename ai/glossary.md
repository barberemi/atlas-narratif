# Glossary

## Architecture

| Term | Definition | Reference |
|------|-----------|-----------|
| PGlite | **(Legacy)** PostgreSQL running in-browser via WebAssembly + OPFS. Replaced by server-side PostgreSQL 16; residual files in `src/db/` power LOTR seed and pure JS computations | `src/db/` |
| OPFS | **(Legacy)** Origin Private File System; was the storage backend for PGlite | `vite.config.js` |
| DbContext | **(Legacy)** React context that wrapped PGlite worker instance. Removed from `App.jsx`; `ProjectProvider` now manages project state without DB provider | `src/db/ProjectContext.jsx` |
| Store (Zustand) | One Zustand store per domain (`use<Domain>Store`), holds state + CRUD actions | `src/stores/` |
| createEntityStore | Generic factory function for creating Zustand stores with standard CRUD | `src/stores/` |
| SCHEMA_VERSION | Version string (`YYYY-MM-DD.N`) in `schema.js` controlling whether `applySchema()` reruns at startup | `src/db/schema.js` |
| Extra (JSONB) | Flexible JSON column on `timeline_events` for non-columnar data (`beatId`, `threadIds`, `povCharacterId`, scene fields) | `src/db/queries.js` |
| Seed | Demo data insertion; `seed.generic.js` handles any project, `seed.lotr.js` provides LOTR demo | `src/db/seed.generic.js`, `src/db/seed.lotr.js` |
| COOP/COEP | **(Legacy)** Cross-Origin-Opener-Policy / Cross-Origin-Embedder-Policy headers that were required for SharedArrayBuffer (PGlite WASM). Still present in `vite.config.js` dev config but no longer functionally needed | `vite.config.js` |

## Domain (Narrative Craft)

| Term | Definition | Reference |
|------|-----------|-----------|
| Lore | Universe database: characters, locations, objects, and groups | `src/components/lore/`, `useLoreStore` |
| Volume / Tome | A book or major section in a multi-volume work; filtered globally via `activeVolumeId` | `useVolumeStore` |
| Save the Cat (STC) | Blake Snyder's 15-beat story structure; each beat has an ideal percentage position | `src/data/beats_config.js`, `useStcStore` |
| Beat | One of 15 narrative markers in Save the Cat (e.g., `catalyst`, `midpoint`, `all_is_lost`) | `src/data/beats_config.js` |
| Frise (dramatique) | Visual timeline bar showing ideal beat positions (losanges) vs. actual positions (circles) | `src/components/savethecat/` |
| Voyage du Heros | Joseph Campbell's 12-stage Hero's Journey archetype in 3 phases: Depart, Initiation, Retour | `src/data/hero_journey_config.js`, `useHeroJourneyStore` |
| Arc emotionnel | Emotional intensity graph per chapter; tracks narrative tension over time | `useArcStore`, `src/pages/EmotionalArc.jsx` |
| Character Arc | Per-character evolution axes with intensity points across chapters | `useCharacterArcStore` |
| Plant / Payoff | Setup (plant/amorce) of a narrative element and its later resolution (payoff) | `usePlantStore`, `src/components/plants/` |
| Amorce narrative | French synonym for "plant" — a narrative hook or foreshadowing | `CLAUDE.md` |
| Fil narratif | Narrative thread / subplot tracked separately from main timeline | `useThreadStore` |
| POV | Point of View — the character whose perspective drives a scene (`povCharacterId`) | `timeline_events.extra` |
| Scene Goal/Conflict/Outcome | Three elements defining a scene stored in event extra: `sceneGoal`, `sceneConflict`, `sceneOutcome` | `timeline_events.extra` |
| Flashback | Scene placed outside chronological order; flagged via `isFlashback` on timeline events | `timeline_events` table |
| Incoherence | A detected narrative inconsistency (continuity break, orphaned entity, payoff before plant, etc.) | `useIncStore`, `src/db/detectIncoherences.js` |
| Groupe | Character grouping: race, faction, family, guild | `groups` table, `character_groups` table |

## Incoherence Types

| Type Key | Meaning |
|----------|---------|
| Continuite de Personnage | Dead character reappears in later chapters |
| Continuite d'Objet | Destroyed/lost object used after status change |
| Payoff Avant Plant | Payoff placed chronologically before its setup |
| Entite Non Referencee | Deleted lore entity still referenced in timeline |
| Plant Sans Payoff | Setup with no resolution |
| Fil Narratif Vide | Thread exists but has no associated events |
| Entite Orpheline | Lore entity never appears in any timeline event |
| Scene Vide | Timeline event has no associated entities |
| Conflit de Lieu Intra-Chapitre | Same character at different locations in the same chapter |
| Incohérence de Porteur | Object holder not found in characters |
| Téléportation de Personnage | Character at different locations in consecutive chapters (X→X+1) |
| Affiliation Fantôme | Group member references a non-existent character |
| Personnage POV Absent | POV character not listed in the scene's entities |
| Lieu d'Origine Inexistant | Character's origin location not found |
| Créateur Non Référencé | Object creator not found in characters |

## External / Third-Party

| Term | Definition |
|------|-----------|
| Hono | Lightweight Node.js HTTP framework used for the API server (`server/`) |
| Better Auth | Authentication library handling email/password, Google OAuth, email verification |
| Resend | Email service provider for transactional emails; falls back to console in dev |
| Traefik | Reverse proxy handling TLS (Let's Encrypt) in production |
| postgres.js | PostgreSQL client used server-side |
| Anthropic SDK | Claude API client for AI manuscript analysis |

## ID Prefix Conventions

All entity IDs follow `<prefix>_<slug>` (seed) or `<prefix>_<projectId>_<timestamp>` (runtime).

| Prefix | Entity |
|--------|--------|
| `char_` | Character |
| `loc_` | Location |
| `obj_` | Object |
| `evt_` | Event |
| `vol_` | Volume |
| `grp_` | Group |
| `inc_` | Incoherence |
| `ch_` | Chapter (STC) |
| `thread_` | Narrative thread |

## Abbreviations

| Abbr | Full form | Context |
|------|-----------|---------|
| STC | Save the Cat | Beat structure, store name, route `/savethecat` |
| POV | Point of View | `povCharacterId` in event extra |
| Inc | Incoherence | Store name `useIncStore`, ID prefix `inc_` |
| T1 / T2 | Tome 1 / Tome 2 | Seed data files: `lotr_seed_data.js` (T1), `lotr_t2_seed_data.js` (T2) |
| LOTR | Lord of the Rings | Demo seed dataset |
| BEATS | Save the Cat beat definitions array | `src/data/beats_config.js` |
| HERO_PHASES / HERO_STAGES | Hero's Journey structure constants | `src/data/hero_journey_config.js` |
| DETECTOR_CATALOG | List of all incoherence detector types | `src/db/detectIncoherences.js` |
