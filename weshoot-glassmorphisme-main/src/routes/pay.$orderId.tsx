import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Banknote, CalendarDays, CheckCircle2, CreditCard, FileText, Lock, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { formatDate, TEST_ORDER_STATUS, useClientSpace, type PaymentMethod } from "@/lib/client-space";
import { getCreator } from "@/lib/creators";
import { useDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/pay/$orderId")({
  head: () => ({
    meta: [
      { title: "Paiement · WeShoot" },
      { name: "description", content: "Réglez votre prestation en toute sécurité : le prestataire n'est payé qu'à la validation des livrables." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PayPage,
});

/** Coordonnées bancaires de démonstration : à remplacer par celles du compte WeShoot. */
const BANK = { holder: "WeShoot", bank: "Banque partenaire", rib: "000 000 0000000000000000 00" };

const methods: { id: PaymentMethod; label: string; hint: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Carte bancaire", hint: "Visa, Mastercard · immédiat", icon: CreditCard },
  { id: "paypal", label: "PayPal", hint: "Immédiat", icon: Lock },
  { id: "virement", label: "Virement à WeShoot", hint: "Vérifié sous 24 à 48 h", icon: Banknote },
];

const fieldClass =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition [color-scheme:light] placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/25";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" aria-label="Accueil WeShoot">
            <Logo tone="light" className="text-2xl" />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Lock className="h-3.5 w-3.5" /> Paiement sécurisé
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-8">{children}</main>
    </div>
  );
}

function Notice({ title, action }: { title: string; action: ReactNode }) {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="text-xl font-semibold">{title}</div>
      <div className="mt-6">{action}</div>
    </div>
  );
}

const btnPrimary =
  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

function PayPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const session = useDemoSession();
  const space = useClientSpace();

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });

  const order = space.orders.find((o) => o.id === orderId);
  const creator = order ? getCreator(order.creatorId) : undefined;
  const backToDashboard = () => navigate({ to: "/dashboard", search: { tab: "reservations" } });
  const dashboardLink = (
    <Link to="/dashboard" search={{ tab: "reservations" }} className={btnPrimary}>
      Retour au dashboard
    </Link>
  );

  if (!session.ready || !space.ready) return <Shell>{null}</Shell>;
  if (!session.isAuthenticated)
    return (
      <Shell>
        <Notice
          title="Connecte-toi pour régler ta prestation"
          action={
            <Link to="/login" className={btnPrimary}>
              Connexion
            </Link>
          }
        />
      </Shell>
    );
  if (!order) return <Shell><Notice title="Commande introuvable" action={dashboardLink} /></Shell>;

  // Paiement effectué : écran de confirmation
  if (order.payment) {
    const verifying = order.payment.status === "verifying";
    return (
      <Shell>
        <div className="mx-auto mt-6 max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-5 text-2xl font-semibold">{verifying ? "Virement enregistré" : "Paiement confirmé"}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {verifying
              ? `Nous vérifions la réception de votre virement de ${order.price} MAD (24 à 48 h). Votre réservation avec ${creator?.name ?? "le prestataire"} est déjà enregistrée.`
              : `Votre réservation avec ${creator?.name ?? "le prestataire"} est confirmée.`}
          </p>
          <p className="mt-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
            Le prestataire sera payé uniquement lorsque vous validerez les livrables.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {dashboardLink}
            <Link
              to="/dashboard"
              search={{ tab: "messages", order: order.id }}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-semibold transition hover:bg-slate-50"
            >
              Écrire au prestataire
            </Link>
          </div>
          {order.id in TEST_ORDER_STATUS && (
            <button
              type="button"
              onClick={() => {
                space.resetTestOrder(order.id);
                if (TEST_ORDER_STATUS[order.id] === "quote") backToDashboard();
              }}
              className="mt-5 cursor-pointer text-xs text-slate-500 underline underline-offset-4 transition hover:text-slate-900"
            >
              Commande de test : rejouer le paiement
            </button>
          )}
        </div>
      </Shell>
    );
  }

  if (order.status !== "payment") return <Shell><Notice title="Aucun paiement en attente pour cette commande" action={dashboardLink} /></Shell>;

  const cardReady = card.number.replace(/\s/g, "").length >= 12 && card.name.trim() && card.expiry.length >= 4 && card.cvc.length >= 3;
  const canPay = method !== "card" || !!cardReady;
  const cta = method === "virement" ? "J'ai effectué le virement" : method === "paypal" ? `Payer ${order.price} MAD avec PayPal` : `Payer ${order.price} MAD`;

  return (
    <Shell>
      <button type="button" onClick={backToDashboard} className="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Retour au dashboard
      </button>
      <h1 className="text-3xl font-semibold tracking-tight">Finalisez votre réservation</h1>
      <p className="mt-2 text-sm text-slate-600">Devis accepté. Réglez la prestation pour la confirmer.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Moyens de paiement */}
        <section className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              <strong>Votre paiement est protégé.</strong> Le prestataire n&apos;est payé qu&apos;à la validation de vos livrables.
            </p>
          </div>

          <div role="radiogroup" aria-label="Moyen de paiement" className="space-y-3">
            {methods.map((m) => {
              const active = method === m.id;
              const Icon = m.icon;
              return (
                <div key={m.id} className={`rounded-2xl border bg-white transition ${active ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300"}`}>
                  <button type="button" role="radio" aria-checked={active} onClick={() => setMethod(m.id)} className="flex w-full cursor-pointer items-center gap-4 p-4 text-left">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? "border-primary" : "border-slate-300"}`}>
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    <Icon className="h-5 w-5 shrink-0 text-slate-700" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{m.label}</span>
                      <span className="block text-xs text-slate-500">{m.hint}</span>
                    </span>
                  </button>

                  {active && m.id === "card" && (
                    <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelClass} htmlFor="card-number">Numéro de carte</label>
                        <input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" maxLength={23} value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, "") })} className={fieldClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass} htmlFor="card-name">Nom sur la carte</label>
                        <input id="card-name" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className={fieldClass} />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="card-exp">Expiration</label>
                        <input id="card-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value.replace(/[^\d/]/g, "") })} className={fieldClass} />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="card-cvc">CVC</label>
                        <input id="card-cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "") })} className={fieldClass} />
                      </div>
                      <p className="text-xs text-slate-500 sm:col-span-2">Démo : aucune donnée de carte n&apos;est enregistrée ni débitée.</p>
                    </div>
                  )}

                  {active && m.id === "paypal" && (
                    <p className="border-t border-slate-100 p-4 text-sm text-slate-600">Vous serez redirigé vers PayPal pour confirmer le paiement, puis ramené ici.</p>
                  )}

                  {active && m.id === "virement" && (
                    <div className="space-y-3 border-t border-slate-100 p-4 text-sm">
                      <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50">
                        {[
                          ["Bénéficiaire", BANK.holder],
                          ["Banque", BANK.bank],
                          ["RIB", BANK.rib],
                          ["Montant", `${order.price} MAD`],
                          ["Référence à indiquer", order.id],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                            <dt className="text-xs text-slate-500">{k}</dt>
                            <dd className="break-all text-right font-medium">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="text-xs text-slate-500">Indiquez bien la référence dans le libellé du virement, puis cliquez sur « J&apos;ai effectué le virement ».</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button type="button" disabled={!canPay} onClick={() => space.payOrder(order.id, method)} className={`${btnPrimary} h-14 w-full text-base`}>
            <Lock className="h-4 w-4" /> {cta}
          </button>
        </section>

        {/* Récapitulatif */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Votre prestation</div>
          <div className="mt-4 flex items-center gap-3">
            <img src={creator?.avatar} alt="" className="h-12 w-12 rounded-full border-2 border-primary object-cover" />
            <div className="min-w-0">
              <div className="truncate font-semibold">{creator?.name ?? "Prestataire"}</div>
              <div className="truncate text-xs text-slate-500">{order.category}</div>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <dd>{formatDate(order.date)}</dd>
            </div>
            {order.quote && (
              <div className="flex items-center gap-2 text-slate-600">
                <FileText className="h-4 w-4 shrink-0" />
                <dd className="truncate">{order.quote.document.name}</dd>
              </div>
            )}
          </dl>
          {order.quote?.message && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">{order.quote.message}</p>}
          <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-5">
            <span className="text-sm text-slate-600">Total à payer</span>
            <span className="text-2xl font-semibold text-primary">{order.price} MAD</span>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
