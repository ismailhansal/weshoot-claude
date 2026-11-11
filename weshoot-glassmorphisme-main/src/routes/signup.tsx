import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Camera } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSafeBookingReturnPath } from "@/lib/booking-rules";
import { startDemoSession, useDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    ...(typeof search.redirect === "string" ? { redirect: search.redirect } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Inscription · WeShoot" },
      { name: "description", content: "Créez votre compte WeShoot pour réserver des photographes et vidéastes en quelques clics." },
      { property: "og:title", content: "Inscription · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ClientSignup,
});

const fieldClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground outline-none backdrop-blur transition [color-scheme:dark] placeholder:text-muted-foreground/60 hover:border-white/20 focus:border-primary focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/25";
const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

const moroccanCities = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda",
  "Kénitra", "Tétouan", "Salé", "El Jadida", "Essaouira", "Chefchaouen", "Laâyoune", "Dakhla",
];

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());
// Facultatif, mais s'il est rempli il doit être un numéro marocain
const phoneOk = (v: string) => v.trim() === "" || /^(?:\+212|0)[5-7]\d{8}$/.test(v.replace(/[\s.-]/g, ""));

function ClientSignup() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const session = useDemoSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);

  // Reprend la réservation interrompue (chemin validé), sinon retourne à l'exploration.
  function resume() {
    const path = getSafeBookingReturnPath(redirect);
    const match = path.match(/^\/book\/([A-Za-z0-9_-]+)(?:\?offer=([A-Za-z0-9_-]+))?$/);
    if (match) {
      navigate({
        to: "/book/$id",
        params: { id: match[1] },
        search: match[2] ? { offer: match[2] } : {},
        replace: true,
      });
    } else {
      navigate({ to: "/explore", replace: true });
    }
  }

  useEffect(() => {
    if (session.ready && session.isAuthenticated) resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.ready, session.isAuthenticated]);

  const missing = [
    !firstName.trim() && "prénom",
    !lastName.trim() && "nom",
    !emailOk(email) && "email valide",
    !phoneOk(phone) && "téléphone marocain valide",
    password.length < 8 && "mot de passe (8 caractères min.)",
    confirm !== password && "confirmation identique",
    !terms && "acceptation des conditions",
  ].filter(Boolean) as string[];
  const canSubmit = missing.length === 0;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    // Démo frontend : pas d'API, on ouvre une session puis on reprend le parcours.
    startDemoSession(email, firstName);
    resume();
  }

  const fromBooking = !!redirect && redirect.startsWith("/book/");

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[760px] overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] opacity-60" style={{ background: "radial-gradient(circle, oklch(0.65 0.18 45 / 0.45), transparent 70%)" }} />
        <div className="absolute -left-48 top-72 h-[28rem] w-[28rem] opacity-40" style={{ background: "radial-gradient(circle, oklch(0.55 0.20 30 / 0.4), transparent 70%)" }} />
      </div>

      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-6 py-12 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
            Inscription
          </div>
          <h1 className="text-display mt-4 text-3xl leading-[1.05] md:text-5xl">Crée ton compte</h1>
          <p className="mt-3 text-muted-foreground">
            {fromBooking
              ? "Crée ton compte pour réserver. Tu reprendras ta demande juste après."
              : "Réserve des photographes et des vidéastes en quelques clics."}
          </p>

          <form onSubmit={submit} noValidate className="glass-strong mt-7 space-y-5 rounded-3xl p-5 md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cs-first" className={labelClass}>Prénom</label>
                <input id="cs-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="cs-last" className={labelClass}>Nom</label>
                <input id="cs-last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} />
              </div>
            </div>

            <div>
              <label htmlFor="cs-email" className={labelClass}>Email</label>
              <input id="cs-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@email.com" className={fieldClass} />
              {email.length > 0 && !emailOk(email) && <p className="mt-2 text-xs text-destructive">Adresse email invalide.</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cs-phone" className={labelClass}>Téléphone (optionnel)</label>
                <input id="cs-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212…" className={fieldClass} />
                {!phoneOk(phone) && <p className="mt-2 text-xs text-destructive">Numéro marocain attendu.</p>}
              </div>
              <div>
                <label htmlFor="cs-city" className={labelClass}>Ville (optionnel)</label>
                <select id="cs-city" value={city} onChange={(e) => setCity(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                  <option value="">— Choisir une ville —</option>
                  {moroccanCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cs-pass" className={labelClass}>Mot de passe</label>
              <input id="cs-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} />
              {password.length > 0 && password.length < 8 && <p className="mt-2 text-xs text-destructive">8 caractères minimum.</p>}
            </div>
            <div>
              <label htmlFor="cs-confirm" className={labelClass}>Confirmation</label>
              <input id="cs-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={fieldClass} />
              {confirm.length > 0 && confirm !== password && <p className="mt-2 text-xs text-destructive">Les mots de passe ne correspondent pas.</p>}
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-primary)]"
              />
              J'accepte les conditions d'utilisation et la politique de confidentialité de WeShoot.
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="cursor-pointer inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Créer mon compte <ArrowRight className="h-4 w-4" />
            </button>
            {!canSubmit && (
              <p className="-mt-2 text-center text-xs text-muted-foreground">À compléter : {missing.join(", ")}</p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" search={redirect ? { redirect } : {}} className="text-foreground underline-offset-4 hover:text-primary hover:underline">
              Connexion
            </Link>
          </p>

          <Link
            to="/become-creator"
            className="glass mt-8 flex items-center gap-4 rounded-2xl p-4 transition hover:border-primary/60"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/15">
              <Camera className="h-5 w-5 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Tu es photographe ou vidéaste ?</span>
              <span className="block text-xs text-muted-foreground">Crée ton profil prestataire et reçois des réservations.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}