import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Heart, Hourglass, ListChecks } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDisplayName, useDemoSession } from "@/lib/demo-auth";
import { useBookings, useSaved } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · WeShoot" },
      { name: "description", content: "Votre activité WeShoot : réservations, favoris et prochaines étapes." },
      { property: "og:title", content: "Dashboard · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

const statusLabel = { pending: "En attente", confirmed: "Confirmée", cancelled: "Annulée" } as const;

function Dashboard() {
  const session = useDemoSession();
  const { bookings } = useBookings();
  const { saved } = useSaved();
  const firstName = getDisplayName(session.email, session.name);

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const recent = bookings.slice(0, 3);

  const stats = [
    { label: "Réservations", value: bookings.length, icon: ListChecks },
    { label: "En attente", value: pending, icon: Hourglass },
    { label: "Confirmées", value: confirmed, icon: CalendarCheck },
    { label: "Favoris", value: saved.length, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        {!session.ready ? null : !session.isAuthenticated ? (
          <div className="mt-8 rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="text-display text-2xl">Connecte-toi pour accéder à ton dashboard</div>
            <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Dashboard</div>
            <h1 className="text-display mt-2 text-4xl md:text-5xl">Bonjour, {firstName}</h1>
            <p className="mt-3 text-muted-foreground">Voici un aperçu de ton activité sur WeShoot.</p>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
                    <Icon className="h-4 w-4 text-primary" />
                    <div className="text-display mt-4 text-3xl">{s.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-display text-2xl">Dernières réservations</h2>
              {bookings.length > 0 && (
                <Link to="/bookings" className="text-sm text-muted-foreground transition hover:text-primary">Tout voir</Link>
              )}
            </div>

            {recent.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-border bg-surface p-10 text-center">
                <p className="text-sm text-muted-foreground">Aucune réservation pour le moment.</p>
                <Link to="/explore" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                  Découvrir les créateurs
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recent.map((b) => (
                  <div key={b.ref} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                    <img src={b.creatorAvatar} alt={b.creatorName} className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{b.offerName} · {b.creatorName}</div>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground">{b.ref}</div>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                      b.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                    }`}>
                      {statusLabel[b.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
