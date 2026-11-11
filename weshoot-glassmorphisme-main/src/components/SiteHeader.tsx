import { Link } from "@tanstack/react-router";
import { Heart, CalendarCheck, LayoutDashboard, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import avatar5 from "@/assets/avatar-5.jpg";
import avatar6 from "@/assets/avatar-6.jpg";
import { useClientSpace } from "@/lib/client-space";
import { endDemoSession, getDisplayName, useDemoSession } from "@/lib/demo-auth";
import { useSaved, useBookings } from "@/lib/store";

const nav = [
  { to: "/explore", label: "Découvrir" },
  { to: "/how-it-works", label: "Comment ça marche" },
  { to: "/become-creator", label: "Devenir créateur" },
] as const;

const defaultAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

/** Avatar par défaut stable pour un email donné, tant qu'aucune photo de profil n'est enregistrée. */
function defaultAvatarFor(email: string | null) {
  const seed = Array.from(email ?? "").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return defaultAvatars[seed % defaultAvatars.length];
}

function UserAvatar({ src, className = "h-8 w-8" }: { src: string; className?: string }) {
  return (
    <span className={`shrink-0 rounded-full border-2 border-primary p-0.5 ${className}`}>
      <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
    </span>
  );
}

const menuItemClass = "cursor-pointer rounded-xl px-3 py-2.5 text-sm focus:bg-white/10 focus:text-foreground";

export function SiteHeader() {
  const { saved } = useSaved();
  const { bookings } = useBookings();
  const [open, setOpen] = useState(false);
  const session = useDemoSession();
  const space = useClientSpace();
  const firstName = getDisplayName(session.email, session.name);
  const avatarSrc = session.avatar ?? defaultAvatarFor(session.email);
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
          {session.ready && !session.isAuthenticated && (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-sm font-medium text-black transition hover:bg-primary hover:text-primary-foreground"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-md transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                Inscription
              </Link>
            </>
          )}
          {session.ready && session.isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="cursor-pointer hidden sm:inline-flex h-11 items-center gap-2.5 rounded-full border border-white/70 bg-black/30 pl-1.5 pr-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white data-[state=open]:border-white outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <UserAvatar src={avatarSrc} />
                  {firstName}
                  {(space.unreadCount > 0 || space.actionCount > 0) && <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="min-w-[15rem] rounded-2xl border border-white/15 bg-background/80 p-1.5 text-foreground backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12),0_24px_60px_-12px_rgb(0_0_0/0.75)]"
              >
                <div className="flex items-center gap-3 px-3 pb-2.5 pt-2.5">
                  <UserAvatar src={avatarSrc} className="h-10 w-10" />
                  <div className="min-w-0 truncate text-sm font-semibold">{firstName}</div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className={menuItemClass}>
                  <Link to="/dashboard" className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Dashboard</span>
                    {space.actionCount > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                        {space.actionCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItemClass}>
                  <Link to="/messages" className="flex items-center gap-2.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Messages</span>
                    {space.unreadCount > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                        {space.unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItemClass}>
                  <Link to="/bookings" className="flex items-center gap-2.5">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Mes réservations</span>
                    {activeBookings > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                        {activeBookings}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItemClass}>
                  <Link to="/saved" className="flex items-center gap-2.5">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Favoris</span>
                    {saved.length > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-md bg-white/10 px-1.5 text-[11px] font-semibold">
                        {saved.length}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onSelect={() => endDemoSession()} className={`${menuItemClass} text-muted-foreground`}>
                  <LogOut className="h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
          {session.ready && !session.isAuthenticated && (
            <div className="mt-1 flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 h-10 inline-flex items-center justify-center rounded-full bg-white text-black font-medium"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 h-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-white font-medium backdrop-blur-md"
              >
                Inscription
              </Link>
            </div>
          )}
          {session.ready && session.isAuthenticated && (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link to="/messages" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Messages</Link>
            </>
          )}
          {session.ready && session.isAuthenticated && (
            <button
              onClick={() => { endDemoSession(); setOpen(false); }}
              className="cursor-pointer mt-1 inline-flex items-center gap-2 text-left text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Se déconnecter ({firstName})
            </button>
          )}
        </div>
      )}
    </header>
  );
}
