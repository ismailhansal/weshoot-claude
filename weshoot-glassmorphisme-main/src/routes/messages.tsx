import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, Paperclip, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { formatDateTime, formatShortDate, useClientSpace, type DocFile } from "@/lib/client-space";
import { getCreator } from "@/lib/creators";
import { useDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/messages")({
  validateSearch: (search: Record<string, unknown>): { order?: string } => ({
    ...(typeof search.order === "string" ? { order: search.order } : {}),
  }),
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

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

function Messages() {
  const { order } = Route.useSearch();
  const navigate = useNavigate();
  const session = useDemoSession();
  const space = useClientSpace();

  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<DocFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Conversations : les plus récentes d'abord, celles sans message à la fin (hors annulées)
  const conversations = useMemo(() => {
    return space.orders
      .filter((o) => o.status !== "cancelled" || space.messages.some((m) => m.orderId === o.id))
      .map((o) => ({ order: o, last: space.lastMessageOf(o.id) }))
      .sort((a, b) => (b.last?.at ?? "").localeCompare(a.last?.at ?? ""));
  }, [space.orders, space.messages, space.lastMessageOf]);

  const activeId = order ?? conversations[0]?.order.id;
  const active = conversations.find((c) => c.order.id === activeId);
  const activeCreator = active ? getCreator(active.order.creatorId) : undefined;
  const thread = useMemo(
    () => space.messages.filter((m) => m.orderId === activeId).sort((a, b) => a.at.localeCompare(b.at)),
    [space.messages, activeId],
  );

  // Marque comme lu la conversation réellement affichée (desktop : toujours ; mobile : si ouverte)
  useEffect(() => {
    if (!activeId || !space.ready) return;
    const visible = !!order || window.matchMedia("(min-width: 768px)").matches;
    if (visible && space.isUnread(activeId)) space.markRead(activeId);
  }, [activeId, order, space]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length, activeId]);

  function select(id: string | undefined) {
    setText("");
    setAttachment(null);
    navigate({ to: "/messages", search: id ? { order: id } : {}, replace: true });
  }

  function send(event: React.FormEvent) {
    event.preventDefault();
    if (!activeId || (!text.trim() && !attachment)) return;
    space.sendMessage(activeId, text, attachment ?? undefined);
    setText("");
    setAttachment(null);
  }

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      {!session.ready || !space.ready ? null : !session.isAuthenticated ? (
        <main className="mx-auto w-full max-w-md px-6 py-20 text-center">
          <div className="glass rounded-3xl p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="text-display mt-6 text-2xl">Connecte-toi pour voir tes messages</div>
            <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Connexion
            </Link>
          </div>
        </main>
      ) : conversations.length === 0 ? (
        <main className="mx-auto w-full max-w-md px-6 py-20 text-center">
          <div className="glass rounded-3xl p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="text-display mt-6 text-2xl">Aucun message</div>
            <p className="mt-2 text-sm text-muted-foreground">Les conversations apparaîtront ici dès que tu auras envoyé une demande de réservation.</p>
            <Link to="/explore" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Découvrir les créateurs
            </Link>
          </div>
        </main>
      ) : (
        <main className="grid min-h-0 flex-1 md:grid-cols-[22rem_minmax(0,1fr)]">
          {/* Liste des conversations */}
          <aside className={`${order ? "hidden md:flex" : "flex"} min-h-0 flex-col overflow-y-auto border-r border-white/10 bg-white/[0.02]`}>
            {conversations.map(({ order: o, last }) => {
              const creator = getCreator(o.creatorId);
              const selected = o.id === activeId;
              const unread = space.isUnread(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => select(o.id)}
                  className={`flex w-full cursor-pointer items-center gap-3.5 border-b border-white/[0.06] px-5 py-4 text-left transition hover:bg-white/[0.05] ${
                    selected ? "md:bg-white/[0.07]" : ""
                  }`}
                >
                  <img src={creator?.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-primary object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{creator?.name}</span>
                      {unread && <span aria-label="Non lu" className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <div className="truncate text-xs text-primary">
                      {o.category} — {formatShortDate(o.date)}
                    </div>
                    <div className={`mt-0.5 truncate text-sm ${unread ? "text-foreground" : "text-muted-foreground"}`}>
                      {last ? `${last.from === "client" ? "Vous : " : ""}${last.text || last.attachment?.name || ""}` : "Aucun message"}
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Conversation */}
          <section className={`${order ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col`}>
            {active && (
              <>
                <header className="flex items-center gap-3.5 border-b border-white/10 px-4 py-3.5 md:px-6">
                  <button
                    type="button"
                    onClick={() => select(undefined)}
                    aria-label="Retour aux conversations"
                    className="cursor-pointer grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 transition hover:bg-white/10 md:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <img src={activeCreator?.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full border-2 border-primary object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{activeCreator?.name}</div>
                    <div className="truncate text-xs text-primary">
                      {active.order.category} — {formatShortDate(active.order.date)}
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    search={{ tab: "reservations" }}
                    className="glass hidden h-9 items-center rounded-xl px-3.5 text-xs font-medium uppercase tracking-wider text-muted-foreground transition hover:border-primary/60 hover:text-foreground sm:inline-flex"
                  >
                    Mon dashboard
                  </Link>
                </header>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-6 md:px-8">
                  {thread.length === 0 && (
                    <p className="pt-10 text-center text-sm text-muted-foreground">
                      Aucun message pour le moment. Écris à {activeCreator?.name} pour préciser ton brief.
                    </p>
                  )}
                  {thread.map((m) => {
                    const mine = m.from === "client";
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[70%] ${
                            mine
                              ? "bg-primary text-primary-foreground shadow-glow"
                              : "border border-white/10 bg-white/[0.06] backdrop-blur"
                          }`}
                        >
                          {m.text && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text}</p>}
                          {m.attachment && (
                            <div className={`${m.text ? "mt-2" : ""} flex items-center gap-2.5 rounded-xl px-3 py-2 ${mine ? "bg-black/15" : "bg-white/[0.06]"}`}>
                              <FileText className="h-4 w-4 shrink-0" />
                              <div className="min-w-0">
                                <div className="truncate text-xs font-medium">{m.attachment.name}</div>
                                <div className="text-[11px] opacity-70">{m.attachment.size}</div>
                              </div>
                            </div>
                          )}
                          <div className={`mt-1.5 text-[11px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatDateTime(m.at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={send} className="border-t border-white/10 px-4 py-3.5 md:px-6">
                  {attachment && (
                    <div className="mb-3 inline-flex max-w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] py-2 pl-3 pr-2 text-xs">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{attachment.name}</span>
                      <span className="shrink-0 text-muted-foreground">{attachment.size}</span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        aria-label="Retirer la pièce jointe"
                        className="cursor-pointer grid h-6 w-6 place-items-center rounded-full transition hover:bg-white/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      tabIndex={-1}
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setAttachment({ name: file.name, size: formatSize(file.size) });
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      aria-label="Joindre un fichier"
                      className="glass cursor-pointer grid h-12 w-12 shrink-0 place-items-center rounded-full transition hover:border-primary/60"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Écris ton message…"
                      aria-label="Message"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none backdrop-blur transition [color-scheme:dark] placeholder:text-muted-foreground/60 hover:border-white/20 focus:border-primary focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/25"
                    />
                    <button
                      type="submit"
                      disabled={!text.trim() && !attachment}
                      className="cursor-pointer h-12 shrink-0 rounded-xl bg-primary px-5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none md:px-7"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </main>
      )}
    </div>
  );
}