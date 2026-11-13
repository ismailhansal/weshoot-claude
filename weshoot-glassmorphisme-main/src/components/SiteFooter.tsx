import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Logo className="text-lg" />
          <span>· © 2026</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link to="/explore" className="hover:text-foreground transition">Découvrir</Link>
          <Link to="/how-it-works" className="hover:text-foreground transition">Comment ça marche</Link>
          <Link to="/for-creators" className="hover:text-foreground transition">Devenir créateur</Link>
          <Link to="/dashboard" className="hover:text-foreground transition">Mon dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
