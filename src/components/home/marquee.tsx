export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="mask-fade-x relative overflow-hidden" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 py-1 hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {t}
            <span className="size-1 rounded-full bg-line-strong" />
          </span>
        ))}
      </div>
    </div>
  );
}
