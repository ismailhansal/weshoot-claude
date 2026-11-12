import * as DialogPrimitive from "@radix-ui/react-dialog";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { PortfolioItem } from "@/lib/creators";

type Props = {
  items: PortfolioItem[];
  /** Index de l'image cliquée ; null = lightbox fermée */
  index: number | null;
  onClose: () => void;
  alt: (i: number) => string;
};

export function PortfolioLightbox({ items, index, onClose, alt }: Props) {
  return (
    <DialogPrimitive.Root open={index !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <DialogPrimitive.Title className="sr-only">Galerie du portfolio</DialogPrimitive.Title>
          {index !== null && <Slides items={items} startIndex={index} onClose={onClose} alt={alt} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Slides({
  items,
  startIndex,
  onClose,
  alt,
}: {
  items: PortfolioItem[];
  startIndex: number;
  onClose: () => void;
  alt: (i: number) => string;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ startIndex, loop: items.length > 1 });
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  useEffect(() => {
    if (!embla) return;
    const sync = () => setCurrent(embla.selectedScrollSnap());
    embla.on("select", sync);
    sync();
    return () => {
      embla.off("select", sync);
    };
  }, [embla]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const item = items[current];

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 h-16 shrink-0">
        <div className="min-w-0 flex items-center gap-3">
          <span className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold">
            {item?.category}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {current + 1} / {items.length}
          </span>
        </div>
        <DialogPrimitive.Close
          aria-label="Fermer"
          className="cursor-pointer h-10 w-10 rounded-xl border border-border bg-surface grid place-items-center hover:bg-surface-elevated transition"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </div>

      {/* Slides */}
      <div className="relative flex-1 min-h-0">
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {items.map((it, i) => (
              <div
                key={`${it.src}-${i}`}
                className="h-full min-w-0 shrink-0 grow-0 basis-full px-4 md:px-20 pb-4 flex items-center justify-center"
                onClick={(e) => e.target === e.currentTarget && onClose()}
              >
                <img
                  src={it.src}
                  alt={alt(i)}
                  draggable={false}
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-card select-none"
                />
              </div>
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="cursor-pointer hidden md:grid absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass place-items-center hover:bg-white/15 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="cursor-pointer hidden md:grid absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass place-items-center hover:bg-white/15 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && items.length <= 12 && (
        <div className="shrink-0 h-12 flex items-center justify-center gap-1.5 pb-[env(safe-area-inset-bottom)]">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Aller à l'image ${i + 1}`}
              className={`cursor-pointer h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      )}
    </>
  );
}