import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Camera,
  GraduationCap,
  Heart,
  PartyPopper,
  Package,
  Shirt,
  Star,
  User,
  Users,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { getFirstName } from "@/lib/booking-rules";
import { getCreator } from "@/lib/creators";
import { Reveal, SectionHead } from "./fx";

/**
 * Un « univers » = un type de projet.
 *   - label    : texte du bouton
 *   - category : valeur envoyée à /explore?category=… (doit exister dans tes filtres)
 *   - pitch    : phrase affichée sous la rangée
 *   - creators : 3 à 4 créateurs mis en avant (id de creators.ts ; `work` = index d'une photo du portfolio)
 */
const UNIVERS: {
  label: string;
  category: string;
  Icon: LucideIcon;
  pitch: string;
  creators: { id: string; work?: number }[];
}[] = [
  { label: "Mariage", category: "Mariage", Icon: Heart, pitch: "Le plus beau jour de votre vie, raconté avec émotion.", creators: [{ id: "3" }, { id: "1" }, { id: "4" }] },
  { label: "Portrait", category: "Portrait", Icon: User, pitch: "Une photo de vous dont vous êtes enfin fier.", creators: [{ id: "1" }, { id: "4" }, { id: "2" }] },
  { label: "Soutenance", category: "Soutenance", Icon: GraduationCap, pitch: "Des années d'efforts, un souvenir à la hauteur.", creators: [{ id: "6" }, { id: "2" }, { id: "5" }] },
  { label: "Famille", category: "Famille", Icon: Users, pitch: "Des rires, des enfants qui grandissent, des instants à garder.", creators: [{ id: "3" }, { id: "6" }, { id: "1" }] },
  { label: "Anniversaire", category: "Événement", Icon: PartyPopper, pitch: "Fêtes, naissances, fiançailles : vous profitez, ils capturent.", creators: [{ id: "2" }, { id: "5" }, { id: "4" }] },
  { label: "Entreprise", category: "Corporate", Icon: Briefcase, pitch: "Équipes, événements, image de marque.", creators: [{ id: "5" }, { id: "6" }, { id: "2" }] },
  { label: "Mode", category: "Mode", Icon: Shirt, pitch: "Lookbooks, shootings, collections.", creators: [{ id: "4" }, { id: "1" }, { id: "3" }] },
  { label: "Produit", category: "Packshot Produit", Icon: Package, pitch: "Vos produits sous leur meilleur jour.", creators: [{ id: "6" }, { id: "3" }, { id: "5" }] },
];

const roleOf = (r: string) => (r === "Photographer" ? "Photographe" : r === "Videographer" ? "Vidéaste" : "Photo & vidéo");

export function CreatorsShowcase() {
  const [active, setActive] = useState(0);
  const u = UNIVERS[active];

  const picks = u.creators.slice(0, 4).flatMap((p) => {
    const c = getCreator(p.id);
    return c ? [{ p, c }] : [];
  });

  return (
    <section id="createurs" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 pb-14 pt-10 md:pb-20 md:pt-14">
      <SectionHead
        eyebrow="Explorer les univers"
        title={"Quel est votre prochain projet\u00A0?"}
        accent="projet"
        lead="Choisissez une occasion et découvrez les créateurs qui l'ont déjà capturée."
      />

      {/* Rangée de catégories (à faire défiler sur mobile) */}
      <Reveal delay={100} className="mt-8 md:mt-12">
        <div role="tablist" aria-label="Type de projet" className="-mx-6 flex snap-x gap-7 overflow-x-auto border-b border-white/10 px-6 [scrollbar-width:none] md:gap-12 lg:mx-0 lg:justify-between lg:px-0 [&::-webkit-scrollbar]:hidden">
          {UNIVERS.map((x, i) => {
            const on = i === active;
            return (
              <button
                key={x.label}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={(e) => {
                  setActive(i);
                  e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
                }}
                className={`group relative flex shrink-0 snap-center flex-col items-center gap-2 pb-4 pt-1 text-sm font-medium transition-colors ${
                  on ? "text-white" : "text-white/45 hover:text-white/80"
                }`}
              >
                <x.Icon className={`h-7 w-7 transition-transform duration-300 ${on ? "scale-110 text-primary" : "group-hover:scale-105"}`} strokeWidth={1.6} />
                {x.label}
                <span className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-primary transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`} />
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Créateurs de la catégorie choisie */}
      <div key={active} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
        <p className="mt-6 text-sm text-muted-foreground md:mt-8 md:text-base">{u.pitch}</p>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-5 lg:grid-cols-4">
          {picks.map(({ p, c }, k) => {
            const photo = p.work !== undefined && c.portfolio[p.work] ? c.portfolio[p.work].src : c.cover;
            return (
              <Link
                key={c.id}
                to="/creator/$id"
                params={{ id: c.id }}
                style={{ animationDelay: `${k * 70}ms` }}
                className="group block animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface md:rounded-3xl">
                  <img
                    src={photo}
                    alt={`${u.label} par ${c.name}`}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                    {c.role === "Videographer" ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                    {roleOf(c.role)}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2.5">
                  <img src={c.avatar} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-display truncate text-base">{getFirstName(c.name)}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-white/80">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        {c.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.city}</div>
                    <div className="mt-1 text-xs text-white/70">
                      dès <b className="font-semibold text-white">{c.price.toLocaleString("fr-FR")} MAD</b>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* 4e case : invitation à voir tous les créateurs de l'univers */}
          {picks.length < 4 && (
            <Link
              to="/explore"
              search={{ category: u.category }}
              className="group flex aspect-[4/5] flex-col justify-between rounded-2xl border border-white/10 bg-surface p-5 transition hover:border-primary/50 md:rounded-3xl"
            >
              <u.Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <div>
                <div className="text-display text-xl leading-tight md:text-2xl">Tous les créateurs {u.label.toLowerCase()}</div>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition group-hover:text-primary">
                  Explorer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center md:mt-10">
        <Link
          to="/explore"
          className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 text-sm font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          Voir tous les créateurs
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}