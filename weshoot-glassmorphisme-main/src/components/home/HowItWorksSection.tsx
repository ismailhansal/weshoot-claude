import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Lock, Search, SlidersHorizontal, Star } from "lucide-react";

import { getCreator, timeSlots } from "@/lib/creators";
import { Reveal, SectionHead } from "./fx";

const camille = getCreator("3");

/* ------------------------------ Étape 1 ------------------------------ */
function MockChoose() {
  if (!camille) return null;
  return (
    <div className="mock flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-[13px]">
        <Search className="h-4 w-4 text-white/50" />
        <span className="text-white/90">Mariage</span>
        <span className="text-white/30">·</span>
        <span className="text-white/60">Rabat</span>
        <SlidersHorizontal className="ml-auto h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {camille.portfolio.slice(0, 3).map((p, i) => (
          <div key={p.src} className="relative overflow-hidden rounded-xl">
            <img src={p.src} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/50 backdrop-blur">
                <Heart className="h-3 w-3 fill-primary text-primary" />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mock-pulse flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-3">
        <img src={camille.avatar} alt="" loading="lazy" className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">Camille · Rabat</div>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Star className="h-3 w-3 fill-primary text-primary" /> {camille.rating.toFixed(1)} · {camille.reviews} avis
          </div>
        </div>
        <div className="text-right text-xs text-white/60">
          dès
          <div className="text-display text-sm text-white">{camille.price.toLocaleString("fr-FR")} MAD</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Étape 2 ------------------------------ */
const WEEK = ["L", "M", "M", "J", "V", "S", "D"];
const DAYS = Array.from({ length: 14 }, (_, i) => 16 + i); // 16 → 29 nov. 2026 (lundi → dimanche)

function MockBook() {
  const booked = camille?.bookedDays ?? [];
  const picked = 21;
  return (
    <div className="mock flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Novembre 2026</span>
        <span className="flex gap-1 text-white/50">
          <ChevronLeft className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
        {WEEK.map((d, i) => (
          <span key={i} className="pb-1 text-white/40">
            {d}
          </span>
        ))}
        {DAYS.map((d) => {
          const isBooked = booked.includes(d);
          const isPicked = d === picked;
          return (
            <span
              key={d}
              className={`grid aspect-square place-items-center rounded-lg text-[12px] ${
                isPicked
                  ? "mock-pick bg-primary font-bold text-primary-foreground"
                  : isBooked
                    ? "text-white/25 line-through"
                    : "bg-white/[0.06] text-white/85"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {timeSlots.slice(0, 4).map((t) => (
          <span
            key={t}
            className={`rounded-full border px-3 py-1 text-xs ${
              t === "14:00" ? "border-primary bg-primary/15 text-white" : "border-white/10 text-white/60"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black">
        <Lock className="h-4 w-4" />
        Payer {camille ? camille.price.toLocaleString("fr-FR") : ""} MAD · séquestre
      </div>
    </div>
  );
}

/* ------------------------------ Étape 3 ------------------------------ */
function MockDeliver() {
  const p = camille?.portfolio ?? [];
  return (
    <div className="mock flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Vos fichiers</span>
        <span className="mock-pop inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <Check className="h-3 w-3" strokeWidth={3} /> Livré
        </span>
      </div>

      <div className="grid h-40 grid-cols-3 grid-rows-2 gap-2">
        {p[0] && <img src={p[0].src} alt="" loading="lazy" className="col-span-2 row-span-2 h-full min-h-0 w-full rounded-xl object-cover" />}
        {p[1] && <img src={p[1].src} alt="" loading="lazy" className="h-full min-h-0 w-full rounded-xl object-cover" />}
        {p[2] && <img src={p[2].src} alt="" loading="lazy" className="h-full min-h-0 w-full rounded-xl object-cover" />}
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-[11px] text-white/55">
          <span>48 photos retouchées</span>
          <span>100 %</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="mock-fill h-full rounded-full bg-gradient-accent" />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-3 text-[13px] text-white/80">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-400 text-black">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        Paiement versé au créateur
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    t: "Choisissez votre créateur",
    d: "Parcourez les portfolios, filtrez par ville, style et budget, comparez les avis. Trouvez le regard qui colle à votre projet.",
    chip: "Portfolios & avis vérifiés",
    Mock: MockChoose,
  },
  {
    n: "02",
    t: "Réservez en quelques clics",
    d: "Une offre, une date, un créneau, le lieu du shoot, puis paiement en ligne. Confirmation immédiate.",
    chip: "Paiement sécurisé en séquestre",
    Mock: MockBook,
  },
  {
    n: "03",
    t: "Shootez, puis recevez vos fichiers",
    d: "Le créateur n'est payé qu'une fois vos photos et vidéos livrées. Annulation gratuite jusqu'à 72 h avant.",
    chip: "Livraison sous 3 à 7 jours",
    Mock: MockDeliver,
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.06] bg-surface/60 py-16 md:py-24">
      {/* halos */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-10 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(250 92 7 / 0.22), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(250 92 7 / 0.16), transparent 65%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Le parcours"
          title={"Comment ça marche\u00A0?"}
          accent="marche"
          lead="De l'inspiration au shooting, trois étapes. Pas d'intermédiaire, pas de surprise : vous gardez la main du début à la fin."
        >
          <Link
            to="/how-it-works"
            className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            Tout savoir <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </SectionHead>

        <ol className="mt-14 grid gap-5 md:mt-20 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ n, t, d, chip, Mock }, i) => (
            <li key={n} className="relative">
              <Reveal delay={i * 140} className="flex h-full flex-col">
                {/* Pastille + trait de liaison */}
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-display grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-lg text-primary-foreground shadow-glow">
                    {n}
                  </span>
                  <span className="hidden h-px flex-1 bg-linear-to-r from-primary/70 to-transparent md:block" />
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40 md:hidden">Étape {i + 1} / 3</span>
                </div>

                <div className="step-card group relative flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-background/70 p-4 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-primary/40">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 sm:p-5">
                    <Mock />
                  </div>
                  <div className="flex flex-1 flex-col px-2 pb-3 pt-6">
                    <h3 className="text-display text-2xl leading-tight">{t}</h3>
                    <p className="mb-5 mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
                    <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {chip}
                    </span>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}