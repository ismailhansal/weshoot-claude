import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, TrendingUp, Globe, Wallet, Star, Send } from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { creators } from "@/lib/creators";

export const Route = createFileRoute("/for-creators")({
  head: () => ({
    meta: [
      { title: "Devenir créateur · WeShoot" },
      { name: "description", content: "Publiez votre portfolio sur WeShoot, fixez vos tarifs et recevez des réservations de clients qualifiés. 0€ d'abonnement." },
      { property: "og:title", content: "Devenir créateur · WeShoot" },
      { property: "og:description", content: "Publiez votre portfolio et recevez des réservations de clients qualifiés." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForCreators,
});

const benefits = [
  { icon: TrendingUp, t: "Des clients qui viennent à vous", d: "Votre feed travaille 24/7 : clients qualifiés, brief déjà rempli au moment du booking." },
  { icon: Wallet, t: "Paiement garanti", d: "Le client paie d'avance via un séquestre sécurisé. Vous êtes payé à la livraison des fichiers." },
  { icon: Globe, t: "Une vitrine internationale", d: "Paris, Berlin, Tokyo… Votre portfolio exposé dans toutes les villes où vous shooterez." },
  { icon: Star, t: "Votre réputation", d: "Les avis vérifiés construisent votre crédibilité et font grimper votre position dans le feed." },
];

const onboarding = [
  { n: "01", t: "Créez votre profil", d: "Photos, bio, spécialités et villes d'intervention. 10 minutes, pas plus." },
  { n: "02", t: "Publiez vos offres", d: "Définissez vos prestations, durées et tarifs. Vous gardez le contrôle total." },
  { n: "03", t: "Recevez vos bookings", d: "Acceptez les demandes, échangez sur le brief, et shootez." },
];

function ForCreators() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pour les créateurs</div>
            <h1 className="text-display mt-4 text-4xl md:text-6xl leading-[1.05]">
              Soyez booké pendant que vous créez.
            </h1>
            <p className="mt-6 max-w-lg text-muted-foreground">
              Exposez votre meilleur travail dans le feed, fixez votre tarif journalier et laissez les clients venir à vous.
              Zéro abonnement — seulement 8% sur les réservations complétées.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSent(true); }}
              className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="flex-1 h-12 rounded-xl bg-surface border border-border px-4 text-sm outline-none focus:border-primary transition"
              />
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">
                <Send className="h-4 w-4" /> Postuler
              </button>
            </form>
            {sent && (
              <p className="mt-3 flex items-center gap-2 text-sm text-primary">
                <Check className="h-4 w-4" /> Merci ! On revient vers vous sous 48h avec les étapes d'inscription.
              </p>
            )}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <div className="text-display text-3xl">8%</div>
                <div className="mt-1 text-[11px] text-muted-foreground uppercase tracking-widest">Commission</div>
              </div>
              <div>
                <div className="text-display text-3xl">0€</div>
                <div className="mt-1 text-[11px] text-muted-foreground uppercase tracking-widest">Abonnement</div>
              </div>
              <div>
                <div className="text-display text-3xl">48h</div>
                <div className="mt-1 text-[11px] text-muted-foreground uppercase tracking-widest">Délai réponse</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {creators.slice(0, 6).map((c, i) => (
              <img
                key={c.id}
                src={c.cover}
                alt={`Travail de ${c.name}`}
                loading="lazy"
                className={`aspect-[3/4] rounded-2xl object-cover border border-border shadow-card ${i % 2 ? "translate-y-6" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <h2 className="text-display mt-24 text-3xl md:text-4xl">Pourquoi WeShoot</h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.t} className="rounded-2xl border border-border bg-surface p-7">
                <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-display mt-5 text-xl">{b.t}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            );
          })}
        </div>

        {/* Onboarding */}
        <h2 className="text-display mt-20 text-3xl md:text-4xl">Lancer votre profil en 3 étapes</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {onboarding.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-surface p-7">
              <div className="text-display text-5xl text-primary">{s.n}</div>
              <div className="mt-4 text-lg font-medium">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-2xl border border-primary/40 bg-surface-elevated p-8 md:p-12 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 opacity-40"
               style={{ background: "radial-gradient(circle, oklch(0.65 0.18 45 / 0.5), transparent 70%)" }} />
          <h2 className="text-display text-3xl md:text-4xl">Votre prochain client scrolle déjà.</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Les réservations partent vite dans les villes les plus demandées.
          </p>
          <Link to="/explore" className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">
            Voir le feed <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
