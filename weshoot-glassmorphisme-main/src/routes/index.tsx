import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight } from "lucide-react";

import { CreatorCard } from "@/components/CreatorCard";
import { HeroSection } from "@/components/HeroSection";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ALL_CATEGORIES, categories, creators } from "@/lib/creators";
import { useSaved } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WeShoot — Trouvez le photographe parfait" },
      { name: "description", content: "Scrollez un feed curaté de photographes et vidéastes. Portfolios, tarifs, réservation en quelques minutes." },
      { property: "og:title", content: "WeShoot — Trouvez le photographe parfait" },
      { property: "og:description", content: "Le marketplace pour booker les meilleurs photographes et vidéastes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { saved } = useSaved();

  const featured = creators.slice(0, 6);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />

      <HeroSection />

      {/* Feed */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-display text-3xl md:text-4xl">The feed</h2>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-primary animate-pulse" /> Live · {creators.length} créateurs en ligne
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <Link
              key={c}
              to="/explore"
              search={c === ALL_CATEGORIES ? {} : { category: c }}
              className={`whitespace-nowrap rounded-xl px-4 h-9 text-sm font-medium border transition flex items-center ${
                c === ALL_CATEGORIES
                  ? "bg-foreground text-background border-foreground"
                  : "bg-surface text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((c, i) => (
            <CreatorCard key={c.id} creator={c} featured={i === 0} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/explore"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-foreground text-background px-7 text-sm font-semibold hover:opacity-90 transition"
          >
            Voir tous les créateurs {saved.length > 0 && `· ${saved.length} favori${saved.length > 1 ? "s" : ""}`} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How it works teaser */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="rounded-[2rem] bg-surface-elevated border border-border p-10 md:p-16 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-[3rem] opacity-40"
               style={{ background: "radial-gradient(circle, rgb(250 92 7 / 0.5), transparent 70%)" }} />
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Comment ça marche</div>
          <h3 className="text-display text-4xl md:text-6xl mt-4 max-w-3xl">Trois étapes du feed au shooting.</h3>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[
              { n: "01", t: "Scroll the feed", d: "Découvrez des créateurs filtrés par ville, style et budget. Likez pour sauvegarder." },
              { n: "02", t: "Comparez & échangez", d: "Ouvrez les portfolios, lisez les avis, discutez directement. Sans intermédiaire." },
              { n: "03", t: "Réservez & shootez", d: "Paiement sécurisé conservé en séquestre, versé quand vous recevez vos fichiers." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="text-display text-5xl text-primary">{s.n}</div>
                <div className="mt-3 text-xl font-medium">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <Link
            to="/how-it-works"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition"
          >
            Tout savoir sur le fonctionnement <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA for creators */}
      <section className="mx-auto max-w-7xl px-6 pb-40">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pour les créateurs</div>
            <h3 className="text-display text-4xl md:text-6xl mt-4">Soyez booké pendant que vous créez.</h3>
            <p className="mt-5 text-muted-foreground max-w-md">
              Montrez votre meilleur travail dans le feed, fixez votre tarif journalier, et laissez les clients venir à vous.
              Zéro abonnement — seulement 8% sur les réservations complétées.
            </p>
            <Link
              to="/for-creators"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-primary-foreground font-semibold h-12 px-6 shadow-glow hover:scale-[1.02] transition"
            >
              Devenir créateur <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="grid grid-cols-3 gap-3">
              {creators.slice(0, 6).map((c, i) => (
                <img key={c.id} src={c.avatar} alt="" loading="lazy" className={`aspect-[3/4] rounded-2xl object-cover border border-border ${i % 2 ? "translate-y-6" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}