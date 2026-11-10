import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Camera, Check, Clock3, MapPin, Send, Star, Video } from "lucide-react";
import { format as formatDate } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { creators, getCreator } from "@/lib/creators";
import { getBookingSteps, isDateBeforeToday, isProjectDescriptionValid, PROJECT_DESCRIPTION_MAX, getFirstName } from "@/lib/booking-rules";
import { newRef, useBookings } from "@/lib/store";

export const Route = createFileRoute("/book/$id")({
  validateSearch: (search: Record<string, unknown>): { offer?: string } => ({
    ...(typeof search.offer === "string" ? { offer: search.offer } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Réserver un prestataire · WeShoot" },
      { name: "description", content: "Choisissez une offre ou décrivez votre projet photo ou vidéo." },
      { property: "og:title", content: "Réserver un prestataire · WeShoot" },
      { property: "og:description", content: "Choisissez une offre ou envoyez une demande de projet à un prestataire WeShoot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingFlow,
});

type Mode = "offer" | "project";
type ServiceType = "Photo" | "Vidéo" | "Photo & vidéo";
type DateChoice = "fixed" | "flexible";

const projectCategories = [
  "Mariage", "Fiançailles / couple", "Portrait", "Famille", "Grossesse", "Naissance", "Enfants",
  "Mode", "Lookbook", "Éditorial", "Beauté", "Immobilier", "Architecture", "Culinaire / restauration",
  "Produit / e-commerce", "Corporate / entreprise", "Événement", "Soirée / concert", "Musique / clip",
  "Sport", "Voyage", "Automobile", "Publicité", "Réseaux sociaux", "Autre",
];
const durations = ["1 heure", "2 heures", "3 heures", "4 heures", "Demi-journée", "Journée", "Plusieurs jours", "À définir"];
const videoDurations = ["15 secondes", "30 secondes", "1 min", "2 min", "3 min", "5 min", "10 min", "15 min et +"];
const videoFormats = ["Vertical 9:16", "Horizontal 16:9", "Carré 1:1"] as const;
const MAX_VIDEOS = 10;
type VideoSpec = { duration: string; format: string };
const newVideoSpec = (): VideoSpec => ({ duration: "30 secondes", format: "Vertical 9:16" });
const deliveryDelays = ["Pas de préférence", "48 heures", "3 jours", "5 jours", "7 jours", "10 jours", "15 jours", "1 mois"];
const stepTitles = { choice: "Choix", type: "Type", date: "Date & lieu", brief: "Brief", summary: "Récap" } as const;

const fieldClass = "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground outline-none backdrop-blur transition [color-scheme:dark] placeholder:text-muted-foreground/60 hover:border-white/20 focus:border-primary focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/25";
const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";
const tileBase = "relative rounded-2xl border text-left backdrop-blur transition duration-300";
const tileIdle = "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]";
const tileOn = "border-primary/70 bg-primary/10 shadow-glow";
const stepCopy = {
  choice: { title: "Comment veux-tu réserver ?", text: "Choisis un pack du prestataire ou décris ton projet pour recevoir un devis." },
  type: { title: "Photo, vidéo ou les deux ?", text: "Dis-nous ce que tu attends de la prestation." },
  date: { title: "Quand et où ?", text: "Indique la ville, puis une date précise ou une période flexible." },
  brief: { title: "Précise ton brief", text: "Quelques détails pour que le prestataire puisse te répondre juste." },
  summary: { title: "Vérifie ta demande", text: "Relis le récapitulatif, puis envoie-le au prestataire." },
} as const;
function Radio({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-white/25"}`}>
      {on && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}

const quickTimes = ["09:00", "11:00", "14:00", "16:00", "18:00"];

function localToday() {
  return formatDate(new Date(), "yyyy-MM-dd");
}

function parseDay(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function prettyDate(value: string, time: string) {
  const label = parseDay(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return time ? `${label} · ${time}` : label;
}

function BookingFlow() {
  const { id } = Route.useParams();
  const { offer: offerParam } = Route.useSearch();
  const creator = getCreator(id);
  const { addBooking } = useBookings();
  const initialOffer = creator?.offers.find((item) => item.id === offerParam);
  const [mode, setMode] = useState<Mode | null>(initialOffer ? "offer" : null);
  const [offerId, setOfferId] = useState(initialOffer?.id ?? "");
  const [stepIndex, setStepIndex] = useState(0);
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [dateChoice, setDateChoice] = useState<DateChoice>("fixed");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [flexibleDate, setFlexibleDate] = useState("");
  const [city, setCity] = useState(creator?.city ?? "");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("Demi-journée");
  const [delivery, setDelivery] = useState("Pas de préférence");
  const [photoCount, setPhotoCount] = useState("20");
  const [videoCount, setVideoCount] = useState("1");
  const [videoSpecs, setVideoSpecs] = useState<VideoSpec[]>([newVideoSpec()]);
  const [reference, setReference] = useState("");

  if (!creator) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto max-w-md px-6 py-32 text-center">
          <h1 className="text-display text-3xl">Prestataire introuvable</h1>
          <Link to="/explore" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground">Explorer les prestataires</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const hybrid = creator.role === "Photo & Video";
  const serviceLabel: ServiceType = creator.role === "Photographer" ? "Photo" : creator.role === "Videographer" ? "Vidéo" : "Photo & vidéo";
  const activeService: ServiceType = hybrid ? (serviceType || "Photo & vidéo") : serviceLabel;
  const selectedOffer = creator.offers.find((item) => item.id === offerId);
  // Avant le choix, on affiche la longueur du parcours « projet libre » ; elle se resserre si une offre est choisie.
  const steps = getBookingSteps(mode ?? "project", hybrid);
  const step = steps[stepIndex] ?? steps[0];
  const isProject = mode === "project";
  const showVideoFields = isProject && (activeService === "Vidéo" || activeService === "Photo & vidéo");
  const showPhotoFields = isProject && (activeService === "Photo" || activeService === "Photo & vidéo");
  const budgetValue = Number(budget);
  const choiceIsValid = mode === "offer" ? !!selectedOffer : mode === "project" ? isProjectDescriptionValid(description) : false;
  const dateIsValid = dateChoice === "fixed" ? date !== "" && !isDateBeforeToday(date, localToday()) && time !== "" : flexibleDate.trim() !== "";
  const videosValid = !showVideoFields || (Number(videoCount) >= 1 && videoSpecs.length === Number(videoCount));
  const photosValid = !showPhotoFields || Number(photoCount) >= 1;
  const briefIsValid = category !== "" && duration !== "" && photosValid && videosValid;
  const canContinue =
    (step === "choice" && choiceIsValid) ||
    (step === "type" && serviceType !== "") ||
    (step === "date" && city.trim() !== "" && dateIsValid) ||
    (step === "brief" && briefIsValid);

  const amount = selectedOffer ? `${selectedOffer.price} €` : budgetValue > 0 ? `Jusqu'à ${budgetValue} €` : "Sur devis";
  const dateLabel = dateChoice === "fixed" ? (date ? prettyDate(date, time) : "") : flexibleDate;

  const changeVideoCount = (value: string) => {
    setVideoCount(value);
    const n = Math.min(MAX_VIDEOS, Math.floor(Number(value)));
    if (!(n >= 1)) return;
    // Une carte par vidéo ; les nouvelles reprennent les réglages de la précédente.
    setVideoSpecs((current) =>
      n <= current.length ? current.slice(0, n) : [...current, ...Array.from({ length: n - current.length }, () => ({ ...(current[current.length - 1] ?? newVideoSpec()) }))],
    );
  };
  const updateVideo = (index: number, patch: Partial<VideoSpec>) =>
    setVideoSpecs((current) => current.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)));
  const videoSummary = videoSpecs.map((spec, i) => `Vidéo ${i + 1} : ${spec.duration}, ${spec.format}`);

  const chooseMode = (next: Mode) => {
    setMode(next);
    setStepIndex(0);
  };

  const sendRequest = () => {
    if (!mode || !city.trim() || !dateIsValid || (mode === "offer" && !selectedOffer) || (mode === "project" && !(choiceIsValid && briefIsValid))) return;
    const ref = newRef();
    const brief = mode === "project"
      ? [
          `Projet : ${description}`,
          `Catégorie : ${category}`,
          `Prestation : ${activeService}`,
          `Durée : ${duration}`,
          showPhotoFields ? `Photos : ${photoCount}` : "",
          showVideoFields ? `Vidéos : ${videoSpecs.length}\n${videoSummary.join("\n")}` : "",
          delivery !== "Pas de préférence" ? `Livraison souhaitée : ${delivery}` : "",
          budgetValue > 0 ? `Budget maximum : ${budgetValue} €` : "",
        ].filter(Boolean).join("\n")
      : `Offre sélectionnée : ${selectedOffer?.name}`;

    addBooking({
      ref,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      offerName: selectedOffer?.name ?? `${category} · demande de devis`,
      price: selectedOffer?.price ?? Math.max(0, budgetValue || 0),
      day: dateChoice === "fixed" && date ? Number(date.slice(-2)) : 0,
      date: dateChoice === "fixed" ? date : undefined,
      flexibleDate: dateChoice === "flexible" ? flexibleDate : undefined,
      time: dateChoice === "fixed" ? time : "",
      city,
      location,
      notes: brief,
      contactName: "",
      contactEmail: "",
      status: "pending",
      createdAt: new Date().toISOString(),
      serviceType: selectedOffer?.serviceType ?? activeService,
      requestDescription: brief,
    });
    setReference(ref);
  };

  const firstName = getFirstName(creator.name);
  const cities = Array.from(new Set(creators.map((item) => item.city)));
  const ServiceIcon = serviceLabel === "Vidéo" ? Video : Camera;

  const Backdrop = (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[760px] overflow-hidden">
      <img src={creator.cover} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl saturate-150" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.04 0 0 / 0.2), var(--background) 92%)" }} />
      <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] opacity-60" style={{ background: "radial-gradient(circle, oklch(0.65 0.18 45 / 0.45), transparent 70%)" }} />
      <div className="absolute -left-48 top-72 h-[28rem] w-[28rem] opacity-40" style={{ background: "radial-gradient(circle, oklch(0.55 0.20 30 / 0.4), transparent 70%)" }} />
    </div>
  );

  if (reference) {
    return (
      <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
        {Backdrop}
        <div className="relative z-10">
          <SiteHeader />
          <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
            <div className="glass-strong relative overflow-hidden rounded-3xl p-8 md:p-12">
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 opacity-50" style={{ background: "radial-gradient(circle, oklch(0.65 0.18 45 / 0.5), transparent 70%)" }} />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
                  Demande envoyée
                </div>
                <h1 className="text-display mt-6 text-4xl leading-[1.05] md:text-6xl">{firstName} a bien reçu ta demande.</h1>
                <div className="mt-10 flex items-end gap-4 border-t border-white/10 pt-8">
                  <span className="text-display text-6xl leading-none text-primary md:text-7xl">48h</span>
                  <span className="pb-1 text-sm text-muted-foreground">pour obtenir<br />une réponse</span>
                </div>
                <p className="mt-8 text-sm text-muted-foreground">Référence <span className="font-mono text-foreground">{reference}</span></p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/bookings" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">Suivre ma demande <ArrowRight className="h-4 w-4" /></Link>
                  <Link to="/explore" className="glass inline-flex h-12 items-center rounded-xl px-6 text-sm font-semibold transition hover:border-primary/60">Continuer à explorer</Link>
                </div>
              </div>
            </div>
          </main>
          <SiteFooter />
        </div>
      </div>
    );
  }

  const recap = [
    { k: "Demande", v: selectedOffer ? selectedOffer.name : isProject ? "Devis libre" : "" },
    { k: "Prestation", v: mode ? (selectedOffer?.serviceType ?? activeService) : "" },
    { k: "Date", v: dateLabel },
    { k: "Ville", v: city },
    { k: "Montant", v: mode ? amount : "" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      {Backdrop}
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 md:px-6">
          <Link to="/creator/$id" params={{ id: creator.id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Retour au profil
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            {/* Prestataire — visible pendant tout le parcours */}
            <aside className="lg:order-last lg:col-span-4">
              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="glass-strong overflow-hidden rounded-3xl">
                  <div className="relative h-32 lg:h-40">
                    <img src={creator.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 20%, oklch(0.04 0 0 / 0.85))" }} />
                    <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                      <img src={creator.avatar} alt={creator.name} className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-primary/80" />
                      <div className="min-w-0 pb-0.5">
                        <p className="text-display truncate text-xl">{creator.name}</p>
                        <p className="flex items-center gap-1 text-xs text-white/70"><MapPin className="h-3 w-3" />{creator.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1"><ServiceIcon className="h-3 w-3 text-primary" />{serviceLabel}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1"><MapPin className="h-3 w-3 text-primary" />Rayon {creator.radiusKm} km</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1"><Star className="h-3 w-3 fill-primary text-primary" />{creator.rating} <span className="text-muted-foreground">({creator.reviews})</span></span>
                  </div>
                </div>

                {step !== "summary" && (
                  <div className="glass hidden rounded-3xl p-5 lg:block">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Ta demande</p>
                    <dl className="mt-4 space-y-3 text-sm">
                      {recap.map((row) => (
                        <div key={row.k} className="flex items-start justify-between gap-4">
                          <dt className="shrink-0 text-muted-foreground">{row.k}</dt>
                          <dd className={`max-w-[62%] text-right ${row.v ? "font-medium" : "text-muted-foreground/50"}`}>{row.v || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-muted-foreground"><Clock3 className="h-4 w-4 text-primary" />Réponse du prestataire sous 48 heures</p>
                  </div>
                )}
              </div>
            </aside>

            <div className="lg:col-span-8">
              {/* Progression */}
              <ol className="glass flex items-center gap-1 rounded-2xl p-1.5" aria-label="Progression">
                {steps.map((label, index) => {
                  const done = index < stepIndex;
                  const active = index === stepIndex;
                  return (
                    <li key={label} aria-current={active ? "step" : undefined} className={`flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs transition ${active ? "flex-1 bg-white/10 text-foreground sm:flex-none" : done ? "text-foreground/80" : "text-muted-foreground"} ${active ? "" : "sm:flex-1"}`}>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-semibold ${active ? "bg-gradient-accent text-primary-foreground shadow-glow" : done ? "bg-primary text-primary-foreground" : "border border-white/15"}`}>
                        {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <span className={`truncate ${active ? "" : "hidden sm:block"}`}>{stepTitles[label]}</span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
                  Étape {stepIndex + 1}/{steps.length}
                </div>
                <h1 className="text-display mt-4 text-3xl leading-[1.05] md:text-5xl">{stepCopy[step].title}</h1>
                <p className="mt-3 max-w-xl text-muted-foreground">{stepCopy[step].text}</p>
              </div>

              <section className="glass-strong mt-7 rounded-3xl p-5 md:p-8">
                {step === "choice" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {([
                        { key: "offer", opt: "Option A", title: "Choisir une offre", text: "Sélectionne un pack pré-défini par le prestataire." },
                        { key: "project", opt: "Option B", title: "Décrire mon projet", text: "Demande un devis personnalisé." },
                      ] as const).map(({ key, opt, title, text }) => (
                        <button key={key} type="button" aria-pressed={mode === key} onClick={() => chooseMode(key)} className={`${tileBase} flex min-h-[10.5rem] flex-col justify-start p-6 ${mode === key ? tileOn : tileIdle}`}>
                          <span className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{opt}</span>
                            <Radio on={mode === key} />
                          </span>
                          <span className="text-display mt-8 block text-2xl">{title}</span>
                          <span className="mt-1.5 block text-sm text-muted-foreground">{text}</span>
                        </button>
                      ))}
                    </div>

                    {mode === "offer" && (
                      <div className="border-t border-white/10 pt-6">
                        <span className={labelClass}>Choisis un pack</span>
                        <div className="space-y-3">
                          {creator.offers.map((offer) => (
                            <button key={offer.id} type="button" aria-pressed={offerId === offer.id} onClick={() => setOfferId(offer.id)} className={`${tileBase} flex w-full items-center gap-4 p-4 ${offerId === offer.id ? tileOn : tileIdle}`}>
                              <Radio on={offerId === offer.id} />
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">{offer.name}</span>
                                  {offer.popular && <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Populaire</span>}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">{offer.duration}</span>
                              </span>
                              <span className="text-display shrink-0 text-2xl">{offer.price} €</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === "project" && (
                      <div className="space-y-5 border-t border-white/10 pt-6">
                        <div>
                          <label htmlFor="project-description" className={labelClass}>
                            Décris ton projet <span className="normal-case tracking-normal">· {description.length}/{PROJECT_DESCRIPTION_MAX}</span>
                          </label>
                          <textarea id="project-description" maxLength={PROJECT_DESCRIPTION_MAX} value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Ton idée, l'ambiance recherchée, les contraintes…" className={`${fieldClass} h-auto resize-y py-3`} />
                        </div>
                        <div>
                          <label htmlFor="project-budget" className={labelClass}>Budget maximum (€) (optionnel)</label>
                          <input id="project-budget" type="number" inputMode="numeric" min="1" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Ex. 800" className={fieldClass} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === "type" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {([
                      { type: "Photo", text: "Uniquement photos" },
                      { type: "Vidéo", text: "Uniquement vidéos" },
                      { type: "Photo & vidéo", text: "Les deux" },
                    ] as const).map(({ type, text }) => (
                      <button key={type} type="button" aria-pressed={serviceType === type} onClick={() => setServiceType(type)} className={`${tileBase} flex min-h-[8.5rem] flex-col justify-start p-5 ${serviceType === type ? tileOn : tileIdle}`}>
                        <span className="flex justify-end"><Radio on={serviceType === type} /></span>
                        <span className="text-display mt-6 block text-xl">{type}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {step === "date" && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="project-city" className={labelClass}>Ville</label>
                      <input id="project-city" list="booking-cities" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex. Casablanca" className={fieldClass} />
                      <datalist id="booking-cities">{cities.map((item) => <option key={item} value={item} />)}</datalist>
                    </div>

                    <div>
                      <span className={labelClass}>Type de date</span>
                      <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
                        {([["fixed", "Date fixe"], ["flexible", "Date flexible"]] as const).map(([choice, label]) => (
                          <button key={choice} type="button" aria-pressed={dateChoice === choice} onClick={() => setDateChoice(choice)} className={`h-10 rounded-lg px-5 text-sm font-medium transition ${dateChoice === choice ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {dateChoice === "fixed" ? (
                      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
                        <div>
                          <span className={labelClass}>Date</span>
                          <div className="w-fit rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
                            <Calendar
                              mode="single"
                              locale={fr}
                              selected={date ? parseDay(date) : undefined}
                              onSelect={(day) => setDate(day ? formatDate(day, "yyyy-MM-dd") : "")}
                              disabled={{ before: parseDay(localToday()) }}
                              defaultMonth={date ? parseDay(date) : undefined}
                              className="bg-transparent"
                              classNames={{ today: "rounded-md ring-1 ring-primary/60" }}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="project-time" className={labelClass}>Heure</label>
                          <input id="project-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className={fieldClass} />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {quickTimes.map((slot) => (
                              <button key={slot} type="button" onClick={() => setTime(slot)} className={`h-9 rounded-lg border px-3 text-xs font-medium transition ${time === slot ? "border-primary/70 bg-primary/15 text-primary" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/25 hover:text-foreground"}`}>{slot}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="flexible-period" className={labelClass}>Période souhaitée</label>
                        <input id="flexible-period" value={flexibleDate} onChange={(event) => setFlexibleDate(event.target.value)} placeholder="Ex. entre le 10 et le 20 décembre" className={fieldClass} />
                      </div>
                    )}

                    <div>
                      <label htmlFor="exact-location" className={labelClass}>Lieu exact (optionnel)</label>
                      <input id="exact-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Adresse, salle, quartier…" className={fieldClass} />
                    </div>
                  </div>
                )}

                {step === "brief" && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="brief-category" className={labelClass}>Catégorie</label>
                      <select id="brief-category" value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
                        <option value="">—</option>
                        {projectCategories.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="brief-duration" className={labelClass}>Durée</label>
                        <select id="brief-duration" value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClass}>
                          {durations.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="brief-delivery" className={labelClass}>Délai de livraison (optionnel)</label>
                        <select id="brief-delivery" value={delivery} onChange={(event) => setDelivery(event.target.value)} className={fieldClass}>
                          {deliveryDelays.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </div>
                    </div>

                    {showPhotoFields && (
                      <div className="space-y-4 border-t border-white/10 pt-6">
                        <p className="text-sm font-medium">{showVideoFields ? "Photos" : "Détails de la prestation « Photo »"}</p>
                        <div>
                          <label htmlFor="brief-photos" className={labelClass}>Nombre de photos attendues</label>
                          <input id="brief-photos" type="number" min="1" value={photoCount} onChange={(event) => setPhotoCount(event.target.value)} className={`${fieldClass} sm:max-w-[12rem]`} />
                        </div>
                      </div>
                    )}

                    {showVideoFields && (
                      <div className="space-y-4 border-t border-white/10 pt-6">
                        <p className="text-sm font-medium">{showPhotoFields ? "Vidéos" : "Détails de la prestation « Vidéo »"}</p>
                        <div>
                          <label htmlFor="brief-videos" className={labelClass}>Nombre de vidéos</label>
                          <input id="brief-videos" type="number" min="1" max={MAX_VIDEOS} value={videoCount} onChange={(event) => changeVideoCount(event.target.value)} className={`${fieldClass} sm:max-w-[12rem]`} />
                        </div>
                        {videoSpecs.map((spec, index) => (
                          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Vidéo {index + 1} / {videoSpecs.length}</p>
                            <div className="mt-4 grid gap-5 sm:grid-cols-2">
                              <div>
                                <label htmlFor={`video-duration-${index}`} className={labelClass}>Durée</label>
                                <select id={`video-duration-${index}`} value={spec.duration} onChange={(event) => updateVideo(index, { duration: event.target.value })} className={fieldClass}>
                                  {videoDurations.map((item) => <option key={item}>{item}</option>)}
                                </select>
                              </div>
                              <div>
                                <span className={labelClass}>Format</span>
                                <div className="flex flex-wrap gap-2">
                                  {videoFormats.map((format) => (
                                    <button key={format} type="button" aria-pressed={spec.format === format} onClick={() => updateVideo(index, { format })} className={`h-10 rounded-lg border px-3.5 text-sm font-medium transition ${spec.format === format ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/25 hover:text-foreground"}`}>
                                      {format}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {step === "summary" && (
                  <div>
                    <dl className="text-sm">
                      <SummaryRow label="Prestataire" value={`${creator.name} · ${creator.city}`} />
                      <SummaryRow label="Type de prestation" value={selectedOffer?.serviceType ?? activeService} />
                      <SummaryRow label="Demande" value={selectedOffer ? `Offre · ${selectedOffer.name}` : "Devis libre"} />
                      <SummaryRow label="Date" value={dateLabel} />
                      <SummaryRow label="Ville" value={city} />
                      {location && <SummaryRow label="Lieu" value={location} />}
                      {selectedOffer && <SummaryRow label="Livrables" value={selectedOffer.includes.join(" · ")} />}
                      {isProject && <SummaryRow label="Projet" value={description} />}
                      {isProject && <SummaryRow label="Catégorie" value={category} />}
                      {isProject && <SummaryRow label="Durée" value={duration} />}
                      {showPhotoFields && <SummaryRow label="Photos" value={`${photoCount} photos`} />}
                      {showVideoFields && <SummaryRow label="Vidéos" value={videoSummary.map((line) => line.replace(" : ", " · ")).join("\n")} />}
                      {isProject && delivery !== "Pas de préférence" && <SummaryRow label="Livraison souhaitée" value={delivery} />}
                    </dl>
                    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Montant indiqué</p>
                        <p className="text-display mt-1 text-3xl md:text-4xl">{amount}</p>
                      </div>
                      <p className="flex items-center gap-2 text-xs text-muted-foreground sm:max-w-[11rem] sm:text-right"><Clock3 className="h-4 w-4 shrink-0 text-primary" />{firstName} a 48 heures pour répondre</p>
                    </div>
                  </div>
                )}
              </section>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStepIndex((current) => Math.max(0, current - 1))} disabled={stepIndex === 0} className="glass inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium transition hover:border-primary/60 disabled:opacity-30 sm:px-5" aria-label="Précédent">
                  <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Précédent</span>
                </button>
                {step === "summary" ? (
                  <button type="button" onClick={sendRequest} className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-accent px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]">
                    <Send className="h-4 w-4" /> Envoyer au prestataire
                  </button>
                ) : (
                  <button type="button" onClick={() => canContinue && setStepIndex((current) => Math.min(steps.length - 1, current + 1))} disabled={!canContinue} className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-40 disabled:shadow-none">
                    Suivant <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/10 py-3.5 first:pt-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="max-w-[65%] whitespace-pre-line break-words text-right font-medium">{value}</dd>
    </div>
  );
}