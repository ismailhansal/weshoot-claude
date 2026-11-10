import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { CreatorCard } from "@/components/CreatorCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { creators } from "@/lib/creators";
import { useSaved } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Mes favoris · WeShoot" },
      { name: "description", content: "Retrouvez les photographes et vidéastes que vous avez aimés sur WeShoot." },
      { property: "og:title", content: "Mes favoris · WeShoot" },
      { property: "og:description", content: "Retrouvez les créateurs que vous avez aimés." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Saved,
});

function Saved() {
  const { saved } = useSaved();
  const list = creators.filter((c) => saved.includes(c.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 pt-10 pb-24">
        <h1 className="text-display text-4xl md:text-5xl">Mes favoris</h1>
        <p className="mt-3 text-muted-foreground">{list.length} créateur{list.length > 1 ? "s" : ""} sauvegardé{list.length > 1 ? "s" : ""}.</p>

        {list.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-elevated border border-border">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div className="text-display mt-6 text-2xl">Aucun favori pour l'instant</div>
            <p className="mt-2 text-sm text-muted-foreground">Touchez le cœur sur une carte pour sauvegarder un créateur.</p>
            <Link to="/explore" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">
              Explorer le feed
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {list.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
