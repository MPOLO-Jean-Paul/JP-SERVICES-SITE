"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function DeleteButton({ action, label = "Supprimer", title = "Confirmer la suppression", text = "Cette action est définitive.", size = "sm", variant = "ghost" }: { action: () => Promise<unknown>; label?: string; title?: string; text?: string; size?: "sm" | "md"; variant?: "ghost" | "danger" | "outline" }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)} className={variant === "ghost" ? "text-danger hover:text-danger" : undefined}><Trash2 /> {label}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={title} description={text}>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button variant="danger" loading={pending} onClick={() => start(async () => { await action(); setOpen(false); })}>Supprimer</Button></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
