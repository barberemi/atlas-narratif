import { z } from 'zod';

// ── Helpers ──────────────────────────────────────────────────────────────────

const str    = z.string().max(1000);
const strReq = z.string().min(1).max(1000);
const text   = z.string().max(10_000);           // descriptions longues
const id     = z.string().max(200);
const arr    = z.array(z.string().max(500));      // tableau de strings
const color  = z.string().max(30).nullable().optional();
const num    = z.number();
const bool   = z.boolean();

/** Raccourci pour champs nullables + optionnels (colonnes SQL DEFAULT NULL). */
const strOpt  = str.nullable().optional();
const textOpt = text.nullable().optional();
const idOpt   = id.nullable().optional();
const numOpt  = num.nullable().optional();
const boolOpt = bool.nullable().optional();

/** Bag de champs custom (couche 2) : dictionnaire clé→valeur libre, stocké en JSONB chiffré. */
const customFields = z.record(z.string().max(200), z.unknown()).nullable().optional();

// ── Projects ─────────────────────────────────────────────────────────────────

export const createProject = z.object({
  name:        strReq,
  description: strOpt,
}).strict();

export const updateProject = z.object({
  name:        strReq.optional(),
  description: strOpt,
}).strict();

export const mapImage = z.object({
  image: z.string().max(10_000_000),  // ~7.5 Mo de données brutes en base64
}).strict();

// ── Chat de requête (niveau 2) ───────────────────────────────────────────────
export const ask = z.object({
  question: z.string().min(1).max(2000),
}).strict();

// ── Volumes ──────────────────────────────────────────────────────────────────

export const volume = z.object({
  number:      num,
  title:       strReq,
  description: textOpt,
}).strict();

// ── Characters ───────────────────────────────────────────────────────────────

export const character = z.object({
  name:           strReq,
  aliases:        arr.optional(),
  race:           strOpt,
  role:           strOpt,
  affiliations:   arr.optional(),
  traits:         arr.optional(),
  origin:         strOpt,
  description:    textOpt,
  color:          color,
  deathEventId:   idOpt,
  journeyKey:     idOpt,
  customFields:   customFields,
  source:         strOpt,
}).strip();

export const characterGroups = z.object({
  groupIds: z.array(id),
}).strict();

// ── Locations ────────────────────────────────────────────────────────────────

export const location = z.object({
  name:        strReq,
  type:        strOpt,
  regime:      strOpt,
  description: textOpt,
  inhabitants: arr.optional(),
  visitedBy:   arr.optional(),
  visited_by:  arr.optional(),
  keyPlaces:   arr.optional(),
  key_places:  arr.optional(),
  customFields: customFields,
  source:      strOpt,
}).strip();

export const locationCoordinates = z.object({
  coordinates: z.object({ x: z.number(), y: z.number() }).nullable(),
}).strict();

// ── Objects ──────────────────────────────────────────────────────────────────

export const object = z.object({
  name:                    strReq,
  type:                    strOpt,
  description:             textOpt,
  creator:                 strOpt,
  currentHolder:           strOpt,
  current_holder:          strOpt,
  powers:                  arr.optional(),
  holders:                 arr.optional(),
  createdIn:               strOpt,
  created_in:              strOpt,
  inscription:             textOpt,
  status:                  strOpt,
  statusChangedAtChapter:  numOpt,
  status_changed_at_chapter: numOpt,
  customFields:            customFields,
  source:                  strOpt,
}).strip();

// ── Groups ───────────────────────────────────────────────────────────────────

export const groupMemberRole = z.object({
  roleInGroup: strOpt,
}).strict();

export const group = z.object({
  name:        strReq,
  type:        strOpt,
  color:       color,
  description: textOpt,
  homelandId:  idOpt,
  homeland_id: idOpt,
}).strip();

// ── Timeline Events ─────────────────────────────────────────────────────────

export const timelineEvent = z.object({
  chapter:        numOpt,
  chapterTitle:   strOpt,
  title:          strReq,
  description:    textOpt,
  locationId:     idOpt,
  entities:       z.array(z.object({ id: id, entityType: str }).strip()).optional(),
  beatId:         idOpt,
  povCharacterId: idOpt,
  threadIds:      z.array(id).optional(),
  sceneOrder:     numOpt,
  sceneGoal:      strOpt,
  sceneConflict:  strOpt,
  sceneOutcome:   strOpt,
  volumeId:       idOpt,
  isFlashback:    boolOpt,
  storyChapterRef: strOpt,
}).strip();

// ── Reorder ──────────────────────────────────────────────────────────────────

export const reorderEvents = z.object({
  updates: z.array(z.object({
    id:         id,
    chapter:    num,
    sceneOrder: num,
  }).strict()),
}).strict();

export const reorderStcChapters = z.object({
  updates: z.array(z.object({
    id:     id,
    number: num,
  }).strict()),
}).strict();

