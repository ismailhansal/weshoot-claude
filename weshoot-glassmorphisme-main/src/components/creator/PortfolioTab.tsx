import { ArrowRightLeft, Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  ConfirmDialog,
  EmptyState,
  Modal,
  bigGhostBtn,
  bigPrimaryBtn,
  fieldClass,
  ghostBtn,
  labelClass,
  panelClass,
  pillBase,
  pillIdle,
  pillOn,
  primaryBtn,
} from "@/components/creator/ui";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CreatorSpace, PortfolioCategory } from "@/lib/creator-space";
import { fileToMedia, newId, type MediaItem } from "@/lib/media";

export function PortfolioTab({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const categories = state.portfolio;
  const [activeId, setActiveId] = useState<string | undefined>(categories[0]?.id);
  const [dialog, setDialog] = useState<"new" | "rename" | null>(null);
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  const patchCategory = (id: string, fn: (c: PortfolioCategory) => PortfolioCategory) =>
    update((s) => ({ ...s, portfolio: s.portfolio.map((c) => (c.id === id ? fn(c) : c)) }));

  function openDialog(kind: "new" | "rename") {
    setName(kind === "rename" ? active?.name ?? "" : "");
    setDialog(kind);
  }

  function submitName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (dialog === "new") {
      const id = newId("cat");
      update((s) => ({ ...s, portfolio: [...s.portfolio, { id, name: trimmed, items: [] }] }));
      setActiveId(id);
    } else if (active) {
      patchCategory(active.id, (c) => ({ ...c, name: trimmed }));
    }
    setDialog(null);
  }

  async function addFiles(files: FileList | null, kind: "image" | "video") {
    if (!files || !active) return;
    setError("");
    setBusy(true);
    const added: MediaItem[] = [];
    let skipped = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith(`${kind}/`)) { skipped += 1; continue; }
      try {
        added.push(await fileToMedia(file));
      } catch {
        skipped += 1;
      }
    }
    setBusy(false);
    if (skipped) setError(`${skipped} fichier(s) ignoré(s) : ${kind === "image" ? "images" : "vidéos"} uniquement.`);
    if (added.length) patchCategory(active.id, (c) => ({ ...c, items: [...c.items, ...added] }));
  }

  function moveItem(item: MediaItem, toId: string) {
    if (!active) return;
    update((s) => ({
      ...s,
      portfolio: s.portfolio.map((c) => {
        if (c.id === active.id) return { ...c, items: c.items.filter((i) => i.id !== item.id) };
        if (c.id === toId) return { ...c, items: [...c.items, item] };
        return c;
      }),
    }));
  }

  return (
    <div className="space-y-6">
      <section className={panelClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Portfolio</div>
            <p className="mt-2 text-xs text-muted-foreground">Visible uniquement sur ta page de détail. Organise-le par catégories.</p>
          </div>
          <button type="button" onClick={() => openDialog("new")} className={primaryBtn}><Plus className="h-3.5 w-3.5" /> Nouvelle catégorie</button>
        </div>
        {categories.length > 0 && (
          <div role="tablist" className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => {
              const on = c.id === active?.id;
              return (
                <button key={c.id} role="tab" aria-selected={on} type="button" onClick={() => { setActiveId(c.id); setError(""); }} className={`${pillBase} h-10 ${on ? pillOn : pillIdle}`}>
                  {c.name} ({c.items.length})
                </button>
              );
            })}
          </div>
        )}
      </section>

      {!active ? (
        <EmptyState>Aucune catégorie. Crée ta première catégorie pour organiser ton portfolio.</EmptyState>
      ) : (
        <section className={panelClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-display text-2xl">{active.name}</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => openDialog("rename")} className={ghostBtn}>Renommer</button>
              <button type="button" onClick={() => setConfirmDelete(true)} className={ghostBtn}>Supprimer</button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => photoInput.current?.click()} className={ghostBtn}><Plus className="h-3.5 w-3.5" /> Ajouter des photos</button>
            <button type="button" disabled={busy} onClick={() => videoInput.current?.click()} className={ghostBtn}><Plus className="h-3.5 w-3.5" /> Ajouter des vidéos</button>
            <input ref={photoInput} type="file" accept="image/*" multiple tabIndex={-1} className="sr-only" onChange={(e) => { void addFiles(e.target.files, "image"); e.target.value = ""; }} />
            <input ref={videoInput} type="file" accept="video/*" multiple tabIndex={-1} className="sr-only" onChange={(e) => { void addFiles(e.target.files, "video"); e.target.value = ""; }} />
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

          {active.items.length === 0 ? (
            <div className="mt-4"><EmptyState>Cette catégorie est vide. Ajoute des photos ou des vidéos.</EmptyState></div>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {active.items.map((item) => (
                <li key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  {item.kind === "video" ? (
                    <video src={item.src} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <img src={item.src} alt={item.name} className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => patchCategory(active.id, (c) => ({ ...c, items: c.items.filter((i) => i.id !== item.id) }))}
                    aria-label={`Retirer ${item.name}`}
                    className="cursor-pointer absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {categories.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" aria-label={`Déplacer ${item.name} vers une autre catégorie`} className="cursor-pointer absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 transition hover:bg-primary hover:text-primary-foreground md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100">
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border border-white/15 bg-background/85 p-1.5 backdrop-blur-2xl">
                        <DropdownMenuLabel className="px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">Déplacer vers</DropdownMenuLabel>
                        {categories.filter((c) => c.id !== active.id).map((c) => (
                          <DropdownMenuItem key={c.id} onSelect={() => moveItem(item, c.id)} className="cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/10">
                            {c.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Démo : les photos sont réduites pour le stockage local ; les vidéos ne sont conservées que pendant la session.</p>
        </section>
      )}

      <Modal open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)} title={dialog === "new" ? "Nouvelle catégorie" : "Renommer la catégorie"} description="Le nom s'affiche sur ton profil public.">
        <form onSubmit={submitName} className="space-y-5">
          <div>
            <label htmlFor="pf-name" className={labelClass}>Nom</label>
            <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Mariage" maxLength={30} className={fieldClass} autoFocus />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={!name.trim()} className={`${bigPrimaryBtn} flex-[1.4]`}>Enregistrer</button>
            <button type="button" onClick={() => setDialog(null)} className={`${bigGhostBtn} flex-1`}>Annuler</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer cette catégorie ?"
        text={`« ${active?.name ?? ""} » et ses ${active?.items.length ?? 0} média(s) seront retirés de ton portfolio.`}
        onConfirm={() => {
          if (!active) return;
          update((s) => ({ ...s, portfolio: s.portfolio.filter((c) => c.id !== active.id) }));
          setActiveId(undefined);
        }}
      />
    </div>
  );
}
