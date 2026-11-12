import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const fieldClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground outline-none backdrop-blur transition [color-scheme:dark] placeholder:text-muted-foreground/60 hover:border-white/20 focus:border-primary focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/25";
export const areaClass = `${fieldClass} h-auto resize-y py-3`;
export const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";
export const panelClass = "glass rounded-3xl p-5 md:p-6";

export const ghostBtn =
  "glass cursor-pointer inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground transition hover:border-primary/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";
export const primaryBtn =
  "cursor-pointer inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
export const bigPrimaryBtn =
  "cursor-pointer inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none";
export const bigGhostBtn =
  "glass cursor-pointer inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-medium uppercase tracking-wider text-muted-foreground transition hover:border-primary/60 hover:text-foreground";

export const pillBase = "cursor-pointer rounded-full border px-4 text-sm font-medium transition whitespace-nowrap";
export const pillIdle = "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/25 hover:text-foreground";
export const pillOn = "border-primary bg-primary text-primary-foreground";

export function Field({ label, htmlFor, children, className = "" }: { label: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{children}</div>;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90dvh] gap-0 overflow-y-auto rounded-3xl border-white/15 bg-background/85 p-0 text-foreground backdrop-blur-2xl`}
      >
        <DialogHeader className="border-b border-white/10 px-6 py-5 text-left">
          <DialogTitle className="text-display text-2xl">{title}</DialogTitle>
          <DialogDescription className={description ? "mt-1 text-sm text-muted-foreground" : "sr-only"}>{description ?? title}</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  text,
  confirmLabel = "Supprimer",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={text}>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
          className="cursor-pointer h-12 flex-1 rounded-xl bg-destructive px-4 text-sm font-semibold uppercase tracking-wider text-destructive-foreground transition hover:opacity-90"
        >
          {confirmLabel}
        </button>
        <button type="button" onClick={() => onOpenChange(false)} className={`${bigGhostBtn} flex-1`}>
          Annuler
        </button>
      </div>
    </Modal>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-muted-foreground backdrop-blur">{children}</div>;
}

export const requestStatusMeta = {
  pending: { label: "En attente", className: "bg-amber-500/15 text-amber-300" },
  quote_to_send: { label: "Devis à envoyer", className: "bg-primary/15 text-primary" },
  quote_sent: { label: "Devis envoyé", className: "bg-sky-500/15 text-sky-300" },
  confirmed: { label: "Confirmée", className: "bg-emerald-500/15 text-emerald-400" },
  declined: { label: "Refusée", className: "bg-white/10 text-muted-foreground" },
  completed: { label: "Terminée", className: "bg-emerald-500/15 text-emerald-400" },
} as const;
