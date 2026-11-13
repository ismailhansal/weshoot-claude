import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, Paperclip, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatDateTime, formatShortDate, type DocFile, type useClientSpace } from "@/lib/client-space";
import { getCreator } from "@/lib/creators";

type Space = ReturnType<typeof useClientSpace>;

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

/** Messagerie intégrée au dashboard client : une conversation par réservation. */
export function MessagesPanel({
  space,
  orderId,
  onSelect,
}: {
  space: Space;
  /** Conversation ouverte (sur mobile : si absente, on affiche la liste). */
  orderId?: string;
  onSelect: (id: string | undefined) => void;
}) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<DocFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Conversations : les plus récentes d'abord, celles sans message à la fin (hors annulées)
  const conversations = useMemo(() => {
    return space.orders
      .filter((o) => o.status !== "cancelled" || space.messages.some((m) => m.orderId === o.id))
      .map((o) => ({ order: o, last: space.lastMessageOf(o.id) }))
      .sort((a, b) => (b.last?.at ?? "").localeCompare(a.last?.at ?? ""));
  }, [space.orders, space.messages, space.lastMessageOf]);

  const activeId = orderId ?? conversations[0]?.order.id;
  const active = conversations.find((c) => c.order.id === activeId);
  const activeCreator = active ? getCreator(active.order.creatorId) : undefined;
  const thread = useMemo(
    () => space.messages.filter((m) => m.orderId === activeId).sort((a, b) => a.at.localeCompare(b.at)),
    [space.messages, activeId],
  );

  // Marque comme lu la conversation réellement affichée (desktop : toujours ; mobile : si ouverte)
  useEffect(() => {
    if (!activeId || !space.ready) return;
    const visible = !!orderId || window.matchMedia("(min-width: 768px)").matches;
    if (visible && space.isUnread(activeId)) space.markRead(activeId);
  }, [activeId, orderId, space]);

  // On fait défiler uniquement le fil de discussion, jamais la page.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, activeId]);

  function select(id: string | undefined) {
    setText("");
    setAttachment(null);
    onSelect(id);
  }

  function send(event: React.FormEvent) {
    event.preventDefault();
    if (!activeId || (!text.trim() && !attachment)) return;
    space.sendMessage(activeId, text, attachment ?? undefined);
    setText("");
    setAttachment(null);
  }

  if (conversations.length === 0) {
    return (
      <div className="glass rounded-3xl p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div className="text-display mt-6 text-2xl">Aucun message</div>
        <p className="mt-2 text-sm text-muted-foreground">Les conversations apparaîtront ici dès que tu auras envoyé une demande de réservation.</p>
        <Link to="/explore" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          Découvrir les créateurs
        </Link>
      </div>
    );
  }

  return (
    <div className="glass grid h-[calc(100dvh-9.5rem)] min-h-[24rem] touch-pan-x touch-pan-y overflow-hidden rounded-3xl md:h-[min(40rem,calc(100dvh-15rem))] md:min-h-[26rem] md:grid-cols-[18rem_minmax(0,1fr)]">
      {/* Liste des conversations */}
      <aside className={`${orderId ? "hidden md:flex" : "flex"} min-h-0 flex-col overflow-y-auto border-white/10 md:border-r [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
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
      <section className={`${orderId ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col`}>
        {active && (
          <>
            <header className="flex items-center gap-3 border-b border-white/10 px-3 py-2.5 md:gap-3.5 md:px-6 md:py-3.5">
              <button
                type="button"
                onClick={() => select(undefined)}
                aria-label="Retour aux conversations"
                className="cursor-pointer grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 transition hover:bg-white/10 md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <img src={activeCreator?.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full border-2 border-primary object-cover md:h-11 md:w-11" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{activeCreator?.name}</div>
                <div className="truncate text-xs text-primary">
                  {active.order.category} — {formatShortDate(active.order.date)}
                </div>
              </div>
            </header>

            <div ref={threadRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-3 py-4 md:space-y-3 md:px-6 md:py-6">
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
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 md:max-w-[75%] md:px-4 md:py-3 ${
                        mine ? "bg-primary text-primary-foreground shadow-glow" : "border border-white/10 bg-white/[0.06] backdrop-blur"
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
                      <div className={`mt-1.5 text-[11px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatDateTime(m.at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={send} className="border-t border-white/10 px-3 py-2.5 md:px-6 md:py-3.5">
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
              <div className="flex items-center gap-2 md:gap-3">
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
                  className="glass cursor-pointer grid h-11 w-11 shrink-0 place-items-center rounded-full transition hover:border-primary/60 md:h-12 md:w-12"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Message…"
                  aria-label="Message"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-base outline-none md:h-12 md:px-4 md:text-sm backdrop-blur transition [color-scheme:dark] placeholder:text-muted-foreground/60 hover:border-white/20 focus:border-primary focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/25"
                />
                <button
                  type="submit"
                  disabled={!text.trim() && !attachment}
                  aria-label="Envoyer"
                  className="cursor-pointer grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none md:inline-grid md:h-12 md:w-auto md:px-7"
                >
                  <Send className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Envoyer</span>
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}