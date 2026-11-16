import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
};

/** Google Material Symbols Rounded — decorative; label the parent control. */
export function MaterialIcon({ name, size = 20, filled = false, className }: MaterialIconProps) {
  return (
    <span
      className={cn("jp-md3-icon", className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 450, 'opsz' ${Math.max(20, Math.min(48, size))}`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
