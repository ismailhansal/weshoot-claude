import { ArrowRight, CheckCircle2, ChevronLeft, FileText, Send, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { EmptyState, SectionLabel, bigPrimaryBtn, ghostBtn, panelClass } from "@/components/creator/ui";
import { AUTO_VALIDATION_DAYS, daysLeftBeforeAutoValidation, formatDay, formatDateTimeLocal, isoDay, type CreatorRequest, type CreatorSpace, type DeliveryFile } from "@/lib/creator-space";
import { formatBytes, imageToDataUrl, newId } from "@/lib/media";

type Phase = { label: string; className: string };

function phaseOf(r: CreatorRequest): Phase {
  if (r.delivery?.validatedAt) return { label: "Validée", className: "bg-emerald-500/15 text-emerald-400" };
  if (r.delivery) return { label: "Livrée", className: "bg-primary/15 text-primary" };
  return { label: "À livrer", className: "bg-amber-500/15 text-amber-300" };
}

export function DeliveriesTab({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [staged, setStaged] = useState<DeliveryFile[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const eligible = state.requests.filter((r) => r.status === "confirmed" || r.status === "completed");
  const selected = eligible.find((r) => r.id === selectedId) ?? null;

  function select(id: string | null) {
    setSelectedId(id);
    setStaged([]);
  }

  async function stage(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    const next: DeliveryFile[] = [];
    for (const file of Array.from(files)) {
      let src: string | undefined;
      if (file.type.startsWith("image/")) {
        try {
          src = await imageToDataUrl(file, 800, 0.72);
        } catch {
          src = undefined;
        }
      }
      next.push({ id: newId("df"), name: file.name, size: formatBytes(file.size), src });
    }
    setBusy(false);
    setStaged((prev) => [...prev, ...next]);
  }

  function send() {
    if (!selected || staged.length === 0) return;
    update((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === selected.id ? { ...r, delivery: { files: staged, sentAt: new Date().toISOString() } } : r)),
    }));
    setStaged([]);
  }

  /** Démo : simule la validation du client — le montant quitte le séquestre. */
  function simulateValidation() {
    if (!selected?.delivery) return;
    update((s) => ({
      ...s,
      requests: s.requests.map((r) =>
        r.id === selected.id && r.delivery ? { ...r, status: "completed", delivery: { ...r.delivery, validatedAt: new Date().toISOString() } } : r,
      ),
      payments: s.payments.map((p) => (p.requestId === selected.id && p.status === "escrow" ? { ...p, status: "received", date: isoDay(0) } : p)),
    }));
  }

  /* ---------- Étape 1 : choisir le client ---------- */
  if (!selected) {
    return (
      <div>
        <SectionLabel>Sélectionne le client concerné</SectionLabel>
        {eligible.length === 0 ? (
          <div className="mt-4"><EmptyState>Aucune prestation à livrer. Elles apparaîtront ici une fois les réservations confirmées.</EmptyState></div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {eligible.map((r) => {
              const phase = phaseOf(r);
              return (
                <button key={r.id} type="button" onClick={() => select(r.id)} className="glass group cursor-pointer rounded-3xl p-5 text-left transition hover:border-primary/60">
                  <div className="flex items-center gap-4">
                    <img src={r.clientAvatar} alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-white/20 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-medium">{r.clientName}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.category} — {formatDay(r.datetime)}</div>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${phase.className}`}>{phase.label}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm text-primary">
                    {r.delivery ? "Voir les livrables" : "Uploader les livrables"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Étape 2 : upload / suivi ---------- */
  const delivery = selected.delivery;
  const files = delivery ? delivery.files : staged;

  return (
    <div>
      <button type="button" onClick={() => select(null)} className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Changer de client
      </button>

      <div className="mt-5 flex items-center gap-4">
        <img src={selected.clientAvatar} alt="" className="h-14 w-14 shrink-0 rounded-full border-2 border-white/20 object-cover" />
        <div className="min-w-0">
          <div className="text-lg font-medium">{selected.clientName}</div>
          <div className="text-xs text-muted-foreground">{selected.category} — {formatDateTimeLocal(selected.datetime)}</div>
        </div>
      </div>

      {delivery && (
        <p className={`mt-5 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${delivery.validatedAt ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-primary/30 bg-primary/10 text-primary"}`}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {delivery.validatedAt
            ? `Prestation validée par ${selected.clientName}. Le paiement est disponible dans tes revenus.`
            : `Livrables envoyés. ${selected.clientName} a ${AUTO_VALIDATION_DAYS} jours pour valider (${daysLeftBeforeAutoValidation(delivery.sentAt)} restant${daysLeftBeforeAutoValidation(delivery.sentAt) > 1 ? "s" : ""}) — validation automatique ensuite.`}
        </p>
      )}

      <section className={`${panelClass} mt-5`}>
        {!delivery && (
          <>
            <input ref={input} type="file" multiple tabIndex={-1} className="sr-only" onChange={(e) => { void stage(e.target.files); e.target.value = ""; }} />
            <div
              role="button"
              tabIndex={0}
              onClick={() => input.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click(); } }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); void stage(e.dataTransfer.files); }}
              className="cursor-pointer flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-center text-sm text-muted-foreground backdrop-blur transition hover:border-white/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Upload className="h-5 w-5 text-primary" />
              {busy ? "Préparation des fichiers…" : "Glisser-déposer ou cliquer pour ajouter les livrables"}
            </div>
          </>
        )}

        {files.length > 0 && (
          <ul className={`${delivery ? "" : "mt-4"} grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4`}>
            {files.map((f) => (
              <li key={f.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                {f.src ? (
                  <img src={f.src} alt={f.name} className="aspect-[3/4] w-full object-cover" />
                ) : (
                  <div className="grid aspect-[3/4] place-items-center"><FileText className="h-8 w-8 text-primary" /></div>
                )}
                <div className="border-t border-white/10 px-3 py-2">
                  <div className="truncate text-xs font-medium">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground">{f.size}</div>
                </div>
                {!delivery && (
                  <button type="button" onClick={() => setStaged((prev) => prev.filter((x) => x.id !== f.id))} aria-label={`Retirer ${f.name}`} className="cursor-pointer absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 transition hover:bg-primary hover:text-primary-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!delivery && files.length === 0 && <p className="mt-4 text-xs text-muted-foreground">Photos retouchées, vidéos, documents : tout ce que {selected.clientName} doit recevoir.</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!delivery && (
            <button type="button" onClick={send} disabled={staged.length === 0 || busy} className={bigPrimaryBtn}>
              <Send className="h-4 w-4" /> Envoyer les livrables{staged.length ? ` (${staged.length})` : ""}
            </button>
          )}
          {delivery && !delivery.validatedAt && (
            <button type="button" onClick={simulateValidation} className={ghostBtn}>Simuler la validation du client (démo)</button>
          )}
          {delivery?.validatedAt && <span className="text-xs text-muted-foreground">Validée le {formatDay(delivery.validatedAt)}</span>}
        </div>
      </section>
    </div>
  );
}
