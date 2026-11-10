import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft, Star, MapPin, Camera, Video, Heart, Share2, MessageCircle,
  ChevronRight, ArrowUpRight, Calendar as CalIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PortfolioLightbox } from "@/components/PortfolioLightbox";
import { getCreator, getPortfolioCategories, monthLabel, monthDays, dayLabels } from "@/lib/creators";
import { useSaved } from "@/lib/store";

export const Route = createFileRoute("/creator/$id")({
  loader: ({ params }) => {
    const creator = getCreator(params.id);
    if (!creator) throw notFound();
    return { creator };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.creator.name} — ${loaderData.creator.role} · WeShoot` },
          { name: "description", content: loaderData.creator.bio },
          { property: "og:title", content: `${loaderData.creator.name} — ${loaderData.creator.role} · WeShoot` },
          { property: "og:description", content: loaderData.creator.bio },
          { property: "og:type", content: "profile" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Créateur · WeShoot" }],
  }),
  component: CreatorProfile,
});

function CreatorProfile() {
  const { creator: c } = Route.useLoaderData();
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(c.id);
  const [category, setCategory] = useState<string>("Tout");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const portfolioCategories = useMemo(() => getPortfolioCategories(c), [c]);
  const visibleItems = useMemo(
    () => (category === "Tout" ? c.portfolio : c.portfolio.filter((p) => p.category === category)),
    [c.portfolio, category],
  );

  const RoleIcon = c.role === "Videographer" ? Video : Camera;
  // Novembre 2026 démarre un dimanche → décalage dans une semaine commençant le lundi
  const firstDayOffset = (new Date(2026, 10, 1).getDay() + 6) % 7;
  const availableDays = monthDays.filter((d) => !c.bookedDays.includes(d)).length;
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (s) => Math.round((c.reviewList.filter((r) => r.rating === s).length / Math.max(1, c.reviewList.length)) * 100),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Cover + identity */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden border border-border h-64 md:h-80">
          <img src={c.portfolio[0].src} alt={`${c.name} cover`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, oklch(0.04 0 0 / 0.85))" }} />
        </div>

        <div className="relative -mt-20 md:-mt-24 px-2 md:px-8 flex flex-col md:flex-row items-start md:items-end gap-6">
          <img
            src={c.avatar}
            alt={c.name}
            className="h-40 w-32 md:h-48 md:w-40 rounded-2xl object-cover border-4 border-background shadow-card"
          />
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <RoleIcon className="h-3.5 w-3.5 text-primary" /> {c.role} · Verified
            </div>
            <h1 className="text-display text-4xl md:text-6xl mt-2">{c.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {c.city}</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-primary text-primary" /> {c.rating} <span className="text-muted-foreground">({c.reviews} avis)</span></span>
            </div>
          </div>
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => toggleSaved(c.id)}
              aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
              className="h-10 w-10 rounded-xl border border-border grid place-items-center hover:bg-surface transition"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: c.name, url: window.location.href }).catch(() => {})}
              aria-label="Partager"
              className="h-10 w-10 rounded-xl border border-border grid place-items-center hover:bg-surface transition"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="mx-auto max-w-7xl px-6 mt-12 grid lg:grid-cols-12 gap-10">
        {/* Left column */}
        <div className="lg:col-span-8">
          {/* Bio */}
          <div className="rounded-3xl bg-surface border border-border p-6 md:p-8">
            <h2 className="text-display text-2xl">À propos</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{c.bio}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[...c.tags, ...c.categories].map((s, i) => (
                <span key={`${s}-${i}`} className="rounded-lg bg-secondary text-secondary-foreground text-xs px-3 py-1.5 border border-border">{s}</span>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <section id="portfolio" className="mt-8 scroll-mt-24">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Portfolio</div>
              <h2 className="text-display text-2xl md:text-3xl mt-2">Le travail</h2>
            </div>

            {/* Catégories configurées par le créateur */}
            <div
              role="tablist"
              aria-label="Catégories du portfolio"
              className="mt-5 -mx-6 px-6 md:mx-0 md:px-0 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {["Tout", ...portfolioCategories].map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 h-10 rounded-full px-5 text-sm font-medium border transition whitespace-nowrap ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div key={category} className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in duration-300">
              {visibleItems.map((item, i) => (
                <button
                  key={`${item.src}-${i}`}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Agrandir la réalisation ${i + 1} de ${c.name}`}
                  className={`relative overflow-hidden rounded-2xl group cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    i === 0 && visibleItems.length >= 3 ? "col-span-2 row-span-2 aspect-square" : "aspect-[3/4]"
                  }`}
                >
                  <img
                    src={item.src}
                    alt={`Réalisation ${i + 1} de ${c.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Offers */}
          <section id="offres" className="mt-16 scroll-mt-24">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Offres</div>
              <h2 className="text-display text-2xl md:text-3xl mt-2">Les formules</h2>
            </div>
            <div className="mt-6 rounded-3xl border border-border bg-surface divide-y divide-border overflow-hidden">
              {c.offers.map((o, i) => {
                const specs = [
                  o.serviceType,
                  o.photos && `${o.photos} photos`,
                  o.videoCount && `${o.videoCount} vidéo${o.videoCount > 1 ? "s" : ""}`,
                  o.delivery && `Livraison ${o.delivery}`,
                  ...o.includes,
                ].filter(Boolean) as string[];
                return (
                  <Link
                    key={o.id}
                    to="/book/$id"
                    params={{ id: c.id }}
                    search={{ offer: o.id }}
                    className={`group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-5 md:p-6 transition hover:bg-surface-elevated ${
                      o.popular ? "shadow-[inset_2px_0_0_0_var(--color-primary)]" : ""
                    }`}
                  >
                    <span className="hidden md:block w-6 text-sm tabular-nums text-muted-foreground">0{i + 1}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-display text-xl">{o.name}</h3>
                        {o.popular && (
                          <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">● Populaire</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{o.duration}</p>
                      <p className="mt-2 text-xs text-muted-foreground/70">{specs.join(" · ")}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="text-display text-3xl">€{o.price}</div>
                      <span
                        className={`h-11 w-11 shrink-0 rounded-full border grid place-items-center transition ${
                          o.popular
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                        }`}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Planning */}
          <section id="disponibilites" className="mt-16 scroll-mt-24">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Disponibilités</div>
              <h2 className="text-display text-2xl md:text-3xl mt-2">Planning</h2>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 md:p-6 flex flex-col md:flex-row gap-6 md:gap-10">
              {/* Calendrier compact */}
              <div className="w-full md:max-w-xs shrink-0">
                <div className="flex items-center justify-between">
                  <div className="text-display text-lg">{monthLabel}</div>
                  <CalIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {dayLabels.map((d) => (
                    <div key={d} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground pb-1">{d.slice(0, 1)}</div>
                  ))}
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`pad-${i}`} />)}
                  {monthDays.map((d) => {
                    const booked = c.bookedDays.includes(d);
                    return (
                      <Link
                        key={d}
                        to="/book/$id"
                        params={{ id: c.id }}
                        disabled={booked}
                        aria-label={booked ? `${d} — réservé` : `${d} — disponible`}
                        className={`h-9 rounded-lg text-xs font-medium border transition grid place-items-center ${
                          booked
                            ? "border-transparent bg-surface-elevated text-muted-foreground/40 line-through cursor-not-allowed pointer-events-none"
                            : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-500"
                        }`}
                      >
                        {d}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Résumé */}
              <div className="flex-1 flex flex-col justify-center md:border-l md:border-border md:pl-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-display text-5xl text-emerald-400">{availableDays}</span>
                  <span className="text-sm text-muted-foreground">dates disponibles en {monthLabel.split(" ")[0].toLowerCase()}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Choisissez une date en vert pour lancer votre réservation.</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Disponible</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted" /> Réservé</span>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section id="avis" className="mt-16 scroll-mt-24">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Avis</div>
              <h2 className="text-display text-2xl md:text-3xl mt-2">Ce qu'ils en disent</h2>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-6 flex items-center gap-8">
                <div>
                  <div className="text-display text-5xl">{c.rating.toFixed(1)}</div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{c.reviews} avis</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingCounts.map((pct, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-3 text-muted-foreground">{5 - i}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {c.reviewList.map((r) => (
                <div key={r.name} className="rounded-2xl border border-border bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.date}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </section>

          <PortfolioLightbox
            items={visibleItems}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            alt={(i) => `Réalisation ${i + 1} de ${c.name}`}
          />
        </div>

        {/* Right sticky booking card */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-card">
              <div className="flex items-baseline gap-1">
                <span className="text-display text-4xl">€{c.price}</span>
                <span className="text-sm text-muted-foreground">/ shoot</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">À partir de · {c.offers[0].name}</div>

              <div className="mt-5 space-y-2 text-sm">
                {c.offers.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    to="/book/$id"
                    params={{ id: c.id }}
                    search={{ offer: o.id }}
                    className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/50 transition"
                  >
                    <span className="text-muted-foreground truncate">{o.name}</span>
                    <span className="font-medium flex items-center gap-1 shrink-0">€{o.price} <ChevronRight className="h-4 w-4" /></span>
                  </Link>
                ))}
              </div>

              <Link
                to="/book/$id"
                params={{ id: c.id }}
                className="mt-5 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition inline-flex items-center justify-center"
              >
                Réserver maintenant
              </Link>
              <p className="mt-3 text-[11px] text-muted-foreground text-center">
                Paiement sécurisé · Remboursé si annulation 72h avant
              </p>
            </div>

            {/* Quick stats */}
            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-display text-2xl">{c.shoots}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Shoots</div>
                </div>
                <div>
                  <div className="text-display text-2xl">{c.reviews}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Avis</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Barre de réservation fixe (mobile) — CTA toujours visible */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <div className="shrink-0 leading-tight">
            <div className="text-xs text-muted-foreground">À partir de</div>
            <div className="text-display text-2xl">€{c.price}</div>
          </div>
          <Link
            to="/book/$id"
            params={{ id: c.id }}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition inline-flex items-center justify-center"
          >
            Réserver
          </Link>
        </div>
      </div>

      <div className="h-24" />
      <SiteFooter />
    </div>
  );
}