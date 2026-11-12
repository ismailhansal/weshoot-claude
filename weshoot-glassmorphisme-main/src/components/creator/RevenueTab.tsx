import { FileText, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Modal, SectionLabel, bigGhostBtn, bigPrimaryBtn, fieldClass, ghostBtn, labelClass, panelClass } from "@/components/creator/ui";
import { formatDay, money, type CreatorSpace } from "@/lib/creator-space";
import { formatBytes } from "@/lib/media";

export function RevenueTab({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const received = state.payments.filter((p) => p.status === "received");
  const escrow = state.payments.filter((p) => p.status === "escrow");
  const totalReceived = received.reduce((sum, p) => sum + p.amount, 0);
  const totalEscrow = escrow.reduce((sum, p) => sum + p.amount, 0);
  const average = received.length ? Math.round(totalReceived / received.length) : 0;

  // 6 derniers mois (revenus reçus)
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const total = received.filter((p) => p.date.startsWith(key)).reduce((sum, p) => sum + p.amount, 0);
      return { key, label: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""), total };
    });
  }, [received]);
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const thisMonth = months[months.length - 1].total;

  const history = [...state.payments].sort((a, b) => b.date.localeCompare(a.date));

  const [ibanOpen, setIbanOpen] = useState(false);
  const [iban, setIban] = useState("");
  const ibanClean = iban.replace(/\s+/g, "").toUpperCase();
  const ibanValid = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(ibanClean);
  const ribInput = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <section className={panelClass}>
          <SectionLabel>Reçu total</SectionLabel>
          <div className="text-display mt-3 text-4xl text-primary">{money(totalReceived)} <span className="text-sm font-medium text-muted-foreground">MAD</span></div>
        </section>
        <section className={panelClass}>
          <SectionLabel>En séquestre</SectionLabel>
          <div className="text-display mt-3 text-4xl">{money(totalEscrow)} <span className="text-sm font-medium text-muted-foreground">MAD</span></div>
          <p className="mt-2 text-xs text-muted-foreground">Libéré à la validation de la prestation par le client.</p>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Ce mois-ci", `${money(thisMonth)} MAD`],
          ["Prestations payées", String(received.length)],
          ["Panier moyen", `${money(average)} MAD`],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className="text-display mt-2 text-2xl">{value}</div>
          </div>
        ))}
      </div>

      <section className={panelClass}>
        <SectionLabel>Revenus des 6 derniers mois</SectionLabel>
        <div className="mt-6 flex h-44 items-end gap-3" role="img" aria-label="Revenus mensuels reçus">
          {months.map((m) => (
            <div key={m.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="text-[11px] tabular-nums text-muted-foreground">{m.total > 0 ? money(m.total) : ""}</div>
              <div
                className={`w-full max-w-14 rounded-t-lg ${m.total > 0 ? "bg-gradient-to-t from-primary/60 to-primary" : "bg-white/10"}`}
                style={{ height: `${Math.max(4, (m.total / maxMonth) * 100)}%` }}
              />
              <div className="text-xs capitalize text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <SectionLabel>Historique</SectionLabel>
        <ul className="mt-3 divide-y divide-white/10">
          {history.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="w-28 shrink-0 text-muted-foreground">{formatDay(p.date)}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{p.clientName}</span>
              <span className={`hidden shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest sm:inline ${p.status === "received" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300"}`}>
                {p.status === "received" ? "Reçu" : "Séquestre"}
              </span>
              <span className="text-display shrink-0 text-lg text-primary">{money(p.amount)} MAD</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={panelClass}>
        <SectionLabel>Informations financières — RIB</SectionLabel>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">IBAN enregistré</div>
            <div className="mt-1 font-mono text-sm">•••• •••• •••• {state.finance.ibanLast4 || "----"}</div>
          </div>
          <button type="button" onClick={() => { setIban(""); setIbanOpen(true); }} className={ghostBtn}>Modifier</button>
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <span className={labelClass}>Document RIB (PDF ou image)</span>
          <input
            ref={ribInput}
            type="file"
            accept="application/pdf,image/*"
            tabIndex={-1}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) update((s) => ({ ...s, finance: { ...s.finance, ribFile: { name: f.name, size: formatBytes(f.size) } } }));
              e.target.value = "";
            }}
          />
          {state.finance.ribFile ? (
            <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm">{state.finance.ribFile.name}</span>
              <span className="text-xs text-muted-foreground">{state.finance.ribFile.size}</span>
              <button type="button" aria-label="Retirer le RIB" onClick={() => update((s) => ({ ...s, finance: { ...s.finance, ribFile: null } }))} className="cursor-pointer grid h-7 w-7 place-items-center rounded-full hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => ribInput.current?.click()} className={`${bigGhostBtn} w-full gap-2 border-dashed`}>
              <Upload className="h-4 w-4" /> Téléverser un fichier
            </button>
          )}
        </div>
      </section>

      <Modal open={ibanOpen} onOpenChange={setIbanOpen} title="Modifier l'IBAN" description="Par sécurité, seuls les 4 derniers chiffres restent affichés après enregistrement.">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ibanValid) return;
            update((s) => ({ ...s, finance: { ...s.finance, ibanLast4: ibanClean.slice(-4) } }));
            setIbanOpen(false);
          }}
        >
          <div>
            <label htmlFor="iban" className={labelClass}>IBAN</label>
            <input id="iban" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="MA64 0111 5000 0000 0000 0000 4521" autoComplete="off" className={`${fieldClass} font-mono`} />
            {iban.length > 0 && !ibanValid && <p className="mt-2 text-xs text-destructive">IBAN invalide.</p>}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={!ibanValid} className={`${bigPrimaryBtn} flex-[1.4]`}>Enregistrer</button>
            <button type="button" onClick={() => setIbanOpen(false)} className={`${bigGhostBtn} flex-1`}>Annuler</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
