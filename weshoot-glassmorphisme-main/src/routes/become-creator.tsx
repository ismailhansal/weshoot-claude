import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, FileText, Lock, Send, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { startDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/become-creator")({
  head: () => ({
    meta: [
      { title: "Devenir créateur · WeShoot" },
      { name: "description", content: "Crée ton profil prestataire WeShoot en 5 étapes : compte, profil, vitrine, portfolio et identité." },
      { property: "og:title", content: "Devenir créateur · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Signup,
});

/* ---------- Styles partagés (identiques au parcours de réservation) ---------- */
const fieldClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground outline-none backdrop-blur transition [color-scheme:dark] placeholder:text-muted-foreground/60 hover:border-white/20 focus:border-primary focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/25";
const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";
const pillBase = "cursor-pointer rounded-full border px-4 text-sm font-medium transition whitespace-nowrap";
const pillIdle = "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/25 hover:text-foreground";
const pillOn = "border-primary bg-primary text-primary-foreground";

/* ---------- Données ---------- */
const steps = ["Compte", "Profil", "Proof vitrine", "Portfolio", "Identité"] as const;

const stepText = [
  "Crée tes accès pour gérer ton profil, tes offres et tes réservations.",
  "Présente-toi aux clients : spécialités, zone d'intervention et tarif de base.",
  "Le proof vitrine est ce que les clients verront en premier dans le feed.",
  "1 à 15 médias, format libre. Tu pourras les organiser par catégories depuis ton dashboard.",
  "Une dernière étape pour sécuriser les paiements et vérifier ton profil.",
];

const serviceTypes = ["Photo", "Vidéo", "Les deux"] as const;

const categoryList = [
  "Mariage", "Événement", "Corporate", "Portrait", "Famille", "Mode",
  "Food", "Restauration", "Immobilier", "Architecture", "Hôtel/Tourisme", "Automobile",
  "Packshot Produit", "Naissance", "Baby Shower", "Anniversaire", "Gender Reveal", "Baptême",
  "Concert", "Influenceur", "Réseaux Sociaux", "Autre",
];

const moroccanCities = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda",
  "Kénitra", "Tétouan", "Salé", "El Jadida", "Essaouira", "Chefchaouen", "Laâyoune", "Dakhla",
];

const radiusOptions = [10, 20, 30, 50, 80, 100, 150, 200];

const BIO_MAX = 300;
const SHOWCASE_MAX_PHOTOS = 5;
const PORTFOLIO_MAX = 15;

/* ---------- Fichiers ---------- */
type Upload = { id: string; file: File; url: string; kind: "image" | "video" | "doc" };
type Accept = "image" | "video" | "imageOrVideo" | "doc";

function kindOf(file: File): Upload["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "doc";
}

function matches(file: File, accept: Accept) {
  const k = kindOf(file);
  if (accept === "image") return k === "image";
  if (accept === "video") return k === "video";
  if (accept === "imageOrVideo") return k === "image" || k === "video";
  return k === "image" || file.type === "application/pdf";
}

function acceptAttr(accept: Accept) {
  if (accept === "image") return "image/png,image/jpeg";
  if (accept === "video") return "video/*";
  if (accept === "imageOrVideo") return "image/*,video/*";
  return "image/*,application/pdf";
}

function toUpload(file: File): Upload {
  return { id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`, file, url: URL.createObjectURL(file), kind: kindOf(file) };
}

function readDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const done = () => URL.revokeObjectURL(url);
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => { resolve({ w: v.videoWidth, h: v.videoHeight }); done(); };
      v.onerror = () => { done(); reject(new Error("video")); };
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); done(); };
      img.onerror = () => { done(); reject(new Error("image")); };
      img.src = url;
    }
  });
}

/** Réduit la photo de profil en 160×160 (data URL) pour l'afficher dans la navbar. */
function toAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("canvas")); return; }
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    img.src = url;
  });
}

/** Format vertical strict : 4:5 (0,8) ou 9:16 (0,5625), avec une petite tolérance. */
function isShowcaseRatio(w: number, h: number) {
  if (!w || !h) return false;
  const r = w / h;
  return Math.abs(r - 4 / 5) <= 0.03 || Math.abs(r - 9 / 16) <= 0.03;
}

/* ---------- Validation ---------- */
const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());
const phoneOk = (v: string) => /^(?:\+212|0)[5-7]\d{8}$/.test(v.replace(/[\s.-]/g, ""));
const urlOk = (v: string) => v.trim() === "" || /^https?:\/\/\S+\.\S+/i.test(v.trim());

/* ---------- Composants ---------- */
function Dropzone({
  text, accept, multiple, onFiles, className = "",
}: {
  text: string;
  accept: Accept;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); }
      }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
      className={`cursor-pointer flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 text-center text-sm backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        over ? "border-primary bg-primary/10 text-foreground" : "border-white/20 bg-white/[0.03] text-muted-foreground hover:border-white/40 hover:text-foreground"
      } ${className}`}
    >
      <Upload className="h-5 w-5 text-primary" />
      {text}
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr(accept)}
        multiple={multiple}
        tabIndex={-1}
        className="sr-only"
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
      />
    </div>
  );
}

function Thumbs({ items, onRemove }: { items: Upload[]; onRemove: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <li key={it.id} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          {it.kind === "video" ? (
            <video src={it.url} muted playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={it.url} alt={it.file.name} className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => onRemove(it.id)}
            aria-label={`Retirer ${it.file.name}`}
            className="cursor-pointer absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function DocField({
  label, value, onChange,
}: {
  label: string;
  value: Upload | null;
  onChange: (u: Upload | null) => void;
}) {
  function pick(files: File[]) {
    const file = files.find((f) => matches(f, "doc"));
    if (!file) return;
    if (value) URL.revokeObjectURL(value.url);
    onChange(toUpload(file));
  }
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm">{value.file.name}</span>
          <button
            type="button"
            onClick={() => { URL.revokeObjectURL(value.url); onChange(null); }}
            aria-label={`Retirer ${label}`}
            className="cursor-pointer grid h-8 w-8 place-items-center rounded-full border border-white/15 transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Dropzone text="Uploader le document" accept="doc" onFiles={pick} className="h-24" />
      )}
    </div>
  );
}

/* ---------- Page ---------- */
function Signup() {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Étape 1 — compte
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Étape 2 — profil
  const [avatar, setAvatar] = useState<Upload | null>(null);
  const [serviceType, setServiceType] = useState<(typeof serviceTypes)[number] | "">("");
  const [cats, setCats] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(10);
  const [basePrice, setBasePrice] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");

  // Étape 3 — proof vitrine
  const [showcaseMode, setShowcaseMode] = useState<"photos" | "video">("photos");
  const [showcase, setShowcase] = useState<Upload[]>([]);
  const [showcaseError, setShowcaseError] = useState("");

  // Étape 4 — portfolio
  const [portfolio, setPortfolio] = useState<Upload[]>([]);
  const [portfolioError, setPortfolioError] = useState("");

  // Étape 5 — identité
  const [cinFront, setCinFront] = useState<Upload | null>(null);
  const [cinBack, setCinBack] = useState<Upload | null>(null);
  const [rib, setRib] = useState<Upload | null>(null);

  // Libère les aperçus à la fermeture de la page
  const allUrls = useRef<string[]>([]);
  allUrls.current = [avatar, cinFront, cinBack, rib, ...showcase, ...portfolio].filter(Boolean).map((u) => (u as Upload).url);
  useEffect(() => () => allUrls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  /* --- validité par étape --- */
  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordMismatch = confirm.length > 0 && confirm !== password;
  // Ce qu'il reste à compléter par étape (affiché sous les boutons quand « Suivant » est grisé)
  const missing: string[][] = [
    [
      !firstName.trim() && "prénom",
      !lastName.trim() && "nom",
      !emailOk(email) && "email valide",
      !phoneOk(phone) && "téléphone marocain (+212…)",
      password.length < 8 && "mot de passe (8 caractères min.)",
      confirm !== password && "confirmation identique",
    ].filter(Boolean) as string[],
    [
      !avatar && "photo de profil",
      !serviceType && "type de prestation",
      cats.length === 0 && "au moins une catégorie",
      !city && "ville",
      !(Number(basePrice) > 0) && "tarif de base",
      !bio.trim() && "bio",
      !urlOk(website) && "lien http(s) valide",
    ].filter(Boolean) as string[],
    [showcase.length < 1 && "au moins un média vitrine"].filter(Boolean) as string[],
    [portfolio.length < 1 && "au moins un média"].filter(Boolean) as string[],
    [!cinFront && "CIN recto", !cinBack && "CIN verso", !rib && "RIB"].filter(Boolean) as string[],
  ];
  const canContinue = missing[stepIndex].length === 0;
  const isLast = stepIndex === steps.length - 1;

  /* --- handlers fichiers --- */
  function pickAvatar(files: File[]) {
    const file = files.find((f) => matches(f, "image"));
    if (!file) return;
    if (avatar) URL.revokeObjectURL(avatar.url);
    setAvatar(toUpload(file));
  }

  async function addShowcase(files: File[]) {
    setShowcaseError("");
    const kind: Accept = showcaseMode === "photos" ? "image" : "video";
    const max = showcaseMode === "photos" ? SHOWCASE_MAX_PHOTOS : 1;
    const candidates = files.filter((f) => matches(f, kind));
    if (candidates.length === 0) {
      setShowcaseError(showcaseMode === "photos" ? "Ajoute des images (PNG ou JPG)." : "Ajoute un fichier vidéo.");
      return;
    }
    const accepted: Upload[] = [];
    let rejected = 0;
    for (const file of candidates) {
      if (showcase.length + accepted.length >= max) break;
      try {
        const { w, h } = await readDimensions(file);
        if (isShowcaseRatio(w, h)) accepted.push(toUpload(file));
        else rejected += 1;
      } catch {
        rejected += 1;
      }
    }
    if (rejected > 0) setShowcaseError("Format refusé : le proof vitrine doit être vertical, en 4:5 ou 9:16.");
    else if (showcase.length + accepted.length >= max && candidates.length > accepted.length) setShowcaseError(`Maximum atteint (${max}).`);
    if (accepted.length) setShowcase((prev) => [...prev, ...accepted]);
  }

  function addPortfolio(files: File[]) {
    setPortfolioError("");
    const candidates = files.filter((f) => matches(f, "imageOrVideo"));
    if (candidates.length === 0) {
      setPortfolioError("Ajoute des images ou des vidéos.");
      return;
    }
    const room = PORTFOLIO_MAX - portfolio.length;
    if (candidates.length > room) setPortfolioError(`Maximum ${PORTFOLIO_MAX} médias.`);
    setPortfolio((prev) => [...prev, ...candidates.slice(0, Math.max(0, room)).map(toUpload)]);
  }

  function removeFrom(setter: React.Dispatch<React.SetStateAction<Upload[]>>, id: string) {
    setter((prev) => {
      const gone = prev.find((u) => u.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((u) => u.id !== id);
    });
  }

  function switchShowcaseMode(mode: "photos" | "video") {
    if (mode === showcaseMode) return;
    showcase.forEach((u) => URL.revokeObjectURL(u.url));
    setShowcase([]);
    setShowcaseError("");
    setShowcaseMode(mode);
  }

  function toggleCategory(cat: string) {
    setCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function next() {
    if (!canContinue) return;
    if (isLast) {
      // Démo frontend : pas d'API, on ouvre une session et on affiche la confirmation.
      let avatarUrl: string | undefined;
      try {
        if (avatar) avatarUrl = await toAvatarDataUrl(avatar.file);
      } catch {
        avatarUrl = undefined;
      }
      startDemoSession(email, firstName, avatarUrl);
      setSubmitted(true);
      window.scrollTo({ top: 0 });
      return;
    }
    setStepIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const Backdrop = (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[760px] overflow-hidden">
      <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] opacity-60" style={{ background: "radial-gradient(circle, oklch(0.65 0.18 45 / 0.45), transparent 70%)" }} />
      <div className="absolute -left-48 top-72 h-[28rem] w-[28rem] opacity-40" style={{ background: "radial-gradient(circle, oklch(0.55 0.20 30 / 0.4), transparent 70%)" }} />
    </div>
  );

  /* --- confirmation --- */
  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
        {Backdrop}
        <div className="relative z-10">
          <SiteHeader />
          <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
            <div className="glass-strong rounded-3xl p-8 text-center md:p-12">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <Check className="h-7 w-7" strokeWidth={3} />
              </div>
              <h1 className="text-display mt-6 text-3xl md:text-4xl">Dossier envoyé</h1>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Merci {firstName.trim()} ! Notre équipe vérifie ton profil sous 48h. Tu recevras la réponse sur {email.trim()}.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
                  Retour à l'accueil
                </Link>
                <Link to="/explore" className="glass inline-flex h-12 items-center justify-center rounded-xl px-7 text-sm font-medium transition hover:border-primary/60">
                  Découvrir les créateurs
                </Link>
              </div>
            </div>
          </main>
          <SiteFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      {Backdrop}
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-10 md:py-16">
          {/* Progression */}
          <ol className="glass flex items-center gap-1 rounded-2xl p-1.5" aria-label="Progression">
            {steps.map((label, index) => {
              const done = index < stepIndex;
              const active = index === stepIndex;
              return (
                <li
                  key={label}
                  aria-current={active ? "step" : undefined}
                  className={`flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs transition ${
                    active ? "flex-1 bg-white/10 text-foreground sm:flex-none" : done ? "text-foreground/80" : "text-muted-foreground"
                  } ${active ? "" : "sm:flex-1"}`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-semibold ${
                      active ? "bg-gradient-accent text-primary-foreground shadow-glow" : done ? "bg-primary text-primary-foreground" : "border border-white/15"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className={`truncate ${active ? "" : "hidden sm:block"}`}>{label}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-8">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
              Prestataire · Étape {stepIndex + 1}/{steps.length}
            </div>
            <h1 className="text-display mt-4 text-3xl leading-[1.05] md:text-5xl">Crée ton profil</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">{stepText[stepIndex]}</p>
          </div>

          <section className="glass-strong mt-7 rounded-3xl p-5 md:p-8">
            {/* 1 — Compte */}
            {stepIndex === 0 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="su-first" className={labelClass}>Prénom</label>
                    <input id="su-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="su-last" className={labelClass}>Nom</label>
                    <input id="su-last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="su-email" className={labelClass}>Email</label>
                  <input id="su-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@email.com" className={fieldClass} />
                  {email.length > 0 && !emailOk(email) && <p className="mt-2 text-xs text-destructive">Adresse email invalide.</p>}
                </div>
                <div>
                  <label htmlFor="su-phone" className={labelClass}>Téléphone</label>
                  <input id="su-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212…" className={fieldClass} />
                  {phone.length > 0 && !phoneOk(phone) && <p className="mt-2 text-xs text-destructive">Numéro marocain attendu (ex. +212 6 12 34 56 78).</p>}
                </div>
                <div>
                  <label htmlFor="su-pass" className={labelClass}>Mot de passe</label>
                  <input id="su-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} />
                  {passwordTooShort && <p className="mt-2 text-xs text-destructive">8 caractères minimum.</p>}
                </div>
                <div>
                  <label htmlFor="su-confirm" className={labelClass}>Confirmation</label>
                  <input id="su-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={fieldClass} />
                  {passwordMismatch && <p className="mt-2 text-xs text-destructive">Les mots de passe ne correspondent pas.</p>}
                </div>
              </div>
            )}

            {/* 2 — Profil */}
            {stepIndex === 1 && (
              <div className="space-y-7">
                <div>
                  <span className={labelClass}>Photo de profil</span>
                  {avatar ? (
                    <div className="flex items-center gap-4">
                      <img src={avatar.url} alt="Aperçu de ta photo de profil" className="h-20 w-16 rounded-2xl border border-white/15 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{avatar.file.name}</p>
                        <button
                          type="button"
                          onClick={() => { URL.revokeObjectURL(avatar.url); setAvatar(null); }}
                          className="cursor-pointer mt-1 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                          Changer la photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Dropzone text="Cliquer pour uploader (PNG/JPG)" accept="image" onFiles={pickAvatar} className="h-28" />
                  )}
                </div>

                <div>
                  <span className={labelClass}>Type de prestation</span>
                  <div className="flex flex-wrap gap-2">
                    {serviceTypes.map((t) => (
                      <button key={t} type="button" aria-pressed={serviceType === t} onClick={() => setServiceType(t)} className={`${pillBase} h-10 ${serviceType === t ? pillOn : pillIdle}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Catégories</span>
                  <div className="flex flex-wrap gap-2">
                    {categoryList.map((cat) => {
                      const on = cats.includes(cat);
                      return (
                        <button key={cat} type="button" aria-pressed={on} onClick={() => toggleCategory(cat)} className={`${pillBase} h-9 ${on ? pillOn : pillIdle}`}>
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="su-city" className={labelClass}>Ville</label>
                    <select id="su-city" value={city} onChange={(e) => setCity(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                      <option value="">— Choisir une ville —</option>
                      {moroccanCities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="su-radius" className={labelClass}>Rayon</label>
                    <select id="su-radius" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className={`${fieldClass} cursor-pointer`}>
                      {radiusOptions.map((r) => <option key={r} value={r}>{r} km</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="su-price" className={labelClass}>Tarif de base (MAD)</label>
                  <input id="su-price" type="number" inputMode="numeric" min="1" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="Ex. 3000" className={fieldClass} />
                </div>

                <div>
                  <label htmlFor="su-bio" className={labelClass}>Bio ({bio.length}/{BIO_MAX})</label>
                  <textarea
                    id="su-bio"
                    rows={4}
                    maxLength={BIO_MAX}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ton style, ton approche, ce qui te distingue…"
                    className={`${fieldClass} h-auto resize-y py-3`}
                  />
                </div>

                <div>
                  <label htmlFor="su-site" className={labelClass}>Site / portfolio externe (optionnel)</label>
                  <input id="su-site" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={fieldClass} />
                  {!urlOk(website) && <p className="mt-2 text-xs text-destructive">Le lien doit commencer par http:// ou https://.</p>}
                </div>
              </div>
            )}

            {/* 3 — Proof vitrine */}
            {stepIndex === 2 && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Format vertical strict <span className="font-medium text-primary">4:5 ou 9:16</span>.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" aria-pressed={showcaseMode === "photos"} onClick={() => switchShowcaseMode("photos")} className={`${pillBase} h-10 ${showcaseMode === "photos" ? pillOn : pillIdle}`}>
                    1 à 5 photos
                  </button>
                  <button type="button" aria-pressed={showcaseMode === "video"} onClick={() => switchShowcaseMode("video")} className={`${pillBase} h-10 ${showcaseMode === "video" ? pillOn : pillIdle}`}>
                    1 vidéo
                  </button>
                </div>
                <Dropzone
                  text="Glisser-déposer ou cliquer pour uploader"
                  accept={showcaseMode === "photos" ? "image" : "video"}
                  multiple={showcaseMode === "photos"}
                  onFiles={addShowcase}
                  className="mt-5 h-32"
                />
                {showcaseError && <p role="alert" className="mt-3 text-sm text-destructive">{showcaseError}</p>}
                <Thumbs items={showcase} onRemove={(id) => removeFrom(setShowcase, id)} />
                <p className="mt-4 text-xs text-muted-foreground">
                  {showcase.length}/{showcaseMode === "photos" ? SHOWCASE_MAX_PHOTOS : 1} ajouté{showcase.length > 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* 4 — Portfolio */}
            {stepIndex === 3 && (
              <div>
                <Dropzone text="Glisser-déposer ou cliquer" accept="imageOrVideo" multiple onFiles={addPortfolio} className="h-32" />
                {portfolioError && <p role="alert" className="mt-3 text-sm text-destructive">{portfolioError}</p>}
                <Thumbs items={portfolio} onRemove={(id) => removeFrom(setPortfolio, id)} />
                <p className="mt-4 text-xs text-muted-foreground">{portfolio.length}/{PORTFOLIO_MAX} médias</p>
              </div>
            )}

            {/* 5 — Identité */}
            {stepIndex === 4 && (
              <div className="space-y-6">
                <p className="flex items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                  <Lock className="h-4 w-4 shrink-0" /> Ces documents sont confidentiels et ne seront jamais affichés publiquement.
                </p>
                <DocField label="CIN (recto)" value={cinFront} onChange={setCinFront} />
                <DocField label="CIN (verso)" value={cinBack} onChange={setCinBack} />
                <DocField label="RIB bancaire" value={rib} onChange={setRib} />
              </div>
            )}
          </section>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={stepIndex === 0}
              aria-label="Précédent"
              className="glass cursor-pointer inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
            >
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Précédent</span>
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="cursor-pointer inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:px-7"
            >
              {isLast ? (<><Send className="h-4 w-4" /> Soumettre mon dossier</>) : (<>Suivant <ArrowRight className="h-4 w-4" /></>)}
            </button>
          </div>
          {!canContinue && (
            <p className="mt-3 text-right text-xs text-muted-foreground">
              À compléter : {missing[stepIndex].join(", ")}
            </p>
          )}
          <p className="mt-5 text-center text-xs text-muted-foreground/70">
            Les offres se gèrent depuis ton dashboard après création du compte.
          </p>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
