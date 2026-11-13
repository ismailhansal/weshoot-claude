import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { CreatorsShowcase } from "@/components/home/CreatorsShowcase";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhyWeShootSection } from "@/components/home/WhyWeShootSection";
import { creators } from "@/lib/creators";

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
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />

      <HeroSection />

      <CreatorsShowcase />
      <HowItWorksSection />
      <WhyWeShootSection />

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