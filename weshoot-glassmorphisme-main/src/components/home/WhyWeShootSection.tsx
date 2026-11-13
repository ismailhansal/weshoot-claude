import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Check, Lock, Plus, Star } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import avatar1 from "@/assets/avatar-1.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import p5 from "@/assets/portfolio-5.jpg";
import p6 from "@/assets/portfolio-6.jpg";
import { getCreator } from "@/lib/creators";
import { Reveal, SectionHead } from "./fx";

const sophie = getCreator("1");
const review = sophie?.reviewList[0];

const GLASS = "rounded-2xl border border-white/15 bg-black/50 backdrop-blur-md";

function Bg({ src, dim = "bg-black/35", className = "" }: { src: string; dim?: string; className?: string }) {
  return (
    <>
      <img src={src} alt="" loading="lazy" draggable={false} className={`absolute inset-0 h-full w-full object-cover ${className}`} />
      <div className={`absolute inset-0 ${dim}`} />
    </>
  );
}

/* 1 · Séquestre : les fichiers restent « verrouillés » tant que le shoot n'est pas livré */
function VisualEscrow() {
  return (
    <>
      <Bg src={p3} dim="bg-transparent" className="wf-blur" />
      <div className="wf-a absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-black/50 backdrop-blur">
          <Lock className="h-7 w-7" />
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4 h-11">
        <span className={`wf-a absolute inset-0 flex items-center justify-center gap-2 text-[13px] font-semibold ${GLASS}`}>
          <Lock className="h-3.5 w-3.5 text-primary" /> Paiement bloqué chez WeShoot
        </span>
        <span className="wf-b absolute inset-0 flex items-center justify-center gap-2 rounded-2xl bg-white text-[13px] font-semibold text-black">
          <Check className="h-4 w-4" strokeWidth={3} /> Fichiers livrés · créateur payé
        </span>
      </div>
    </>
  );
}

