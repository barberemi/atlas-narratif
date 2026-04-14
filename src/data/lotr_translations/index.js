/**
 * Applique une traduction sur le payload seed LOTR.
 * Le payload d'origine est en FR — cette fonction remplace les champs textuels
 * par les traductions de la langue demandée.
 *
 * Si la langue est 'fr' ou qu'aucune traduction n'existe, retourne le payload tel quel.
 */

import en from './en.json';
import zh from './zh.json';

const translations = { en, zh };

export function translateSeedData(meta, data, lang) {
  const t = translations[lang];
  if (!t) return { meta, data }; // FR ou langue non supportée → pas de traduction

  const translatedMeta = {
    ...meta,
    ...(t.meta || {}),
  };

  const translatedData = {
    ...data,

    volumesDB: (data.volumesDB || []).map(v => ({
      ...v,
      ...pick(t.volumes?.[v.id], ['title', 'description']),
    })),

    loreDB: {
      characters: (data.loreDB?.characters || []).map(c => ({
        ...c,
        ...pick(t.characters?.[c.id], ['name', 'aliases', 'description', 'role', 'origin', 'race', 'affiliation', 'traits']),
      })),
      locations: (data.loreDB?.locations || []).map(l => ({
        ...l,
        ...pick(t.locations?.[l.id], ['name', 'description', 'type', 'regime', 'inhabitants', 'keyPlaces']),
      })),
      objects: (data.loreDB?.objects || []).map(o => ({
        ...o,
        ...pick(t.objects?.[o.id], ['name', 'description', 'type', 'creator', 'inscription', 'powers', 'currentHolder']),
      })),
    },

    groupsDB: (data.groupsDB || []).map(g => {
      const gt = t.groups?.[g.id];
      return {
        ...g,
        ...pick(gt, ['name', 'description', 'type']),
        members: (g.members ?? []).map(m => {
          const mt = gt?.members?.[m.characterId];
          return mt ? { ...m, ...pick(mt, ['roleInGroup']) } : m;
        }),
      };
    }),

    timelineDB: (data.timelineDB || []).map(e => ({
      ...e,
      ...pick(t.events?.[e.id], ['title', 'description', 'chapterTitle']),
    })),

    chaptersDB: (data.chaptersDB || []).map(ch => ({
      ...ch,
      ...pick(t.chapters?.[ch.id], ['title', 'summary']),
    })),

    plantsDB: (data.plantsDB || []).map(p => ({
      ...p,
      ...pick(t.plants?.[p.id], ['label', 'notes']),
    })),

    threadsDB: (data.threadsDB || []).map(th => ({
      ...th,
      ...pick(t.threads?.[th.id], ['name', 'description']),
    })),

    incoherencesDB: (data.incoherencesDB || []).map(inc => ({
      ...inc,
      ...pick(t.incoherences?.[inc.id], ['title', 'explanation']),
    })),

    heroJourneyDB: (data.heroJourneyDB || []).map(hj => {
      const key = `${hj.characterId}_${hj.stageKey}`;
      return {
        ...hj,
        ...pick(t.heroJourney?.[key], ['summary']),
      };
    }),
  };

  return { meta: translatedMeta, data: translatedData };
}

/** Extrait les champs non-undefined d'un objet de traduction. */
function pick(src, keys) {
  if (!src) return {};
  const result = {};
  for (const k of keys) {
    if (src[k] !== undefined) result[k] = src[k];
  }
  return result;
}
