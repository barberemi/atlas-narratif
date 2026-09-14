/**
 * État vide réutilisable — affiché quand une vue n'a pas encore de données.
 * @param {string}  icon     — emoji ou icône (ex: "📅")
 * @param {string}  title    — message principal (ex: "Aucun événement")
 * @param {string}  [hint]   — sous-texte d'aide (ex: "Ajoutez votre premier événement.")
 * @param {React.ReactNode} [action] — bouton ou lien optionnel
 */
export default function EmptyState({ icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      {icon && <span className="text-4xl">{icon}</span>}
      <p className="text-sm text-atlas-soft font-medium">{title}</p>
      {hint && <p className="text-xs text-atlas-mute max-w-xs">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
