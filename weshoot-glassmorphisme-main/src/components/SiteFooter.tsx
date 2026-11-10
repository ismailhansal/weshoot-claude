import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-accent" />
          <span className="text-display text-lg text-foreground">weshoot</span>
          <span>· © 2026</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link to="/explore" className="hover:text-foreground transition">Découvrir</Link>
          <Link to="/how-it-works" className="hover:text-foreground transition">Comment ça marche</Link>
          <Link to="/for-creators" className="hover:text-foreground transition">Devenir créateur</Link>
          <Link to="/bookings" className="hover:text-foreground transition">Mes réservations</Link>
        </div>
      </div>
    </footer>
  );
}
