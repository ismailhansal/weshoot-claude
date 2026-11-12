import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

import { DeliveriesTab } from "@/components/creator/DeliveriesTab";
import { GearTab } from "@/components/creator/GearTab";
import { OffersTab } from "@/components/creator/OffersTab";
import { PlanningTab } from "@/components/creator/PlanningTab";
import { PortfolioTab } from "@/components/creator/PortfolioTab";
import { ProfileTab } from "@/components/creator/ProfileTab";
import { RequestsTab } from "@/components/creator/RequestsTab";
import { RevenueTab } from "@/components/creator/RevenueTab";
import { ShowcaseTab } from "@/components/creator/ShowcaseTab";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { pendingRequestCount, useCreatorSpace } from "@/lib/creator-space";
import { useDemoSession } from "@/lib/demo-auth";

const tabs = [
  { id: "demandes", label: "Demandes" },
  { id: "offres", label: "Offres" },
  { id: "planning", label: "Planning" },
  { id: "materiel", label: "Matériel" },
  { id: "vitrine", label: "Vitrine" },
  { id: "portfolio", label: "Portfolio" },
  { id: "livrables", label: "Livrables" },
  { id: "revenus", label: "Revenus" },
  { id: "profil", label: "Mon profil" },
] as const;
type TabId = (typeof tabs)[number]["id"];

export const Route = createFileRoute("/creator-dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: TabId } => ({
    ...(tabs.some((t) => t.id === search.tab) ? { tab: search.tab as TabId } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Espace prestataire · WeShoot" },
      { name: "description", content: "Gérez vos demandes, offres, planning, portfolio, livrables et revenus sur WeShoot." },
      { property: "og:title", content: "Espace prestataire · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CreatorDashboard,
});

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass mt-8 rounded-3xl p-12 text-center">
      <div className="text-display text-2xl">{title}</div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

const gateBtn = "inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90";
const gateGhost = "glass inline-flex h-11 items-center rounded-xl px-6 text-sm font-medium transition hover:border-primary/60";

function CreatorDashboard() {
  const { tab = "demandes" } = Route.useSearch();
  const navigate = useNavigate();
  const session = useDemoSession();
  const space = useCreatorSpace();

  const creatorSpace = space.state ? { state: space.state, storageFull: space.storageFull, update: space.update } : null;
  const isCreator = session.isAuthenticated && session.role === "creator";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        {!session.ready ? null : !session.isAuthenticated ? (
          <Gate title="Connecte-toi pour accéder à ton espace prestataire">
            <Link to="/login" className={gateBtn}>Connexion</Link>
          </Gate>
        ) : !isCreator ? (
          <Gate title="Cet espace est réservé aux prestataires">
            <Link to="/dashboard" className={gateBtn}>Mon espace client</Link>
            <Link to="/become-creator" className={gateGhost}>Devenir créateur</Link>
          </Gate>
        ) : !creatorSpace ? null : (
          <>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Espace prestataire</div>
            <h1 className="text-display mt-2 text-4xl md:text-5xl">Salut {creatorSpace.state.profile.displayName}</h1>

            <div role="tablist" className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((t) => {
                const active = tab === t.id;
                const badge = t.id === "demandes" ? pendingRequestCount(creatorSpace.state) : 0;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => navigate({ to: "/creator-dashboard", search: { tab: t.id } })}
                    className={`relative inline-flex cursor-pointer items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t.label}
                    {badge > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{badge}</span>}
                    {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>

            {creatorSpace.storageFull && (
              <p role="status" className="mt-6 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                Le stockage du navigateur est plein : tes dernières modifications restent visibles tant que cette page est ouverte, mais ne seront pas conservées.
              </p>
            )}

            <div className="mt-8">
              {tab === "demandes" && <RequestsTab space={creatorSpace} />}
              {tab === "offres" && <OffersTab space={creatorSpace} />}
              {tab === "planning" && <PlanningTab space={creatorSpace} />}
              {tab === "materiel" && <GearTab space={creatorSpace} />}
              {tab === "vitrine" && <ShowcaseTab space={creatorSpace} />}
              {tab === "portfolio" && <PortfolioTab space={creatorSpace} />}
              {tab === "livrables" && <DeliveriesTab space={creatorSpace} />}
              {tab === "revenus" && <RevenueTab space={creatorSpace} />}
              {tab === "profil" && <ProfileTab space={creatorSpace} />}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
