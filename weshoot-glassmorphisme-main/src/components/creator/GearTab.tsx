import { Plus, X } from "lucide-react";
import { useState } from "react";

import { EmptyState, SectionLabel, fieldClass, panelClass, primaryBtn } from "@/components/creator/ui";
import { gearCategories, type CreatorSpace, type GearCategory } from "@/lib/creator-space";
import { newId } from "@/lib/media";

export function GearTab({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GearCategory>("Boîtier");
  const [note, setNote] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    update((s) => ({ ...s, gear: [...s.gear, { id: newId("gear"), name: name.trim(), category, note: note.trim() }] }));
    setName("");
    setNote("");
  }

  const groups = gearCategories
    .map((c) => ({ category: c, items: state.gear.filter((g) => g.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <section className={panelClass}>
        <SectionLabel>Ajouter du matériel</SectionLabel>
        <p className="mt-2 text-xs text-muted-foreground">Ton matériel rassure les clients : boîtiers, objectifs, éclairage, drone…</p>
        <form onSubmit={add} className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_1.4fr_auto]">
          <input aria-label="Nom du matériel" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Canon EOS R5" className={`${fieldClass} h-11`} />
          <select aria-label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value as GearCategory)} className={`${fieldClass} h-11 cursor-pointer`}>
            {gearCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (facultatif)" className={`${fieldClass} h-11`} />
          <button type="submit" disabled={!name.trim()} className={`${primaryBtn} h-11`}><Plus className="h-4 w-4" /> Ajouter</button>
        </form>
      </section>

      {groups.length === 0 ? (
        <EmptyState>Aucun matériel renseigné pour le moment.</EmptyState>
      ) : (
        groups.map((g) => (
          <section key={g.category} className={panelClass}>
            <SectionLabel>{g.category} — {g.items.length}</SectionLabel>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {g.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.name}</div>
                    {item.note && <div className="truncate text-xs text-muted-foreground">{item.note}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => update((s) => ({ ...s, gear: s.gear.filter((x) => x.id !== item.id) }))}
                    aria-label={`Retirer ${item.name}`}
                    className="cursor-pointer grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