// ── STC Chapters ─────────────────────────────────────────────────────────────

export const stcChapter = z.object({
  number:    num,
  title:     strReq,
  summary:   textOpt,
  beats:     z.array(id).optional(),
  entities:  z.array(z.object({ id: id, entityType: str }).strip()).optional(),
  volumeId:  idOpt,
}).strip();

// ── Incoherences ─────────────────────────────────────────────────────────────

export const scanIncoherences = z.object({
  incoherences: z.array(z.object({
    id:          id,
    type:        str.optional(),
    severity:    str.optional(),
    title:       strReq,
    explanation: text.optional(),
  }).strip()),
}).strict();

export const resolved = z.object({
  resolved: bool,
}).strict();

export const resolutionNote = z.object({
  note: text.nullable(),
}).strict();

// ── Arc émotionnel ───────────────────────────────────────────────────────────

export const arcPoint = z.object({
  intensity: num,
}).strict();

// ── Notes ────────────────────────────────────────────────────────────────────

export const chapterNote = z.object({
  content: text,
}).strict();

// ── Plants ───────────────────────────────────────────────────────────────────

export const plant = z.object({
  label:           strReq,
  type:            strOpt,
  plantChapterNum: numOpt,
  plantEventId:    idOpt,
  plantVolumeId:   idOpt,
  payoffChapterNum: numOpt,
  payoffEventId:   idOpt,
  payoffVolumeId:  idOpt,
  entityId:        idOpt,
  entityType:      strOpt,
  status:          strOpt,
  notes:           textOpt,
}).strip();

// ── Threads ──────────────────────────────────────────────────────────────────

export const thread = z.object({
  name:        strReq,
  color:       color,
  role:        strOpt,
  description: textOpt,
  sortOrder:   numOpt,
  sort_order:  numOpt,
}).strip();

// ── Journeys ─────────────────────────────────────────────────────────────────

const journeyStep = z.object({
  lat: z.number(),
  lng: z.number(),
  label: strOpt,
  locationId: idOpt,
  chapterNum: numOpt,
  volumeId: idOpt,
}).strip();

export const journey = z.object({
  steps: z.array(journeyStep),
}).strict();

// ── Character Arcs ───────────────────────────────────────────────────────────

export const characterAxis = z.object({
  characterId: id,
  label:       strReq,
  color:       color,
}).strict();

export const characterArcPoint = z.object({
  value:    num,
  note:     textOpt,
  volumeId: idOpt,
}).strict();

// ── Hero Journey ─────────────────────────────────────────────────────────────

export const heroJourneyEntry = z.object({
  stageKey:    strReq,
  characterId: idOpt,
  chapterNum:  numOpt,
  summary:     textOpt,
  volumeId:    idOpt,
}).strict();

// ── Custom entity types & entities (couche 3) ────────────────────────────────

/** Un champ déclaré dans le field_schema d'un type custom. */
const customFieldDef = z.object({
  key:   strReq,
  label: strOpt,
  type:  strOpt,   // 'text' | 'number' | 'list' | … (libre, non contraint côté serveur)
}).strip();

export const customEntityType = z.object({
  label:        strReq,
  icon:         strOpt,
  color:        color,
  fieldSchema:  z.array(customFieldDef).optional(),
  baseBehavior: strOpt,   // 'entity' par défaut
  source:       strOpt,
}).strip();

export const customEntity = z.object({
  typeId:       id,
  name:         strReq,
  aliases:      arr.optional(),
  description:  textOpt,
  customFields: customFields,
  source:       strOpt,
}).strip();

// ── Seed ─────────────────────────────────────────────────────────────────────

export const seed = z.object({
  meta: z.object({
    id:          id.optional(),
    name:        strReq,
    description: str.optional(),
  }).strip(),
  data: z.object({
    loreDB:           z.record(z.string(), z.array(z.record(z.string(), z.unknown()))).optional(),
    timelineDB:       z.array(z.record(z.string(), z.unknown())).optional(),
    incoherencesDB:   z.array(z.record(z.string(), z.unknown())).optional(),
    chaptersDB:       z.array(z.record(z.string(), z.unknown())).optional(),
    journeys:         z.array(z.record(z.string(), z.unknown())).optional(),
    groupsDB:         z.array(z.record(z.string(), z.unknown())).optional(),
    plantsDB:         z.array(z.record(z.string(), z.unknown())).optional(),
    arcPointsDB:      z.array(z.record(z.string(), z.unknown())).optional(),
    threadsDB:        z.array(z.record(z.string(), z.unknown())).optional(),
    eventExtrasDB:    z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
    characterArcsDB:  z.array(z.record(z.string(), z.unknown())).optional(),
    heroJourneyDB:    z.array(z.record(z.string(), z.unknown())).optional(),
    volumesDB:        z.array(z.record(z.string(), z.unknown())).optional(),
    customTypesDB:    z.array(z.record(z.string(), z.unknown())).optional(),
    customEntitiesDB: z.array(z.record(z.string(), z.unknown())).optional(),
  }).strict(),
}).strict();

