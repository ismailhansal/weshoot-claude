import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, LayoutDashboard, LogOut, Menu } from "lucide-react";
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
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useClientSpace } from "@/lib/client-space";
import { pendingRequestCount, useCreatorSpace } from "@/lib/creator-space";
import { endDemoSession, getDisplayName, useDemoSession } from "@/lib/demo-auth";
import { useSaved } from "@/lib/store";

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
  const [open, setOpen] = useState(false);
  const session = useDemoSession();
  const onExplore = useRouterState({ select: (st) => st.location.pathname.startsWith("/explore") });
  const onClientDashboard = useRouterState({ select: (st) => st.location.pathname === "/dashboard" });
  const space = useClientSpace();
  const isCreator = session.isAuthenticated && session.role === "creator";
  const creator = useCreatorSpace(isCreator);
  const firstName = isCreator && creator.state ? creator.state.profile.displayName : getDisplayName(session.email, session.name);
  const avatarSrc = (isCreator && creator.state?.profile.avatar) || session.avatar || defaultAvatarFor(session.email);
  const creatorPending = creator.state ? pendingRequestCount(creator.state) : 0;
  const dashboardBadge = space.actionCount + space.unreadCount;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Logo className="text-2xl" />
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
          {onClientDashboard && !isCreator && <ThemeToggle />}
          {!isCreator && (
            <>
          <Link
            to="/saved"
            aria-label="Favoris"
            className="relative hidden md:grid h-9 w-9 rounded-xl border border-border place-items-center hover:bg-surface transition"
          >
            <Heart className="h-4 w-4" />
            {saved.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                {saved.length}
              </span>
            )}
          </Link>
            </>
          )}
          {session.ready && !session.isAuthenticated && (
            <>
              <Link
                to="/login"
                className="hidden md:inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-sm font-medium text-black transition hover:bg-primary hover:text-primary-foreground"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="hidden md:inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-md transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                Inscription
              </Link>
            </>
          )}
          {session.ready && session.isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="cursor-pointer hidden md:inline-flex h-11 items-center gap-2.5 rounded-full border border-white/70 bg-black/30 pl-1.5 pr-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white data-[state=open]:border-white outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <UserAvatar src={avatarSrc} />
                  {firstName}
                  {(isCreator ? creatorPending > 0 : space.unreadCount > 0 || space.actionCount > 0) && <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />}
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
                {isCreator && (
                  <DropdownMenuItem asChild className={menuItemClass}>
                    <Link to="/creator-dashboard" className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">Espace prestataire</span>
                      {creatorPending > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                          {creatorPending}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                )}
                {!isCreator && (<>
                <DropdownMenuItem asChild className={menuItemClass}>
                  <Link to="/dashboard" className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Dashboard</span>
                    {dashboardBadge > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                        {dashboardBadge}
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
                </>)}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onSelect={() => endDemoSession()} className={`${menuItemClass} text-muted-foreground`}>
                  <LogOut className="h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* Mobile : accès rapide + menu */}
          <div className="flex items-center gap-2 md:hidden">
            {session.ready && !session.isAuthenticated && !onExplore && (
              <Link
                to="/explore"
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-sm font-medium text-black transition active:scale-95"
              >
                Parcourir ↗
              </Link>
            )}
            {session.ready && session.isAuthenticated && !onExplore && (
              <Link
                to="/explore"
                activeProps={{ className: "text-foreground" }}
                className="px-1.5 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Découvrir
              </Link>
            )}
            {session.ready && session.isAuthenticated ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Ouvrir le menu"
                className="cursor-pointer relative inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/[0.07] pl-1 pr-3 backdrop-blur-xl transition active:scale-95"
              >
                <span className="h-8 w-8 shrink-0 rounded-full border-2 border-primary p-0.5">
                  <img src={avatarSrc} alt="" className="h-full w-full rounded-full object-cover" />
                </span>
                <Menu className="h-4 w-4" />
                {(isCreator ? creatorPending > 0 : space.unreadCount > 0 || space.actionCount > 0) && (
                  <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Ouvrir le menu"
                className="cursor-pointer grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur-xl transition active:scale-95"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <MobileNav
        open={open}
        onOpenChange={setOpen}
        ready={session.ready}
        authed={session.isAuthenticated}
        isCreator={isCreator}
        firstName={firstName}
        avatarSrc={avatarSrc}
        counts={{ dashboard: dashboardBadge, saved: saved.length, creatorPending }}
        onLogout={endDemoSession}
      />
    </header>
  );
}