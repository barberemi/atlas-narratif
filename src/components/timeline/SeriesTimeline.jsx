import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BEATS } from '../../data/beats_config';

const BEAT_COUNT = BEATS.length;

// ── helpers ───────────────────────────────────────────────────────────────────

function avg(arr) {
  if (!arr.length) return null;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ── Jauge intensité mini ───────────────────────────────────────────────────────

function IntensityBar({ value }) {
  if (value == null) return <span className="text-[10px] text-slate-600 italic">—</span>;
  const pct = (value / 10) * 100;
  const color = value >= 8 ? '#ef4444' : value >= 6 ? '#f97316' : value >= 4 ? '#fbbf24' : '#3b82f6';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{value.toFixed(1)}</span>
    </div>
  );
}

// ── Mini frise des beats ───────────────────────────────────────────────────────

function BeatCoverage({ covered, total }) {
  const pct = total ? Math.round((covered / total) * 100) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5 flex-wrap">
        {BEATS.slice(0, 15).map((b, i) => (
          <div
            key={b.id}
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: covered > i ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.07)' }}
            title={b.label}
          />
        ))}
      </div>
      <span className="text-[10px] text-slate-500">{pct}%</span>
    </div>
  );
}

// ── Carte d'un tome ────────────────────────────────────────────────────────────

function VolumeCard({ volume, events, arcPoints, onSelect, isUnassigned, t }) {
  const chapters = useMemo(() => {
    const seen = new Set();
    events.forEach(e => seen.add(e.chapter));
    return seen.size;
  }, [events]);

  const beatsHit = useMemo(() => {
    const ids = new Set();
    events.forEach(e => { if (e.beatId) ids.add(e.beatId); });
    return ids.size;
  }, [events]);

  // Intensité arc moyenne pour les chapitres de ce volume
  const chapterNums = useMemo(() => {
    const s = new Set();
    events.forEach(e => s.add(e.chapter));
    return s;
  }, [events]);

  const avgIntensity = useMemo(() => {
    const pts = arcPoints.filter(p => chapterNums.has(p.chapterNumber) && p.intensity != null);
    return pts.length ? avg(pts.map(p => p.intensity)) : null;
  }, [arcPoints, chapterNums]);

  // Distribution des scènes par chapitre (pour mini heatmap)
  const chapterDist = useMemo(() => {
    const map = new Map();
    events.forEach(e => map.set(e.chapter, (map.get(e.chapter) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [events]);
  const maxEvtsPerCh = Math.max(1, ...chapterDist.map(([, n]) => n));

  const accentColor = isUnassigned ? '#475569' : '#818cf8';
  const bgColor     = isUnassigned ? 'rgba(71,85,105,0.08)' : 'rgba(63,81,181,0.08)';
  const borderColor = isUnassigned ? 'rgba(71,85,105,0.2)'  : 'rgba(99,102,241,0.2)';

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        width: 260,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* En-tête */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {!isUnassigned && (
          <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: accentColor }}>
            {t('volume.tome', { number: volume.number })}
          </p>
        )}
        <h3 className="text-base font-black text-slate-200 leading-tight">
          {isUnassigned ? t('timeline.unassigned') : volume.title}
        </h3>
        {!isUnassigned && volume.description && (
          <p className="text-xs text-slate-500 font-serif italic mt-1 leading-snug line-clamp-2">
            {volume.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="px-5 py-4 space-y-3 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-0.5">{t('label.chapters')}</p>
            <p className="text-xl font-black" style={{ color: accentColor }}>{chapters}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-0.5">{t('label.events')}</p>
            <p className="text-xl font-black text-slate-300">{events.length}</p>
          </div>
        </div>

        {/* Intensité arc */}
        <div>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">{t('timeline.avgIntensity')}</p>
          <IntensityBar value={avgIntensity != null ? Math.round(avgIntensity * 10) / 10 : null} />
        </div>

        {/* Beats STC */}
        {!isUnassigned && (
          <div>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">{t('timeline.beatsSTC')}</p>
            <BeatCoverage covered={beatsHit} total={BEAT_COUNT} />
          </div>
        )}

        {/* Mini heatmap de densité narrative */}
        {chapterDist.length > 0 && (
          <div>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1.5">{t('timeline.densityPerChapter')}</p>
            <div className="flex items-end gap-0.5 h-6">
              {chapterDist.map(([ch, n]) => (
                <div
                  key={ch}
                  className="flex-1 rounded-sm min-w-[3px]"
                  style={{
                    height: `${Math.round((n / maxEvtsPerCh) * 100)}%`,
                    minHeight: 3,
                    backgroundColor: `${accentColor}${Math.round(40 + (n / maxEvtsPerCh) * 160).toString(16).padStart(2, '0')}`,
                  }}
                  title={`Ch.${ch} — ${n} événement${n > 1 ? 's' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      {!isUnassigned && (
        <div className="px-5 pb-5">
          <button
            onClick={() => onSelect(volume.id)}
            className="w-full py-2 rounded-xl text-xs font-bold transition-all duration-150"
            style={{
              backgroundColor: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: accentColor,
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.15)'; }}
          >
            {t('timeline.viewVolume')}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────

export default function SeriesTimeline({ volumes, allEvents, arcPoints, onSelectVolume }) {
  const { t } = useTranslation();
  // Répartir les events par volumeId
  const eventsByVolume = useMemo(() => {
    const map = new Map();
    volumes.forEach(v => map.set(v.id, []));
    map.set(null, []); // non assignés
    for (const e of (allEvents ?? [])) {
      const key = e.volumeId ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return map;
  }, [volumes, allEvents]);

  const unassigned = eventsByVolume.get(null) ?? [];

  // Stats globales série
  const totalChapters = useMemo(() => {
    const seen = new Set();
    (allEvents ?? []).forEach(e => seen.add(e.chapter));
    return seen.size;
  }, [allEvents]);

  const totalEvents = allEvents?.length ?? 0;

  if (!volumes.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600 italic text-sm">
          {t('timeline.seriesEmptyHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {/* Bandeau résumé série */}
      <div
        className="flex items-center gap-6 px-5 py-3 rounded-xl mb-6 flex-shrink-0"
        style={{ backgroundColor: 'rgba(63,81,181,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
      >
        <div>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest">{t('label.volumes')}</p>
          <p className="text-2xl font-black" style={{ color: '#818cf8' }}>{volumes.length}</p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest">{t('label.chapters')}</p>
          <p className="text-2xl font-black text-slate-300">{totalChapters}</p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest">{t('label.events')}</p>
          <p className="text-2xl font-black text-slate-300">{totalEvents}</p>
        </div>
        {unassigned.length > 0 && (
          <>
            <div className="w-px h-8 bg-white/10" />
            <p className="text-xs text-slate-500 italic">
              {t('timeline.unassignedEvents', { count: unassigned.length })}
            </p>
          </>
        )}
      </div>

      {/* Cartes des tomes */}
      <div className="flex flex-wrap gap-4">
        {volumes.map(v => (
          <VolumeCard
            key={v.id}
            volume={v}
            events={eventsByVolume.get(v.id) ?? []}
            arcPoints={arcPoints ?? []}
            onSelect={onSelectVolume}
            t={t}
          />
        ))}
        {unassigned.length > 0 && (
          <VolumeCard
            key="unassigned"
            volume={null}
            events={unassigned}
            arcPoints={arcPoints ?? []}
            onSelect={() => {}}
            isUnassigned
            t={t}
          />
        )}
      </div>
    </div>
  );
}
