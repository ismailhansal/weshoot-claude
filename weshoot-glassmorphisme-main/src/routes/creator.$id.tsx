import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft, Star, MapPin, Camera, Video, Heart, Share2, MessageCircle,
  Check, Clock, Award, ChevronRight, Calendar as CalIcon,
} from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCreator, monthLabel, monthDays, dayLabels } from "@/lib/creators";
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
  const [tab, setTab] = useState<"portfolio" | "offers" | "planning" | "reviews">("portfolio");

  const RoleIcon = c.role === "Videographer" ? Video : Camera;
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (s) => Math.round((c.reviewList.filter((r) => r.rating === s).length / Math.max(1, c.reviewList.length)) * 100),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Cover + identity */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden border border-border h-64 md:h-80">
          <img src={c.portfolio[0]} alt={`${c.name} cover`} className="absolute inset-0 h-full w-full object-cover" />
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
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Répond en {c.responseTime}</span>
              <span className="flex items-center gap-1.5"><Award className="h-4 w-4" /> {c.years} ans d'expérience</span>
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

          {/* Tabs */}
          <div className="mt-8 border-b border-border flex gap-1 overflow-x-auto">
            {([
              { k: "portfolio", l: "Portfolio" },
              { k: "offers", l: "Offres" },
              { k: "planning", l: "Planning" },
              { k: "reviews", l: "Avis" },
            ] as const).map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  tab === t.k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>

          {/* Portfolio */}
          {tab === "portfolio" && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {c.portfolio.map((src, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl group ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-[3/4]"}`}>
                  <img src={src} alt={`Réalisation ${i + 1} de ${c.name}`} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              ))}
            </div>
          )}

          {/* Offers */}
          {tab === "offers" && (
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {c.offers.map((o) => (
                <div key={o.id} className={`relative rounded-2xl p-6 border flex flex-col ${o.popular ? "border-primary bg-surface-elevated shadow-glow" : "border-border bg-surface"}`}>
                  {o.popular && (
                    <span className="absolute -top-2 left-6 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-2 py-1 rounded-lg font-semibold">Populaire</span>
                  )}
                  <div className="text-display text-xl">{o.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{o.duration}</div>
                  <div className="mt-6 text-display text-4xl">€{o.price}</div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
                    {o.includes.map((inc) => (
                      <li key={inc} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> {inc}</li>
                    ))}
                  </ul>
                  <Link
                    to="/book/$id"
                    params={{ id: c.id }}
                    search={{ offer: o.id }}
                    className={`mt-6 w-full h-10 rounded-xl text-sm font-semibold transition inline-flex items-center justify-center ${
                      o.popular ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-foreground text-background hover:opacity-90"
                    }`}
                  >
                    Réserver
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Planning */}
          {tab === "planning" && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-display text-xl">{monthLabel}</div>
                  <div className="text-xs text-muted-foreground mt-1">Sélectionnez un créneau disponible</div>
                </div>
                <div className="h-9 w-9 grid place-items-center rounded-xl border border-border"><CalIcon className="h-4 w-4 text-muted-foreground" /></div>
              </div>
              <div className="mt-6 grid grid-cols-7 gap-2">
                {dayLabels.map((d) => (
                  <div key={d} className="text-center text-[11px] uppercase tracking-widest text-muted-foreground py-2">{d}</div>
                ))}
                {monthDays.map((d) => {
                  const booked = c.bookedDays.includes(d);
                  return (
                    <Link
                      key={d}
                      to="/book/$id"
                      params={{ id: c.id }}
                      disabled={booked}
                      className={`aspect-square rounded-xl text-sm font-medium border transition grid place-items-center ${
                        booked
                          ? "border-border bg-surface-elevated text-muted-foreground/40 line-through cursor-not-allowed pointer-events-none"
                          : "border-border bg-background hover:border-primary hover:text-primary"
                      }`}
                    >
                      {d}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" /> Disponible</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-muted" /> Réservé</span>
              </div>
            </div>
          )}

          {/* Reviews */}
          {tab === "reviews" && (
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
          )}
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-display text-2xl">{c.shoots}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Shoots</div>
                </div>
                <div>
                  <div className="text-display text-2xl">98%</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Réponse</div>
                </div>
                <div>
                  <div className="text-display text-2xl">{c.responseTime.replace("~", "")}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Délai</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="h-24" />
      <SiteFooter />
    </div>
  );
}
