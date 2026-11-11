import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages · WeShoot" },
      { name: "description", content: "Vos échanges avec les photographes et vidéastes WeShoot." },
      { property: "og:title", content: "Messages · WeShoot" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Messages,
});

function Messages() {
  const session = useDemoSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        {!session.ready ? null : (
          <>
            <div className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Messagerie</div>
            <h1 className="text-display mt-2 text-4xl md:text-5xl">Messages</h1>
            <p className="mt-3 text-muted-foreground">Tes échanges avec les prestataires.</p>

            <div className="mt-10 rounded-2xl border border-border bg-surface p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface-elevated">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              {session.isAuthenticated ? (
                <>
                  <div className="text-display mt-6 text-2xl">Aucun message</div>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    Les conversations apparaîtront ici dès que tu auras envoyé une demande de réservation.
                  </p>
                  <Link to="/explore" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                    Découvrir les créateurs
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-display mt-6 text-2xl">Connecte-toi pour voir tes messages</div>
                  <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                    Connexion
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
