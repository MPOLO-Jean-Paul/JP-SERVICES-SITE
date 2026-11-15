import Image from "next/image";
import { cn, initials, mediaUrl } from "@/lib/utils";

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const url = src ? mediaUrl(src, "") : "";
  const showImage = url && !url.endsWith("default-avatar.svg");
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary", className)}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      aria-hidden
    >
      {showImage ? <Image src={url} alt="" width={size} height={size} className="size-full object-cover" unoptimized={url.startsWith("http")} /> : initials(name)}
    </span>
  );
}
