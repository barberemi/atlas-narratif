import { useMemo, useState } from 'react';
import { findDuplicateCandidates } from '../../import/dedup';
import { CANONICAL_FIELDS } from '../../import/obsidian/mapToCanonical';

// Libellés FR des champs canoniques du noyau typé (pour l'écran de mapping).
const FIELD_LABELS = {
  aliases: 'Alias', race: 'Race / espèce', role: 'Rôle', origin: 'Origine',
  affiliations: 'Affiliations', traits: 'Traits', description: 'Description',
  type: 'Type', regime: 'Régime', inhabitants: 'Habitants',
  creator: 'Créateur', currentHolder: 'Détenteur', powers: 'Pouvoirs',
};
const fieldLabel = (k) => FIELD_LABELS[k] ?? k;

/**
 * Aperçu de staging AVANT le seed (étape 5, scaffold).
 *
 * Lit le payload canonique EN MÉMOIRE (jamais la DB) et présente : comptages,
 * doublons candidats, liens cassés — puis un bouton « Confirmer l'import ».
 *
 * Point d'insertion prévu : src/api/importFromAiOutputViaApi.js (~32-64), juste
 * AVANT l'appel à seedProjectViaApi — le `data` (et le `report` pour Obsidian)
 * y sont déjà disponibles. Ce composant reçoit ce `data`/`report` et n'appelle
 * `onConfirm` (qui déclenche le seed) que sur action explicite de l'utilisateur.
 *
 * TODO :
 *   - Dédup via Fuse.js (seuil réglable, comparaison alias↔nom) au lieu de dedup.js.
 *   - Permettre de fusionner / ignorer une entité doublon avant import.
 *   - Router ce composant dans un flux /review dédié à l'import (pré-seed), distinct
 *     du /review post-seed actuel (ReviewPage).
 *   - i18n (fr/en/zh) — chaînes en clair pour le scaffold.
 */
export default function ImportPreview({ data, report, onConfirm, onCancel, busy, fields, overrideMap, onOverride }) {
  const duplicates = useMemo(() => findDuplicateCandidates(data), [data]);
  const [mappingOpen, setMappingOpen] = useState(false);

  const counts = report?.counts ?? {
    characters: data?.loreDB?.characters?.length ?? 0,
    locations:  data?.loreDB?.locations?.length ?? 0,
    objects:    data?.loreDB?.objects?.length ?? 0,
    customEntities: data?.customEntitiesDB?.length ?? 0,
    customTypes: data?.customTypesDB?.length ?? 0,
    scenes:     data?.timelineDB?.length ?? 0,
    chapters:   data?.chaptersDB?.length ?? 0,
  };
  const scenes   = counts.scenes   ?? data?.timelineDB?.length ?? 0;
  const chapters = counts.chapters ?? data?.chaptersDB?.length ?? 0;
  const brokenLinks = report?.brokenLinks ?? [];

  return (
    <div className="p-6 max-w-2xl mx-auto text-slate-200 space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Aperçu avant import</h2>
        <p className="text-sm text-atlas-soft italic">Rien n'est encore écrit. Vérifiez puis confirmez.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Personnages" value={counts.characters} />
        <Stat label="Lieux" value={counts.locations} />
        <Stat label="Objets" value={counts.objects} />
        <Stat label="Entités custom" value={counts.customEntities} />
        {scenes > 0 && <Stat label="Scènes" value={scenes} />}
        {chapters > 0 && <Stat label="Chapitres" value={chapters} />}
      </div>

      {onOverride && fields?.length > 0 && (
        <section className="rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setMappingOpen(o => !o)}
            data-testid="mapping-toggle"
            className="w-full flex items-center justify-between px-3 py-2.5 text-left"
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
              Ajuster le mapping des champs
            </span>
            <span className="text-atlas-mute text-xs">{fields.length} champ(s) · {mappingOpen ? '▾' : '▸'}</span>
          </button>

          {mappingOpen && (
            <div className="px-3 pb-3 space-y-1.5">
              <p className="text-[11px] text-atlas-mute mb-2">
                Par défaut chaque champ est deviné automatiquement (champ du noyau ou champ personnalisé).
                Corrige ici si besoin — les compteurs ci-dessus se mettent à jour.
              </p>
              {fields.map(f => (
                <div key={f.normKey} className="flex items-center gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-bold text-slate-200">{f.key}</span>
                    <span className="text-atlas-mute"> ×{f.count}</span>
                    {f.sample && <span className="text-atlas-mute block truncate italic">« {f.sample} »</span>}
                  </div>
                  <select
                    value={overrideMap?.[f.normKey] ?? ''}
                    onChange={e => onOverride(f.normKey, e.target.value)}
                    aria-label={`Mapping du champ ${f.key}`}
                    className="text-xs bg-transparent border border-white/10 rounded px-1.5 py-1 text-slate-200"
                    style={{ maxWidth: 190 }}
                  >
                    <option value="">Auto ({f.guess ? fieldLabel(f.guess) : 'champ perso.'})</option>
                    <optgroup label="Champ du noyau">
                      {CANONICAL_FIELDS.map(k => (
                        <option key={k} value={k}>{fieldLabel(k)}</option>
                      ))}
                    </optgroup>
                    <option value="__custom">Champ personnalisé</option>
                    <option value="__ignore">Ignorer</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {duplicates.length > 0 && (
        <section className="rounded-lg p-3" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1.5">{duplicates.length} doublon(s) candidat(s)</h3>
          <ul className="text-xs space-y-0.5">
            {duplicates.slice(0, 8).map((d, i) => (
              <li key={i} className="text-amber-300">« {d.a} » ≈ « {d.b} » <span className="text-atlas-mute">({d.bucket})</span></li>
            ))}
          </ul>
        </section>
      )}

      {brokenLinks.length > 0 && (
        <section className="rounded-lg p-3" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1.5">{brokenLinks.length} lien(s) cassé(s)</h3>
          <ul className="text-xs space-y-0.5">
            {brokenLinks.slice(0, 8).map((l, i) => (
              <li key={i} className="text-red-300">{l.from} → {l.target}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-atlas-soft border border-white/10">Annuler</button>
        )}
        <button onClick={onConfirm} disabled={busy} data-testid="import-confirm" className="px-4 py-2 text-sm font-black" style={{ backgroundColor: '#5cae8e', color: '#15171b', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Import en cours…' : "Confirmer l'import"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[11px] text-atlas-mute uppercase tracking-widest">{label}</p>
    </div>
  );
}
