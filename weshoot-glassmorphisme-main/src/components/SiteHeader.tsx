import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, CalendarCheck, Menu, X } from "lucide-react";
import { useState } from "react";

import { useSaved, useBookings } from "@/lib/store";

const nav = [
  { to: "/explore", label: "Découvrir" },
  { to: "/how-it-works", label: "Comment ça marche" },
  { to: "/for-creators", label: "Devenir créateur" },
] as const;

export function SiteHeader() {
  const { saved } = useSaved();
  const { bookings } = useBookings();
  const [open, setOpen] = useState(false);
  const activeBookings = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-accent shadow-glow" />
          <span className="text-display text-2xl">weshoot</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-foreground" }}
              className="hover:text-foreground transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/saved"
            aria-label="Favoris"
            className="relative h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-surface transition"
          >
            <Heart className="h-4 w-4" />
            {saved.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                {saved.length}
              </span>
            )}
          </Link>
          <Link
            to="/bookings"
            aria-label="Mes réservations"
            className="relative h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-surface transition"
          >
            <CalendarCheck className="h-4 w-4" />
            {activeBookings > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                {activeBookings}
              </span>
            )}
          </Link>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background text-sm font-medium px-4 h-9 hover:opacity-90 transition"
          >
            Réserver un shoot <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="md:hidden h-9 w-9 rounded-xl border border-border grid place-items-center"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 px-6 py-4 flex flex-col gap-3 text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              {n.label}
            </Link>
          ))}
          <Link to="/bookings" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            Mes réservations
          </Link>
        </div>
      )}
    </header>
  );
}
