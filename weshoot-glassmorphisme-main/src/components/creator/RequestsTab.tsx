import { FileText, Paperclip, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  ConfirmDialog,
  EmptyState,
  Modal,
  areaClass,
  bigGhostBtn,
  bigPrimaryBtn,
  fieldClass,
  ghostBtn,
  labelClass,
  primaryBtn,
  requestStatusMeta,
} from "@/components/creator/ui";
import { formatBytes, newId } from "@/lib/media";
import { formatClock, formatDateTimeLocal, isoDay, money, type CreatorRequest, type CreatorSpace } from "@/lib/creator-space";

export function RequestsTab({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const [detailId, setDetailId] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [refuseId, setRefuseId] = useState<string | null>(null);

  const byId = (id: string | null) => state.requests.find((r) => r.id === id) ?? null;

  function setStatus(id: string, patch: Partial<CreatorRequest>) {
    update((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }

  function accept(r: CreatorRequest) {
    update((s) => ({
      ...s,
      requests: s.requests.map((x) => (x.id === r.id ? { ...x, status: "confirmed" } : x)),
      // Le montant est mis en séquestre jusqu'à la validation de la prestation par le client
      payments: [
        { id: newId("pay"), date: isoDay(0), clientName: r.clientName, amount: r.price, status: "escrow", requestId: r.id },
        ...s.payments,
      ],
    }));
  }

  if (state.requests.length === 0) {
    return <EmptyState>Aucune demande pour le moment. Elles apparaîtront ici dès qu'un client te contactera.</EmptyState>;
  }

  return (
    <>
      <div className="space-y-4">
        {state.requests.map((r) => {
          const meta = requestStatusMeta[r.status];
          return (
            <article key={r.id} className="glass rounded-3xl p-5 md:p-6">
              <div className="flex items-start gap-4">
                <img src={r.clientAvatar} alt="" className="h-14 w-14 shrink-0 rounded-full border-2 border-white/20 object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-medium">{r.clientName}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.kind === "devis" ? "Devis" : "Réservation"} • {r.category} • {formatDateTimeLocal(r.datetime)} • {r.city}
                  </div>
                  {r.price > 0 && <div className="text-display mt-2 text-2xl text-primary">{money(r.price)} MAD</div>}
                  {r.offerName && <div className="mt-1 text-xs text-muted-foreground">Offre : {r.offerName}</div>}
                </div>
                <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${meta.className}`}>{meta.label}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button type="button" onClick={() => setDetailId(r.id)} className={ghostBtn}>Voir le détail</button>
                {r.status === "pending" && (
                  <>
                    <button type="button" onClick={() => accept(r)} className={primaryBtn}>Accepter</button>
                    <button type="button" onClick={() => setRefuseId(r.id)} className={ghostBtn}>Refuser</button>
                  </>
                )}
                {r.status === "quote_to_send" && (
                  <button type="button" onClick={() => setQuoteId(r.id)} className={primaryBtn}>Envoyer un devis</button>
                )}
                <button type="button" onClick={() => setMessageId(r.id)} className={ghostBtn}>Message</button>
              </div>
            </article>
          );
        })}
      </div>

      <DetailDialog request={byId(detailId)} onClose={() => setDetailId(null)} />
      <QuoteDialog
        request={byId(quoteId)}
        onClose={() => setQuoteId(null)}
        onSend={(id, quote) => {
          setStatus(id, { status: "quote_sent", price: quote.amount, quote });
          setQuoteId(null);
        }}
      />
      <MessageDialog space={space} request={byId(messageId)} onClose={() => setMessageId(null)} />
      <ConfirmDialog
        open={!!refuseId}
        onOpenChange={(o) => !o && setRefuseId(null)}
        title="Refuser cette demande ?"
        text="Le client sera prévenu que tu n'es pas disponible pour cette prestation."
        confirmLabel="Refuser"
        onConfirm={() => refuseId && setStatus(refuseId, { status: "declined" })}
      />
    </>
  );
}

/* ---------- Détail ---------- */
function DetailDialog({ request, onClose }: { request: CreatorRequest | null; onClose: () => void }) {
  const rows = request
    ? [
        ["Client", request.clientName],
        ["Type", request.kind === "devis" ? "Demande de devis" : "Réservation"],
        ["Catégorie", request.category],
        ["Date", formatDateTimeLocal(request.datetime)],
        ["Lieu", request.city],
        ["Offre", request.offerName ?? "Sur mesure"],
        ["Montant", request.price > 0 ? `${money(request.price)} MAD` : "À définir"],
      ]
    : [];
  return (
    <Modal open={!!request} onOpenChange={(o) => !o && onClose()} title="Détail de la demande" description={request ? `Demande de ${request.clientName}` : undefined}>
      {request && (
        <div className="space-y-6">
          <dl>
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 py-3">
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <div className={labelClass}>Brief du client</div>
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-muted-foreground">{request.brief.message}</p>
          </div>
          {request.brief.docs.length > 0 && (
            <div className="space-y-2">
              <div className={labelClass}>Documents</div>
              {request.brief.docs.map((d) => (
                <div key={d.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <FileText className="h-5 w-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm">{d.name}</span>
                  <span className="text-xs text-muted-foreground">{d.size}</span>
                </div>
              ))}
            </div>
          )}
          {request.quote && (
            <div>
              <div className={labelClass}>Devis envoyé</div>
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-muted-foreground">
                {money(request.quote.amount)} MAD — {request.quote.message || "Sans message."}
                {request.quote.fileName && <span className="mt-2 block text-xs">Pièce jointe : {request.quote.fileName}</span>}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ---------- Devis ---------- */
function QuoteDialog({
  request,
  onClose,
  onSend,
}: {
  request: CreatorRequest | null;
  onClose: () => void;
  onSend: (id: string, quote: { amount: number; message: string; fileName?: string }) => void;
}) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (request) {
      setAmount("");
      setMessage("");
      setFile(null);
    }
  }, [request?.id]);

  return (
    <Modal open={!!request} onOpenChange={(o) => !o && onClose()} title="Envoyer un devis" description={request ? `Pour ${request.clientName} — ${request.category}` : undefined}>
      {request && (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(amount) > 0) onSend(request.id, { amount: Number(amount), message: message.trim(), fileName: file?.name });
          }}
        >
          <div>
            <label htmlFor="quote-amount" className={labelClass}>Montant (MAD)</label>
            <input id="quote-amount" type="number" min="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex. 3000" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="quote-message" className={labelClass}>Message pour le client</label>
            <textarea id="quote-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ce que comprend ton tarif : prise de vue, post-production, livraison…" className={areaClass} />
          </div>
          <div>
            <span className={labelClass}>Document du devis (PDF)</span>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              tabIndex={-1}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile({ name: f.name, size: formatBytes(f.size) });
                e.target.value = "";
              }}
            />
            {file ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <button type="button" aria-label="Retirer le document" onClick={() => setFile(null)} className="cursor-pointer grid h-7 w-7 place-items-center rounded-full hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className={`${bigGhostBtn} w-full gap-2`}>
                <Paperclip className="h-4 w-4" /> Joindre un PDF
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={!(Number(amount) > 0)} className={`${bigPrimaryBtn} flex-[1.4]`}>Envoyer le devis</button>
            <button type="button" onClick={onClose} className={`${bigGhostBtn} flex-1`}>Annuler</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ---------- Messages ---------- */
function MessageDialog({ space, request, onClose }: { space: CreatorSpace; request: CreatorRequest | null; onClose: () => void }) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const thread = request ? space.state.messages[request.id] ?? [] : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length, request?.id]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!request || !text.trim()) return;
    const msg = { id: newId("rm"), from: "creator" as const, text: text.trim(), at: new Date().toISOString() };
    space.update((s) => ({ ...s, messages: { ...s.messages, [request.id]: [...(s.messages[request.id] ?? []), msg] } }));
    setText("");
  }

  return (
    <Modal open={!!request} onOpenChange={(o) => !o && onClose()} title={request ? `Message à ${request.clientName}` : "Message"} description={request ? `${request.category} — ${formatDateTimeLocal(request.datetime)}` : undefined}>
      {request && (
        <div className="space-y-4">
          <div className="max-h-72 min-h-32 space-y-2.5 overflow-y-auto pr-1">
            {thread.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Aucun message pour le moment.</p>}
            {thread.map((m) => (
              <div key={m.id} className={`flex ${m.from === "creator" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${m.from === "creator" ? "bg-primary text-primary-foreground" : "border border-white/10 bg-white/[0.06]"}`}>
                  <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>
                  <div className={`mt-1 text-[11px] ${m.from === "creator" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatClock(m.at)}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="flex gap-3">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écris ton message…" aria-label="Message" className={`${fieldClass} min-w-0 flex-1`} />
            <button type="submit" disabled={!text.trim()} className={bigPrimaryBtn}>Envoyer</button>
          </form>
        </div>
      )}
    </Modal>
  );
}
