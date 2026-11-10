import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, MapPin, Clock, XCircle, ArrowUpRight } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCreator } from "@/lib/creators";
import { useBookings } from "@/lib/store";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Mes réservations · WeShoot" },
      { name: "description", content: "Suivez vos shootings confirmés, accédez aux détails et gérez vos réservations WeShoot." },
      { property: "og:title", content: "Mes réservations · WeShoot" },
      { property: "og:description", content: "Suivez vos shootings confirmés et gérez vos réservations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Bookings,
});

function Bookings() {
  const { bookings, cancelBooking } = useBookings();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        <h1 className="text-display text-4xl md:text-5xl">Mes réservations</h1>
        <p className="mt-3 text-muted-foreground">Suivez vos séances confirmées et annulez si besoin.</p>

        {bookings.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-elevated border border-border">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="text-display mt-6 text-2xl">Aucune réservation</div>
            <p className="mt-2 text-sm text-muted-foreground">Explorez le feed et réservez votre premier shooting.</p>
            <Link to="/explore" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">
              Découvrir les créateurs
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {bookings.map((b) => {
              const creator = getCreator(b.creatorId);
              const cancelled = b.status === "cancelled";
              return (
                <div
                  key={b.ref}
                  className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-5 transition ${
                    cancelled ? "border-border bg-surface opacity-60" : "border-border bg-surface hover:border-primary/50"
                  }`}
                >
                  <img src={b.creatorAvatar} alt={b.creatorName} className="h-14 w-14 rounded-xl object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-primary">{b.ref}</span>
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${
                        cancelled ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                      }`}>
                        {cancelled ? "Annulée" : "Confirmée"}
                      </span>
                    </div>
                    <div className="text-display text-xl mt-1">{b.offerName} · {b.creatorName}</div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> {b.day} {b.createdAt.slice(0, 0)}Janv. · {b.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.location || b.city}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.price > 0 ? `${b.price} MAD` : "Sur devis"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {creator && (
                      <Link
                        to="/creator/$id"
                        params={{ id: creator.id }}
                        className="h-10 px-4 rounded-xl border border-border text-sm inline-flex items-center gap-1.5 hover:bg-surface-elevated transition"
                      >
                        Profil <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {!cancelled && (
                      <button
                        onClick={() => cancelBooking(b.ref)}
                        className="h-10 px-4 rounded-xl border border-destructive/40 text-destructive text-sm inline-flex items-center gap-1.5 hover:bg-destructive/10 transition"
                      >
                        <XCircle className="h-4 w-4" /> Annuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}