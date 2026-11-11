import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSafeBookingReturnPath } from "@/lib/booking-rules";
import { getDemoProfile, startDemoSession, useDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    ...(typeof search.redirect === "string" ? { redirect: search.redirect } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Connexion · WeShoot" },
      { name: "description", content: "Connectez-vous à WeShoot pour réserver un photographe ou un vidéaste." },
      { property: "og:title", content: "Connexion · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Login,
});

const fieldClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground outline-none backdrop-blur transition [color-scheme:dark] placeholder:text-muted-foreground/60 hover:border-white/20 focus:border-primary focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/25";
const labelClass = "mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const session = useDemoSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Entre une adresse email valide.");
      return;
    }
    if (password.length < 1) {
      setError("Entre ton mot de passe.");
      return;
    }
    setError("");
    // Retrouve prénom et avatar déjà connus pour cet email (inscription précédente), sinon déduit de l'email.
    const profile = getDemoProfile(email);
    startDemoSession(email, profile?.name, profile?.avatar);
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
        <main className="mx-auto max-w-md px-6 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
            Connexion
          </div>
          <h1 className="text-display mt-4 text-3xl leading-[1.05] md:text-5xl">Content de te revoir</h1>
          <p className="mt-3 text-muted-foreground">
            {fromBooking
              ? "La réservation nécessite une connexion. Tu reprendras ta demande juste après."
              : "Connecte-toi pour réserver et suivre tes demandes."}
          </p>

          <form onSubmit={submit} className="glass-strong mt-7 space-y-5 rounded-3xl p-5 md:p-8" noValidate>
            <div>
              <label htmlFor="login-email" className={labelClass}>Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@email.com"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="login-password" className={labelClass}>Mot de passe</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="cursor-pointer inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              Se connecter <ArrowRight className="h-4 w-4" />
            </button>
            <p className="flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" /> Mode démo : aucun compte réel n'est créé.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/signup" search={redirect ? { redirect } : {}} className="text-foreground underline-offset-4 hover:text-primary hover:underline">
              Inscription
            </Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}