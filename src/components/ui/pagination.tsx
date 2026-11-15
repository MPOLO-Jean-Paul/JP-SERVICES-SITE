import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link aria-disabled={page <= 1} className={cn("inline-flex size-10 items-center justify-center rounded-full border hover:bg-panel-2", page <= 1 && "pointer-events-none opacity-40")} href={hrefFor(Math.max(1, page - 1))}>
        <ChevronLeft className="size-4" />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1]! < p - 1 ? <span className="px-1 text-muted">…</span> : null}
          <Link aria-current={p === page ? "page" : undefined} className={cn("inline-flex size-10 items-center justify-center rounded-full border text-sm font-medium hover:bg-panel-2", p === page && "border-primary bg-primary text-white hover:bg-primary")} href={hrefFor(p)}>
            {p}
          </Link>
        </span>
      ))}
      <Link aria-disabled={page >= totalPages} className={cn("inline-flex size-10 items-center justify-center rounded-full border hover:bg-panel-2", page >= totalPages && "pointer-events-none opacity-40")} href={hrefFor(Math.min(totalPages, page + 1))}>
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
