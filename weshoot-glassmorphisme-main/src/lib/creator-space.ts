import { useEffect, useState } from "react";

import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar5 from "@/assets/avatar-5.jpg";
import avatar6 from "@/assets/avatar-6.jpg";
import heroImg2 from "@/assets/hero-2.jpg";
import heroImg3 from "@/assets/hero-3.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";
import type { MediaItem } from "@/lib/media";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

export const serviceTypes = ["Photo", "Vidéo", "Photo & Vidéo"] as const;
export type ServiceType = (typeof serviceTypes)[number];

export const allCategories = [
  "Mariage", "Événement", "Corporate", "Portrait", "Famille", "Mode",
  "Food", "Restauration", "Immobilier", "Architecture", "Hôtel/Tourisme", "Automobile",
  "Packshot Produit", "Naissance", "Baby Shower", "Anniversaire", "Gender Reveal", "Baptême",
  "Concert", "Influenceur", "Réseaux Sociaux", "Autre",
];

export const moroccanCities = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda",
  "Kénitra", "Tétouan", "Salé", "El Jadida", "Essaouira", "Chefchaouen", "Laâyoune", "Dakhla",
];

export const gearCategories = ["Boîtier", "Objectif", "Éclairage", "Drone", "Audio", "Stabilisateur", "Autre"] as const;
export type GearCategory = (typeof gearCategories)[number];

export const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/** Délai de validation automatique par le client après livraison. */
export const AUTO_VALIDATION_DAYS = 7;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CreatorProfile = {
  avatar: string;
  cover: string;
  displayName: string;
  handle: string;
  bio: string;
  city: string;
  radiusKm: number;
  serviceType: ServiceType;
  categories: string[];
  basePrice: number;
  website: string;
  externalPortfolio: string;
};

export type CreatorOffer = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: ServiceType;
  price: number;
  duration: string;
  photoCount: string;
  videoCount: string;
  videoDuration: string;
  delivery: string;
  extras: string;
  conditions: string;
};

export type RequestStatus = "pending" | "quote_to_send" | "quote_sent" | "confirmed" | "declined" | "completed";

export type DeliveryFile = { id: string; name: string; size: string; src?: string };

export type CreatorRequest = {
  id: string;
  clientName: string;
  clientAvatar: string;
  kind: "reservation" | "devis";
  category: string;
  /** YYYY-MM-DDTHH:mm */
  datetime: string;
  city: string;
  price: number;
  offerName?: string;
  status: RequestStatus;
  brief: { message: string; docs: { name: string; size: string }[] };
  quote?: { amount: number; message: string; fileName?: string };
  delivery?: { files: DeliveryFile[]; sentAt: string; validatedAt?: string };
};

export type RequestMessage = { id: string; from: "client" | "creator"; text: string; at: string };

export type DayHours = { open: string; close: string; closed: boolean };
export type Absence = { id: string; from: string; to: string; reason: string };

export type GearItem = { id: string; name: string; category: GearCategory; note: string };

export type PortfolioCategory = { id: string; name: string; items: MediaItem[] };

export type Payment = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  clientName: string;
  amount: number;
  status: "received" | "escrow";
  requestId?: string;
};

export type CreatorState = {
  profile: CreatorProfile;
  offers: CreatorOffer[];
  requests: CreatorRequest[];
  messages: Record<string, RequestMessage[]>;
  planning: { blocked: string[]; hours: DayHours[]; absences: Absence[] };
  gear: GearItem[];
  showcase: { mode: "photos" | "video"; photos: MediaItem[]; video: MediaItem | null };
  portfolio: PortfolioCategory[];
  payments: Payment[];
  finance: { ibanLast4: string; ribFile: { name: string; size: string } | null };
};

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");

