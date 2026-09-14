/**
 * Import d'un projet Atlas Narratif depuis un fichier JSON exporté.
 * Les lignes sont des snapshots bruts de la DB — on les réinsère directement
 * après avoir remplacé le project_id original par un nouvel ID unique.
 */

export async function importFromBackup(db, file, { onProgress } = {}) {
  onProgress?.('Lecture du fichier…');

  const text = await file.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('Fichier invalide — ce n\'est pas un JSON Atlas Narratif.');
  }

  // ── Validation minimale ────────────────────────────────────────────────────
  if (payload.version !== '1.0' || !payload.project?.name) {
    throw new Error('Format non reconnu. Utilise un fichier exporté depuis Atlas Narratif.');
  }

  const {
    project,
    volumes            = [],
    characters         = [],
    locations          = [],
    objects            = [],
    timelineEvents     = [],
    eventEntities      = [],
    incoherences       = [],
    incoherenceLinks   = [],
    stcChapters        = [],
    stcChapterBeats    = [],
    stcChapterEntities = [],
    characterJourneys  = [],
    groups             = [],
    characterGroups    = [],
    plantPayoffs       = [],
    arcPoints          = [],
    narrativeThreads   = [],
    characterArcAxes   = [],
    characterArcPoints = [],
    heroJourneyEntries = [],
  } = payload;

  // ── Nouveau project_id unique ──────────────────────────────────────────────
  const slug      = project.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').slice(0, 20);
  const newId     = `${slug}_${Date.now()}`;
  // ── Insertion en transaction ───────────────────────────────────────────────
  onProgress?.('Création du projet…');
  await db.exec('BEGIN');
  try {
    // Projet
    await db.query(
      `INSERT INTO projects (id, name, description, map_image) VALUES ($1,$2,$3,$4)`,
      [newId, project.name, project.description ?? null, project.mapImage ?? null],
    );

    // Helpers
    const pid   = ()    => newId;
    const json  = (v)   => v === null || v === undefined ? null
                         : typeof v === 'string' ? v
                         : JSON.stringify(v);
    // Lit un champ depuis la colonne directe (nouveau backup) ou depuis extra (ancien backup)
    const fromExtra = (r, directKey, extraKey, fallback) => {
      if (r[directKey] !== undefined && r[directKey] !== null) return r[directKey];
      const ex = typeof r.extra === 'string' ? JSON.parse(r.extra || '{}') : (r.extra ?? {});
      return ex[extraKey] ?? fallback;
    };

    // Volumes
    onProgress?.('Import des volumes…');
    for (const r of volumes) {
      await db.query(
        `INSERT INTO volumes (id, project_id, number, title, description)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.number, r.title, r.description ?? null],
      );
    }

    // Personnages
    onProgress?.('Import des personnages…');
    for (const r of characters) {
      await db.query(
        `INSERT INTO characters
           (id, project_id, name, aliases, race, role, affiliations, traits,
            origin, description, color, journey_key, death_event_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.name,
          json(r.aliases),
          fromExtra(r, 'race',           'race',         null),
          fromExtra(r, 'role',           'role',         null),
          json(fromExtra(r, 'affiliations', 'affiliations', [])),
          json(fromExtra(r, 'traits',       'traits',       [])),
          r.origin ?? null,
          r.description ?? null,
          r.color ?? '#64748b',
          r.journey_key ?? null,
          fromExtra(r, 'death_event_id', 'deathEventId', null),
        ],
      );
    }

    // Lieux
    onProgress?.('Import des lieux…');
    for (const r of locations) {
      await db.query(
        `INSERT INTO locations
           (id, project_id, name, type, regime, description, coordinates,
            inhabitants, visited_by, key_places)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.name,
          r.type ?? null, r.regime ?? null, r.description ?? null,
          json(r.coordinates),
          json(fromExtra(r, 'inhabitants', 'inhabitants', [])),
          json(fromExtra(r, 'visited_by',  'visitedBy',  [])),
          json(fromExtra(r, 'key_places',  'keyPlaces',  [])),
        ],
      );
    }

    // Objets
    onProgress?.('Import des objets…');
    for (const r of objects) {
      await db.query(
        `INSERT INTO objects
           (id, project_id, name, type, description, creator, current_holder,
            powers, holders, created_in, inscription, status, status_changed_at_chapter)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.name,
          r.type ?? null, r.description ?? null, r.creator ?? null,
          r.current_holder ?? null,
          json(fromExtra(r, 'powers',      'powers',      [])),
          json(fromExtra(r, 'holders',     'holders',     [])),
          fromExtra(r, 'created_in',   'createdIn',   null),
          fromExtra(r, 'inscription',  'inscription', null),
          fromExtra(r, 'status',       'status',      'active'),
          fromExtra(r, 'status_changed_at_chapter', 'statusChangedAtChapter', null),
        ],
      );
    }

    // Événements timeline
    onProgress?.('Import de la timeline…');
    for (const r of timelineEvents) {
      await db.query(
        `INSERT INTO timeline_events
           (id, project_id, chapter_num, chapter_title, title, description, location_id, beat_id,
            pov_character_id, thread_ids, scene_order, scene_goal, scene_conflict, scene_outcome,
            volume_id, is_flashback, story_chapter_ref)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(),
          r.chapter_num, r.chapter_title,
          r.title, r.description ?? null,
          r.location_id ?? null,
          fromExtra(r, 'beat_id', 'beatId', null),
          r.pov_character_id ?? null,
          json(r.thread_ids ?? []),
          r.scene_order    ?? 0,
          r.scene_goal     ?? null,
          r.scene_conflict ?? null,
          r.scene_outcome  ?? null,
          r.volume_id      ?? null,
          r.is_flashback   ?? false,
          r.story_chapter_ref ?? null,
        ],
      );
    }
    for (const r of eventEntities) {
      await db.query(
        `INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [r.event_id, pid(), r.entity_id, r.entity_type],
      );
    }

    // Incohérences
    onProgress?.('Import des incohérences…');
    for (const r of incoherences) {
      await db.query(
        `INSERT INTO incoherences
           (id, project_id, type, severity, title, explanation, resolved)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.type, r.severity,
          r.title, r.explanation ?? null,
          r.resolved ?? false,
        ],
      );
    }
    for (const r of incoherenceLinks) {
      await db.query(
        `INSERT INTO incoherence_links
           (incoherence_id, project_id, entity_id, entity_type, label)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [r.incoherence_id, pid(), r.entity_id, r.entity_type, r.label ?? null],
      );
    }

    // Save the Cat
    onProgress?.('Import Save the Cat…');
    for (const r of stcChapters) {
      await db.query(
        `INSERT INTO stc_chapters (id, project_id, number, title, summary)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.number, r.title, r.summary ?? null],
      );
    }
    for (const r of stcChapterBeats) {
      await db.query(
        `INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
         VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [r.chapter_id, pid(), r.beat_id],
      );
    }
    for (const r of stcChapterEntities) {
      await db.query(
        `INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [r.chapter_id, pid(), r.entity_id, r.entity_type],
      );
    }

    // Trajets personnages
    onProgress?.('Import des trajets…');
    for (const r of characterJourneys) {
      await db.query(
        `INSERT INTO character_journeys (project_id, char_key, step_index, data)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [pid(), r.char_key, r.step_index, json(r.data)],
      );
    }

    // Groupes
    onProgress?.('Import des groupes…');
    for (const r of groups) {
      await db.query(
        `INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.name, r.type ?? 'autre', r.color ?? '#64748B', r.description ?? null, r.homeland_id ?? null],
      );
    }
    for (const r of characterGroups) {
      await db.query(
        `INSERT INTO character_groups (character_id, group_id, project_id, role_in_group)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [r.character_id, r.group_id, pid(), r.role_in_group ?? null],
      );
    }

    // Amorces
    onProgress?.('Import des amorces…');
    for (const r of plantPayoffs) {
      await db.query(
        `INSERT INTO plant_payoffs
           (id, project_id, label, type, plant_chapter_num, plant_event_id, payoff_chapter_num, payoff_event_id, entity_id, entity_type, status, notes, plant_volume_id, payoff_volume_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.label, r.type ?? 'information',
          r.plant_chapter_num ?? null, r.plant_event_id ?? null,
          r.payoff_chapter_num ?? null, r.payoff_event_id ?? null,
          r.entity_id ?? null, r.entity_type ?? null,
          r.status ?? 'open', r.notes ?? null,
          r.plant_volume_id  ?? null, r.payoff_volume_id ?? null,
        ],
      );
    }

    // Arc émotionnel
    for (const r of arcPoints) {
      await db.query(
        `INSERT INTO arc_points (project_id, chapter_number, intensity, note)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [pid(), r.chapter_number, r.intensity, r.note ?? null],
      );
    }

    // Fils narratifs
    onProgress?.('Import des fils narratifs…');
    for (const r of narrativeThreads) {
      await db.query(
        `INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.name, r.color ?? '#3F51B5', r.role ?? 'subplot', r.description ?? null, r.sort_order ?? 0],
      );
    }

    // Arcs des personnages
    for (const r of characterArcAxes) {
      await db.query(
        `INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.character_id, r.label, r.color ?? '#64748b'],
      );
    }
    for (const r of characterArcPoints) {
      await db.query(
        `INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note, volume_id)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [pid(), r.axis_id, r.chapter_num, r.value, r.note ?? null, r.volume_id ?? null],
      );
    }

    // Voyage du Héros
    onProgress?.('Import du Voyage du Héros…');
    for (const r of heroJourneyEntries) {
      await db.query(
        `INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary, volume_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.stage_key, r.character_id ?? null, r.chapter_num ?? null, r.summary ?? null, r.volume_id ?? null],
      );
    }

    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }

  return newId;
}
