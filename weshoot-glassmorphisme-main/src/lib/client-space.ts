import { useCallback, useEffect, useMemo, useState } from "react";

import heroImg1 from "@/assets/hero-1.jpg";
import heroImg2 from "@/assets/hero-2.jpg";
import heroImg3 from "@/assets/hero-3.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";
import { useBookings, type Booking } from "@/lib/store";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type OrderStatus = "pending" | "payment" | "confirmed" | "quote" | "delivered" | "validated" | "disputed" | "cancelled";

export type PaymentMethod = "virement" | "card" | "paypal";

export type DocFile = { name: string; size: string };

export type ClientOrder = {
  id: string;
  creatorId: string;
  kind: "reservation" | "devis";
  category: string;
  /** YYYY-MM-DD */
  date: string;
  price: number;
  status: OrderStatus;
  brief: { documents: DocFile[]; message: string };
  quote?: { document: DocFile; message: string };
  /** Paiement de la prestation, séquestré par WeShoot jusqu'à la validation des livrables. */
  payment?: { method: PaymentMethod; paidAt: string; status: "paid" | "verifying" };
  deliverables?: { photos: string[]; deliveredAt: string; validatedAt?: string };
  review?: { rating: number; text: string; date: string };
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  orderId: string;
  from: "client" | "creator";
  text: string;
  /** ISO */
  at: string;
  attachment?: DocFile;
};

type State = {
  orders: ClientOrder[];
  messages: ChatMessage[];
  /** dernière lecture par conversation (ISO) */
  reads: Record<string, string>;
};

export const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-500/15 text-amber-300" },
  confirmed: { label: "Confirmée", className: "bg-emerald-500/15 text-emerald-400" },
  quote: { label: "Devis reçu", className: "bg-sky-500/15 text-sky-300" },
  payment: { label: "À payer", className: "bg-primary/15 text-primary" },
  delivered: { label: "Livrée", className: "bg-primary/15 text-primary" },
  validated: { label: "Validée", className: "bg-emerald-500/15 text-emerald-400" },
  disputed: { label: "Contestée", className: "bg-destructive/15 text-destructive" },
  cancelled: { label: "Annulée", className: "bg-white/10 text-muted-foreground" },
};

/** Délai de validation automatique après livraison. */
export const AUTO_VALIDATION_DAYS = 7;

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;

