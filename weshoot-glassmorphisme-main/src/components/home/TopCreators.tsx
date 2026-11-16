import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BadgeCheck, Camera, ChevronLeft, ChevronRight, Flame, MapPin, Star, Video, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef, useState } from "react";

import { getFirstName } from "@/lib/booking-rules";
import { creators } from "@/lib/creators";
import type { Creator } from "@/lib/creators";
import { Reveal, SectionHead } from "./fx";

const hours = (c: Creator) => parseInt(c.responseTime.replace(/\D/g, ""), 10) || 99;
const roleOf = (r: string) => (r === "Photographer" ? "Photographe" : r === "Videographer" ? "Vidéaste" : "Photo & vidéo");

/** Les 3 classements possibles : tri + chiffre mis en avant à droite de chaque ligne. */
const MODES: {
  key: string;
  label: string;
  Icon: LucideIcon;
  sort: (a: Creator, b: Creator) => number;
  value: (c: Creator) => string;
  unit: (c: Creator) => string;
}[] = [
  {
    key: "rating",
    label: "Mieux notés",
    Icon: Star,
    sort: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    value: (c) => c.rating.toFixed(1),
    unit: (c) => `${c.reviews} avis`,
  },
  {
    key: "shoots",
    label: "Plus réservés",
    Icon: Flame,
    sort: (a, b) => b.shoots - a.shoots,
    value: (c) => String(c.shoots),
    unit: () => "shootings",
  },
  {
    key: "fast",
    label: "Plus réactifs",
    Icon: Zap,
    sort: (a, b) => hours(a) - hours(b) || b.rating - a.rating,
    value: (c) => c.responseTime.replace("~", ""),
    unit: () => "de réponse",
  },
];

export function TopCreators() {
  const [m, setM] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const mode = MODES[m];
  const ranked = [...creators].sort(mode.sort).slice(0, 8);

  const go = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * 640, behavior: "smooth" });
  const pick = (i: number) => {
    setM(i);
    rail.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  return (
    <section id="top-createurs" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHead
        eyebrow="Créateurs à découvrir"
        title={"Les profils qui font parler d'eux"}
        accent="parler"
        lead="Notes vérifiées, shootings réalisés, réponse rapide : voyez qui se démarque en ce moment."
      >
        <div className="hidden gap-2 md:flex">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d === 1 ? "Suivant" : "Précédent"}
              onClick={() => go(d)}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.04] transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {d === 1 ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          ))}
        </div>
      </SectionHead>

      <Reveal delay={100} className="mt-8 md:mt-10">
        <div role="tablist" aria-label="Classement" className="-mx-6 flex gap-2 overflow-x-auto px-6 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          {MODES.map((x, i) => {
            const on = i === m;
            return (
              <button
                key={x.key}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => pick(i)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition md:text-sm ${
                  on ? "border-primary bg-primary text-primary-foreground" : "border-white/12 bg-white/[0.04] text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                <x.Icon className={`h-4 w-4 ${on ? "fill-current" : ""}`} />
                {x.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Rail à swiper */}
      <div
        ref={rail}
        key={mode.key}
        className="-mx-6 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-6 px-6 pb-2 [scrollbar-width:none] md:mt-8 md:gap-5 lg:mx-0 lg:scroll-pl-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {ranked.map((c, i) => (
          <Link
            key={c.id}
            to="/creator/$id"
            params={{ id: c.id }}
            draggable={false}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group relative block aspect-[3/4] w-[74vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-surface animate-in fade-in slide-in-from-right-4 fill-mode-both duration-500 sm:w-[300px] lg:w-[calc((100%-3*1.25rem)/4)] lg:max-w-none"
          >
            <img
              src={c.portfolio[0]?.src ?? c.cover}
              alt={`${c.name}, ${roleOf(c.role)} à ${c.city}`}
              loading="lazy"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/90 via-black/10 to-black/35" />

            <span className="text-display absolute left-3 top-3 grid h-8 min-w-8 place-items-center rounded-full bg-black/55 px-2 text-sm backdrop-blur">
              {i + 1}
            </span>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              {mode.key === "rating" ? <Star className="h-3 w-3 fill-current" /> : <mode.Icon className="h-3 w-3 fill-current" />}
              {mode.value(c)} <span className="font-medium opacity-80">{mode.unit(c)}</span>
            </span>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-center gap-2.5">
                <img src={c.avatar} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-full border-2 border-white/80 object-cover" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-display truncate text-xl leading-none">{getFirstName(c.name)}</span>
                    <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-black" />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-white/75">
                    {c.role === "Videographer" ? <Video className="h-3 w-3 shrink-0" /> : <Camera className="h-3 w-3 shrink-0" />}
                    {roleOf(c.role)} · <MapPin className="h-3 w-3 shrink-0" />
                    {c.city}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-xs">
                <span className="text-white/70">
                  dès <b className="font-semibold text-white">{c.price.toLocaleString("fr-FR")} MAD</b>
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-white transition group-hover:text-primary">
                  Voir <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex justify-center md:mt-10">
        <Link
          to="/explore"
          className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 text-sm font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          Découvrir tous les créateurs
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}