import { useTranslation } from 'react-i18next';

function TimelineSvg() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 40 Q20 16, 32 32 Q44 48, 56 24" stroke="#3F51B5" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
      <circle cx="8" cy="40" r="4" fill="rgba(63,81,181,0.15)" stroke="#3F51B5" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="5" fill="rgba(63,81,181,0.25)" stroke="#3F51B5" strokeWidth="1.5" />
      <circle cx="56" cy="24" r="4" fill="rgba(63,81,181,0.15)" stroke="#3F51B5" strokeWidth="1.5" />
      <line x1="8" y1="52" x2="56" y2="52" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="8" y1="52" x2="8" y2="54" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1="32" y1="52" x2="32" y2="54" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1="56" y1="52" x2="56" y2="54" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" /><feComposite in="SourceGraphic" /></filter>
      </defs>
    </svg>
  );
}

function CharactersSvg() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="22" r="8" fill="rgba(63,81,181,0.2)" stroke="#3F51B5" strokeWidth="1.5" />
      <circle cx="16" cy="44" r="6" fill="rgba(63,81,181,0.12)" stroke="#3F51B5" strokeWidth="1.5" />
      <circle cx="48" cy="44" r="6" fill="rgba(63,81,181,0.12)" stroke="#3F51B5" strokeWidth="1.5" />
      <line x1="26" y1="28" x2="19" y2="39" stroke="#3F51B5" strokeWidth="1" opacity="0.5" />
      <line x1="38" y1="28" x2="45" y2="39" stroke="#3F51B5" strokeWidth="1" opacity="0.5" />
      <line x1="22" y1="44" x2="42" y2="44" stroke="#3F51B5" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
    </svg>
  );
}

function IncoherencesSvg() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="30" r="16" stroke="#3F51B5" strokeWidth="1.5" fill="rgba(63,81,181,0.08)" />
      <line x1="40" y1="42" x2="54" y2="56" stroke="#3F51B5" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow2)" />
      <line x1="28" y1="22" x2="28" y2="32" stroke="#3F51B5" strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="37" r="1.5" fill="#3F51B5" />
      <defs>
        <filter id="glow2"><feGaussianBlur stdDeviation="1.5" /><feComposite in="SourceGraphic" /></filter>
      </defs>
    </svg>
  );
}

function FrameworksSvg() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="30" height="40" rx="4" fill="rgba(63,81,181,0.08)" stroke="#3F51B5" strokeWidth="1.5" opacity="0.5" />
      <rect x="28" y="14" width="30" height="40" rx="4" fill="rgba(63,81,181,0.15)" stroke="#3F51B5" strokeWidth="1.5" />
      <line x1="34" y1="24" x2="50" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="30" x2="46" y2="30" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="36" x2="52" y2="36" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="42" x2="44" y2="42" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const FEATURES = [
  { titleKey: 'home.featureTimelineTitle', descKey: 'home.featureTimelineDesc', Illustration: TimelineSvg },
  { titleKey: 'home.featureCharactersTitle', descKey: 'home.featureCharactersDesc', Illustration: CharactersSvg },
  { titleKey: 'home.featureIncoherencesTitle', descKey: 'home.featureIncoherencesDesc', Illustration: IncoherencesSvg },
  { titleKey: 'home.featureFrameworksTitle', descKey: 'home.featureFrameworksDesc', Illustration: FrameworksSvg },
];

export default function FeaturesShowcase() {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* eslint-disable-next-line no-unused-vars */}
      {FEATURES.map(({ titleKey, descKey, Illustration }) => (
        <div
          key={titleKey}
          className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Illustration />
          <h2 className="text-sm font-black text-slate-200 leading-snug">{t(titleKey)}</h2>
          <p className="text-xs text-slate-500 font-serif italic leading-relaxed">{t(descKey)}</p>
        </div>
      ))}
    </section>
  );
}