function isoDay(offsetDays: number) {
  const d = new Date(Date.now() + offsetDays * DAY);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ago(days: number, hour = 10, minute = 0) {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function daysLeftBeforeAutoValidation(deliveredAt: string) {
  const elapsed = Math.floor((Date.now() - new Date(deliveredAt).getTime()) / DAY);
  return Math.max(0, AUTO_VALIDATION_DAYS - elapsed);
}

/* ------------------------------------------------------------------ */
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

function seed(): State {
  const orders: ClientOrder[] = [
    {
      id: "demo-mariage",
      creatorId: "3", // Camille
      kind: "reservation",
      category: "Mariage",
      date: isoDay(24),
      price: 18000,
      status: "confirmed",
      brief: {
        documents: [
          { name: "Brief_initial.pdf", size: "240 Ko" },
          { name: "Inspiration_moodboard.pdf", size: "1,2 Mo" },
        ],
        message: "Merci, hâte de bosser avec vous. Lieu confirmé, on se voit sur place à 9h.",
      },
      createdAt: ago(6),
    },
    {
      id: "demo-portrait",
      creatorId: "1", // Sophie
      kind: "devis",
      category: "Portrait",
      date: isoDay(17),
      price: 3000,
      status: "quote",
      brief: {
        documents: [{ name: "Brief_portrait.pdf", size: "180 Ko" }],
        message: "Bonjour, je cherche une séance portrait en lumière naturelle, plutôt en fin de journée.",
      },
      quote: {
        document: { name: "Devis_sophie.pdf", size: "320 Ko" },
        message: "Voici mon devis ajusté selon vos besoins. Le tarif inclut la prise de vue, la post-prod et la livraison.",
      },
      createdAt: ago(3),
    },
    {
      id: "demo-corporate",
      creatorId: "2", // Marcus
      kind: "reservation",
      category: "Corporate",
      date: isoDay(-6),
      price: 6000,
      status: "delivered",
      brief: {
        documents: [{ name: "Brief_corporate.pdf", size: "210 Ko" }],
        message: "Equipe de 12 personnes, fond neutre et quelques plans en situation de travail.",
      },
      deliverables: {
        photos: [portfolio2, heroImg2, portfolio5, portfolio1, heroImg3, portfolio6],
        deliveredAt: ago(2),
      },
      createdAt: ago(20),
    },
    {
      id: "demo-food",
      creatorId: "6", // Daniel
      kind: "reservation",
      category: "Food",
      date: isoDay(-30),
      price: 3500,
      status: "validated",
      brief: {
        documents: [],
        message: "Shooting de 8 plats pour la nouvelle carte du restaurant.",
      },
      deliverables: {
        photos: [portfolio1, portfolio4, heroImg1, portfolio3],
        deliveredAt: ago(24),
        validatedAt: ago(22),
      },
      createdAt: ago(40),
    },
  ];

  orders.unshift(...testOrders());

  const messages: ChatMessage[] = [
    { id: "m1", orderId: "demo-mariage", from: "creator", text: "Bonjour ! Merci pour votre réservation. J'arrive sur place à 10h.", at: ago(5, 14, 22) },
    { id: "m2", orderId: "demo-mariage", from: "client", text: "Parfait, on vous attend. Le lieu exact a été ajouté au brief.", at: ago(5, 14, 30) },
    { id: "m3", orderId: "demo-mariage", from: "creator", text: "Bien reçu. Une préférence particulière pour la cérémonie ?", at: ago(4, 9, 10) },
    { id: "m4", orderId: "demo-portrait", from: "client", text: "Bonjour, voici mon brief pour le shooting portrait.", at: ago(3, 11, 5) },
    { id: "m5", orderId: "demo-portrait", from: "creator", text: "Merci, je regarde et reviens vers vous.", at: ago(3, 15, 40) },
    { id: "m6", orderId: "demo-corporate", from: "creator", text: "Les livrables sont prêts, dis-moi si tout te convient !", at: ago(2, 18, 2) },
    { id: "m7", orderId: "demo-food", from: "creator", text: "Merci pour ta confiance, ravi d'avoir shooté ta nouvelle carte !", at: ago(22, 12, 15) },
  ];

  // Tout est lu sauf le dernier message de Camille (conversation « Mariage »)
  const reads: Record<string, string> = {
    "demo-mariage": ago(5, 15, 0),
    "demo-portrait": ago(3, 16, 0),
    "demo-corporate": ago(1, 9, 0),
    "demo-food": ago(21, 9, 0),
  };

  return { orders, messages, reads };
}

function bookingToOrder(b: Booking): ClientOrder {
  const isQuote = b.offerName.includes("demande de devis");
  const category = b.offerName.includes("·") ? b.offerName.split("·")[0].trim() : b.serviceType ?? "Prestation";
  return {
    id: b.ref,
    creatorId: b.creatorId,
    kind: isQuote ? "devis" : "reservation",
    category: isQuote ? category : b.serviceType ?? "Prestation",
    date: b.date ?? b.createdAt.slice(0, 10),
    price: b.price,
    status: b.status === "cancelled" ? "cancelled" : "pending",
    brief: { documents: [], message: b.requestDescription || b.notes || "" },
    createdAt: b.createdAt,
  };
}

/* ------------------------------------------------------------------ */
/* Stockage local (démo, sans API)                                     */
/* ------------------------------------------------------------------ */

/** Commandes de test (démo) : rejouables à volonté pour tester l'acceptation d'un devis et le paiement. */
export const TEST_ORDER_STATUS: Record<string, OrderStatus> = { "demo-test-devis": "quote", "demo-test-paiement": "payment" };

function testOrders(): ClientOrder[] {
  const quote = (name: string) => ({
    document: { name, size: "290 Ko" },
    message: "Devis de test : acceptez-le puis réglez la prestation pour essayer le paiement.",
  });
  const brief = { documents: [], message: "Commande de test pour essayer le paiement." };
  return [
    { id: "demo-test-devis", creatorId: "6", kind: "devis", category: "Test · Devis à accepter", date: isoDay(12), price: 4500, status: "quote", brief, quote: quote("Devis_test_daniel.pdf"), createdAt: ago(1) },
    { id: "demo-test-paiement", creatorId: "2", kind: "devis", category: "Test · Paiement direct", date: isoDay(15), price: 2500, status: "payment", brief, quote: quote("Devis_test_marcus.pdf"), createdAt: ago(1) },
  ];
}

const KEY = "weshoot.client-space";
const EVENT = "weshoot:client-space";

function persist(state: State) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

function load(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const stored = JSON.parse(raw) as State;
      // Les commandes de test sont ajoutées aux données déjà enregistrées.
      const missing = testOrders().filter((t) => !stored.orders.some((o) => o.id === t.id));
      if (missing.length) {
        const merged = { ...stored, orders: [...missing, ...stored.orders] };
        persist(merged);
        return merged;
      }
      return stored;
    }
  } catch {
    // données illisibles : on repart de la démo
  }
  const fresh = seed();
  try {
    persist(fresh);
  } catch {
    // stockage indisponible
  }
  return fresh;
}

