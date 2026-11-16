import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Camera, MapPin, Play, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getFirstName } from "@/lib/booking-rules";
import { getCreator } from "@/lib/creators";

/**
 * Une entrée = une occasion (l'ordre = la priorité, non-pros d'abord).
 * À gauche une PHOTO (créateur photographe), à droite une VIDÉO (créateur vidéaste) :
 *   - id    : id du créateur (creators.ts)
 *   - work  : (optionnel) index de la photo de son portfolio (défaut : sa photo de couverture)
 *   - video : (vidéo uniquement) chemin d'un court extrait, ex. "/videos/mariage.mp4"
 *             (mp4, 5-10 s, ≤ 3 Mo, sans son). Sans `video`, on affiche une image avec un bouton ▶.
 * `category` = valeur envoyée à /explore?category=… (doit exister dans tes filtres).
 */
type Pick = { id: string; work?: number };
const MOMENTS: { category: string; label: string; photo: Pick; video: Pick & { video?: string } }[] = [
{ category: "Mariage", label: "Mariage", photo: { id: "3" }, video: { id: "5", video: "/videos/mariage.mp4" } },  { category: "Portrait", label: "Portrait", photo: { id: "1" }, video: { id: "4" } },
  { category: "Soutenance", label: "Soutenance", photo: { id: "6" }, video: { id: "2" } },
  { category: "Famille", label: "Famille", photo: { id: "3" }, video: { id: "4" } },
  { category: "Événement", label: "Anniversaire", photo: { id: "1" }, video: { id: "5" } },
];

const HEADER = 64; // hauteur du header fixe (px)
const PER = 40; // scroll par catégorie, en % de hauteur d'écran (plus petit = passe plus vite)

export function MomentsSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const n = MOMENTS.length;

  // La catégorie active dépend de l'avancement du scroll dans la section
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dist = r.height - (window.innerHeight - HEADER);
      if (dist <= 0) return;
      const p = Math.min(1, Math.max(0, (HEADER - r.top) / dist));
      setActive(Math.min(n - 1, Math.floor(p * n)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [n]);

  // Clic sur une catégorie : on scrolle jusqu'à son « moment »
  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dist = r.height - (window.innerHeight - HEADER);
    window.scrollTo({ top: window.scrollY + r.top - HEADER + ((i + 0.5) / n) * dist, behavior: "smooth" });
  };

  const shots = MOMENTS.map((m) =>
    ([m.photo, m.video] as (Pick & { video?: string })[]).map((s) => {
      const c = getCreator(s.id);
      if (!c) return null;
      return { c, src: s.work !== undefined && c.portfolio[s.work] ? c.portfolio[s.work].src : c.cover, video: s.video };
    }),
  );

  // Seule la vidéo de la catégorie active joue
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) void v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  return (
    <section
      id="moments"
      ref={ref}
      className="relative"
      style={{ height: `calc(${n * PER}svh + 100svh - ${HEADER}px)` }}
    >
      <div className="sticky flex flex-col overflow-hidden px-6" style={{ top: HEADER, height: `calc(100svh - ${HEADER}px)` }}>
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col py-5 md:py-8">
          {/* Titre */}
          <header className="text-center">
            <h2 className="text-display text-[clamp(1.6rem,4.2vw,3rem)] leading-[1.02]">
              Faites durer les moments <span className="text-primary">précieux</span>
            </h2>
            <p className="mx-auto mt-2 hidden max-w-xl text-sm text-muted-foreground sm:block md:text-base">
              Trouvez le créateur de tous vos moments importants.
            </p>
          </header>

          {/* Scène : photo gauche · catégories · vidéo droite */}
          <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)_auto] gap-x-3 gap-y-4 md:mt-6 lg:grid-cols-[1fr_minmax(0,0.8fr)_1fr] lg:grid-rows-1 lg:gap-x-10">
            {[0, 1].map((side) => (
              <div key={side} className={`flex min-h-0 flex-col ${side === 1 ? "lg:order-3" : ""}`}>
                {/* média */}
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-surface md:rounded-3xl">
                  {shots.map((pair, i) => {
                    const s = pair[side];
                    if (!s) return null;
                    const cls = `absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-out ${
                      i === active ? "scale-100 opacity-100" : "scale-[1.07] opacity-0"
                    }`;
                    return s.video ? (
                      <video
                        key={i}
                        ref={(el) => {
                          vids.current[i] = el;
                        }}
                        src={s.video}
                        poster={s.src}
                        muted
                        loop
                        playsInline
                        preload="none"
                        aria-label={`${MOMENTS[i].label} par ${s.c.name}`}
                        className={cls}
                      />
                    ) : (
                      <img key={i} src={s.src} alt={`${MOMENTS[i].label} par ${s.c.name}`} draggable={false} className={cls} />
                    );
                  })}
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                    {side === 0 ? <Camera className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                    {side === 0 ? "Photo" : "Vidéo"}
                  </span>
                  {/* bouton ▶ quand la vidéo n'est pas encore fournie */}
                  {side === 1 && !shots[active]?.[1]?.video && (
                    <span className="pointer-events-none absolute inset-0 grid place-items-center">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-black shadow-xl md:h-16 md:w-16">
                        <Play className="h-6 w-6 fill-current" />
                      </span>
                    </span>
                  )}
                </div>

                {/* signature : « Capturé par … » */}
                <div className="relative mt-3 h-[3.1rem] shrink-0 text-center md:mt-4 md:h-[3.6rem]">
                  {shots.map((pair, i) => {
                    const s = pair[side];
                    if (!s) return null;
                    return (
                      <Link
                        key={i}
                        to="/creator/$id"
                        params={{ id: s.c.id }}
                        tabIndex={i === active ? 0 : -1}
                        className={`group absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
                          i === active ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                      >
                        <span className="text-xs text-white/55 md:text-sm">
                          Capturé par{" "}
                          <span className="text-display text-sm text-white transition group-hover:text-primary md:text-lg">{getFirstName(s.c.name)}</span>
                        </span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-white/55 md:text-xs">
                          <MapPin className="h-3 w-3" />
                          {s.c.city}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* catégories */}
            <div className="col-span-2 flex flex-col items-center justify-center lg:order-2 lg:col-span-1">
              <ul className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 lg:flex-col lg:flex-nowrap lg:gap-y-3">
                {MOMENTS.map((m, i) => {
                  const on = i === active;
                  return (
                    <li key={m.category}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={on}
                        className={`text-display relative transition-all duration-500 ${
                          on
                            ? "text-[1.35rem] text-white lg:text-[clamp(2.4rem,3.6vw,3.4rem)]"
                            : "text-base text-white/25 hover:text-white/60 lg:text-[clamp(1.9rem,2.8vw,2.7rem)]"
                        }`}
                      >
                        {m.label}
                        {on && <ArrowUpRight className="absolute -right-5 top-0 hidden h-5 w-5 text-primary lg:block" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <Link
                to="/explore"
                search={{ category: MOMENTS[active].category }}
                className="group mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-xs font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground md:mt-6 md:text-sm"
              >
                Voir les créateurs
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}