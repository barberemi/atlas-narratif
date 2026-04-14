/** Navigation groups — labels are i18n keys resolved at render time via `t()`. */
export const NAV_GROUPS = [
  {
    key:   'ecrire',
    labelKey: 'nav.write',
    icon:  '✍️',
    items: [
      { path: '/savethecat', labelKey: 'nav.saveTheCat',    icon: '🐱' },
      { path: '/heros',      labelKey: 'nav.heroJourney',   icon: '⚔️' },
      { path: '/arc',        labelKey: 'nav.emotionalArc',  icon: '〰️' },
      { path: '/plants',     labelKey: 'nav.plants',        icon: '◎'  },
      { path: '/threads',    labelKey: 'nav.threads',       icon: '🧵' },
    ],
  },
  {
    key:   'univers',
    labelKey: 'nav.universe',
    icon:  '🌍',
    items: [
      { path: '/lore', labelKey: 'nav.lore', icon: '💾' },
      { path: '/map',  labelKey: 'nav.map',  icon: '🗺️' },
    ],
  },
  {
    key:   'analyser',
    labelKey: 'nav.analyze',
    icon:  '📊',
    items: [
      { path: '/timeline',     labelKey: 'nav.timeline',       icon: '📅' },
      { path: '/dashboard',    labelKey: 'nav.dashboard',      icon: '📊' },
      { path: '/review',       labelKey: 'nav.review',         icon: '🔍' },
      { path: '/incoherences', labelKey: 'nav.incoherences',   icon: '⚠️' },
    ],
  },
];
