import { createFileRoute } from "@tanstack/react-router";
import { Camera, Check, ChevronDown, Film, LayoutGrid, MapPin, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { CreatorCard } from "@/components/CreatorCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ALL_CATEGORIES, cities, creators, serviceCategories } from "@/lib/creators";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): { category?: string; q?: string } => ({
    ...(typeof search.category === "string" ? { category: search.category } : {}),
    ...(typeof search.q === "string" ? { q: search.q } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Découvrir les photographes & vidéastes · WeShoot" },
      { name: "description", content: "Filtrez par ville, style et budget pour trouver le photographe ou vidéaste idéal, puis réservez en quelques minutes." },
      { property: "og:title", content: "Découvrir les photographes & vidéastes · WeShoot" },
      { property: "og:description", content: "Filtrez par ville, style et budget, puis réservez en quelques minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

type Role = "Photographer" | "Videographer" | "Photo & Video";
const formatOptions: { value: Role; label: string; icon: typeof Camera }[] = [
  { value: "Photographer", label: "Photo", icon: Camera },
  { value: "Videographer", label: "Vidéo", icon: Film },
  { value: "Photo & Video", label: "Les deux", icon: LayoutGrid },
];

/** Champ étiqueté (label + valeur) avec liste déroulante glassmorphisme à la place du <select> natif. */
function GlassSelect({ value, onChange, options, icon: Icon, label, muted = false }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon: typeof MapPin;
  label: string;
  /** Valeur par défaut ("Toutes…") affichée en grisé comme un placeholder. */
  muted?: boolean;
}) {
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left outline-none transition hover:bg-white/5 focus-visible:bg-white/10 data-[state=open]:bg-white/10"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
            <span className={`mt-1 block truncate text-base ${muted ? "text-muted-foreground" : "font-medium text-foreground"}`}>{current}</span>
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={6}
        className="max-h-72 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-2xl border border-white/15 bg-background/80 p-1.5 text-foreground backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12),0_24px_60px_-12px_rgb(0_0_0/0.75)]"
      >
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onSelect={() => onChange(o.value)}
            className="cursor-pointer justify-between gap-3 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:text-foreground"
          >
            <span className={o.value === value ? "font-semibold text-primary" : ""}>{o.label}</span>
            {o.value === value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Pré-sélection depuis l'URL (?category=…) ou depuis la recherche de l'accueil (?q=Mariage à Marrakech). */
function initialFilters(search: { category?: string; q?: string }) {
  let category = ALL_CATEGORIES;
  let city = cities[0];
  if (search.category && serviceCategories.includes(search.category)) category = search.category;
  if (search.q) {
    const q = normalize(search.q);
    if (category === ALL_CATEGORIES) category = serviceCategories.find((c) => q.includes(normalize(c))) ?? ALL_CATEGORIES;
    city = cities.slice(1).find((c) => q.includes(normalize(c))) ?? cities[0];
  }
  return { category, city };
}

function Explore() {
  const search = Route.useSearch();
  const [initial] = useState(() => initialFilters(search));
  const [city, setCity] = useState(initial.city);
  const [category, setCategory] = useState(initial.category);
  const [role, setRole] = useState<Role | null>(null);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "rating">("relevance");
  // Mobile : filtres supplémentaires (budget, tri) repliés par défaut
  const [moreOpen, setMoreOpen] = useState(false);
  // Tablette / desktop : ancien panneau de filtres
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const list = creators.filter((c) => {
      const matchCity = city === cities[0] || c.city === city;
      const matchCategory = category === ALL_CATEGORIES || c.categories.includes(category);
      const matchRole = role === null || c.role === role;
      return matchCity && matchCategory && matchRole && c.price <= maxPrice;
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [city, category, role, maxPrice, sort]);

  const extraCount = [maxPrice < 10000, sort !== "relevance"].filter(Boolean).length;
  const activeCount = [category !== ALL_CATEGORIES, city !== cities[0], role !== null, maxPrice < 10000, sort !== "relevance"].filter(Boolean).length;
  const summary = [category !== ALL_CATEGORIES && category, city !== cities[0] && city].filter(Boolean).join(" · ") || "Tous les créateurs";

  const reset = () => {
    setCity(cities[0]);
    setCategory(ALL_CATEGORIES);
    setRole(null);
    setMaxPrice(10000);
    setSort("relevance");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-6 md:pt-10">
        <h1 className="sr-only md:not-sr-only text-display text-4xl md:text-5xl">Découvrir</h1>
        {/* Mobile : barre de recherche étiquetée, aérée */}
        <div className="glass rounded-3xl p-3 shadow-card md:hidden">
          <div className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-white/[0.04]">
            <GlassSelect
              label="Prestation"
              icon={LayoutGrid}
              value={category}
              muted={category === ALL_CATEGORIES}
              onChange={setCategory}
              options={[{ value: ALL_CATEGORIES, label: "Toutes les prestations" }, ...serviceCategories.map((c) => ({ value: c, label: c }))]}
            />
            <GlassSelect
              label="Ville"
              icon={MapPin}
              value={city}
              muted={city === cities[0]}
              onChange={setCity}
              options={cities.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="px-2 pb-1 pt-6" role="group" aria-label="Format">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Format</div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {formatOptions.map(({ value, label, icon: Icon }) => {
                const active = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRole(active ? null : value)}
                    className={`flex h-14 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border text-xs font-medium transition active:scale-[0.97] ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-white/10 bg-white/[0.06] text-foreground hover:border-primary/60 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" /> {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-controls="explore-more-filters"
            className="mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm text-muted-foreground transition hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Plus de filtres
            {extraCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{extraCount}</span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
          </button>

          <div id="explore-more-filters" className={`${moreOpen ? "block" : "hidden"} space-y-6 border-t border-white/10 px-2 pb-2 pt-6`}>
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Budget max</span>
                <span className="text-sm tabular-nums tracking-normal text-foreground">{maxPrice} MAD</span>
              </div>
              <input
                type="range"
                min={1000}
                max={10000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-4 w-full accent-primary"
              />
            </div>
            <div className="overflow-hidden rounded-2xl bg-white/[0.04]">
              <GlassSelect
                label="Trier par"
                icon={SlidersHorizontal}
                value={sort}
                onChange={(v) => setSort(v as typeof sort)}
                options={[
                  { value: "relevance", label: "Pertinence" },
                  { value: "price-asc", label: "Prix croissant" },
                  { value: "price-desc", label: "Prix décroissant" },
                  { value: "rating", label: "Meilleures notes" },
                ]}
              />
            </div>
            <button
              type="button"
              onClick={reset}
              className="h-11 w-full rounded-2xl border border-white/10 text-sm transition hover:bg-white/5"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <p className="mt-3 hidden max-w-xl text-muted-foreground md:block">
          {creators.length} créateurs vérifiés. Filtrez par catégorie, ville, format et budget.
        </p>

        {/* Tablette / desktop : bouton pour déplier les filtres (fermés par défaut sous lg) */}
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="explore-filters"
          className="glass mt-6 hidden h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 shadow-card transition hover:border-primary/60 md:flex lg:hidden"
        >
          <span className="flex shrink-0 items-center gap-2.5 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Filtres
            {activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{activeCount}</span>
            )}
          </span>
          <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{summary}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </span>
        </button>

        <div className="hidden md:block">
          <div
            id="explore-filters"
            className={`${filtersOpen ? "flex" : "hidden"} mt-3 flex-col items-stretch gap-2 rounded-2xl p-2 shadow-card glass sm:flex-row sm:items-center lg:mt-8 lg:flex`}
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 pl-4">
              <LayoutGrid className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">Catégorie</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer bg-transparent py-2 text-sm text-foreground outline-none"
              >
                <option value={ALL_CATEGORIES} className="bg-background">Toutes les catégories</option>
                {serviceCategories.map((c) => (
                  <option key={c} value={c} className="bg-background">{c}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 border-t border-border px-3 pl-4 text-sm text-muted-foreground sm:border-l sm:border-t-0 sm:pl-3">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="sr-only">Ville</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer bg-transparent py-2 text-sm text-foreground outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-background">{c}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-6 grid lg:grid-cols-12 gap-8 pb-24">
        <aside className={`${filtersOpen ? "max-md:hidden md:block" : "hidden"} lg:col-span-3 lg:block`}>
          <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-surface p-6 space-y-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filtres
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Format</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["Tous", "Photographer", "Videographer", "Photo & Video"] as const).map((r) => {
                  const active = r === "Tous" ? role === null : role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r === "Tous" ? null : r)}
                      className={`rounded-lg border px-3 h-8 text-xs transition ${
                        active ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Budget max</span>
                <span className="text-foreground">{maxPrice} MAD</span>
              </div>
              <input
                type="range"
                min={1000}
                max={10000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Trier par</div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="mt-3 w-full rounded-xl bg-background border border-border px-3 h-10 text-sm outline-none"
              >
                <option value="relevance">Pertinence</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
              </select>
            </div>

            <button
              onClick={reset}
              className="w-full h-10 rounded-xl border border-border text-sm hover:bg-surface-elevated transition"
            >
              Réinitialiser
            </button>

            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 lg:hidden"
            >
              Voir {results.length} résultat{results.length > 1 ? "s" : ""}
            </button>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="text-sm text-muted-foreground mb-4">
            {results.length} résultat{results.length > 1 ? "s" : ""}
          </div>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <div className="text-display text-2xl">Aucun créateur trouvé</div>
              <p className="mt-2 text-sm text-muted-foreground">Élargissez votre budget, changez de ville ou de catégorie.</p>
              <button onClick={reset} className="mt-6 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map((c) => (
                <CreatorCard key={c.id} creator={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}