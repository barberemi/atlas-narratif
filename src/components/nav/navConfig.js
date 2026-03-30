export const NAV_GROUPS = [
  {
    key:   'ecrire',
    label: 'Écrire',
    icon:  '✍️',
    items: [
      { path: '/savethecat', label: 'Save the Cat',   icon: '🐱' },
      { path: '/heros',      label: 'Voyage du Héros', icon: '⚔️' },
      { path: '/arc',        label: 'Arc émotionnel', icon: '〰️' },
      { path: '/plants',     label: 'Amorces',        icon: '◎'  },
      { path: '/threads',    label: 'Fils narratifs', icon: '🧵' },
    ],
  },
  {
    key:   'univers',
    label: 'Univers',
    icon:  '🌍',
    items: [
      { path: '/lore', label: 'Univers', icon: '💾' },
      { path: '/map',  label: 'Carte',   icon: '🗺️' },
    ],
  },
  {
    key:   'analyser',
    label: 'Analyser',
    icon:  '📊',
    items: [
      { path: '/timeline',     label: 'Timeline',        icon: '📅' },
      { path: '/dashboard',    label: 'Vue d\'ensemble', icon: '📊' },
      { path: '/review',       label: 'Révision',        icon: '🔍' },
      { path: '/incoherences', label: 'Incohérences',    icon: '⚠️' },
    ],
  },
];
