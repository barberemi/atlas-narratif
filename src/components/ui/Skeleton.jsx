/**
 * Skeleton loader — placeholder animé pendant le chargement.
 * @param {'card'|'list'|'text'|'dashboard'} [variant='list'] — type de layout
 */
export default function Skeleton({ variant = 'list' }) {
  const shimmer = 'animate-pulse bg-white/5 rounded-lg';

  if (variant === 'card') {
    return (
      <div className="flex flex-col gap-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${shimmer} h-24`} />
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${shimmer} h-20`} />
          ))}
        </div>
        <div className={`${shimmer} h-48`} />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="flex flex-col gap-3 p-6">
        <div className={`${shimmer} h-4 w-2/3`} />
        <div className={`${shimmer} h-4 w-1/2`} />
        <div className={`${shimmer} h-4 w-3/4`} />
      </div>
    );
  }

  // list (default)
  return (
    <div className="flex flex-col gap-3 p-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`${shimmer} h-14`} />
      ))}
    </div>
  );
}
