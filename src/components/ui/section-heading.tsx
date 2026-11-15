import { cn } from "@/lib/utils";

export function SectionHeading({ kicker, title, text, align = "left", action, className, as: Tag = "h2" }: { kicker?: string; title: string; text?: string; align?: "left" | "center"; action?: React.ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <div className={cn("reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", align === "center" && "sm:flex-col sm:items-center sm:text-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {kicker ? <span className="eyebrow">{kicker}</span> : null}
        <Tag className={cn("h2 mt-3", Tag === "h1" && "h1")}>{title}</Tag>
        {text ? <p className="mt-3 text-copy text-lg">{text}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
