import { Check, UserRound } from "lucide-react";
import { useRef, useState } from "react";

import { Field, SectionLabel, areaClass, bigPrimaryBtn, fieldClass, ghostBtn, panelClass, pillBase, pillIdle, pillOn } from "@/components/creator/ui";
import { allCategories, moroccanCities, serviceTypes, type CreatorProfile, type CreatorSpace } from "@/lib/creator-space";
import { imageToDataUrl } from "@/lib/media";

const BIO_MAX = 300;

export function ProfileTab({ space }: { space: CreatorSpace }) {
  const [draft, setDraft] = useState<CreatorProfile>(space.state.profile);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof CreatorProfile>(key: K, value: CreatorProfile[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  async function pickImage(file: File | undefined, key: "avatar" | "cover") {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Ajoute une image (PNG ou JPG).");
      return;
    }
    try {
      set(key, await imageToDataUrl(file, key === "avatar" ? 400 : 1400, 0.8));
    } catch {
      setError("Impossible de lire cette image.");
    }
  }

  function toggleCategory(cat: string) {
    set("categories", draft.categories.includes(cat) ? draft.categories.filter((c) => c !== cat) : [...draft.categories, cat]);
  }

  const missing = [
    !draft.displayName.trim() && "prénom affiché",
    !draft.handle.replace("@", "").trim() && "handle",
    !draft.city && "ville",
    draft.categories.length === 0 && "au moins une catégorie",
    !(draft.basePrice > 0) && "tarif de base",
  ].filter(Boolean) as string[];

  function save() {
    if (missing.length) return;
    const handle = `@${draft.handle.replace(/^@+/, "").trim()}`;
    space.update((s) => ({ ...s, profile: { ...draft, displayName: draft.displayName.trim(), handle } }));
    setDraft((d) => ({ ...d, handle, displayName: d.displayName.trim() }));
    setSaved(true);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">Édite ton profil public. Les médias vitrine et portfolio se gèrent dans leurs onglets dédiés.</p>

      <section className={panelClass}>
        <SectionLabel>Photo de profil</SectionLabel>
        <div className="mt-4 flex items-center gap-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary bg-gradient-accent">
            {draft.avatar ? <img src={draft.avatar} alt="Photo de profil" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-primary-foreground" />}
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => avatarInput.current?.click()} className={ghostBtn}>Changer</button>
            {draft.avatar && (
              <button type="button" onClick={() => set("avatar", "")} className="cursor-pointer text-xs text-muted-foreground underline-offset-4 transition hover:text-primary hover:underline">Supprimer</button>
            )}
          </div>
          <input ref={avatarInput} type="file" accept="image/*" tabIndex={-1} className="sr-only" onChange={(e) => { void pickImage(e.target.files?.[0], "avatar"); e.target.value = ""; }} />
        </div>
      </section>

      <section className={panelClass}>
        <SectionLabel>Photo de couverture</SectionLabel>
        <div className="mt-4 grid aspect-[3/1] place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          {draft.cover ? <img src={draft.cover} alt="Couverture" className="h-full w-full object-cover" /> : <span className="text-sm text-muted-foreground">Aucune couverture</span>}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={() => coverInput.current?.click()} className={ghostBtn}>+ Téléverser une couverture</button>
          {draft.cover && <button type="button" onClick={() => set("cover", "")} className="cursor-pointer text-xs text-muted-foreground underline-offset-4 transition hover:text-primary hover:underline">Retirer</button>}
          <input ref={coverInput} type="file" accept="image/*" tabIndex={-1} className="sr-only" onChange={(e) => { void pickImage(e.target.files?.[0], "cover"); e.target.value = ""; }} />
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      </section>

      <section className={panelClass}>
        <SectionLabel>Identité publique</SectionLabel>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Prénom affiché" htmlFor="pr-name">
            <input id="pr-name" value={draft.displayName} onChange={(e) => set("displayName", e.target.value)} className={fieldClass} />
            <p className="mt-1.5 text-xs text-muted-foreground">Seul le prénom est affiché publiquement.</p>
          </Field>
          <Field label="Handle" htmlFor="pr-handle">
            <input id="pr-handle" value={draft.handle} onChange={(e) => set("handle", e.target.value)} placeholder="@ton.nom" className={fieldClass} />
          </Field>
        </div>
        <Field label={`Bio (${draft.bio.length}/${BIO_MAX})`} htmlFor="pr-bio" className="mt-5">
          <textarea id="pr-bio" rows={4} maxLength={BIO_MAX} value={draft.bio} onChange={(e) => set("bio", e.target.value)} className={areaClass} />
        </Field>
      </section>

      <section className={panelClass}>
        <SectionLabel>Zone d'intervention</SectionLabel>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Ville" htmlFor="pr-city">
            <select id="pr-city" value={draft.city} onChange={(e) => set("city", e.target.value)} className={`${fieldClass} cursor-pointer`}>
              <option value="">— Choisir une ville —</option>
              {moroccanCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={`Rayon de déplacement — ${draft.radiusKm} km`} htmlFor="pr-radius">
            <input id="pr-radius" type="range" min={5} max={200} step={5} value={draft.radiusKm} onChange={(e) => set("radiusKm", Number(e.target.value))} className="mt-3 h-2 w-full cursor-pointer accent-[var(--color-primary)]" />
          </Field>
        </div>
      </section>

      <section className={panelClass}>
        <SectionLabel>Spécialités</SectionLabel>
        <div className="mt-4">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Type de prestation</div>
          <div className="flex flex-wrap gap-2">
            {serviceTypes.map((t) => (
              <button key={t} type="button" aria-pressed={draft.serviceType === t} onClick={() => set("serviceType", t)} className={`${pillBase} h-10 ${draft.serviceType === t ? pillOn : pillIdle}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Catégories</div>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const on = draft.categories.includes(cat);
              return (
                <button key={cat} type="button" aria-pressed={on} onClick={() => toggleCategory(cat)} className={`${pillBase} h-9 ${on ? pillOn : pillIdle}`}>{cat}</button>
              );
            })}
          </div>
        </div>
        <Field label="Tarif de base (MAD)" htmlFor="pr-price" className="mt-5">
          <input id="pr-price" type="number" min="1" inputMode="numeric" value={draft.basePrice || ""} onChange={(e) => set("basePrice", Number(e.target.value))} className={fieldClass} />
        </Field>
      </section>

      <section className={panelClass}>
        <SectionLabel>Liens externes</SectionLabel>
        <div className="mt-4 space-y-5">
          <Field label="Site / lien public principal" htmlFor="pr-site">
            <input id="pr-site" value={draft.website} onChange={(e) => set("website", e.target.value)} placeholder="instagram.com/ton.compte" className={fieldClass} />
          </Field>
          <Field label="Portfolio externe (Drive, YouTube, Vimeo, site…)" htmlFor="pr-ext">
            <input id="pr-ext" value={draft.externalPortfolio} onChange={(e) => set("externalPortfolio", e.target.value)} placeholder="https://…" className={fieldClass} />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={missing.length > 0} className={bigPrimaryBtn}>Enregistrer</button>
        {saved && <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400"><Check className="h-4 w-4" /> Profil enregistré</span>}
        {missing.length > 0 && <span className="text-xs text-muted-foreground">À compléter : {missing.join(", ")}</span>}
      </div>
    </div>
  );
}
