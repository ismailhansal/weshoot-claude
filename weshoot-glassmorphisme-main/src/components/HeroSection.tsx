import { Fragment, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FormEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ALL_CATEGORIES, categories } from "@/lib/creators";

import photo1 from "@/assets/photo1.png";
import photo2 from "@/assets/photo2.png";
import photo3 from "@/assets/photo3.png";
import photo4 from "@/assets/photo4.jpg";
import photo5 from "@/assets/photo5.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import avatar5 from "@/assets/avatar-5.jpg";

type Category = (typeof categories)[number];
type Kind = "photographe" | "videaste" | "both";

/* ------------------------------------------------------------------ */
/* Slides : photos dans src/assets/hero/ (importées plus haut)         */
/* ------------------------------------------------------------------ */
const SLIDES = [
  { src: photo1, avatar: avatar1, handle: "@yassine.frames", kind: "Photo", city: "Casablanca" },
  { src: photo2, avatar: avatar2, handle: "@salma.lens", kind: "Photo", city: "Marrakech" },
  { src: photo3, avatar: avatar3, handle: "@omar.motion", kind: "Vidéo", city: "Tanger" },
  { src: photo4, avatar: avatar4, handle: "@imane.studio", kind: "Photo", city: "Rabat" },
  { src: photo5, avatar: avatar5, handle: "@reda.visuals", kind: "Vidéo", city: "Essaouira" },
];

const DURATION = 6500; // ms par slide (transmis au CSS via --slide-ms)
const WORDS = ["photographe", "vidéaste"];
const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Essaouira"];
const KINDS: { v: Kind; l: string }[] = [
  { v: "photographe", l: "Photographe" },
  { v: "videaste", l: "Vidéaste" },
  { v: "both", l: "Les deux" },
];
const PRESTATIONS = categories.filter((c) => c !== ALL_CATEGORIES);

const EASE_IN = "cubic-bezier(.16,1,.3,1)";
const EASE_OUT = "cubic-bezier(.7,0,.84,0)";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const pad = (n: number) => String(n).padStart(2, "0");

/* Text reveal : chaque élément glisse depuis un masque, en cascade */
function reveal(els: ArrayLike<HTMLElement>, delay = 0, step = 40, duration = 1000) {
  if (reduced()) return;
  Array.from(els).forEach((el, i) =>
    el.animate(
      [
        { transform: "translateY(115%) rotate(6deg)" },
        { transform: "translateY(0) rotate(0)" },
      ],
      { duration, delay: delay + i * step, easing: EASE_IN, fill: "forwards" },
    ),
  );
}

