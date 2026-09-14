/**
 * Navigation groups — labels are i18n keys resolved at render time via `t()`.
 *
 * Le menu « Écrire » est orchestré (point 16) : ses items portent des
 * métadonnées optionnelles (`section`, `sublabelKey`, `badgeKey`) qui
 * hiérarchisent les 5 méthodes sans en supprimer aucune. Les autres menus
 * restent des listes à plat (aucune de ces clés → rendu inchangé).
 * Ordre des sections = ordre de première apparition des items.
 */
export const NAV_GROUPS = [
  {
    key:   'ecrire',
    labelKey: 'nav.write',
    icon:  'write',
    items: [
      { path: '/savethecat', labelKey: 'nav.saveTheCat',   icon: 'cat',    section: 'nav.secFoundation', sublabelKey: 'nav.descSaveTheCat',  badgeKey: 'nav.startHere' },
      { path: '/heros',      labelKey: 'nav.heroJourney',  icon: 'hero',   section: 'nav.secDeepen',     sublabelKey: 'nav.descHeroJourney' },
      { path: '/arc',        labelKey: 'nav.emotionalArc', icon: 'arc',    section: 'nav.secDeepen',     sublabelKey: 'nav.descEmotionalArc' },
      { path: '/plants',     labelKey: 'nav.plants',       icon: 'plant',  section: 'nav.secThreads',    sublabelKey: 'nav.descPlants' },
      { path: '/threads',    labelKey: 'nav.threads',      icon: 'thread', section: 'nav.secThreads',    sublabelKey: 'nav.descThreads' },
    ],
  },
  {
    key:   'univers',
    labelKey: 'nav.universe',
    icon:  'universe',
    items: [
      { path: '/lore', labelKey: 'nav.lore', icon: 'lore' },
      { path: '/map',  labelKey: 'nav.map',  icon: 'map' },
    ],
  },
  {
    key:   'analyser',
    labelKey: 'nav.analyze',
    icon:  'analyze',
    items: [
      { path: '/timeline',     labelKey: 'nav.timeline',       icon: 'event' },
      { path: '/dashboard',    labelKey: 'nav.dashboard',      icon: 'dashboard' },
      { path: '/review',       labelKey: 'nav.review',         icon: 'search' },
      { path: '/incoherences', labelKey: 'nav.incoherences',   icon: 'warning' },
    ],
  },
];
