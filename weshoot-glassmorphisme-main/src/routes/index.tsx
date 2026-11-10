import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, MapPin, Star, ArrowUpRight, ChevronRight } from "lucide-react";
import { useState } from "react";

import { CreatorCard } from "@/components/CreatorCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { categories, creators } from "@/lib/creators";
import { useSaved } from "@/lib/store";

import heroImg1 from "@/assets/hero-1.jpg";
import heroImg2 from "@/assets/hero-2.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";

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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { saved } = useSaved();

  const featured = creators.slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
              Marketplace · Photo & Video
            </div>
            <h1 className="text-display mt-6 text-5xl md:text-6xl lg:text-7xl leading-[1.02]">
              Trouvez le shooter qui matche votre vision.
            </h1>
            <p className="mt-6 max-w-lg text-base md:text-lg text-muted-foreground">
              WeShoot met en relation clients, photographes et vidéastes. Scrollez un feed curaté, comparez portfolios et tarifs, bookez en quelques minutes.
            </p>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/explore", search: query.trim() ? { q: query.trim() } : {} });
              }}
              className="mt-8 glass rounded-2xl p-2 flex items-center gap-2 shadow-card"
            >
              <div className="flex items-center gap-3 pl-4 flex-1 min-w-0">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Mariage à Marrakech, clip, portrait éditorial…"
                  className="bg-transparent outline-none text-sm placeholder:text-muted-foreground flex-1 py-2 min-w-0"
                />
              </div>
              <div className="hidden sm:flex items-center gap-1.5 pl-3 pr-3 border-l border-border text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Toutes les villes
              </div>
              <button type="submit" className="rounded-xl bg-primary text-primary-foreground font-semibold text-sm h-10 px-5 shadow-glow hover:opacity-90 transition">
                Rechercher
              </button>
            </form>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { v: "2,400+", l: "Créateurs vérifiés" },
                { v: "60+", l: "Villes" },
                { v: "4.9", l: "Note moyenne" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-display text-3xl md:text-4xl">{s.v}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground uppercase tracking-widest">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[5/6] w-full max-w-xl mx-auto">
              {/* Glow */}
              <div className="absolute -inset-10 -z-10 opacity-60"
                   style={{ background: "radial-gradient(50% 50% at 60% 40%, oklch(0.65 0.18 45 / 0.35), transparent 70%)" }} />

              {/* Main image */}
              <div className="absolute top-0 right-0 w-[72%] h-[78%] rounded-3xl overflow-hidden shadow-card border border-border">
                <img src={heroImg1} alt="Editorial photoshoot" className="h-full w-full object-cover" width={960} height={1280} />
                {/* Floating creator card */}
                <div className="absolute bottom-3 left-3 right-3 glass rounded-2xl p-3 flex items-center gap-3">
                  <img src={avatar1} alt="" loading="lazy" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">Sophie</div>
                    <div className="text-[11px] text-white/70 truncate">Éditorial · Casablanca</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">3000 MAD</div>
                    <div className="text-[10px] text-white/60 -mt-0.5">/ day</div>
                  </div>
                </div>
              </div>

              {/* Secondary image */}
              <div className="absolute bottom-0 left-0 w-[58%] h-[58%] rounded-3xl overflow-hidden shadow-card border border-border">
                <img src={heroImg2} alt="Behind the scenes" loading="lazy" className="h-full w-full object-cover" width={960} height={1280} />
              </div>

              {/* Floating rating pill */}
              <div className="absolute top-6 left-0 glass rounded-xl pl-2 pr-4 py-2 flex items-center gap-2 shadow-card">
                <div className="flex -space-x-2">
                  {[avatar2, avatar3, avatar4].map((a, i) => (
                    <img key={i} src={a} alt="" className="h-7 w-7 rounded-md object-cover border-2 border-background" />
                  ))}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 font-semibold"><Star className="h-3 w-3 fill-primary text-primary" /> 4.9</div>
                  <div className="text-muted-foreground -mt-0.5 text-[10px]">2,400+ shoots</div>
                </div>
              </div>

              {/* Floating tag */}
              <div className="absolute bottom-[42%] right-[-10px] bg-primary text-primary-foreground rounded-xl px-4 py-2 text-xs font-semibold shadow-glow rotate-[6deg]">
                Book in 2 min
              </div>
            </div>
          </div>
        </div>
      </section>

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
              search={c === "For You" ? {} : { category: c }}
              className={`whitespace-nowrap rounded-xl px-4 h-9 text-sm font-medium border transition flex items-center ${
                c === "For You"
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
               style={{ background: "radial-gradient(circle, oklch(0.65 0.18 45 / 0.5), transparent 70%)" }} />
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