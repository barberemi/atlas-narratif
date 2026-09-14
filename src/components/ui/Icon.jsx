import {
  User, Users, MapPin, Swords, BookOpen, Calendar, Cat, Waypoints, Sprout,
  AlertTriangle, CornerDownLeft, Pencil, Search, Link2, Share2, Skull, Eye,
  Library, Settings, Lightbulb, Package, Ghost, Map, Zap, BarChart3, FileText,
  Ban, HelpCircle, FlaskConical, Globe, Trash2, Clapperboard, Hammer, Circle,
  CheckCircle2, Download, Key, Save, SlidersHorizontal, MessageCircle, Sparkles,
  Star, Feather, PartyPopper, NotebookPen, Home, Megaphone, DoorOpen, Mountain,
  Wand2, Compass, Flag, PenLine, Gem, ScrollText, Route, Bell, Trophy,
  Clock, Ban as Forbidden, Link2Off,
  X, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, LayoutGrid, Play, Pause, Maximize2, Minimize2,
} from 'lucide-react';

/**
 * Jeu d'icônes central (lucide) — remplace les emojis-icônes.
 * Trait fin, teinté via `currentColor` (utiliser text-atlas-* / style color).
 *
 * Usage : <Icon name="user" size={16} className="text-atlas-soft" />
 */
const ICONS = {
  // Entités & lore
  user: User, users: Users, character: User, group: Users,
  location: MapPin, mapPin: MapPin, object: Swords, sword: Swords,
  gem: Gem, ring: Gem, book: BookOpen, chapter: BookOpen,
  // Narration
  event: Calendar, calendar: Calendar, cat: Cat, thread: Waypoints,
  plant: Sprout, seed: Sprout, arc: Route, beat: Flag,
  memory: CornerDownLeft, pov: Eye, view: Eye, death: Skull,
  scene: Clapperboard, note: NotebookPen, feather: Feather, quill: Feather,
  // Voyage du héros (archétypes)
  ordinaryWorld: Home, call: Megaphone, refusal: Ban, mentor: Wand2,
  threshold: DoorOpen, tests: Swords, cave: Mountain, ordeal: Skull,
  reward: Gem, roadBack: Route, resurrection: Sparkles, elixir: Trophy,
  hero: Compass,
  // Nav / sections
  write: PenLine, universe: Globe, analyze: BarChart3, series: Library,
  volume: Library, map: Map, dashboard: BarChart3, lore: ScrollText,
  // Actions & états
  edit: Pencil, search: Search, link: Link2, relations: Share2,
  settings: Settings, idea: Lightbulb, inventory: Package, ghost: Ghost,
  rescan: Zap, zap: Zap, doc: FileText, critical: Ban, help: HelpCircle,
  detector: FlaskConical, trash: Trash2, hammer: Hammer, dot: Circle,
  check: CheckCircle2, checkmark: Check, close: X,
  chevronDown: ChevronDown, chevronUp: ChevronUp, chevronRight: ChevronRight, chevronLeft: ChevronLeft, grid: LayoutGrid, play: Play, pause: Pause, expand: Maximize2, shrink: Minimize2,
  import: Download, key: Key, save: Save,
  controls: SlidersHorizontal, chat: MessageCircle, sparkles: Sparkles,
  star: Star, celebrate: PartyPopper, warning: AlertTriangle, bell: Bell,
  clock: Clock, temporal: Clock, forbidden: Forbidden, linkBroken: Link2Off,
};

export default function Icon({ name, size = 16, strokeWidth = 1.75, className, style, title, ...rest }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    />
  );
}

export { ICONS };
