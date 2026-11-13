import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, Images, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

import { BriefDialog, QuoteDialog } from "@/components/ClientOrderDialogs";
import { DeliverablesTab } from "@/components/DeliverablesTab";
import { MessagesPanel } from "@/components/MessagesPanel";
import { ReviewsTab } from "@/components/ReviewsTab";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDate, statusMeta, useClientSpace, type ClientOrder } from "@/lib/client-space";
import { getCreator } from "@/lib/creators";
import { useDemoSession } from "@/lib/demo-auth";

type Tab = "reservations" | "messages" | "livrables" | "avis";
const tabs: { id: Tab; label: string }[] = [
  { id: "reservations", label: "Réservations" },
  { id: "messages", label: "Messages" },
  { id: "livrables", label: "Livrables" },
  { id: "avis", label: "Avis" },
];
const tabIds: string[] = tabs.map((t) => t.id);

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab; order?: string } => ({
    ...(typeof search.tab === "string" && tabIds.includes(search.tab) ? { tab: search.tab as Tab } : {}),
    ...(typeof search.order === "string" ? { order: search.order } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Mon dashboard · WeShoot" },
      { name: "description", content: "Espace client WeShoot : réservations, messages, livrables et avis au même endroit." },
      { property: "og:title", content: "Mon dashboard · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

const glassBtn =
  "glass cursor-pointer inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-medium text-foreground transition hover:border-primary/60 hover:bg-white/10 active:scale-95";
const primaryBtn =
  "cursor-pointer inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90";

function Dashboard() {
  const { tab = "reservations", order: selectedOrder } = Route.useSearch();
  const navigate = useNavigate();
  const session = useDemoSession();
  const space = useClientSpace();

  // Un prestataire connecté n'a pas d'espace client : on l'envoie vers son dashboard.
  useEffect(() => {
    if (session.ready && session.isAuthenticated && session.role === "creator") navigate({ to: "/creator-dashboard", replace: true });
  }, [session.ready, session.isAuthenticated, session.role, navigate]);

  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [briefId, setBriefId] = useState<string | null>(null);

  const quoteOrder = space.orders.find((o) => o.id === quoteId) ?? null;
  const briefOrder = space.orders.find((o) => o.id === briefId) ?? null;

  function go(nextTab: Tab, order?: string, replace = false) {
    navigate({ to: "/dashboard", search: { tab: nextTab, ...(order ? { order } : {}) }, replace });
  }

  const badges: Partial<Record<Tab, number>> = { reservations: space.actionCount, messages: space.unreadCount };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-10 pt-5 md:px-6 md:pb-24 md:pt-10">
        {!session.ready || !space.ready ? null : !session.isAuthenticated ? (
          <div className="glass mt-8 rounded-3xl p-12 text-center">
            <div className="text-display text-2xl">Connecte-toi pour accéder à ton dashboard</div>
            <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Connexion
            </Link>
          </div>
        ) : (
          <>
            <div className={tab === "messages" ? "hidden md:block" : ""}>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Espace client</div>
              <h1 className="text-display mt-2 text-4xl md:text-5xl">Mon dashboard</h1>
            </div>

            <div role="tablist" className="mt-4 flex gap-1 md:mt-8 overflow-x-auto border-b border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => go(t.id)}
                    className={`relative cursor-pointer whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {t.label}
                      {!!badges[t.id] && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{badges[t.id]}</span>
                      )}
                    </span>
                    {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 md:mt-8">
              {tab === "reservations" && (
                <ReservationsList
                  orders={space.orders}
                  onQuote={setQuoteId}
                  onBrief={setBriefId}
                  onPay={(id) => navigate({ to: "/pay/$orderId", params: { orderId: id } })}
                  onMessage={(id) => go("messages", id)}
                  onDeliverables={(id) => go("livrables", id)}
                  onReview={() => go("avis")}
                />
              )}
              {tab === "messages" && <MessagesPanel space={space} orderId={selectedOrder} onSelect={(id) => go("messages", id, true)} />}
              {tab === "livrables" && (
                <DeliverablesTab
                  orders={space.orders}
                  selectedId={selectedOrder}
                  onSelect={(id) => go("livrables", id)}
                  onValidate={space.validateDelivery}
                  onContest={space.contestDelivery}
                />
              )}
              {tab === "avis" && <ReviewsTab orders={space.orders} onReview={space.addReview} />}
            </div>
          </>
        )}
      </main>

      <QuoteDialog
        order={quoteOrder}
        creatorName={getCreator(quoteOrder?.creatorId ?? "")?.name ?? "Prestataire"}
        open={!!quoteOrder}
        onOpenChange={(o) => !o && setQuoteId(null)}
        onAccept={() => {
          if (!quoteOrder) return;
          const id = quoteOrder.id;
          space.acceptQuote(id);
          setQuoteId(null);
          // Le devis accepté se règle tout de suite sur la page de paiement.
          navigate({ to: "/pay/$orderId", params: { orderId: id } });
        }}
        onRefuse={() => {
          if (quoteOrder) space.refuseQuote(quoteOrder.id);
          setQuoteId(null);
        }}
      />
      <BriefDialog
        order={briefOrder}
        creatorName={getCreator(briefOrder?.creatorId ?? "")?.name ?? "Prestataire"}
        open={!!briefOrder}
        onOpenChange={(o) => !o && setBriefId(null)}
      />

      <SiteFooter />
    </div>
  );
}

/** Ce que le client doit comprendre en un coup d'œil : où en est la commande, et quoi faire ensuite. */
function nextStep(o: ClientOrder, creatorName: string): { hint: string; action?: "quote" | "pay" | "validate" | "review" } {
  switch (o.status) {
    case "quote":
      return { hint: `${creatorName} vous a envoyé son devis.`, action: "quote" };
    case "payment":
      return { hint: "Devis accepté : il ne reste qu'à payer pour confirmer.", action: "pay" };
    case "delivered":
      return { hint: "Vos livrables sont prêts. Vérifiez-les et validez.", action: "validate" };
    case "pending":
      return { hint: `En attente de la réponse de ${creatorName}.` };
    case "confirmed":
      return { hint: o.payment?.status === "verifying" ? "Virement en cours de vérification (24 à 48 h)." : "Confirmée. Le prestataire sera payé après validation des livrables." };
    case "validated":
      return o.review ? { hint: "Prestation terminée. Merci pour votre avis !" } : { hint: "Prestation terminée.", action: "review" };
    case "disputed":
      return { hint: "Contestation en cours d'examen par WeShoot." };
    case "cancelled":
      return { hint: "Cette demande a été annulée." };
  }
}

const todoStatuses = ["quote", "payment", "delivered"];
const doneStatuses = ["validated", "disputed", "cancelled"];

function ReservationsList({
  orders,
  onQuote,
  onBrief,
  onPay,
  onMessage,
  onDeliverables,
  onReview,
}: {
  orders: ClientOrder[];
  onQuote: (id: string) => void;
  onBrief: (id: string) => void;
  onPay: (id: string) => void;
  onMessage: (id: string) => void;
  onDeliverables: (id: string) => void;
  onReview: () => void;
}) {
  const [showHistory, setShowHistory] = useState(false);

  if (orders.length === 0) {
    return (
      <div className="glass rounded-3xl p-10 text-center">
        <p className="text-sm text-muted-foreground">Aucune réservation pour le moment.</p>
        <Link to="/explore" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          Découvrir les créateurs
        </Link>
      </div>
    );
  }

  const todo = orders.filter((o) => todoStatuses.includes(o.status));
  const ongoing = orders.filter((o) => !todoStatuses.includes(o.status) && !doneStatuses.includes(o.status));
  const done = orders.filter((o) => doneStatuses.includes(o.status));

  function card(o: ClientOrder, highlight = false) {
    const creator = getCreator(o.creatorId);
    const creatorName = creator?.name ?? "Prestataire";
    const meta = statusMeta[o.status];
    const step = nextStep(o, creatorName);
    const canSeeDeliverables = !!o.deliverables && (o.status === "validated" || o.status === "disputed");
    const actionLabel = { quote: "Voir le devis", pay: "Payer", validate: "Voir et valider", review: "Laisser un avis" };
    const run = {
      quote: () => onQuote(o.id),
      pay: () => onPay(o.id),
      validate: () => onDeliverables(o.id),
      review: () => onReview(),
    };

    return (
      <article key={o.id} className={`glass rounded-3xl p-5 ${highlight ? "border-primary/40" : ""}`}>
        <div className="flex items-center gap-4">
          <img src={creator?.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-primary object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-base font-medium">{creatorName}</div>
              <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${meta.className}`}>{meta.label}</span>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {o.category} · {formatDate(o.date)}
              {o.price > 0 ? ` · ${o.price} MAD` : ""}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-foreground/90">{step.hint}</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onBrief(o.id)} className={glassBtn}>
              <FileText className="h-3.5 w-3.5 text-primary" /> Brief
            </button>
            <button type="button" onClick={() => onMessage(o.id)} className={glassBtn}>
              <MessageSquare className="h-3.5 w-3.5 text-primary" /> Message
            </button>
            {canSeeDeliverables && step.action !== "review" && (
              <button type="button" onClick={() => onDeliverables(o.id)} className={glassBtn}>
                <Images className="h-3.5 w-3.5 text-primary" /> Livrables
              </button>
            )}
          </div>
          {step.action && (
            <button type="button" onClick={run[step.action]} className={primaryBtn}>
              {actionLabel[step.action]}
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-8">
      {todo.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">À faire · {todo.length}</h2>
          <div className="space-y-3">{todo.map((o) => card(o, true))}</div>
        </section>
      )}

      {ongoing.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">En cours</h2>
          <div className="space-y-3">{ongoing.map((o) => card(o))}</div>
        </section>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            className="cursor-pointer text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground"
          >
            Historique · {done.length} {showHistory ? "−" : "+"}
          </button>
          {showHistory && <div className="space-y-3">{done.map((o) => card(o))}</div>}
        </section>
      )}
    </div>
  );
}
