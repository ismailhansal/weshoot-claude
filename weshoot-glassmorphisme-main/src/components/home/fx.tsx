import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

/** Passe à true (une seule fois) quand l'élément entre dans le viewport. */
export function useInView<T extends Element>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen] as const;
}

/** Apparition en fondu + glissement vers le haut, avec délai optionnel. */
export function Reveal({
  as,
  delay = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const Tag = (as ?? "div") as ElementType;
  const [ref, seen] = useInView<HTMLElement>(0.12);
  return (
    <Tag
      ref={ref}
      data-in={seen}
      style={{ "--fx-delay": `${delay}ms` } as CSSProperties}
      className={`fx-up ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Compteur animé (ease-out) déclenché à l'entrée dans le viewport. */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.5);
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);

  const txt = v.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref}>
      {txt}
      {suffix}
    </span>
  );
}

/** Eyebrow + titre + sous-titre communs aux trois sections. */
export function SectionHead({
  eyebrow,
  title,
  accent,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  /** Fragment du titre mis en orange */
  accent?: string;
  lead: string;
  children?: ReactNode;
}) {
  const [before, after] = accent && title.includes(accent) ? title.split(accent) : [title, ""];
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Reveal>
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary" />
            {eyebrow}
          </div>
        </Reveal>
        <Reveal delay={80} as="h2" className="text-display mt-5 text-[clamp(2.25rem,6vw,4.25rem)] leading-[0.98]">
          {before}
          {accent && <span className="text-primary">{accent}</span>}
          {after}
        </Reveal>
        <Reveal delay={160} as="p" className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {lead}
        </Reveal>
      </div>
      {children && (
        <Reveal delay={220} className="shrink-0">
          {children}
        </Reveal>
      )}
    </div>
  );
}
