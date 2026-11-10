import { createFileRoute } from "@tanstack/react-router";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { CreatorCard } from "@/components/CreatorCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { categories, cities, creators } from "@/lib/creators";

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

function Explore() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(cities[0]);
  const [category, setCategory] = useState("For You");
  const [role, setRole] = useState<(typeof roles)[number]>("Tous");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "rating">("relevance");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = creators.filter((c) => {
      const matchQuery =
        !q ||
        [c.name, c.city, c.role, c.handle, ...c.tags, ...c.categories].join(" ").toLowerCase().includes(q);
      const matchCity = city === cities[0] || c.city === city;
      const matchCategory = category === "For You" || c.categories.includes(category) || c.tags.includes(category);
      const matchRole = role === "Tous" || c.role === role;
      return matchQuery && matchCity && matchCategory && matchRole && c.price <= maxPrice;
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [query, city, category, role, maxPrice, sort]);

  const reset = () => {
    setQuery("");
    setCity(cities[0]);
    setCategory("For You");
    setRole("Tous");
    setMaxPrice(5000);
    setSort("relevance");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <h1 className="text-display text-4xl md:text-5xl">Découvrir</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          {creators.length} créateurs vérifiés. Filtrez par ville, style, format et budget.
        </p>

        <div className="mt-8 glass rounded-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-card">
          <div className="flex items-center gap-3 pl-4 flex-1 min-w-0">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mariage à Paris, clip, portrait éditorial…"
              className="bg-transparent outline-none text-sm placeholder:text-muted-foreground flex-1 py-2 min-w-0"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 sm:border-l border-border text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent outline-none text-sm text-foreground py-2"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-background">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-xl px-4 h-9 text-sm font-medium border transition ${
                category === c
                  ? "bg-foreground text-background border-foreground"
                  : "bg-surface text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-6 grid lg:grid-cols-12 gap-8 pb-24">
        <aside className="lg:col-span-3">
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
                <span className="text-foreground">€{maxPrice}</span>
              </div>
              <input
                type="range"
                min={400}
                max={5000}
                step={100}
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
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="text-sm text-muted-foreground mb-4">
            {results.length} résultat{results.length > 1 ? "s" : ""}
          </div>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <div className="text-display text-2xl">Aucun créateur trouvé</div>
              <p className="mt-2 text-sm text-muted-foreground">Élargissez votre budget ou changez de ville.</p>
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
