import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, LayoutGrid, MapPin, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { CreatorCard } from "@/components/CreatorCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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

const roles = ["Tous", "Photographer", "Videographer", "Photo & Video"] as const;

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
  const [role, setRole] = useState<(typeof roles)[number]>("Tous");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "rating">("relevance");
  // Mobile / tablette : filtres repliés par défaut pour laisser la place aux résultats
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const list = creators.filter((c) => {
      const matchCity = city === cities[0] || c.city === city;
      const matchCategory = category === ALL_CATEGORIES || c.categories.includes(category);
      const matchRole = role === "Tous" || c.role === role;
      return matchCity && matchCategory && matchRole && c.price <= maxPrice;
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [city, category, role, maxPrice, sort]);

  const activeCount = [
    category !== ALL_CATEGORIES,
    city !== cities[0],
    role !== "Tous",
    maxPrice < 10000,
    sort !== "relevance",
  ].filter(Boolean).length;
  const summary = [category !== ALL_CATEGORIES && category, city !== cities[0] && city].filter(Boolean).join(" · ") || "Tous les créateurs";

  const reset = () => {
    setCity(cities[0]);
    setCategory(ALL_CATEGORIES);
    setRole("Tous");
    setMaxPrice(10000);
    setSort("relevance");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <h1 className="text-display text-4xl md:text-5xl">Découvrir</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          {creators.length} créateurs vérifiés. Filtrez par catégorie, ville, format et budget.
        </p>

        {/* Mobile / tablette : bouton pour déplier les filtres (fermés par défaut) */}
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="explore-filters"
          className="glass mt-6 flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 shadow-card transition hover:border-primary/60 lg:hidden"
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
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-6 grid lg:grid-cols-12 gap-8 pb-24">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:col-span-3 lg:block`}>
          <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-surface p-6 space-y-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filtres
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Format</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3 h-8 text-xs transition ${
                      role === r ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
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