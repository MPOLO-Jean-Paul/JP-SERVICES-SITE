/** Carte des pages de compte ; `step` affiche une progression explicite (« Étape 1 sur 2 · … »). */
export function AuthCard({ title, intro, children, footer, step }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode; step?: { current: number; total: number; label: string } }) {
  return (
    <div className="jp-auth-card animate-fade-up">
      {step ? (
        <div className="jp-auth-steps">
          <div className="jp-auth-steps-bar" aria-hidden="true">
            {Array.from({ length: step.total }, (_, i) => <span key={i} data-done={i < step.current} />)}
          </div>
          <p>Étape {step.current} sur {step.total} · {step.label}</p>
        </div>
      ) : null}
      <h1 className="h1">{title}</h1>
      {intro ? <p className="jp-auth-intro">{intro}</p> : null}
      <div className="jp-auth-fields">{children}</div>
      {footer ? <div className="jp-auth-footer border-t text-sm text-copy">{footer}</div> : null}
    </div>
  );
}