function mutate(fn: (s: State) => State) {
  const next = fn(load());
  try {
    persist(next);
  } catch {
    // stockage plein : la mise à jour reste uniquement visuelle
  }
  window.dispatchEvent(new Event(EVENT));
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useClientSpace() {
  const { bookings } = useBookings();
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const sync = () => setState(load());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Les demandes envoyées depuis le parcours de réservation apparaissent dans l'espace client.
  useEffect(() => {
    if (!state) return;
    const missing = bookings.filter((b) => !state.orders.some((o) => o.id === b.ref));
    const cancelled = bookings.filter((b) => b.status === "cancelled" && state.orders.some((o) => o.id === b.ref && o.status === "pending"));
    if (!missing.length && !cancelled.length) return;
    // Plusieurs composants utilisent ce hook : on re-filtre sur l'état stocké pour ne jamais dupliquer une commande.
    mutate((s) => ({
      ...s,
      orders: [
        ...bookings.filter((b) => !s.orders.some((o) => o.id === b.ref)).map(bookingToOrder),
        ...s.orders.map((o) => (cancelled.some((b) => b.ref === o.id) ? { ...o, status: "cancelled" as const } : o)),
      ],
    }));
  }, [bookings, state]);

  const orders = state?.orders ?? [];
  const messages = state?.messages ?? [];
  const reads = state?.reads ?? {};

  const lastMessageOf = useCallback(
    (orderId: string) => {
      const list = messages.filter((m) => m.orderId === orderId);
      return list.length ? list.reduce((a, b) => (a.at >= b.at ? a : b)) : undefined;
    },
    [messages],
  );

  const isUnread = useCallback(
    (orderId: string) => {
      const last = lastMessageOf(orderId);
      return !!last && last.from === "creator" && last.at > (reads[orderId] ?? "");
    },
    [lastMessageOf, reads],
  );

  const unreadCount = useMemo(() => orders.filter((o) => isUnread(o.id)).length, [orders, isUnread]);
  /** Actions attendues du client : devis à traiter, paiement à effectuer, livrables à valider. */
  const actionCount = useMemo(() => orders.filter((o) => o.status === "quote" || o.status === "payment" || o.status === "delivered").length, [orders]);

  return {
    ready: state !== null,
    orders,
    messages,
    unreadCount,
    actionCount,
    isUnread,
    lastMessageOf,
    /** Accepter un devis ne confirme pas encore la prestation : il reste à la payer. */
    acceptQuote: (id: string) =>
      mutate((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status: "payment" as const } : o)) })),
    /** Démo : remet une commande de test dans son état de départ pour rejouer le parcours. */
    resetTestOrder: (id: string) =>
      mutate((s) => ({
        ...s,
        orders: s.orders.map((o) => {
          const status = TEST_ORDER_STATUS[o.id];
          if (!status || o.id !== id) return o;
          const { payment: _payment, ...rest } = o;
          return { ...rest, status };
        }),
      })),
    /** Enregistre le paiement (démo, aucun débit réel). Un virement reste « en vérification » côté WeShoot. */
    payOrder: (id: string, method: PaymentMethod) =>
      mutate((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "confirmed" as const,
                payment: { method, paidAt: new Date().toISOString(), status: method === "virement" ? ("verifying" as const) : ("paid" as const) },
              }
            : o,
        ),
      })),
    refuseQuote: (id: string) =>
      mutate((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o)) })),
    validateDelivery: (id: string) =>
      mutate((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === id && o.deliverables
            ? { ...o, status: "validated" as const, deliverables: { ...o.deliverables, validatedAt: new Date().toISOString() } }
            : o,
        ),
      })),
    contestDelivery: (id: string, reason: string) =>
      mutate((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === id ? { ...o, status: "disputed" as const } : o)),
        messages: reason.trim()
          ? [...s.messages, { id: newId("m"), orderId: id, from: "client" as const, text: `Contestation : ${reason.trim()}`, at: new Date().toISOString() }]
          : s.messages,
      })),
    addReview: (id: string, rating: number, text: string) =>
      mutate((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === id ? { ...o, review: { rating, text: text.trim(), date: new Date().toISOString() } } : o)),
      })),
    sendMessage: (orderId: string, text: string, attachment?: DocFile) =>
      mutate((s) => ({
        ...s,
        messages: [...s.messages, { id: newId("m"), orderId, from: "client" as const, text: text.trim(), at: new Date().toISOString(), attachment }],
        reads: { ...s.reads, [orderId]: new Date().toISOString() },
      })),
    markRead: (orderId: string) => {
      const last = lastMessageOf(orderId);
      if (!last || last.at <= (reads[orderId] ?? "")) return;
      mutate((s) => ({ ...s, reads: { ...s.reads, [orderId]: new Date().toISOString() } }));
    },
  };
}

/* ------------------------------------------------------------------ */
/* Téléchargements (démo)                                              */
/* ------------------------------------------------------------------ */

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Télécharge un fichier image servi par l'app. */
export function downloadUrl(url: string, filename: string) {
  triggerDownload(url, filename);
}

/** Télécharge plusieurs fichiers l'un après l'autre (les navigateurs peuvent demander une autorisation). */
export function downloadMany(files: { url: string; filename: string }[]) {
  files.forEach((f, i) => window.setTimeout(() => triggerDownload(f.url, f.filename), i * 350));
}

function ascii(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/[\\()]/g, "\\$&");
}

/** Génère un petit PDF valide pour les documents de démonstration (brief, devis). */
export function downloadDemoPdf(filename: string, lines: string[]) {
  const text = lines.map((l, i) => `${i === 0 ? "" : "0 -22 Td "}(${ascii(l)}) Tj`).join("\n");
  const stream = `BT /F1 14 Tf 60 780 Td\n${text}\nET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