export function isoDay(offsetDays: number) {
  const d = new Date(Date.now() + offsetDays * DAY);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isoDateTime(offsetDays: number, time: string) {
  return `${isoDay(offsetDays)}T${time}`;
}

function agoIso(days: number, hour = 10, minute = 0) {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function formatDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function formatDateTimeLocal(value: string) {
  const [date, time] = value.split("T");
  return `${formatDay(date)}${time ? ` · ${time}` : ""}`;
}

export function formatClock(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function money(amount: number) {
  return `${amount.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")}`;
}

/* ------------------------------------------------------------------ */
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

function seed(): CreatorState {
  const profile: CreatorProfile = {
    avatar: avatar2,
    cover: "",
    displayName: "Amine",
    handle: "@amine.bnz",
    bio: "Photographe et vidéaste basé à Casablanca. Spécialisé dans les mariages, événements corporate et portraits éditoriaux. 8 ans d'expérience, plus de 200 prestations livrées.",
    city: "Casablanca",
    radiusKm: 50,
    serviceType: "Photo & Vidéo",
    categories: ["Mariage", "Événement", "Portrait"],
    basePrice: 2500,
    website: "instagram.com/amine.bnz",
    externalPortfolio: "https://drive.google.com/amine-portfolio",
  };

  const offers: CreatorOffer[] = [
    {
      id: "offer-decouverte",
      title: "Pack Découverte",
      description: "Séance portrait 1h en extérieur, 20 photos retouchées.",
      category: "Portrait",
      type: "Photo",
      price: 1500,
      duration: "1h",
      photoCount: "20",
      videoCount: "",
      videoDuration: "",
      delivery: "5 jours",
      extras: "",
      conditions: "",
    },
    {
      id: "offer-essentiel",
      title: "Pack Mariage Essentiel",
      description: "Couverture demi-journée, 150 photos retouchées + 1 vidéo highlight 3min.",
      category: "Mariage",
      type: "Photo & Vidéo",
      price: 6500,
      duration: "Demi-journée",
      photoCount: "150",
      videoCount: "1",
      videoDuration: "3 min",
      delivery: "2 semaines",
      extras: "Album photo +1500 MAD\nDrone +800 MAD",
      conditions: "Acompte 30%, annulation J-15.",
    },
    {
      id: "offer-premium",
      title: "Pack Mariage Premium",
      description: "Couverture journée complète, 400 photos + film 8min + drone.",
      category: "Mariage",
      type: "Photo & Vidéo",
      price: 12000,
      duration: "Journée",
      photoCount: "400",
      videoCount: "1",
      videoDuration: "8 min",
      delivery: "3 semaines",
      extras: "Album photo inclus\nDrone inclus",
      conditions: "Acompte 30%, annulation J-15.",
    },
  ];

  const requests: CreatorRequest[] = [
    {
      id: "req-salma",
      clientName: "Salma K.",
      clientAvatar: avatar5,
      kind: "reservation",
      category: "Mariage",
      datetime: isoDateTime(24, "10:00"),
      city: "Casablanca",
      price: 6500,
      offerName: "Pack Mariage Essentiel",
      status: "pending",
      brief: {
        message: "Mariage en petit comité (60 invités) dans un riad. Nous aimerions surtout des photos naturelles, sans trop de poses.",
        docs: [{ name: "Brief_mariage.pdf", size: "240 Ko" }],
      },
    },
    {
      id: "req-youssef",
      clientName: "Youssef A.",
      clientAvatar: avatar6,
      kind: "devis",
      category: "Portrait",
      datetime: isoDateTime(17, "15:00"),
      city: "Casablanca",
      price: 0,
      status: "quote_to_send",
      brief: {
        message: "Séance portrait pour mon profil professionnel et mon site, en intérieur avec lumière naturelle.",
        docs: [],
      },
    },
    {
      id: "req-hicham",
      clientName: "Hicham B.",
      clientAvatar: avatar2,
      kind: "reservation",
      category: "Corporate",
      datetime: isoDateTime(-6, "09:00"),
      city: "Rabat",
      price: 4500,
      offerName: "Couverture événement",
      status: "confirmed",
      brief: {
        message: "Conférence annuelle de l'entreprise : intervenants, public et ambiance générale. Une trentaine de photos suffisent.",
        docs: [{ name: "Programme_conference.pdf", size: "1,1 Mo" }],
      },
    },
    {
      id: "req-nadia",
      clientName: "Nadia E.",
      clientAvatar: avatar1,
      kind: "reservation",
      category: "Portrait",
      datetime: isoDateTime(-35, "16:00"),
      city: "Casablanca",
      price: 3500,
      offerName: "Pack Découverte",
      status: "completed",
      brief: { message: "Portraits en extérieur au coucher du soleil.", docs: [] },
      delivery: {
        files: [
          { id: "df1", name: "portrait_01.jpg", size: "3,2 Mo", src: portfolio4 },
          { id: "df2", name: "portrait_02.jpg", size: "2,9 Mo", src: portfolio1 },
        ],
        sentAt: agoIso(31),
        validatedAt: agoIso(29),
      },
    },
  ];

  const messages: Record<string, RequestMessage[]> = {
    "req-salma": [
      { id: "rm1", from: "client", text: "Bonjour Amine, êtes-vous disponible à cette date pour le mariage ?", at: agoIso(2, 11, 20) },
      { id: "rm2", from: "client", text: "Le brief détaillé est joint à ma demande.", at: agoIso(2, 11, 22) },
    ],
    "req-youssef": [{ id: "rm3", from: "client", text: "Pourriez-vous me faire un devis pour une séance d'1h30 ?", at: agoIso(1, 18, 5) }],
    "req-hicham": [
      { id: "rm4", from: "creator", text: "Merci pour votre confiance, tout est confirmé pour le jour J.", at: agoIso(14, 10, 0) },
      { id: "rm5", from: "client", text: "Parfait, à très vite !", at: agoIso(14, 10, 12) },
    ],
  };

  const planning = {
    blocked: [isoDay(2), isoDay(4), isoDay(5), isoDay(9), isoDay(10), isoDay(15)],
    hours: weekDays.map((_, i) => ({ open: "09:00", close: "18:00", closed: i === 6 })),
    absences: [{ id: "abs1", from: isoDay(60), to: isoDay(74), reason: "Congés d'été" }],
  };

  const gear: GearItem[] = [
    { id: "g1", name: "Canon EOS R5", category: "Boîtier", note: "Boîtier principal" },
    { id: "g2", name: "Sony A7 IV", category: "Boîtier", note: "Second boîtier" },
    { id: "g3", name: "24-70mm f/2.8", category: "Objectif", note: "" },
    { id: "g4", name: "85mm f/1.4", category: "Objectif", note: "Portraits" },
    { id: "g5", name: "70-200mm f/2.8", category: "Objectif", note: "" },
    { id: "g6", name: "DJI Mavic 3", category: "Drone", note: "Autorisation de vol à jour" },
    { id: "g7", name: "Godox AD600", category: "Éclairage", note: "" },
    { id: "g8", name: "Rode Wireless GO II", category: "Audio", note: "" },
    { id: "g9", name: "DJI RS 3", category: "Stabilisateur", note: "" },
  ];

  const media = (src: string, name: string): MediaItem => ({ id: `${name}-${src.length}`, src, kind: "image", name });

  const showcase = {
    mode: "photos" as const,
    photos: [media(portfolio3, "showcase-1"), media(heroImg3, "showcase-2"), media(portfolio6, "showcase-3")],
    video: null,
  };

  const portfolio: PortfolioCategory[] = [
    { id: "cat-mariage", name: "Mariage", items: [media(portfolio3, "mar-1"), media(portfolio6, "mar-2"), media(heroImg3, "mar-3")] },
    { id: "cat-evenement", name: "Événement", items: [media(portfolio5, "evt-1"), media(heroImg2, "evt-2")] },
    { id: "cat-portrait", name: "Portrait", items: [media(portfolio4, "por-1")] },
  ];

  const payments: Payment[] = [
    { id: "p1", date: isoDay(-29), clientName: "Nadia E.", amount: 3500, status: "received", requestId: "req-nadia" },
    { id: "p2", date: isoDay(-62), clientName: "Omar T.", amount: 6000, status: "received" },
    { id: "p3", date: isoDay(-95), clientName: "Ismail R.", amount: 4500, status: "received" },
    { id: "p4", date: isoDay(-120), clientName: "Sara L.", amount: 8000, status: "received" },
    { id: "p5", date: isoDay(-150), clientName: "Anas M.", amount: 5000, status: "received" },
    { id: "p6", date: isoDay(-6), clientName: "Hicham B.", amount: 4500, status: "escrow", requestId: "req-hicham" },
  ];

  return {
    profile,
    offers,
    requests,
    messages,
    planning,
    gear,
    showcase,
    portfolio,
    payments,
    finance: { ibanLast4: "4521", ribFile: null },
  };
}

/* ------------------------------------------------------------------ */
/* Store externe (démo, sans API)                                      */
/* ------------------------------------------------------------------ */

const KEY = "weshoot.creator-space.v1";

let current: CreatorState | null = null;
let storageFull = false;
const listeners = new Set<() => void>();

function readStored(): CreatorState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CreatorState) : null;
  } catch {
    return null;
  }
}

