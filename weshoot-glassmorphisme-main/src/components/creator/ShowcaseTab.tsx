import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import { EmptyState, SectionLabel, pillBase, pillIdle, pillOn, panelClass, primaryBtn } from "@/components/creator/ui";
import { money, type CreatorSpace } from "@/lib/creator-space";
import { fileToMedia, isShowcaseRatio, readDimensions, type MediaItem } from "@/lib/media";

const MAX_PHOTOS = 5;

export function ShowcaseTab({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const { showcase } = state;
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const setShowcase = (patch: Partial<typeof showcase>) => update((s) => ({ ...s, showcase: { ...s.showcase, ...patch } }));

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setError("");
    setBusy(true);
    const accepted: MediaItem[] = [];
    let rejected = 0;
    let tooMany = false;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { rejected += 1; continue; }
      if (showcase.photos.length + accepted.length >= MAX_PHOTOS) { tooMany = true; break; }
      try {
        const { w, h } = await readDimensions(file);
        if (isShowcaseRatio(w, h)) accepted.push(await fileToMedia(file));
        else rejected += 1;
      } catch {
        rejected += 1;
      }
    }
    setBusy(false);
    if (rejected) setError("Format refusé : la vitrine doit être verticale, en 4:5 ou 9:16.");
    else if (tooMany) setError(`Maximum ${MAX_PHOTOS} photos.`);
    if (accepted.length) setShowcase({ photos: [...showcase.photos, ...accepted] });
  }

  async function addVideo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("video/")) { setError("Ajoute un fichier vidéo."); return; }
    setBusy(true);
    try {
      const { w, h } = await readDimensions(file);
      if (!isShowcaseRatio(w, h)) { setError("Format refusé : la vidéo doit être verticale, en 4:5 ou 9:16."); return; }
      if (showcase.video) URL.revokeObjectURL(showcase.video.src);
      setShowcase({ video: await fileToMedia(file) });
    } catch {
      setError("Impossible de lire cette vidéo.");
    } finally {
      setBusy(false);
    }
  }

  function movePhoto(i: number, delta: -1 | 1) {
    const photos = [...showcase.photos];
    const j = i + delta;
    if (j < 0 || j >= photos.length) return;
    [photos[i], photos[j]] = [photos[j], photos[i]];
    setShowcase({ photos });
  }

  const photosMode = showcase.mode === "photos";

  return (
    <div className="space-y-6">
      <section className={panelClass}>
        <SectionLabel>Média vitrine</SectionLabel>
        <p className="mt-2 text-xs text-muted-foreground">
          Ce média s'affiche dans le feed et sur les cartes prestataires. Choisis <b className="text-foreground">jusqu'à 5 photos</b> (carrousel) ou <b className="text-foreground">1 vidéo showreel</b>. Format vertical 4:5 ou 9:16.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" aria-pressed={photosMode} onClick={() => setShowcase({ mode: "photos" })} className={`${pillBase} h-10 ${photosMode ? pillOn : pillIdle}`}>Photos (max 5)</button>
          <button type="button" aria-pressed={!photosMode} onClick={() => setShowcase({ mode: "video" })} className={`${pillBase} h-10 ${!photosMode ? pillOn : pillIdle}`}>Vidéo showreel</button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section className={panelClass}>
          {photosMode ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <SectionLabel>Photos vitrine — {showcase.photos.length} / {MAX_PHOTOS}</SectionLabel>
                <button type="button" disabled={busy || showcase.photos.length >= MAX_PHOTOS} onClick={() => photoInput.current?.click()} className={primaryBtn}>
                  <Plus className="h-3.5 w-3.5" /> Téléverser
                </button>
                <input ref={photoInput} type="file" accept="image/*" multiple tabIndex={-1} className="sr-only" onChange={(e) => { void addPhotos(e.target.files); e.target.value = ""; }} />
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              {showcase.photos.length === 0 ? (
                <div className="mt-4"><EmptyState>Aucune photo vitrine. Téléverse jusqu'à 5 photos verticales.</EmptyState></div>
              ) : (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {showcase.photos.map((p, i) => (
                    <li key={p.id} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                      <img src={p.src} alt={`Photo vitrine ${i + 1}`} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-black/70 px-1.5 text-[11px] font-semibold">{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setShowcase({ photos: showcase.photos.filter((x) => x.id !== p.id) })}
                        aria-label={`Retirer la photo ${i + 1}`}
                        className="cursor-pointer absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute inset-x-2 bottom-2 flex justify-between">
                        <button type="button" disabled={i === 0} onClick={() => movePhoto(i, -1)} aria-label="Déplacer vers la gauche" className="cursor-pointer grid h-8 w-8 place-items-center rounded-full bg-black/70 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-30">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button type="button" disabled={i === showcase.photos.length - 1} onClick={() => movePhoto(i, 1)} aria-label="Déplacer vers la droite" className="cursor-pointer grid h-8 w-8 place-items-center rounded-full bg-black/70 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-30">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <SectionLabel>Vidéo showreel — {showcase.video ? 1 : 0} / 1</SectionLabel>
                <button type="button" disabled={busy} onClick={() => videoInput.current?.click()} className={primaryBtn}>
                  <Plus className="h-3.5 w-3.5" /> {showcase.video ? "Remplacer" : "Téléverser"}
                </button>
                <input ref={videoInput} type="file" accept="video/*" tabIndex={-1} className="sr-only" onChange={(e) => { void addVideo(e.target.files); e.target.value = ""; }} />
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              {showcase.video ? (
                <div className="relative mx-auto mt-4 aspect-[9/16] max-h-[28rem] overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <video src={showcase.video.src} controls muted playsInline className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setShowcase({ video: null })} aria-label="Retirer la vidéo" className="cursor-pointer absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 transition hover:bg-primary">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-4"><EmptyState>Aucune vidéo showreel. Téléverse une vidéo verticale (4:5 ou 9:16).</EmptyState></div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">Démo : la vidéo n'est conservée que pendant la session du navigateur.</p>
            </>
          )}
        </section>

        <FeedPreview space={space} />
      </div>
    </div>
  );
}

/* ---------- Aperçu dans le feed ---------- */
function FeedPreview({ space }: { space: CreatorSpace }) {
  const { profile, showcase } = space.state;
  const [index, setIndex] = useState(0);
  const photos = showcase.photos;
  const current = Math.min(index, Math.max(0, photos.length - 1));
  const showPhotos = showcase.mode === "photos";

  return (
    <aside>
      <SectionLabel>Aperçu dans le feed</SectionLabel>
      <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-black">
        <div className="relative aspect-[4/5] bg-white/[0.04]">
          {showPhotos ? (
            photos.length > 0 ? (
              <>
                <img src={photos[current].src} alt="" className="h-full w-full object-cover" />
                {photos.length > 1 && (
                  <>
                    <button type="button" onClick={() => setIndex((current - 1 + photos.length) % photos.length)} aria-label="Photo précédente" className="cursor-pointer absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 backdrop-blur transition hover:bg-primary">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setIndex((current + 1) % photos.length)} aria-label="Photo suivante" className="cursor-pointer absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 backdrop-blur transition hover:bg-primary">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute inset-x-0 top-3 flex justify-center gap-1.5">
                      {photos.map((p, i) => (
                        <span key={p.id} className={`h-1 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">Aucune photo</div>
            )
          ) : showcase.video ? (
            <video src={showcase.video.src} muted loop autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">Aucune vidéo</div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent" />
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <img src={profile.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full border-2 border-primary object-cover" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold">{profile.displayName}</div>
                <div className="truncate text-[11px] text-white/70">{profile.city}</div>
              </div>
            </div>
            <div className="shrink-0 text-right leading-tight">
              <div className="text-[10px] text-white/70">À partir de</div>
              <div className="text-display text-lg">{money(profile.basePrice)} <span className="text-[10px] font-medium text-white/70">MAD</span></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
