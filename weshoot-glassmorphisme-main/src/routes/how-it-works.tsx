import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, ShieldCheck, MessageCircle, CalendarCheck, ArrowUpRight, ChevronDown } from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Comment ça marche · WeShoot" },
      { name: "description", content: "Scroll, comparez, réservez : le fonctionnement de WeShoot, du feed au paiement sécurisé en séquestre." },
      { property: "og:title", content: "Comment ça marche · WeShoot" },
      { property: "og:description", content: "Scroll, comparez, réservez : le fonctionnement de WeShoot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    n: "01",
    icon: Search,
    t: "Scroll & découvrez",
    d: "Parcourez un feed curaté de créateurs vérifiés. Filtrez par ville, style, format et budget pour trouver le match parfait.",
  },
  {
    n: "02",
    icon: MessageCircle,
    t: "Comparez & échangez",
    d: "Ouvrez les portfolios, lisez les avis clients, comparez les offres. Contactez directement le créateur, sans intermédiaire.",
  },
  {
    n: "03",
    icon: CalendarCheck,
    t: "Réservez en 4 étapes",
    d: "Choisissez une offre, une date et un créneau, indiquez le lieu du shoot, payez en ligne. Confirmation immédiate.",
  },
  {
    n: "04",
    icon: ShieldCheck,
    t: "Shoot & livraison",
    d: "Votre paiement est conservé en séquestre et versé au créateur une fois vos fichiers livrés. Annulation gratuite jusqu'à 72h avant.",
  },
];

const faqs = [
  {
    q: "Comment sont sélectionnés les créateurs ?",
    a: "Chaque créateur passe une vérification d'identité et de portfolio. Les avis clients sont uniquement laissés après un shoot réservé et complété sur WeShoot.",
  },
  {
    q: "Que se passe-t-il si le créateur annule ?",
    a: "Vous êtes intégralement remboursé et nous vous proposons immédiatement une liste de créateurs disponibles sur votre date.",
  },
  {
    q: "Comment sont fixés les prix ?",
    a: "Chaque créateur fixe librement ses tarifs par offre. Le prix affiché est le prix final — aucune commission côté client.",
  },
  {
    q: "Sous quel délai je reçois mes photos ou vidéos ?",
    a: "Le délai de livraison est indiqué sur chaque offre, généralement entre 3 et 7 jours après le shoot.",
  },
];

function HowItWorks() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 pt-16 pb-24">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Comment ça marche</div>
        <h1 className="text-display mt-4 text-4xl md:text-6xl max-w-2xl">
          Du feed au shooting, en toute confiance.
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          WeShoot encadre chaque étape : créateurs vérifiés, paiement sécurisé, livraison garantie.
        </p>

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="rounded-2xl border border-border bg-surface p-7">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-display text-4xl text-muted-foreground/40">{s.n}</span>
                </div>
                <div className="text-display mt-5 text-2xl">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            );
          })}
        </div>

        {/* Guarantees */}
        <div className="mt-10 rounded-2xl border border-border bg-surface-elevated p-7">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" /> Nos garanties
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { t: "Paiement en séquestre", d: "Libéré seulement quand vous recevez vos fichiers." },
              { t: "Remboursement 72h", d: "Annulation gratuite jusqu'à 72h avant le shoot." },
              { t: "Support dédié", d: "Une équipe répond en moins de 2h, 7j/7." },
            ].map((g) => (
              <div key={g.t} className="rounded-xl bg-background border border-border p-4">
                <div className="font-medium">{g.t}</div>
                <div className="mt-1 text-xs text-muted-foreground">{g.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <h2 className="text-display mt-16 text-3xl">Questions fréquentes</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left text-sm font-medium"
              >
                {f.q}
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-primary/40 bg-surface-elevated p-8 md:p-12 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 opacity-40"
               style={{ background: "radial-gradient(circle, oklch(0.65 0.18 45 / 0.5), transparent 70%)" }} />
          <h2 className="text-display text-3xl md:text-4xl">Prêt à shooter ?</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Explorez le feed et réservez votre créneau en quelques minutes.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/explore" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">
              Découvrir les créateurs <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/for-creators" className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-7 text-sm font-semibold hover:bg-surface transition">
              Devenir créateur <Star className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