function ensure(): CreatorState {
  if (!current) {
    current = readStored() ?? seed();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      storageFull = true;
    }
  }
  return current;
}

function commit(next: CreatorState) {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    storageFull = false;
  } catch {
    // Quota du navigateur atteint : les changements restent visibles tant que la page est ouverte.
    storageFull = true;
  }
  listeners.forEach((l) => l());
}

/** `enabled` à false : aucune lecture ni création de données (ex. visiteur ou client dans la navbar). */
export function useCreatorSpace(enabled = true) {
  const [ready, setReady] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }
    ensure();
    setReady(true);
    const onChange = () => force((n) => n + 1);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, [enabled]);

  return {
    ready,
    state: ready ? ensure() : null,
    storageFull,
    update: (recipe: (s: CreatorState) => CreatorState) => commit(recipe(ensure())),
  };
}

export type CreatorSpace = {
  state: CreatorState;
  storageFull: boolean;
  update: (recipe: (s: CreatorState) => CreatorState) => void;
};

/** Demandes qui attendent une action du prestataire (acceptation ou envoi de devis). */
export function pendingRequestCount(state: CreatorState) {
  return state.requests.filter((r) => r.status === "pending" || r.status === "quote_to_send").length;
}

export function daysLeftBeforeAutoValidation(sentAt: string) {
  const elapsed = Math.floor((Date.now() - new Date(sentAt).getTime()) / DAY);
  return Math.max(0, AUTO_VALIDATION_DAYS - elapsed);
}
