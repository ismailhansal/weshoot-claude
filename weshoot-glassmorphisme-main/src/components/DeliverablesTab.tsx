import { ArrowRight, CheckCircle2, ChevronLeft, Download, Lock } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  daysLeftBeforeAutoValidation,
  downloadMany,
  downloadUrl,
  formatDate,
  formatShortDate,
  statusMeta,
  type ClientOrder,
} from "@/lib/client-space";
import { getCreator } from "@/lib/creators";

type Props = {
  orders: ClientOrder[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  onValidate: (id: string) => void;
  onContest: (id: string, reason: string) => void;
};

function watermark(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='380' height='200'><text x='20' y='120' transform='rotate(-24 190 100)' fill='white' fill-opacity='0.4' font-family='Inter,Arial,sans-serif' font-size='12' letter-spacing='3'>WESHOOT · ${label.toUpperCase()} · APERÇU PROTÉGÉ</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const ring = "rounded-full border-2 border-primary object-cover";

export function DeliverablesTab({ orders, selectedId, onSelect, onValidate, onContest }: Props) {
  const [contestOpen, setContestOpen] = useState(false);
  const [reason, setReason] = useState("");

  const eligible = orders.filter((o) => o.deliverables && (o.status === "delivered" || o.status === "validated" || o.status === "disputed"));
  const selected = eligible.find((o) => o.id === selectedId);

  /* ---------- Étape 1 : choisir un prestataire ---------- */
  if (!selected) {
    return (
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Sélectionne un prestataire pour voir ses livrables
        </div>
        {eligible.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-muted-foreground backdrop-blur">
            Aucun livrable pour le moment. Ils apparaîtront ici dès qu'un prestataire aura livré sa prestation.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {eligible.map((o) => {
              const creator = getCreator(o.creatorId);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onSelect(o.id)}
                  className="glass group cursor-pointer rounded-3xl p-5 text-left transition hover:border-primary/60"
                >
                  <div className="flex items-center gap-4">
                    <img src={creator?.avatar} alt={creator?.name} className={`h-14 w-14 shrink-0 ${ring}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-medium">{creator?.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {o.category} — {formatShortDate(o.date)}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusMeta[o.status].className}`}>
                      {statusMeta[o.status].label}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm text-primary">
                    Voir les livrables <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Étape 2 : galerie ---------- */
  const creator = getCreator(selected.creatorId);
  const creatorName = creator?.name ?? "Prestataire";
  const photos = selected.deliverables!.photos;
  const validated = selected.status === "validated";
  const disputed = selected.status === "disputed";
  const protectedPreview = !validated;
  const daysLeft = daysLeftBeforeAutoValidation(selected.deliverables!.deliveredAt);
  const filename = (i: number) => `weshoot-${creatorName.toLowerCase()}-${selected.category.toLowerCase()}-${String(i + 1).padStart(2, "0")}.jpg`;

  function validateAndDownload() {
    onValidate(selected!.id);
    downloadMany(photos.map((url, i) => ({ url, filename: filename(i) })));
  }

  function submitContest() {
    onContest(selected!.id, reason);
    setContestOpen(false);
    setReason("");
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Changer de prestataire
      </button>

      <div className="mt-5 flex items-center gap-4">
        <img src={creator?.avatar} alt={creatorName} className={`h-14 w-14 shrink-0 ${ring}`} />
        <div className="min-w-0">
          <div className="text-lg font-medium">{creatorName}</div>
          <div className="text-xs text-muted-foreground">
            {selected.category} — {formatDate(selected.date)}
            {selected.status === "delivered" && (
              <span className="text-primary"> · {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""} avant validation auto</span>
            )}
            {validated && <span className="text-emerald-400"> · Prestation validée</span>}
            {disputed && <span className="text-destructive"> · Contestation en cours</span>}
          </div>
        </div>
      </div>

      {protectedPreview && (
        <p className="mt-5 flex items-start gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          Aperçu protégé — clic droit et téléchargement direct désactivés. Valide la prestation pour recevoir les fichiers HD sans watermark.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((src, i) => (
          <div
            key={`${src}-${i}`}
            onContextMenu={protectedPreview ? (e) => e.preventDefault() : undefined}
            className="group relative aspect-[3/4] select-none overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] [-webkit-touch-callout:none]"
          >
            <img src={src} alt={`Livrable ${i + 1} de ${creatorName}`} draggable={!protectedPreview} loading="lazy" className="h-full w-full object-cover" />
            {protectedPreview && (
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: watermark(creatorName), backgroundSize: "380px 200px" }} />
            )}
            {validated && (
              <button
                type="button"
                onClick={() => downloadUrl(src, filename(i))}
                aria-label={`Télécharger le livrable ${i + 1}`}
                className="glass absolute bottom-2.5 right-2.5 grid h-10 w-10 cursor-pointer place-items-center rounded-full transition hover:border-primary hover:bg-primary hover:text-primary-foreground md:opacity-0 md:group-hover:opacity-100"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {selected.status === "delivered" && (
          <>
            <button
              type="button"
              onClick={validateAndDownload}
              className="cursor-pointer inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Valider et télécharger
            </button>
            <button
              type="button"
              onClick={() => setContestOpen(true)}
              className="glass cursor-pointer h-12 rounded-xl px-6 text-sm font-medium uppercase tracking-wider text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
            >
              Contester
            </button>
          </>
        )}
        {validated && (
          <>
            <button
              type="button"
              onClick={() => downloadMany(photos.map((url, i) => ({ url, filename: filename(i) })))}
              className="cursor-pointer inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Tout télécharger ({photos.length})
            </button>
            <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Fichiers HD sans watermark
            </span>
          </>
        )}
        {disputed && (
          <p className="text-sm text-muted-foreground">
            Ta contestation a été envoyée à {creatorName}. Tu peux suivre l'échange dans tes messages.
          </p>
        )}
      </div>

      <Dialog open={contestOpen} onOpenChange={setContestOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-3xl border-white/15 bg-background/85 p-0 text-foreground backdrop-blur-2xl">
          <DialogHeader className="border-b border-white/10 px-6 py-5 text-left">
            <DialogTitle className="text-display text-2xl">Contester la prestation</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Explique ce qui ne convient pas : {creatorName} sera notifié et pourra te répondre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. Il manque les photos de la cérémonie…"
              className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none backdrop-blur [color-scheme:dark] placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={submitContest}
                disabled={!reason.trim()}
                className="cursor-pointer h-12 flex-[1.4] rounded-xl bg-primary px-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Envoyer la contestation
              </button>
              <button
                type="button"
                onClick={() => setContestOpen(false)}
                className="glass cursor-pointer h-12 flex-1 rounded-xl px-4 text-sm font-medium uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
