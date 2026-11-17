import { Search } from "lucide-react";

export function SearchForm({ action, placeholder, defaultValue, extra }: { action: string; placeholder: string; defaultValue?: string; extra?: React.ReactNode }) {
  return (
    <form action={action} method="get" className="jp-admin-search flex min-w-0 flex-wrap gap-2" role="search">
      <label className="relative w-full min-w-0 flex-1 sm:min-w-60"><span className="sr-only">Recherche</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" /><input type="search" name="q" defaultValue={defaultValue} placeholder={placeholder} className="field h-11 min-w-0 pl-9 text-sm" /></label>
      {extra}
      <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Filtrer</button>
    </form>
  );
}
