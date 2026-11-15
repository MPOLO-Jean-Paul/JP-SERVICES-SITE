export function AuthCard({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="animate-fade-up">
      <h1 className="h1">{title}</h1>
      {intro ? <p className="mt-2 text-copy">{intro}</p> : null}
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-8 border-t pt-6 text-sm text-copy">{footer}</div> : null}
    </div>
  );
}
