import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Camera, Star, Video } from "lucide-react";

import { getCreator } from "@/lib/creators";
import { getFirstName } from "@/lib/booking-rules";
import { Reveal, SectionHead } from "./fx";

/** Un créateur vedette par catégorie : chaque panneau met une spécialité en avant. */
const PICKS: { id: string; category: string; pitch: string }[] = [
  { id: "3", category: "Mariage", pitch: "Lumière dorée, émotion brute" },
  { id: "1", category: "Portrait", pitch: "Éditorial, intime, cinématique" },
  { id: "2", category: "Concert", pitch: "Captation live & aftermovies" },
  { id: "4", category: "Mode", pitch: "Photo & vidéo, esprit street" },
  { id: "5", category: "Hôtel/Tourisme", pitch: "Films de marque & destinations" },
  { id: "6", category: "Packshot Produit", pitch: "Studio, matière, précision" },
];

const roleLabel = (r: string) =>
  r === "Photographer" ? "Photographe" : r === "Videographer" ? "Vidéaste" : "Photo & vidéo";

export function CreatorsShowcase() {
  const [active, setActive] = useState(0);

  const items = PICKS.flatMap((p) => {
    const c = getCreator(p.id);
    return c ? [{ ...p, c }] : [];
  });

  return (
    <section id="createurs" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 pb-14 pt-10 md:pb-20 md:pt-14">
      <SectionHead
        eyebrow="Les créateurs"
        title="Explorez nos créateurs"
        accent="créateurs"
        lead="Photographes et vidéastes vérifiés, une spécialité chacun. Survolez, découvrez leur univers, réservez celui qui colle à votre projet."
      >
        <Link
          to="/explore"
          className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          Voir tous les créateurs
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </SectionHead>

      <Reveal delay={120} className="mt-10 md:mt-12">
        <div
          className="cx-rail -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-4 [scrollbar-width:none] lg:mx-0 lg:h-[clamp(520px,72vh,640px)] lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map(({ c, category, pitch }, i) => {
            const on = i === active;
                        return (
              <Link
                key={c.id}
                to="/creator/$id"
                params={{ id: c.id }}
                data-active={on}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-label={`${getFirstName(c.name)} — ${category}, ${c.city}`}
                className="cx-panel group/p relative h-[min(540px,74svh)] w-[78%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface shadow-card sm:w-[52%] lg:h-auto lg:w-auto"
              >
                <img
                  src={c.cover}
                  alt={`Réalisation de ${c.name}, ${category}`}
                  loading="lazy"
                  draggable={false}
                  className="cx-photo absolute inset-0 h-full w-full object-cover"
                />
                <div className="cx-shade pointer-events-none absolute inset-0" />

                {/* Étiquette verticale (panneau replié, desktop) */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden flex-col items-center gap-4 p-5 transition-opacity duration-300 lg:flex lg:group-data-[active=true]/p:opacity-0">
                  <span className="text-display text-sm text-white/60">0{i + 1}</span>
                  <span className="text-display whitespace-nowrap text-2xl text-white [text-orientation:mixed] [writing-mode:vertical-rl] rotate-180">
                    {category}
                  </span>
                </div>

                {/* Badge catégorie */}
                <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 lg:left-6 lg:top-6">
                  <span className="glass flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium">
                    {c.role === "Videographer" ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                    {category}
                  </span>
                </div>

                {/* Détail (toujours visible sur mobile, au survol sur desktop) */}
                <div className="cx-detail absolute inset-x-0 bottom-0 p-5 lg:w-[min(520px,42vw)] lg:p-8">
                  <p className="text-sm text-white/70">{pitch}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={c.avatar}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 rounded-full border-2 border-white/80 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-display truncate text-3xl leading-none lg:text-4xl">{getFirstName(c.name)}</div>
                      <div className="mt-1 truncate text-xs text-white/70">
                        {roleLabel(c.role)} · {c.city}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 hidden flex-wrap gap-2 lg:flex">
                    {c.tags.map((t) => (
                      <span key={t} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm text-white/85">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <b className="font-semibold">{c.rating.toFixed(1)}</b>
                        <span className="whitespace-nowrap text-white/50">({c.reviews} avis)</span>
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        À partir de{" "}
                        <span className="text-display text-lg text-white">
                          {c.price.toLocaleString("fr-FR")} <span className="text-xs font-medium text-white/70">MAD</span>
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition group-hover/p:bg-primary group-hover/p:text-primary-foreground">
                      Portfolio <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Repères du rail (mobile) */}
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground lg:hidden">
          <span className="h-px w-6 bg-white/20" /> Glissez pour découvrir <span className="h-px w-6 bg-white/20" />
        </p>
      </Reveal>
    </section>
  );
}