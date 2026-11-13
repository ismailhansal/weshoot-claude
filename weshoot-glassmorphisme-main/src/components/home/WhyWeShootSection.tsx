import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, CalendarCheck, Check, Lock, ShieldCheck, Star, Undo2, User, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { creators } from "@/lib/creators";
import { CountUp, Reveal, SectionHead } from "./fx";

const avgRating = creators.reduce((s, c) => s + c.rating, 0) / creators.length;
const totalShoots = Math.floor(creators.reduce((s, c) => s + c.shoots, 0) / 100) * 100;
const cityCount = new Set(creators.map((c) => c.city)).size;

function Tile({
  className = "",
  delay = 0,
  icon,
  title,
  children,
}: {
  className?: string;
  delay?: number;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} className={`bento group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface p-6 transition duration-500 hover:border-primary/40 md:p-8 ${className}`}>
      <div className="bento-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">{icon}</span>
        <h3 className="text-display mt-5 text-2xl leading-tight md:text-[1.7rem]">{title}</h3>
        {children}
      </div>
    </Reveal>
  );
}

const P = ({ children }: { children: ReactNode }) => (
  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-[15px]">{children}</p>
);

export function WhyWeShootSection() {
  return (
    <section id="pourquoi" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHead
        eyebrow="Nos garanties"
        title={"Pourquoi WeShoot\u00A0?"}
        accent="WeShoot"
        lead="Réserver un créateur ne devrait jamais être un pari. Chaque détail de la plateforme est pensé pour que vous shootiez l'esprit tranquille."
      />

      <div className="mt-14 grid gap-4 md:mt-20 md:gap-5 lg:grid-cols-12">
        {/* Séquestre : la garantie phare */}
        <Tile
          className="lg:col-span-7 lg:row-span-2"
          icon={<Lock className="h-5 w-5" />}
          title="Votre argent est en sécurité jusqu'à la livraison"
        >
          <P>
            Votre paiement est conservé en séquestre par WeShoot et n'est versé au créateur qu'une fois vos photos et vidéos reçues.
          </P>

          <div className="relative mt-8 flex flex-1 items-center lg:mt-4">
            <div className="escrow w-full rounded-3xl border border-white/10 bg-black/40 p-5 md:p-8">
              <div className="relative flex items-center justify-between gap-2">
                {/* rail */}
                <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-[1.4rem] border-t border-dashed border-white/20" />
                <div className="escrow-dot absolute left-[12%] top-1/2 h-2.5 w-2.5 -translate-y-[calc(1.4rem+5px)] rounded-full bg-primary shadow-[0_0_18px_4px_rgb(250_92_7/0.7)]" />

                {[
                  { i: <User className="h-6 w-6" />, l: "Vous", s: "Paiement en ligne" },
                  { i: <ShieldCheck className="h-7 w-7" />, l: "WeShoot", s: "Fonds bloqués", hot: true },
                  { i: <Wallet className="h-6 w-6" />, l: "Créateur", s: "Versé à la livraison" },
                ].map((n) => (
                  <div key={n.l} className="relative z-[1] flex w-1/3 flex-col items-center text-center">
                    <span
                      className={`grid place-items-center rounded-full border ${
                        n.hot
                          ? "escrow-core h-[4.5rem] w-[4.5rem] border-primary bg-primary text-primary-foreground"
                          : "h-14 w-14 border-white/15 bg-surface-elevated text-white/80"
                      }`}
                    >
                      {n.i}
                    </span>
                    <b className="mt-3 text-sm font-semibold">{n.l}</b>
                    <small className="mt-0.5 text-[11px] leading-tight text-white/50">{n.s}</small>
                  </div>
                ))}
              </div>

              <ul className="mt-8 grid gap-2 border-t border-white/10 pt-6 text-[13px] sm:grid-cols-3">
                {[
                  { l: "Paiement reçu", s: "Fonds bloqués", done: true },
                  { l: "Shooting réalisé", s: "Rien n'est versé", done: true },
                  { l: "Fichiers livrés", s: "Fonds libérés", done: false },
                ].map((x) => (
                  <li key={x.l} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${x.done ? "bg-primary text-primary-foreground" : "border border-primary text-primary"}`}>
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate font-medium">{x.l}</b>
                      <small className="text-[11px] text-white/50">{x.s}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Tile>

        <Tile
          className="lg:col-span-5"
          delay={80}
          icon={<BadgeCheck className="h-5 w-5" />}
          title="Des créateurs vérifiés"
        >
          <P>Identité et portfolio contrôlés avant la publication de chaque profil.</P>
          <div className="mt-6 flex items-center">
            {creators.slice(0, 6).map((c, i) => (
              <img
                key={c.id}
                src={c.avatar}
                alt=""
                loading="lazy"
                style={{ marginLeft: i ? "-0.7rem" : 0 }}
                className="h-11 w-11 rounded-full border-2 border-surface object-cover"
              />
            ))}
            <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
              <Check className="h-3 w-3" strokeWidth={3} /> Vérifiés
            </span>
          </div>
        </Tile>

        <Tile
          className="lg:col-span-5"
          delay={160}
          icon={<Star className="h-5 w-5" />}
          title="Des avis authentiques"
        >
          <P>Seuls les clients ayant réservé et terminé un shoot sur WeShoot peuvent laisser un avis.</P>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-display text-5xl leading-none">{avgRating.toFixed(1)}</span>
            <div className="pb-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <div className="mt-1 text-[11px] text-white/50">note moyenne de nos créateurs</div>
            </div>
          </div>
        </Tile>

        <Tile className="lg:col-span-4" delay={0} icon={<Wallet className="h-5 w-5" />} title="Le prix affiché est le prix final">
          <P>Chaque créateur fixe librement ses tarifs. Aucune commission, aucun frais caché côté client.</P>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-display text-6xl leading-none text-primary">0 %</span>
            <span className="text-sm text-white/55">de commission client</span>
          </div>
        </Tile>

        <Tile className="lg:col-span-4" delay={100} icon={<Undo2 className="h-5 w-5" />} title="Annulation sans stress">
          <P>Gratuite jusqu'à 72 h avant le shoot. Si le créateur annule, vous êtes intégralement remboursé.</P>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-display text-6xl leading-none text-primary">72 h</span>
            <span className="text-sm text-white/55">d'annulation gratuite</span>
          </div>
        </Tile>

        <Tile className="lg:col-span-4" delay={200} icon={<CalendarCheck className="h-5 w-5" />} title="Livraison dans les délais">
          <P>Le délai est indiqué sur chaque offre, avant même de réserver. Vous savez quand vos fichiers arrivent.</P>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-display text-6xl leading-none text-primary">3–7 j</span>
            <span className="text-sm text-white/55">après le shooting</span>
          </div>
        </Tile>
      </div>

      {/* Chiffres */}
      <Reveal className="mt-5 grid grid-cols-2 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] md:mt-6 md:grid-cols-4">
        {[
          { v: creators.length, s: "", l: "créateurs vérifiés", d: 0 },
          { v: totalShoots, s: "+", l: "shoots réalisés", d: 0 },
          { v: avgRating, s: " / 5", l: "note moyenne", d: 1 },
          { v: cityCount, s: "", l: "villes couvertes", d: 0 },
        ].map((x, i) => (
          <div
            key={x.l}
            className={`px-6 py-7 text-center md:py-9 ${i % 2 === 1 ? "border-l" : ""} ${i > 0 ? "md:border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} border-white/10`}
          >
            <div className="text-display text-4xl md:text-5xl">
              <CountUp to={x.v} decimals={x.d} suffix={x.s} />
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.16em] text-white/50">{x.l}</div>
          </div>
        ))}
      </Reveal>

      {/* CTA */}
      <Reveal className="mt-5 md:mt-6">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/30 bg-gradient-accent p-8 text-primary-foreground md:p-12">
          <div aria-hidden className="cta-grain pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="text-display text-3xl text-white md:text-5xl">Prêt à trouver votre créateur ?</h3>
              <p className="mt-3 text-sm text-white/85 md:text-base">Parcourez les portfolios et réservez en quelques minutes.</p>
            </div>
            <Link
              to="/explore"
              className="group inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-black px-8 text-base font-semibold text-white transition hover:scale-[1.03]"
            >
              Trouver mon créateur
              <ArrowUpRight className="h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}