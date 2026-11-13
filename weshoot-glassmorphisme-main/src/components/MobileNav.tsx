import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import {
  Camera,
  ChevronRight,
  Compass,
  Heart,
  LayoutDashboard,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Logo } from "@/components/Logo";

type Counts = {
  /** Client : actions à traiter + messages non lus, regroupés dans le dashboard */
  dashboard: number;
  saved: number;
  /** Prestataire : demandes à traiter */
  creatorPending: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ready: boolean;
  authed: boolean;
  isCreator: boolean;
  firstName: string;
  avatarSrc: string;
  counts: Counts;
  onLogout: () => void;
};

const discover = [
  { to: "/explore", label: "Découvrir", hint: "Photographes et vidéastes", icon: Compass },
  { to: "/how-it-works", label: "Comment ça marche", hint: "Réserver en toute sécurité", icon: Sparkles },
  { to: "/become-creator", label: "Devenir créateur", hint: "Crée ton profil prestataire", icon: Camera },
] as const;

function Badge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
      {value}
    </span>
  );
}

function Tile({
  to,
  icon: Icon,
  label,
  badge = 0,
  onNavigate,
  wide = false,
}: {
  to: "/dashboard" | "/saved" | "/creator-dashboard";
  icon: ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onNavigate: () => void;
  wide?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`glass relative flex items-center gap-3 rounded-2xl p-3.5 transition active:scale-[0.98] hover:border-primary/60 ${wide ? "col-span-2" : ""}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
        <Icon className="h-[18px] w-[18px] text-primary" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      <Badge value={badge} />
    </Link>
  );
}

export function MobileNav({ open, onOpenChange, ready, authed, isCreator, firstName, avatarSrc, counts, onLogout }: Props): ReactNode {
  const close = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-sm flex-col overflow-hidden border-l border-white/15 bg-background/85 text-foreground shadow-[-24px_0_60px_-12px_rgb(0_0_0/0.7)] backdrop-blur-2xl backdrop-saturate-150 outline-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right md:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Menu de navigation</DialogPrimitive.Title>

          {/* Halo de couleur derrière le verre */}
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />

          {/* En-tête */}
          <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
            <Link to="/" onClick={close} className="flex items-center gap-2">
              <Logo className="text-2xl" />
            </Link>
            <DialogPrimitive.Close
              aria-label="Fermer le menu"
              className="cursor-pointer grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.06] transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Contenu */}
          <div className="relative min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6">
            {ready && authed && (
              <section aria-label="Mon compte" className="space-y-3">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <span className="h-14 w-14 shrink-0 rounded-full border-2 border-primary p-0.5">
                    <img src={avatarSrc} alt="" className="h-full w-full rounded-full object-cover" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold">{firstName}</div>
                    <div className="text-xs text-muted-foreground">{isCreator ? "Espace prestataire" : "Espace client"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {isCreator ? (
                    <Tile to="/creator-dashboard" icon={LayoutDashboard} label="Espace prestataire" badge={counts.creatorPending} onNavigate={close} wide />
                  ) : (
                    <>
                      <Tile to="/dashboard" icon={LayoutDashboard} label="Dashboard" badge={counts.dashboard} onNavigate={close} />
                      <Tile to="/saved" icon={Heart} label="Favoris" badge={counts.saved} onNavigate={close} />
                    </>
                  )}
                </div>
              </section>
            )}

            <section aria-label="Navigation">
              <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Explorer</div>
              <nav className="space-y-1">
                {discover
                  .filter((item) => !(isCreator && item.to === "/become-creator"))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={close}
                        activeProps={{ className: "bg-white/[0.07]" }}
                        className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-white/[0.05]"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05]">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-medium">{item.label}</span>
                          <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
              </nav>
            </section>
          </div>

          {/* Pied : actions principales toujours accessibles */}
          <div className="relative shrink-0 border-t border-white/10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {ready && !authed && (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={close}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition hover:bg-primary hover:text-primary-foreground"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  onClick={close}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white backdrop-blur-md transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Inscription
                </Link>
              </div>
            )}
            {ready && authed && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  close();
                }}
                className="cursor-pointer inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] text-sm font-medium text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
