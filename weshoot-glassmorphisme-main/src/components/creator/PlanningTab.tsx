import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { SectionLabel, fieldClass, ghostBtn, panelClass, primaryBtn } from "@/components/creator/ui";
import { formatDay, weekDays, type CreatorSpace, type DayHours } from "@/lib/creator-space";
import { newId } from "@/lib/media";

const dayInitials = ["L", "M", "M", "J", "V", "S", "D"];
const pad = (n: number) => String(n).padStart(2, "0");
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function PlanningTab({ space }: { space: CreatorSpace }) {
  return (
    <div className="space-y-6">
      <BlockedDates space={space} />
      <WorkingHours space={space} />
      <Absences space={space} />
    </div>
  );
}

/* ---------- Dates bloquées ---------- */
function BlockedDates({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const today = todayIso();

  const { cells, monthKey } = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const offset = (first.getDay() + 6) % 7; // semaine commençant le lundi
    const count = new Date(cursor.year, cursor.month + 1, 0).getDate();
    return { cells: [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)] as (number | null)[], monthKey: `${cursor.year}-${pad(cursor.month + 1)}` };
  }, [cursor]);

  const blockedThisMonth = state.planning.blocked.filter((d) => d.startsWith(monthKey)).length;
  const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function toggle(day: number) {
    const iso = `${monthKey}-${pad(day)}`;
    update((s) => ({
      ...s,
      planning: {
        ...s.planning,
        blocked: s.planning.blocked.includes(iso) ? s.planning.blocked.filter((d) => d !== iso) : [...s.planning.blocked, iso],
      },
    }));
  }

  return (
    <section className={panelClass}>
      <SectionLabel>Bloquer des dates</SectionLabel>
      <p className="mt-2 text-xs text-muted-foreground">Clique sur un jour pour basculer entre disponible et bloqué. Les clients ne pourront pas réserver les jours bloqués.</p>

      <div className="mt-5 max-w-sm">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => shift(-1)} aria-label="Mois précédent" className="glass cursor-pointer grid h-9 w-9 place-items-center rounded-xl transition hover:border-primary/60">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-display text-lg capitalize">{label}</div>
          <button type="button" onClick={() => shift(1)} aria-label="Mois suivant" className="glass cursor-pointer grid h-9 w-9 place-items-center rounded-xl transition hover:border-primary/60">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {dayInitials.map((d, i) => (
            <div key={i} className="pb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`pad-${i}`} />;
            const iso = `${monthKey}-${pad(day)}`;
            const blocked = state.planning.blocked.includes(iso);
            const past = iso < today;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => toggle(day)}
                aria-pressed={blocked}
                aria-label={`${day} — ${blocked ? "bloqué" : "disponible"}`}
                className={`cursor-pointer h-10 rounded-lg border text-sm font-medium transition ${past ? "opacity-40" : ""} ${
                  blocked
                    ? "border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Disponible</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Bloqué</span>
        </div>
        <p className="mt-2 text-xs text-primary">{blockedThisMonth} date(s) bloquée(s) ce mois-ci</p>
      </div>
    </section>
  );
}

/* ---------- Horaires ---------- */
function WorkingHours({ space }: { space: CreatorSpace }) {
  const [hours, setHours] = useState<DayHours[]>(space.state.planning.hours);
  const [saved, setSaved] = useState(false);

  const patch = (i: number, p: Partial<DayHours>) => {
    setSaved(false);
    setHours((h) => h.map((d, idx) => (idx === i ? { ...d, ...p } : d)));
  };
  const invalid = hours.some((h) => !h.closed && h.open >= h.close);

  function save() {
    space.update((s) => ({ ...s, planning: { ...s.planning, hours } }));
    setSaved(true);
  }

  return (
    <section className={panelClass}>
      <SectionLabel>Horaires de travail</SectionLabel>
      <div className="mt-4 space-y-2.5">
        {weekDays.map((day, i) => {
          const h = hours[i];
          return (
            <div key={day} className="grid grid-cols-[5.5rem_1fr_1fr_auto] items-center gap-2.5 sm:grid-cols-[7rem_1fr_1fr_auto]">
              <span className="text-sm font-medium">{day}</span>
              <input type="time" aria-label={`${day} ouverture`} value={h.open} disabled={h.closed} onChange={(e) => patch(i, { open: e.target.value })} className={`${fieldClass} h-11 disabled:opacity-40`} />
              <input type="time" aria-label={`${day} fermeture`} value={h.close} disabled={h.closed} onChange={(e) => patch(i, { close: e.target.value })} className={`${fieldClass} h-11 disabled:opacity-40`} />
              <button
                type="button"
                onClick={() => patch(i, { closed: !h.closed })}
                aria-pressed={h.closed}
                className={`cursor-pointer h-9 w-20 rounded-full border text-xs font-medium transition ${
                  h.closed ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/[0.05] text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.closed ? "Fermé" : "Ouvert"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={save} disabled={invalid} className={primaryBtn}>Enregistrer</button>
        {invalid && <span className="text-xs text-destructive">L'heure de fermeture doit être après l'ouverture.</span>}
        {saved && !invalid && <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400"><Check className="h-3.5 w-3.5" /> Horaires enregistrés</span>}
      </div>
    </section>
  );
}

/* ---------- Périodes d'absence ---------- */
function Absences({ space }: { space: CreatorSpace }) {
  const { state, update } = space;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const valid = !!from && !!to && to >= from;

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    update((s) => ({
      ...s,
      planning: { ...s.planning, absences: [...s.planning.absences, { id: newId("abs"), from, to, reason: reason.trim() }].sort((a, b) => a.from.localeCompare(b.from)) },
    }));
    setFrom("");
    setTo("");
    setReason("");
  }

  return (
    <section className={panelClass}>
      <SectionLabel>Périodes d'absence</SectionLabel>
      <div className="mt-4 space-y-3">
        {state.planning.absences.length === 0 && <p className="text-sm text-muted-foreground">Aucune période d'absence.</p>}
        {state.planning.absences.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium">{formatDay(a.from)} → {formatDay(a.to)}</div>
              {a.reason && <div className="text-xs text-muted-foreground">{a.reason}</div>}
            </div>
            <button type="button" onClick={() => update((s) => ({ ...s, planning: { ...s.planning, absences: s.planning.absences.filter((x) => x.id !== a.id) } }))} className={ghostBtn}>
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
        <input type="date" aria-label="Début" value={from} onChange={(e) => setFrom(e.target.value)} className={`${fieldClass} h-11`} />
        <input type="date" aria-label="Fin" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={`${fieldClass} h-11`} />
        <input aria-label="Motif" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif (facultatif)" className={`${fieldClass} h-11`} />
        <button type="submit" disabled={!valid} className={`${primaryBtn} h-11`}><Plus className="h-4 w-4" /> Ajouter</button>
      </form>
    </section>
  );
}
