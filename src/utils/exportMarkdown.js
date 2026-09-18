/**
 * Transforme le payload JSON de l'export projet en document Markdown lisible.
 * Conçu pour produire une "bible narrative" envoyable à un éditeur ou co-auteur.
 */

import { HERO_STAGE_MAP } from '../data/hero_journey_config';
import { BEATS } from '../data/beats_config';

const BEAT_MAP = Object.fromEntries(BEATS.map(b => [b.id, b.label]));

export function buildMarkdown(payload) {
  const {
    project, volumes = [], characters = [], locations = [], objects = [],
    timelineEvents = [], eventEntities = [],
    incoherences = [], incoherenceLinks = [],
    stcChapters = [], stcChapterBeats = [],
    groups = [], characterGroups = [],
    plantPayoffs = [], narrativeThreads = [],
    heroJourneyEntries = [],
    customEntityTypes = [], customEntities = [],
  } = payload;

  // ── Lookup maps ─────────────────────────────────────────────────────────────
  const charMap = Object.fromEntries(characters.map(c => [c.id, c.name]));
  const locMap  = Object.fromEntries(locations.map(l => [l.id, l.name]));
  const objMap  = Object.fromEntries(objects.map(o => [o.id, o.name]));
  const volMap  = Object.fromEntries(volumes.map(v => [v.id, v.title]));
  const threadMap = Object.fromEntries(narrativeThreads.map(t => [t.id, t.name]));
  const entityName = (id, type) => {
    if (type === 'character') return charMap[id];
    if (type === 'location')  return locMap[id];
    if (type === 'object')    return objMap[id];
    return id;
  };

  // event_entities grouped by event
  const entitiesByEvent = {};
  for (const ee of eventEntities) {
    if (!entitiesByEvent[ee.event_id]) entitiesByEvent[ee.event_id] = [];
    entitiesByEvent[ee.event_id].push(ee);
  }

  // character_groups grouped by character
  const groupsByChar = {};
  for (const cg of characterGroups) {
    if (!groupsByChar[cg.character_id]) groupsByChar[cg.character_id] = [];
    const grp = groups.find(g => g.id === cg.group_id);
    if (grp) groupsByChar[cg.character_id].push(grp.name);
  }

  // beats by chapter
  const beatsByChapter = {};
  for (const b of stcChapterBeats) {
    if (!beatsByChapter[b.chapter_id]) beatsByChapter[b.chapter_id] = [];
    beatsByChapter[b.chapter_id].push(b.beat_id);
  }

  const lines = [];
  const push = (...args) => lines.push(...args);
  const blank = () => lines.push('');
  const j = (arr) => (arr ?? []).filter(Boolean).join(', ');
  const parseJ = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
    return [];
  };
  // Champs custom (couche 2) : objet {clé: valeur} → lignes markdown.
  const parseObj = (v) => {
    if (!v) return {};
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return {}; } }
    return typeof v === 'object' ? v : {};
  };
  const pushCustomFields = (v) => {
    const obj = parseObj(v);
    for (const [k, val] of Object.entries(obj)) {
      const disp = Array.isArray(val) ? val.join(', ') : (val && typeof val === 'object' ? JSON.stringify(val) : val);
      if (disp !== '' && disp != null) push(`- **${k}** : ${disp}`);
    }
  };

  // ── Header ────────────────────────────────────────────────────────────────────
  push(`# ${project.name}`);
  if (project.description) push(``, `> ${project.description}`);
  blank();
  push(`*Exporté depuis Atlas Narratif le ${new Date().toLocaleDateString('fr-FR')}*`);
  blank();

  // ── Table des matières ────────────────────────────────────────────────────────
  const toc = [];
  if (volumes.length > 1) toc.push('- [Volumes](#volumes)');
  if (characters.length) toc.push('- [Personnages](#personnages)');
  if (locations.length)  toc.push('- [Lieux](#lieux)');
  if (objects.length)    toc.push('- [Objets & Artefacts](#objets--artefacts)');
  if (customEntities.length) toc.push('- [Entités custom](#entités-custom)');
  if (groups.length)     toc.push('- [Groupes & Factions](#groupes--factions)');
  if (timelineEvents.length) toc.push('- [Timeline](#timeline)');
  if (stcChapters.length) toc.push('- [Structure Save the Cat](#structure-save-the-cat)');
  if (plantPayoffs.length) toc.push('- [Amorces narratives](#amorces-narratives-plants--payoffs)');
  if (narrativeThreads.length) toc.push('- [Fils narratifs](#fils-narratifs)');
  if (heroJourneyEntries.length) toc.push('- [Voyage du Héros](#voyage-du-héros)');
  const unresolvedInc = incoherences.filter(i => !i.resolved);
  if (unresolvedInc.length) toc.push('- [Incohérences non résolues](#incohérences-non-résolues)');

  if (toc.length) {
    push('## Table des matières', '', ...toc);
    blank();
  }

  push('---');
  blank();

  // ── Volumes ───────────────────────────────────────────────────────────────────
  if (volumes.length > 1) {
    push('## Volumes', '');
    for (const v of volumes) {
      push(`### Tome ${v.number} — ${v.title}`);
      if (v.description) push(``, `> ${v.description}`);
      blank();
    }
    push('---');
    blank();
  }

  // ── Personnages ───────────────────────────────────────────────────────────────
  if (characters.length) {
    push('## Personnages', '');
    for (const c of characters) {
      const subtitle = c.role ? ` — ${c.role}` : '';
      push(`### ${c.name}${subtitle}`);
      blank();
      const aliases = parseJ(c.aliases);
      const traits  = parseJ(c.traits);
      const affil   = parseJ(c.affiliations);
      const cGroups = groupsByChar[c.id] ?? [];

      if (aliases.length)  push(`- **Aliases** : ${j(aliases)}`);
      if (c.race)          push(`- **Race** : ${c.race}`);
      if (c.origin)        push(`- **Origine** : ${c.origin}`);
      if (traits.length)   push(`- **Traits** : ${j(traits)}`);
      if (affil.length)    push(`- **Affiliations** : ${j(affil)}`);
      if (cGroups.length)  push(`- **Groupes** : ${j(cGroups)}`);
      pushCustomFields(c.custom_fields ?? c.customFields);
      if (c.description) { blank(); push(`> ${c.description}`); }
      blank();
    }
    push('---');
    blank();
  }

  // ── Lieux ─────────────────────────────────────────────────────────────────────
  if (locations.length) {
    push('## Lieux', '');
    for (const l of locations) {
      const subtitle = l.type ? ` (${l.type})` : '';
      push(`### ${l.name}${subtitle}`);
      blank();
      const inhab = parseJ(l.inhabitants);
      const kp    = parseJ(l.key_places);
      if (l.regime)      push(`- **Régime** : ${l.regime}`);
      if (inhab.length)  push(`- **Habitants** : ${j(inhab)}`);
      if (kp.length)     push(`- **Lieux notables** : ${j(kp)}`);
      pushCustomFields(l.custom_fields ?? l.customFields);
      if (l.description) { blank(); push(`> ${l.description}`); }
      blank();
    }
    push('---');
    blank();
  }

  // ── Objets ────────────────────────────────────────────────────────────────────
  if (objects.length) {
    push('## Objets & Artefacts', '');
    for (const o of objects) {
      const subtitle = o.type ? ` (${o.type})` : '';
      push(`### ${o.name}${subtitle}`);
      blank();
      const powers  = parseJ(o.powers);
      const holders = parseJ(o.holders);
      if (o.creator)        push(`- **Créateur** : ${o.creator}`);
      if (o.current_holder) push(`- **Détenteur actuel** : ${o.current_holder}`);
      if (powers.length)    push(`- **Pouvoirs** : ${j(powers)}`);
      if (holders.length)   push(`- **Détenteurs successifs** : ${j(holders)}`);
      if (o.status && o.status !== 'active') push(`- **Statut** : ${o.status}`);
      pushCustomFields(o.custom_fields ?? o.customFields);
      if (o.description)  { blank(); push(`> ${o.description}`); }
      if (o.inscription)  { blank(); push(`> *« ${o.inscription} »*`); }
      blank();
    }
    push('---');
    blank();
  }

  // ── Entités custom (couche 3) ───────────────────────────────────────────────
  if (customEntities.length) {
    push('## Entités custom', '');
    const typeById = Object.fromEntries(customEntityTypes.map(t => [t.id, t]));
    const byType = {};
    for (const e of customEntities) (byType[e.type_id ?? e.typeId] ??= []).push(e);
    for (const [typeId, ents] of Object.entries(byType)) {
      const type = typeById[typeId];
      const icon = type?.icon ? `${type.icon} ` : '';
      push(`### ${icon}${type?.label ?? 'Type inconnu'}`, '');
      for (const e of ents) {
        push(`#### ${e.name}`);
        blank();
        const aliases = parseJ(e.aliases);
        if (aliases.length) push(`- **Aliases** : ${j(aliases)}`);
        pushCustomFields(e.custom_fields ?? e.customFields);
        if (e.description) { blank(); push(`> ${e.description}`); }
        blank();
      }
    }
    push('---');
    blank();
  }

  // ── Groupes ───────────────────────────────────────────────────────────────────
  if (groups.length) {
    push('## Groupes & Factions', '');
    for (const g of groups) {
      const subtitle = g.type && g.type !== 'autre' ? ` (${g.type})` : '';
      push(`### ${g.name}${subtitle}`);
      blank();
      const members = characterGroups
        .filter(cg => cg.group_id === g.id)
        .map(cg => charMap[cg.character_id])
        .filter(Boolean);
      if (members.length) push(`- **Membres** : ${j(members)}`);
      if (g.description) { blank(); push(`> ${g.description}`); }
      blank();
    }
    push('---');
    blank();
  }

  // ── Timeline ──────────────────────────────────────────────────────────────────
  if (timelineEvents.length) {
    push('## Timeline', '');
    // Group by chapter
    const byChapter = {};
    for (const e of timelineEvents) {
      const key = e.chapter_num ?? 0;
      if (!byChapter[key]) byChapter[key] = { title: e.chapter_title, volumeId: e.volume_id, events: [] };
      byChapter[key].events.push(e);
    }
    for (const [num, ch] of Object.entries(byChapter).sort((a, b) => +a[0] - +b[0])) {
      const volLabel = ch.volumeId && volMap[ch.volumeId] ? ` [${volMap[ch.volumeId]}]` : '';
      push(`### Chapitre ${num}${ch.title ? ` — ${ch.title}` : ''}${volLabel}`);
      blank();
      ch.events.sort((a, b) => (a.scene_order ?? 0) - (b.scene_order ?? 0));
      for (const evt of ch.events) {
        push(`#### ${evt.title}`);
        blank();
        if (evt.pov_character_id && charMap[evt.pov_character_id]) push(`- **POV** : ${charMap[evt.pov_character_id]}`);
        if (evt.location_id && locMap[evt.location_id]) push(`- **Lieu** : ${locMap[evt.location_id]}`);
        const evtEntities = (entitiesByEvent[evt.id] ?? []).map(ee => entityName(ee.entity_id, ee.entity_type)).filter(Boolean);
        if (evtEntities.length) push(`- **Personnages/Entités** : ${j(evtEntities)}`);
        const threads = parseJ(evt.thread_ids).map(id => threadMap[id]).filter(Boolean);
        if (threads.length) push(`- **Fils narratifs** : ${j(threads)}`);
        if (evt.is_flashback) push(`- *Flashback*`);
        if (evt.description) { blank(); push(`> ${evt.description}`); }
        blank();
      }
    }
    push('---');
    blank();
  }

  // ── Save the Cat ──────────────────────────────────────────────────────────────
  if (stcChapters.length) {
    push('## Structure Save the Cat', '');
    for (const ch of stcChapters) {
      const volLabel = ch.volume_id && volMap[ch.volume_id] ? ` [${volMap[ch.volume_id]}]` : '';
      push(`### Chapitre ${ch.number} — ${ch.title}${volLabel}`);
      blank();
      const beats = (beatsByChapter[ch.id] ?? []).map(bid => BEAT_MAP[bid]).filter(Boolean);
      if (beats.length) push(`- **Beats** : ${j(beats)}`);
      if (ch.summary) { blank(); push(`> ${ch.summary}`); }
      blank();
    }
    push('---');
    blank();
  }

  // ── Plants ────────────────────────────────────────────────────────────────────
  if (plantPayoffs.length) {
    push('## Amorces narratives (Plants & Payoffs)', '');
    push('| Amorce | Type | Posée (ch.) | Résolue (ch.) | Statut | Notes |');
    push('|--------|------|-------------|---------------|--------|-------|');
    for (const p of plantPayoffs) {
      const plantVol  = p.plant_volume_id  && volMap[p.plant_volume_id]  ? ` (${volMap[p.plant_volume_id]})` : '';
      const payoffVol = p.payoff_volume_id && volMap[p.payoff_volume_id] ? ` (${volMap[p.payoff_volume_id]})` : '';
      const plantCh   = p.plant_chapter_num != null  ? `${p.plant_chapter_num}${plantVol}` : '—';
      const payoffCh  = p.payoff_chapter_num != null ? `${p.payoff_chapter_num}${payoffVol}` : '—';
      const notes     = (p.notes ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      push(`| ${p.label} | ${p.type ?? '—'} | ${plantCh} | ${payoffCh} | ${p.status ?? 'open'} | ${notes} |`);
    }
    blank();
    push('---');
    blank();
  }

  // ── Threads ───────────────────────────────────────────────────────────────────
  if (narrativeThreads.length) {
    push('## Fils narratifs', '');
    for (const t of narrativeThreads) {
      const role = t.role ? ` (${t.role})` : '';
      push(`### ${t.name}${role}`);
      if (t.description) { blank(); push(`> ${t.description}`); }
      blank();
    }
    push('---');
    blank();
  }

  // ── Voyage du Héros ───────────────────────────────────────────────────────────
  if (heroJourneyEntries.length) {
    push('## Voyage du Héros', '');
    // Group by character
    const byChar = {};
    for (const e of heroJourneyEntries) {
      const charName = e.character_id ? (charMap[e.character_id] ?? e.character_id) : 'Inconnu';
      if (!byChar[charName]) byChar[charName] = [];
      byChar[charName].push(e);
    }
    for (const [charName, entries] of Object.entries(byChar)) {
      push(`### ${charName}`, '');
      push('| Étape | Chapitre | Résumé |');
      push('|-------|----------|--------|');
      for (const e of entries) {
        const stage = HERO_STAGE_MAP[e.stage_key]?.label ?? e.stage_key;
        const ch    = e.chapter_num != null ? `${e.chapter_num}` : '—';
        const sum   = (e.summary ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
        push(`| ${stage} | ${ch} | ${sum} |`);
      }
      blank();
    }
    push('---');
    blank();
  }

  // ── Incohérences ──────────────────────────────────────────────────────────────
  if (unresolvedInc.length) {
    push('## Incohérences non résolues', '');
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    unresolvedInc.sort((a, b) => (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4));
    for (const inc of unresolvedInc) {
      const sev = inc.severity ? `[${inc.severity.toUpperCase()}] ` : '';
      push(`### ${sev}${inc.title}`);
      if (inc.explanation) { blank(); push(`> ${inc.explanation}`); }
      const links = incoherenceLinks.filter(l => l.incoherence_id === inc.id);
      if (links.length) {
        blank();
        push(`Entités liées : ${links.map(l => entityName(l.entity_id, l.entity_type) ?? l.label).filter(Boolean).join(', ')}`);
      }
      blank();
    }
  }

  return lines.join('\n');
}