/* 2 · Créateurs vérifiés : carte d'identité du créateur */
function VisualVerified() {
  return (
    <>
      <Bg src={p4} dim="bg-black/55" />
      <div className={`absolute inset-x-4 top-1/2 -translate-y-1/2 p-4 ${GLASS}`}>
        <div className="flex items-center gap-3">
          <img src={avatar1} alt="" loading="lazy" className="h-14 w-14 rounded-full border-2 border-white/80 object-cover" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-base font-semibold">
              Sophie <BadgeCheck className="h-4 w-4 fill-primary text-black" />
            </div>
            <div className="text-xs text-white/60">Photographe · Casablanca</div>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-[13px]">
          {["Identité contrôlée", "Portfolio contrôlé"].map((t) => (
            <li key={t} className="flex items-center gap-2.5 rounded-xl bg-white/[0.07] px-3 py-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* 3 · Avis authentiques : un avis n'existe qu'après un shoot terminé */
function VisualReviews() {
  return (
    <>
      <Bg src={p1} dim="bg-black/55" />
      <div className={`absolute inset-x-4 top-1/2 -translate-y-1/2 p-4 ${GLASS}`}>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, k) => (
            <Star key={k} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>
        <p className="mt-3 text-[15px] leading-snug text-white/95">« {review?.text ?? "Super expérience, qualité top."} »</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          <span className="text-white/70">{review?.name ?? "Anna R."}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 font-medium text-primary">
            <Check className="h-3 w-3" strokeWidth={3} /> Shoot terminé sur WeShoot
          </span>
        </div>
      </div>
    </>
  );
}

/* 4 · Prix final : le ticket de caisse n'a qu'une ligne */
function VisualPrice() {
  const price = sophie ? sophie.price : 3000;
  const fmt = (n: number) => n.toLocaleString("fr-FR");
  return (
    <>
      <Bg src={p6} dim="bg-black/10" />
      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 rotate-[-2deg] rounded-md bg-white p-4 text-black shadow-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50">Votre réservation</div>
        <dl className="mt-3 space-y-1.5 text-[13px]">
          <div className="flex justify-between"><dt>Prix du créateur</dt><dd>{fmt(price)} MAD</dd></div>
          <div className="flex justify-between"><dt>Frais de service client</dt><dd>0 MAD</dd></div>
          <div className="flex justify-between"><dt>Frais cachés</dt><dd>0 MAD</dd></div>
        </dl>
        <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-black/30 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
          <span className="text-display text-2xl text-primary">{fmt(price)} MAD</span>
        </div>
      </div>
    </>
  );
}

/* 5 · Annulation : le compte à rebours de 72 h */
function VisualCancel() {
  return (
    <>
      <Bg src={p2} dim="bg-black/65" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5">
        <div className="relative h-44 w-44">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgb(255 255 255 / .14)" strokeWidth="6" />
            <circle cx="70" cy="70" r="60" fill="none" stroke="#fa5c07" strokeWidth="6" strokeLinecap="round" className="wf-ring" />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-display text-4xl leading-none">72 h</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/60">avant le shoot</div>
            </div>
          </div>
        </div>
        <span className={`px-4 py-2 text-[13px] font-semibold ${GLASS}`}>Annulation 100 % gratuite</span>
      </div>
    </>
  );
}

/* 6 · Livraison : la fenêtre de 3 à 7 jours après le shoot */
function VisualDelivery() {
  const days = Array.from({ length: 8 }, (_, i) => i);
  return (
    <>
      <Bg src={p5} dim="bg-black/60" />
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2">
        <div className="mb-3 flex justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
          <span>Shoot</span>
          <span className="text-primary">Livraison</span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {days.map((d) => (
            <div key={d} className="text-center">
              <div className={`h-12 rounded-md ${d === 0 ? "bg-white" : d >= 3 ? "wf-day bg-primary" : "bg-white/15"}`} style={{ animationDelay: `${d * 0.12}s` }} />
              <div className={`mt-1.5 text-[11px] ${d >= 3 ? "text-primary" : "text-white/50"}`}>{d === 0 ? "J" : `+${d}`}</div>
            </div>
          ))}
        </div>
        <div className={`mt-5 px-4 py-3 text-center text-[13px] font-semibold ${GLASS}`}>Vos fichiers arrivent entre J+3 et J+7</div>
      </div>
    </>
  );
}

const FRAMES: { t: string; tag: string; d: string; v: ReactNode }[] = [
  { t: "Paiement en séquestre", tag: "Fonds bloqués", d: "Votre argent est conservé par WeShoot. Le créateur n'est payé qu'une fois vos fichiers reçus.", v: <VisualEscrow /> },
  { t: "Créateurs vérifiés", tag: "Identité + portfolio", d: "Identité et portfolio sont contrôlés avant la publication de chaque profil.", v: <VisualVerified /> },
  { t: "Avis authentiques", tag: "Après shoot terminé", d: "Seuls les clients qui ont réservé et terminé un shoot sur WeShoot peuvent noter.", v: <VisualReviews /> },
  { t: "Prix final, sans surprise", tag: "0 % commission", d: "Le tarif affiché est le prix final. Aucune commission, aucun frais caché côté client.", v: <VisualPrice /> },
  { t: "Annulation sans stress", tag: "Gratuite jusqu'à 72 h", d: "Gratuite jusqu'à 72 h avant le shoot. Si le créateur annule, vous êtes intégralement remboursé.", v: <VisualCancel /> },
  { t: "Livraison dans les délais", tag: "3 à 7 jours", d: "Le délai est indiqué sur chaque offre avant de réserver : de 3 à 7 jours après le shooting.", v: <VisualDelivery /> },
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Coins de viseur autour d'un visuel. */
function Corners({ size = "h-7 w-7", inset = "left-5 right-5 top-5 bottom-5" }: { size?: string; inset?: string }) {
  const c = `absolute ${size} border-white/90`;
  const [l, r, t, b] = ["left-0", "right-0", "top-0", "bottom-0"];
  return (
    <div className={`pointer-events-none absolute z-10 ${inset}`}>
      <span className={`${c} ${l} ${t} border-l-2 border-t-2`} />
      <span className={`${c} ${r} ${t} border-r-2 border-t-2`} />
      <span className={`${c} ${l} ${b} border-b-2 border-l-2`} />
      <span className={`${c} ${r} ${b} border-b-2 border-r-2`} />
    </div>
  );
}

export function WhyWeShootSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="pourquoi" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHead
        eyebrow="Nos garanties"
        title={"Pourquoi WeShoot\u00A0?"}
        accent="WeShoot"
        lead="Réserver un créateur ne devrait jamais être un pari. Six engagements, du paiement à la livraison."
      />

      <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-16">
        {/* Visuel de la garantie active (desktop) */}
        <Reveal className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface text-white shadow-card">
            <div key={active} className="vf-in absolute inset-0">
              {FRAMES[active].v}
            </div>
            <Corners />
            <div className="pointer-events-none absolute left-0 right-0 top-9 z-10 flex items-center justify-between px-9 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90">
              <span className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 backdrop-blur">
                <i className="vf-rec h-2 w-2 rounded-full bg-primary" /> WeShoot
              </span>
              <span className="rounded-full bg-black/55 px-3 py-1 backdrop-blur">
                {pad(active)} / {pad(FRAMES.length - 1)}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Liste éditoriale */}
        <Reveal delay={100} className="lg:col-span-7">
          <ul className="border-t border-white/10">
            {FRAMES.map((f, i) => {
              const on = i === active;
              return (
                <li key={f.t} className="border-b border-white/10">
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className="group flex w-full items-center gap-4 py-5 text-left md:gap-6 md:py-7"
                  >
                    <span className={`text-display w-9 shrink-0 text-sm transition-colors md:w-12 md:text-base ${on ? "text-primary" : "text-white/35"}`}>
                      {pad(i)}
                    </span>
                    <span
                      className={`text-display min-w-0 flex-1 text-2xl leading-tight transition-colors duration-300 md:text-4xl ${
                        on ? "text-white" : "text-white/45 group-hover:text-white/80"
                      }`}
                    >
                      {f.t}
                    </span>
                    <span
                      className={`hidden shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] transition sm:block ${
                        on ? "border-primary/60 text-primary" : "border-white/10 text-white/35"
                      }`}
                    >
                      {f.tag}
                    </span>
                    <Plus className={`h-5 w-5 shrink-0 transition-transform duration-300 lg:hidden ${on ? "rotate-45 text-primary" : "text-white/40"}`} />
                  </button>

                  <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="pb-7 pl-[3.25rem] md:pl-[4.5rem]">
                        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">{f.d}</p>
                        {/* mobile : le visuel s'ouvre dans l'accordéon */}
                        {on && (
                          <div className="relative mt-5 aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface text-white lg:hidden">
                            <div className="vf-in absolute inset-0">{f.v}</div>
                            <Corners size="h-5 w-5" inset="inset-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            to="/explore"
            className="group mt-8 inline-flex items-center gap-2 text-base font-semibold text-white transition hover:text-primary"
          >
            Trouver mon créateur
            <ArrowUpRight className="h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}