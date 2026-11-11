import { FileText } from "lucide-react";
import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadDemoPdf, formatDate, statusMeta, type ClientOrder, type DocFile } from "@/lib/client-space";

const contentClass =
  "w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-3xl border-white/15 bg-background/85 p-0 text-foreground backdrop-blur-2xl max-h-[90dvh] overflow-y-auto";
const labelClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3.5">
      <dt className={labelClass}>{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function FileCard({ file, creatorName, title }: { file: DocFile; creatorName: string; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/15">
        <FileText className="h-5 w-5 text-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{file.name}</div>
        <div className="text-xs text-muted-foreground">{file.size}</div>
      </div>
      <button
        type="button"
        onClick={() => downloadDemoPdf(file.name, [title, `Prestataire : ${creatorName}`, "Document de démonstration WeShoot."])}
        className="glass cursor-pointer h-9 shrink-0 rounded-xl px-3.5 text-xs font-medium uppercase tracking-wider transition hover:border-primary/60"
      >
        Télécharger
      </button>
    </div>
  );
}

function MessageBox({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

type CommonProps = {
  order: ClientOrder | null;
  creatorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuoteDialog({
  order,
  creatorName,
  open,
  onOpenChange,
  onAccept,
  onRefuse,
}: CommonProps & { onAccept: () => void; onRefuse: () => void }) {
  if (!order?.quote) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClass}>
        <DialogHeader className="border-b border-white/10 px-6 py-5 text-left">
          <DialogTitle className="text-display text-2xl">Devis reçu</DialogTitle>
          <DialogDescription className="sr-only">Détail du devis envoyé par {creatorName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 px-6 py-5">
          <dl>
            <Row label="Prestataire">{creatorName}</Row>
            <Row label="Date">{formatDate(order.date)}</Row>
            <Row label="Montant">
              <span className="text-display text-2xl text-primary">{order.price} MAD</span>
            </Row>
          </dl>
          <div className="space-y-2.5">
            <div className={labelClass}>Document</div>
            <FileCard file={order.quote.document} creatorName={creatorName} title={`Devis ${order.category} — ${order.price} MAD`} />
          </div>
          <div className="space-y-2.5">
            <div className={labelClass}>Message du prestataire</div>
            <MessageBox>{order.quote.message}</MessageBox>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onAccept}
              className="cursor-pointer h-12 flex-[1.4] rounded-xl bg-primary px-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              Accepter le devis
            </button>
            <button
              type="button"
              onClick={onRefuse}
              className="glass cursor-pointer h-12 flex-1 rounded-xl px-4 text-sm font-medium uppercase tracking-wider text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
            >
              Refuser
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BriefDialog({ order, creatorName, open, onOpenChange }: CommonProps) {
  if (!order) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClass}>
        <DialogHeader className="border-b border-white/10 px-6 py-5 text-left">
          <DialogTitle className="text-display text-2xl">Brief &amp; documents</DialogTitle>
          <DialogDescription className="sr-only">Brief et documents transmis à {creatorName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 px-6 py-5">
          <dl>
            <Row label="Prestataire">{creatorName}</Row>
            <Row label="Catégorie">{order.category}</Row>
            <Row label="Date">{formatDate(order.date)}</Row>
            <Row label="Statut">{statusMeta[order.status].label}</Row>
          </dl>
          <div className="space-y-2.5">
            <div className={labelClass}>Documents transmis</div>
            {order.brief.documents.length === 0 ? (
              <MessageBox>Aucun document transmis.</MessageBox>
            ) : (
              order.brief.documents.map((doc) => (
                <FileCard key={doc.name} file={doc} creatorName={creatorName} title={`${doc.name.replace(/\.pdf$/i, "")} — ${order.category}`} />
              ))
            )}
          </div>
          <div className="space-y-2.5">
            <div className={labelClass}>Messages complémentaires</div>
            <MessageBox>{order.brief.message || "Aucun message complémentaire."}</MessageBox>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
