import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { services } from '../../data/services';
import { categories } from '../../data/categories';
import { ServiceCard } from './ServiceCard';

export function ServiceCatalog() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || categories.find((c) => c.id === s.categoryId)?.name.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'all' || s.categoryId === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted
      .map((cat) => ({ category: cat, items: filtered.filter((s) => s.categoryId === cat.id) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="sticky top-[4.5rem] z-10 -mx-1 space-y-3 bg-mist/95 px-1 pb-3 pt-1 backdrop-blur">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            className="w-full rounded-full border border-fog bg-white py-3 pl-11 pr-4 text-base shadow-card focus:border-navy focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterChip label="All Services" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
          {categories.map((c) => (
            <FilterChip key={c.id} label={c.name} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} />
          ))}
        </div>
      </div>

      {grouped.length === 0 && <div className="rounded-2xl border border-dashed border-fog p-10 text-center text-slate">No services match your search.</div>}

      {grouped.map(({ category, items }) => (
        <section key={category.id}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">{category.name}</h2>
            <span className="text-xs text-slate">{items.length} service{items.length === 1 ? '' : 's'}</span>
          </div>
          <div className="space-y-3">
            {items.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? 'border-navy bg-navy text-white' : 'border-fog bg-white text-ink/70 hover:border-slate'
      }`}
    >
      {label}
    </button>
  );
}