/* Ligne statique du titre : un masque par mot */
function RevealLine({ text, delay }: { text: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    reveal(ref.current.querySelectorAll<HTMLElement>("[data-rv]"), delay, 80);
  }, [delay]);

  return (
    <span ref={ref} className="block" aria-hidden="true">
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="rv-mask">
            <span data-rv className="rv">
              {w}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/* Mot orange qui alterne : sortie vers le haut, entrée depuis le bas, lettre par lettre */
function RotatingWord({ words, delay }: { words: string[]; delay: number }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  // entrée à chaque nouveau mot (la toute première fois avec un petit délai)
  useEffect(() => {
    if (!ref.current) return;
    reveal(
      ref.current.querySelectorAll<HTMLElement>("[data-ch]"),
      first.current ? delay : 0,
      38,
      first.current ? 1000 : 900,
    );
    first.current = false;
  }, [i, delay]);

  // alternance toutes les 3,6 s
  useEffect(() => {
    const id = setInterval(async () => {
      const chars = ref.current?.querySelectorAll<HTMLElement>("[data-ch]");
      if (chars && !reduced()) {
        Array.from(chars).forEach((el, k) =>
          el.animate(
            [{ transform: "translateY(0)" }, { transform: "translateY(-115%)" }],
            { duration: 550, delay: k * 22, easing: EASE_OUT, fill: "forwards" },
          ),
        );
        await wait(550 + chars.length * 22);
      }
      setI((v) => (v + 1) % words.length);
    }, 3600);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span className="block whitespace-nowrap text-primary" aria-hidden="true">
      <span key={i} ref={ref} className="rv-mask">
        {Array.from(words[i]).map((ch, k) => (
          <span key={k} data-ch className="rv">
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}

const FIELD =
  "flex min-w-0 flex-col justify-center gap-0.5 rounded-[14px] bg-white/[0.07] px-3.5 py-2.5 lg:ml-2 lg:rounded-none lg:border-l lg:border-white/[0.14] lg:bg-transparent lg:px-[22px] lg:py-1.5";
const LABEL = "text-[10px] uppercase tracking-[0.14em] text-white/55";
const CONTROL =
  "w-full min-w-0 truncate bg-transparent text-[15px] font-medium text-white outline-none";

export function HeroSection() {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [kind, setKind] = useState<Kind>("photographe");
  const [ville, setVille] = useState("");
  const [prestation, setPrestation] = useState("");
  const touchX = useRef<number | null>(null);
  const slide = SLIDES[cur];

  const go = (i: number) => setCur((i + SLIDES.length) % SLIDES.length);

  // défilement auto : repart de zéro après chaque changement (auto ou manuel)
  useEffect(() => {
    const t = setTimeout(() => setCur((c) => (c + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [cur]);

  // précharge la slide suivante
  useEffect(() => {
    const img = new Image();
    img.src = SLIDES[(cur + 1) % SLIDES.length].src;
  }, [cur]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const search: { q?: string; category?: Category } = {};
    if (ville.trim()) search.q = ville.trim();
    if (prestation) search.category = prestation as Category;
    navigate({ to: "/explore", search });
  };

  const onTouchStart = (e: ReactTouchEvent) => {
    touchX.current = (e.target as HTMLElement).closest("form")
      ? null
      : e.touches[0].clientX;
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-3 sm:pt-5">
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ "--slide-ms": `${DURATION}ms` } as CSSProperties}
        className="relative left-1/2 isolate h-[calc(100svh_-_92px)] min-h-[600px] w-[calc(100vw_-_1rem)] -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-[#111] min-[861px]:h-[min(780px,calc(100svh_-_108px))] min-[861px]:min-h-[560px] min-[861px]:w-[min(100vw_-_1.5rem,87rem)]"
      >
        {/* Slides */}
        <div>
          {SLIDES.map((s, k) => (
            <div
              key={s.src}
              className={`hero-slide absolute inset-0 transition-opacity duration-[1200ms] ${
                k === cur ? "is-active z-[1] opacity-100" : "z-0 opacity-0"
              }`}
            >
              <img
                src={s.src}
                alt={`Shoot de ${s.handle}`}
                loading={k === 0 ? "eager" : "lazy"}
                draggable={false}
                className="hero-bg absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="hero-shade pointer-events-none absolute inset-0 z-[2]" />

        {/* Crédit du photographe (haut droite) */}
        <Link
          key={cur}
          to="/explore"
          aria-label={`Voir les créateurs, photo de ${slide.handle}`}
          className="hero-credit group absolute right-5 top-5 z-[6] flex max-w-[calc(100%-2.5rem)] flex-row-reverse items-center gap-3 text-right text-white md:right-11 md:top-11"
        >
          <img
            src={slide.avatar}
            alt=""
            className="h-[38px] w-[38px] shrink-0 rounded-full border-[1.5px] border-white/70 bg-[#444] object-cover"
          />
          <span className="min-w-0">
            <small className="block text-[11px] uppercase tracking-[0.14em] text-white/70">
              {slide.kind} · {slide.city}
            </small>
            <b className="block truncate text-[15px] font-semibold">
              <em className="not-italic text-primary">@</em>
              {slide.handle.slice(1)}
            </b>
          </span>
          <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </Link>

        {/* Contenu */}
        <div className="absolute inset-0 z-[5] flex flex-col items-start justify-center px-5 pb-14 pt-[72px] md:px-[clamp(20px,3vw,44px)] md:py-[76px]">
          <h1
            aria-label="Trouvez le photographe qui matche votre vision."
            className="max-w-[12em] text-[clamp(36px,11.5vw,64px)] font-bold leading-[0.98] tracking-[-0.04em] [text-shadow:0_2px_24px_rgb(0_0_0/.25)] md:text-[clamp(38px,6vw,84px)]"
          >
            <RevealLine text="Trouvez le" delay={150} />
            <RotatingWord words={WORDS} delay={420} />
            <RevealLine text="qui matche votre vision." delay={700} />
          </h1>

          {/* Recherche */}
          <form
            onSubmit={onSubmit}
            autoComplete="off"
            className="mt-5 grid w-full max-w-[900px] grid-cols-2 gap-2 rounded-[22px] border border-white/15 bg-[#0e0e0e]/55 p-2.5 backdrop-blur-[22px] backdrop-saturate-[1.4] md:mt-7 lg:grid-cols-[auto_1fr_1fr_auto] lg:items-stretch lg:gap-0 lg:rounded-full lg:p-[7px]"
          >
            <div
              role="group"
              aria-label="Type de créateur"
              className="col-span-2 grid grid-cols-3 gap-1 rounded-full bg-white/[0.07] p-1 lg:col-span-1 lg:flex lg:self-center"
            >
              {KINDS.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  aria-pressed={kind === o.v}
                  onClick={() => setKind(o.v)}
                  className={`whitespace-nowrap rounded-full px-1 py-2.5 text-[13px] font-medium transition lg:px-[15px] ${
                    kind === o.v ? "bg-white text-black" : "text-white/75 hover:text-white"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>

            {/* Bloc Prestation */}
            <label className={FIELD}>
              <span className={LABEL}>Prestation</span>
              <select
                value={prestation}
                onChange={(e) => setPrestation(e.target.value)}
                className={`${CONTROL} cursor-pointer appearance-none`}
              >
                <option value="" className="text-black">
                  Toutes les prestations
                </option>
                {PRESTATIONS.map((c) => (
                  <option key={c} value={c} className="text-black">
                    {c}
                  </option>
                ))}
              </select>
            </label>

            {/* Bloc Ville (transformé en select) */}
            <label className={FIELD}>
              <span className={LABEL}>Ville</span>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className={`${CONTROL} cursor-pointer appearance-none`}
              >
                <option value="" className="text-black">
                  Toutes les villes
                </option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="text-black">
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="col-span-2 flex items-center justify-center gap-2 rounded-[14px] bg-primary px-8 py-[15px] text-[15px] font-semibold text-white transition hover:brightness-110 lg:col-span-1 lg:rounded-full lg:py-0"
            >
              Rechercher
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </form>
        </div>

        {/* Barres de progression */}
        <div className="absolute bottom-5 left-5 z-[6] flex w-[140px] items-center gap-2 md:bottom-11 md:left-auto md:right-11 md:w-[340px]">
          {SLIDES.map((_, k) => (
            <button
              key={k}
              type="button"
              aria-label={`Image ${k + 1}`}
              aria-current={k === cur}
              onClick={() => go(k)}
              className="flex h-[18px] flex-1 items-center"
            >
              <span
                className={`hero-bar relative block h-0.5 w-full overflow-hidden rounded-sm bg-white/30 ${
                  k < cur ? "is-done" : ""
                } ${k === cur ? "is-on" : ""}`}
              />
            </button>
          ))}
          <span className="ml-1.5 hidden whitespace-nowrap text-xs font-semibold tracking-[0.1em] text-white/70 md:block">
            {pad(cur + 1)} / {pad(SLIDES.length)}
          </span>
        </div>
      </div>
    </section>
  );
}