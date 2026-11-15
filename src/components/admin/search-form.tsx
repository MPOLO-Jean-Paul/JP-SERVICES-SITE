import { Search } from "lucide-react";

export function SearchForm({ action, placeholder, defaultValue, extra }: { action: string; placeholder: string; defaultValue?: string; extra?: React.ReactNode }) {
  return (
    <form action={action} method="get" className="flex flex-wrap gap-2" role="search">
      <label className="relative min-w-64 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input type="search" name="q" defaultValue={defaultValue} placeholder={placeholder} className="field h-10 pl-9 text-sm" /></label>
      {extra}
      <button className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white">Filtrer</button>
    </form>
  );
}
