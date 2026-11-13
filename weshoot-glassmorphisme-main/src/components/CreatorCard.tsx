import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Star, Heart, Camera, Video, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { Creator } from "@/lib/creators";
import { useSaved } from "@/lib/store";
import { getFirstName } from "@/lib/booking-rules";

const SLIDES = 5;

export function CreatorCard({ creator: c, featured = false }: { creator: Creator; featured?: boolean }) {
  const { isSaved, toggleSaved } = useSaved();
  const navigate = useNavigate();
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // 5 visuels max : la couverture d'abord, puis le portfolio (sans doublon).
  const slides = useMemo(
    () => Array.from(new Set([c.cover, ...c.portfolio.map((p) => p.src)])).slice(0, SLIDES),
    [c],
  );

  const goTo = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    const next = Math.max(0, Math.min(slides.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, [slides.length]);

  const stop = (event: React.SyntheticEvent) => { event.preventDefault(); event.stopPropagation(); };
  const arrowClass =
    "glass pointer-events-auto absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-xl opacity-0 transition hover:scale-110 hover:bg-primary hover:text-primary-foreground group-hover:opacity-100 md:grid";

  return (
    <article className={`group relative overflow-hidden rounded-3xl bg-surface border border-border shadow-card hover:shadow-glow transition-all duration-500 ${featured ? "lg:col-span-2 lg:row-span-2" : ""}`}>
      <Link to="/creator/$id" params={{ id: c.id }} aria-label={`Voir le profil de ${getFirstName(c.name)}`} className={`relative block ${featured ? "aspect-[4/5] lg:aspect-auto lg:h-full" : "aspect-[4/5]"}`}>
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== index) setIndex(i);
          }}
          className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
              <img
                src={src}
                alt={`Réalisation ${i + 1} de ${c.name}`}
                loading={featured && i === 0 ? "eager" : "lazy"}
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            {index > 0 && (
              <button type="button" aria-label="Photo précédente" onClick={(e) => { stop(e); goTo(index - 1); }} className={`${arrowClass} left-3`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {index < slides.length - 1 && (
              <button type="button" aria-label="Photo suivante" onClick={(e) => { stop(e); goTo(index + 1); }} className={`${arrowClass} right-3`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </>
        )}
        {/* Mobile uniquement : petits tirets (comme la hero) pour signaler qu'on peut faire défiler les photos */}
        {slides.length > 1 && (
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-2 z-[5] flex -translate-x-1/2 gap-1 md:hidden">
            {slides.map((_, k) => (
              <span
                key={k}
                className={`h-[3px] w-5 rounded-full transition-colors duration-300 ${k === index ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 p-4 flex items-start justify-between">
          <span className="glass rounded-lg px-3 py-1 text-xs flex items-center gap-1.5">
            {c.role === "Videographer" ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
            {c.role === "Photographer" ? "Photographe" : c.role === "Videographer" ? "Vidéaste" : "Photo & vidéo"}
          </span>
          <button
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleSaved(c.id); }}
            className="glass pointer-events-auto h-9 w-9 rounded-xl grid place-items-center hover:scale-110 transition"
            aria-label={isSaved(c.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`h-4 w-4 ${isSaved(c.id) ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 p-5"
          style={{ background: "linear-gradient(180deg, transparent, oklch(0 0 0 / 0.85))" }}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <img src={c.avatar} alt={c.name} loading="lazy" className="h-9 w-9 rounded-lg object-cover border border-white/20" />
                <div className="min-w-0">
                  <div className="text-display text-xl truncate">{getFirstName(c.name)}</div>
                  <div className="text-xs text-white/70 truncate">{c.city}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags.slice(0, featured ? 4 : 2).map((t) => (
                  <span key={t} className="rounded-lg bg-white/10 backdrop-blur px-2.5 py-1 text-[11px] text-white/90 border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-xs text-white/80 justify-end">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {c.rating} <span className="text-white/50">({c.reviews})</span>
              </div>
              <div className="mt-1 text-[11px] text-white/70">À partir de</div>
              <div className="text-display text-2xl text-white leading-none">
                {c.price} <span className="text-xs font-medium text-white/70">MAD</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="h-10 min-w-0 flex-1 whitespace-nowrap rounded-full bg-white px-4 text-sm font-medium text-black inline-flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition">
              Voir le portfolio
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            </span>
            <button
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); navigate({ to: "/book/$id", params: { id: c.id } }); }}
              className="pointer-events-auto h-10 shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-md hover:border-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              Réserver
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}