// ── Restore snapshots ───────────────────────────────────────────────────────
// Ces schémas valident les snapshots produits par les fonctions delete*() avant
// de les réinsérer via les endpoints POST /restore.

const entityBase = z.object({ id: id }).passthrough();
const eventEntityRow = z.object({ event_id: id, entity_id: id, entity_type: str }).passthrough();

export const restoreVolume = z.object({
  entity: z.object({ id: id, number: num, title: str, description: strOpt }).passthrough(),
  refs: z.object({
    events:         z.array(id).optional(),
    chapters:       z.array(id).optional(),
    heroEntries:    z.array(id).optional(),
    plantsByPlant:  z.array(id).optional(),
    plantsByPayoff: z.array(id).optional(),
  }).optional(),
}).strict();

export const restoreCharacter = z.object({
  entity: z.object({ id: id, name: strReq }).passthrough(),
  eventEntities: z.array(eventEntityRow).optional(),
  charGroups: z.array(z.object({ character_id: id, group_id: id }).passthrough()).optional(),
  axes: z.array(z.object({ id: id, character_id: id }).passthrough()).optional(),
  arcPoints: z.array(z.object({ axis_id: id, chapter_num: num, value: num }).passthrough()).optional(),
  heroEntries: z.array(entityBase).optional(),
}).strict();

export const restoreLocation = z.object({
  entity: z.object({ id: id, name: strReq }).passthrough(),
  eventEntities: z.array(eventEntityRow).optional(),
}).strict();

export const restoreObject = z.object({
  entity: z.object({ id: id, name: strReq }).passthrough(),
  eventEntities: z.array(eventEntityRow).optional(),
}).strict();

export const restoreTimelineEvent = z.object({
  entity: z.object({ id: id }).passthrough(),
  eventEntities: z.array(eventEntityRow).optional(),
}).strict();

export const restoreStcChapter = z.object({
  entity: z.object({ id: id, number: num }).passthrough(),
  beats: z.array(z.object({ chapter_id: id, beat_id: id }).passthrough()).optional(),
  entities: z.array(z.object({ chapter_id: id, entity_id: id, entity_type: str }).passthrough()).optional(),
}).strict();

export const restorePlant = z.object({
  entity: z.object({ id: id, label: strReq }).passthrough(),
}).strict();

export const restoreGroup = z.object({
  entity: z.object({ id: id, name: strReq }).passthrough(),
  charGroups: z.array(z.object({ character_id: id, group_id: id }).passthrough()).optional(),
}).strict();

export const restoreThread = z.object({
  entity: z.object({ id: id, name: strReq }).passthrough(),
  affectedEventIds: z.array(id).optional(),
}).strict();

export const restoreCharacterAxis = z.object({
  entity: z.object({ id: id, character_id: id, label: str }).passthrough(),
  arcPoints: z.array(z.object({ axis_id: id, chapter_num: num, value: num }).passthrough()).optional(),
}).strict();

export const restoreHeroJourneyEntry = z.object({
  entity: z.object({ id: id, stage_key: strReq }).passthrough(),
}).strict();

export const restoreCustomType = z.object({
  entity: z.object({ id: id, label: str }).passthrough(),
  entities: z.array(entityBase).optional(),
  eventEntities: z.array(eventEntityRow).optional(),
}).strict();

export const restoreCustomEntity = z.object({
  entity: z.object({ id: id, name: strReq }).passthrough(),
  eventEntities: z.array(eventEntityRow).optional(),
}).strict();

// ── Import backup ────────────────────────────────────────────────────────────

const backupArray = z.array(z.record(z.string(), z.unknown())).optional();

export const importBackup = z.object({
  version:              z.literal('1.0'),
  project:              z.object({ name: strReq, description: str.optional(), mapImage: z.string().max(10_000_000).optional() }).strip(),
  volumes:              backupArray,
  characters:           backupArray,
  locations:            backupArray,
  objects:              backupArray,
  timelineEvents:       backupArray,
  eventEntities:        backupArray,
  incoherences:         backupArray,
  incoherenceLinks:     backupArray,
  stcChapters:          backupArray,
  stcChapterBeats:      backupArray,
  stcChapterEntities:   backupArray,
  characterJourneys:    backupArray,
  groups:               backupArray,
  characterGroups:      backupArray,
  plantPayoffs:         backupArray,
  arcPoints:            backupArray,
  narrativeThreads:     backupArray,
  characterArcAxes:     backupArray,
  characterArcPoints:   backupArray,
  heroJourneyEntries:   backupArray,
  customEntityTypes:    backupArray,
  customEntities:       backupArray,
}).strict();
