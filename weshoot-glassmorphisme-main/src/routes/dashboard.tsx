import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { BriefDialog, QuoteDialog } from "@/components/ClientOrderDialogs";
import { DeliverablesTab } from "@/components/DeliverablesTab";
import { ReviewsTab } from "@/components/ReviewsTab";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDate, statusMeta, useClientSpace, type ClientOrder } from "@/lib/client-space";
import { getCreator } from "@/lib/creators";
import { useDemoSession } from "@/lib/demo-auth";

type Tab = "reservations" | "livrables" | "avis";
const tabs: { id: Tab; label: string }[] = [
  { id: "reservations", label: "Réservations" },
  { id: "livrables", label: "Livrables" },
  { id: "avis", label: "Avis" },
];

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab; order?: string } => ({
    ...(search.tab === "reservations" || search.tab === "livrables" || search.tab === "avis" ? { tab: search.tab } : {}),
    ...(typeof search.order === "string" ? { order: search.order } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Mon dashboard · WeShoot" },
      { name: "description", content: "Espace client WeShoot : réservations, devis, livrables et avis." },
      { property: "og:title", content: "Mon dashboard · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

const ghostBtn =
  "glass cursor-pointer inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground transition hover:border-primary/60 hover:text-foreground";
const primaryBtn =
  "cursor-pointer inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90";

function Dashboard() {
  const { tab = "reservations", order: selectedOrder } = Route.useSearch();
  const navigate = useNavigate();
  const session = useDemoSession();
  const space = useClientSpace();

  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [briefId, setBriefId] = useState<string | null>(null);

  const quoteOrder = space.orders.find((o) => o.id === quoteId) ?? null;
  const briefOrder = space.orders.find((o) => o.id === briefId) ?? null;

  function go(nextTab: Tab, order?: string) {
    navigate({ to: "/dashboard", search: { tab: nextTab, ...(order ? { order } : {}) } });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        {!session.ready || !space.ready ? null : !session.isAuthenticated ? (
          <div className="glass mt-8 rounded-3xl p-12 text-center">
            <div className="text-display text-2xl">Connecte-toi pour accéder à ton dashboard</div>
            <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Espace client</div>
            <h1 className="text-display mt-2 text-4xl md:text-5xl">Mon dashboard</h1>

            <div role="tablist" className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    {t.label}
                    {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              {tab === "reservations" && (
                <ReservationsList
                  orders={space.orders}
                  onQuote={setQuoteId}
                  onBrief={setBriefId}
                  onValidate={(id) => go("livrables", id)}
                  onDeliverables={(id) => go("livrables", id)}
                />
              )}
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
          if (quoteOrder) space.acceptQuote(quoteOrder.id);
          setQuoteId(null);
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

function ReservationsList({
  orders,
  onQuote,
  onBrief,
  onValidate,
  onDeliverables,
}: {
  orders: ClientOrder[];
  onQuote: (id: string) => void;
  onBrief: (id: string) => void;
  onValidate: (id: string) => void;
  onDeliverables: (id: string) => void;
}) {
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

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const creator = getCreator(o.creatorId);
        const meta = statusMeta[o.status];
        const hasDeliverables = !!o.deliverables && (o.status === "validated" || o.status === "disputed");
        return (
          <article key={o.id} className={`glass rounded-3xl p-5 md:p-6 ${o.status === "delivered" ? "border-primary/40" : ""}`}>
            <div className="flex items-start gap-4">
              <img src={creator?.avatar} alt={creator?.name} className="h-14 w-14 shrink-0 rounded-full border-2 border-primary object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-medium">{creator?.name ?? "Prestataire"}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {o.kind === "devis" ? "Devis" : "Réservation"} • {o.category} • {formatDate(o.date)}
                </div>
              </div>
              <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${meta.className}`}>
                {meta.label}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-display text-2xl text-primary">{o.price > 0 ? `${o.price} MAD` : "Sur devis"}</div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => onBrief(o.id)} className={ghostBtn}>
                  Voir brief
                </button>
                {o.status === "quote" && (
                  <button type="button" onClick={() => onQuote(o.id)} className={primaryBtn}>
                    Voir devis
                  </button>
                )}
                {o.status === "delivered" && (
                  <button type="button" onClick={() => onValidate(o.id)} className={primaryBtn}>
                    Valider la prestation
                  </button>
                )}
                {hasDeliverables && (
                  <button type="button" onClick={() => onDeliverables(o.id)} className={ghostBtn}>
                    Livrables
                  </button>
                )}
                <Link to="/messages" search={{ order: o.id }} className={ghostBtn}>
                  Message
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}