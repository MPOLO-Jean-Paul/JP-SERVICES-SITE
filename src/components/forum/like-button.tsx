"use client";
import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleLikeAction } from "@/server/actions/forum";
import { cn } from "@/lib/utils";

export function LikeButton({ postId, liked, total, disabled }: { postId: number; liked: boolean; total: number; disabled?: boolean }) {
  const [state, setOptimistic] = useOptimistic({ liked, total });
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={state.liked}
      aria-label={state.liked ? "Ne plus aimer" : "Aimer cette publication"}
      onClick={() => {
        if (disabled) return toast.info("Connectez-vous pour aimer une publication.");
        start(async () => {
          setOptimistic({ liked: !state.liked, total: state.total + (state.liked ? -1 : 1) });
          const r = await toggleLikeAction(postId);
          if ("error" in r) toast.error(r.error);
        });
      }}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition", state.liked ? "border-accent-500/40 bg-accent-500/10 text-accent-600" : "text-copy hover:border-accent-500/40 hover:text-accent-600")}
    >
      <Heart className={cn("size-4", state.liked && "fill-current")} /> {state.total}
    </button>
  );
}
