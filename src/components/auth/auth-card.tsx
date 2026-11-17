export function AuthCard({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="jp-auth-card animate-fade-up">
      <div className="jp-auth-topline" aria-hidden="true"><span /><span /></div>
      <h1 className="h1">{title}</h1>
      {intro ? <p className="jp-auth-intro">{intro}</p> : null}
      <div className="jp-auth-fields">{children}</div>
      {footer ? <div className="jp-auth-footer border-t text-sm text-copy">{footer}</div> : null}
    </div>
  );
}
