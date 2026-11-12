import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import {
  ConfirmDialog,
  EmptyState,
  Modal,
  areaClass,
  bigGhostBtn,
  bigPrimaryBtn,
  fieldClass,
  ghostBtn,
  labelClass,
} from "@/components/creator/ui";
import { allCategories, money, serviceTypes, type CreatorOffer, type CreatorSpace, type ServiceType } from "@/lib/creator-space";
import { newId } from "@/lib/media";

const emptyOffer = (category: string): CreatorOffer => ({
  id: "",
  title: "",
  description: "",
  category,
  type: "Photo",
  price: 0,
  duration: "",
  photoCount: "",
  videoCount: "",
  videoDuration: "",
  delivery: "",
  extras: "",
  conditions: "",
});

export function OffersTab({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const [editing, setEditing] = useState<CreatorOffer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function move(index: number, delta: -1 | 1) {
    update((s) => {
      const offers = [...s.offers];
      const target = index + delta;
      if (target < 0 || target >= offers.length) return s;
      [offers[index], offers[target]] = [offers[target], offers[index]];
      return { ...s, offers };
    });
  }

  function save(offer: CreatorOffer) {
    update((s) => ({
      ...s,
      offers: offer.id
        ? s.offers.map((o) => (o.id === offer.id ? offer : o))
        : [...s.offers, { ...offer, id: newId("offer") }],
    }));
    setEditing(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Gère tes offres affichées sur ton profil. Réorganise-les avec les flèches.</p>
        <button type="button" onClick={() => setEditing(emptyOffer(state.profile.categories[0] ?? allCategories[0]))} className={`${bigPrimaryBtn} h-11`}>
          <Plus className="h-4 w-4" /> Créer une offre
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {state.offers.length === 0 && <EmptyState>Aucune offre pour le moment. Crée ta première offre pour qu'elle apparaisse sur ton profil.</EmptyState>}
        {state.offers.map((o, i) => (
          <article key={o.id} className="glass flex gap-4 rounded-3xl p-5 md:p-6">
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Monter ${o.title}`}
                className="glass cursor-pointer grid h-9 w-9 place-items-center rounded-xl transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === state.offers.length - 1}
                aria-label={`Descendre ${o.title}`}
                className="glass cursor-pointer grid h-9 w-9 place-items-center rounded-xl transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-display text-xl">{o.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {[o.category, o.type, o.duration].filter(Boolean).join(" • ")}
                  </div>
                </div>
                <div className="text-display shrink-0 text-2xl text-primary">
                  {money(o.price)} <span className="text-xs font-medium text-muted-foreground">MAD</span>
                </div>
              </div>
              {o.description && <p className="mt-3 text-sm text-muted-foreground">{o.description}</p>}
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setEditing(o)} className={ghostBtn}>Modifier</button>
                <button type="button" onClick={() => setDeleteId(o.id)} className={ghostBtn}>Supprimer</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <OfferDialog offer={editing} onClose={() => setEditing(null)} onSave={save} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer cette offre ?"
        text="Elle disparaîtra de ton profil public. Cette action est définitive."
        onConfirm={() => deleteId && update((s) => ({ ...s, offers: s.offers.filter((o) => o.id !== deleteId) }))}
      />
    </>
  );
}

function OfferDialog({ offer, onClose, onSave }: { offer: CreatorOffer | null; onClose: () => void; onSave: (o: CreatorOffer) => void }) {
  const [draft, setDraft] = useState<CreatorOffer | null>(offer);
  useEffect(() => setDraft(offer), [offer]);

  if (!draft) return <Modal open={false} onOpenChange={onClose} title="Offre">{null}</Modal>;

  const set = <K extends keyof CreatorOffer>(key: K, value: CreatorOffer[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const hasPhotos = draft.type !== "Vidéo";
  const hasVideos = draft.type !== "Photo";
  const valid = draft.title.trim() && draft.price > 0;

  return (
    <Modal open={!!offer} onOpenChange={(o) => !o && onClose()} title={draft.id ? "Modifier l'offre" : "Créer une offre"} description="Les informations s'affichent sur ton profil public." wide>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave({ ...draft, title: draft.title.trim() });
        }}
      >
        <div>
          <label htmlFor="of-title" className={labelClass}>Titre</label>
          <input id="of-title" value={draft.title} onChange={(e) => set("title", e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="of-desc" className={labelClass}>Description</label>
          <textarea id="of-desc" rows={3} value={draft.description} onChange={(e) => set("description", e.target.value)} className={areaClass} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="of-cat" className={labelClass}>Catégorie</label>
            <select id="of-cat" value={draft.category} onChange={(e) => set("category", e.target.value)} className={`${fieldClass} cursor-pointer`}>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="of-type" className={labelClass}>Type</label>
            <select id="of-type" value={draft.type} onChange={(e) => set("type", e.target.value as ServiceType)} className={`${fieldClass} cursor-pointer`}>
              {serviceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="of-price" className={labelClass}>Prix (MAD)</label>
            <input id="of-price" type="number" min="1" inputMode="numeric" value={draft.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="of-duration" className={labelClass}>Durée</label>
            <input id="of-duration" value={draft.duration} onChange={(e) => set("duration", e.target.value)} placeholder="Ex. 1h, Demi-journée" className={fieldClass} />
          </div>
          {hasPhotos && (
            <div>
              <label htmlFor="of-photos" className={labelClass}>Nombre de photos</label>
              <input id="of-photos" inputMode="numeric" value={draft.photoCount} onChange={(e) => set("photoCount", e.target.value)} className={fieldClass} />
            </div>
          )}
          {hasVideos && (
            <>
              <div>
                <label htmlFor="of-videos" className={labelClass}>Nombre de vidéos</label>
                <input id="of-videos" inputMode="numeric" value={draft.videoCount} onChange={(e) => set("videoCount", e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="of-vdur" className={labelClass}>Durée des vidéos</label>
                <input id="of-vdur" value={draft.videoDuration} onChange={(e) => set("videoDuration", e.target.value)} placeholder="3 min" className={fieldClass} />
              </div>
            </>
          )}
          <div>
            <label htmlFor="of-delivery" className={labelClass}>Délai de livraison</label>
            <input id="of-delivery" value={draft.delivery} onChange={(e) => set("delivery", e.target.value)} placeholder="5 jours" className={fieldClass} />
          </div>
        </div>

        <div>
          <label htmlFor="of-extras" className={labelClass}>Options complémentaires (une par ligne)</label>
          <textarea id="of-extras" rows={3} value={draft.extras} onChange={(e) => set("extras", e.target.value)} placeholder={"Drone +800 MAD\nAlbum photo +1500 MAD"} className={areaClass} />
        </div>
        <div>
          <label htmlFor="of-cond" className={labelClass}>Conditions particulières</label>
          <textarea id="of-cond" rows={2} value={draft.conditions} onChange={(e) => set("conditions", e.target.value)} placeholder="Acompte 30%, annulation J-15…" className={areaClass} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={!valid} className={`${bigPrimaryBtn} flex-[1.4]`}>Enregistrer</button>
          <button type="button" onClick={onClose} className={`${bigGhostBtn} flex-1`}>Annuler</button>
        </div>
        {!valid && <p className="-mt-2 text-center text-xs text-muted-foreground">À compléter : {[!draft.title.trim() && "titre", !(draft.price > 0) && "prix"].filter(Boolean).join(", ")}</p>}
      </form>
    </Modal>
  );
}
