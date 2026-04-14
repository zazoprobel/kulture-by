"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export type VenueItem = {
  id: string;
  slug: string;
  name: string;
  city: string;
  type: string;
  rating: number | null;
  capacity_banquet: number | null;
  capacity_buffet: number | null;
  price_from: number | null;
  is_featured?: boolean | null;
  is_verified?: boolean | null;
};

type Filters = {
  types: string[];
  guestsRange: string;
  budgetFrom: string;
  budgetTo: string;
  cities: string[];
  ratings: string[];
};

const typeOptions = [
  { value: "all", label: "Все" },
  { value: "restaurant", label: "Рестораны" },
  { value: "banquet", label: "Банкетные залы" },
  { value: "loft", label: "Лофты" },
  { value: "estate", label: "Загородные усадьбы" },
  { value: "hotel", label: "Отели" },
  { value: "outdoor", label: "На природе" },
] as const;

const cityOptions = ["Минск", "Брест", "Гродно", "Витебск", "Гомель", "Могилёв"] as const;
const ratingOptions = ["4.5", "4.0"] as const;

const imageByType: Record<string, string> = {
  restaurant: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900",
  banquet: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900",
  loft: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900",
  estate: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900",
  outdoor: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
};

const initialFilters: Filters = {
  types: [],
  guestsRange: "",
  budgetFrom: "",
  budgetTo: "",
  cities: [],
  ratings: [],
};

const PAGE_SIZE = 24; // 4 карточки * 6 рядов

export function VenuesCatalogClient({ initialItems, totalCount }: { initialItems: VenueItem[]; totalCount: number }) {
  const [items, setItems] = useState<VenueItem[]>(initialItems);
  const [count, setCount] = useState(totalCount);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // При изменении фильтров/сортировки всегда возвращаемся на 1 страницу.
  useEffect(() => {
    setPage(1);
  }, [filters, sortBy]);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        let query = supabase
          .from("venues")
          .select("id,slug,name,city,type,rating,capacity_banquet,capacity_buffet,price_from,is_featured,is_verified", { count: "exact" });

        if (filters.types.length > 0) {
          const mapped = Array.from(new Set(filters.types.map((value) => (value === "estate" ? "outdoor" : value))));
          query = query.in("type", mapped);
        }
        if (filters.guestsRange === "up20") query = query.lte("capacity_banquet", 20);
        if (filters.guestsRange === "20-50") query = query.gte("capacity_banquet", 20).lte("capacity_banquet", 50);
        if (filters.guestsRange === "50-100") query = query.gte("capacity_banquet", 50).lte("capacity_banquet", 100);
        if (filters.guestsRange === "100-200") query = query.gte("capacity_banquet", 100).lte("capacity_banquet", 200);
        if (filters.guestsRange === "200plus") query = query.gte("capacity_banquet", 200);
        if (filters.budgetFrom) query = query.gte("price_from", Number(filters.budgetFrom));
        if (filters.budgetTo) query = query.lte("price_from", Number(filters.budgetTo));
        if (filters.cities.length > 0) query = query.in("city", filters.cities);
        if (filters.ratings.length > 0) query = query.gte("rating", Math.min(...filters.ratings.map(Number)));

        if (sortBy === "price") {
          query = query.order("is_featured", { ascending: false }).order("price_from", { ascending: true });
        } else {
          query = query.order("is_featured", { ascending: false }).order("rating", { ascending: false });
        }
        const { data, error, count: nextCount } = await query.range(from, to);
        if (error) throw error;

        if (!isCancelled) {
          setItems((data ?? []) as VenueItem[]);
          setCount(nextCount ?? 0);
        }
      } catch (error) {
        console.error("venues filter error", error);
        if (!isCancelled) {
          setItems([]);
          setCount(0);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [filters, sortBy, page]);

  const chips = useMemo(() => {
    const list: Array<{ key: keyof Filters; label: string }> = [];
    if (filters.types.length > 0) list.push({ key: "types", label: `Тип: ${filters.types.length}` });
    if (filters.guestsRange) list.push({ key: "guestsRange", label: `Гости: ${filters.guestsRange}` });
    if (filters.budgetFrom) list.push({ key: "budgetFrom", label: `Бюджет от: ${filters.budgetFrom}` });
    if (filters.budgetTo) list.push({ key: "budgetTo", label: `Бюджет до: ${filters.budgetTo}` });
    if (filters.cities.length > 0) list.push({ key: "cities", label: `Город: ${filters.cities.length}` });
    if (filters.ratings.length > 0) list.push({ key: "ratings", label: `Рейтинг: ${filters.ratings.join(", ")}` });
    return list;
  }, [filters]);

  const resetOne = (key: keyof Filters) => setFilters((prev) => ({ ...prev, [key]: initialFilters[key] }));

  const pageCount = Math.ceil(count / PAGE_SIZE);
  const canPrev = page > 1;
  const canNext = pageCount > 0 && page < pageCount;

  const visiblePages = (() => {
    if (pageCount <= 1) return [] as number[];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(pageCount, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  })();

  const sidebar = (
    <aside className="sidebar">
      <div className="sbTitleRow">
        <div className="sb-title">Фильтры</div>
        <button type="button" className="sb-reset" onClick={() => setFilters(initialFilters)}>Сбросить всё</button>
      </div>

      <div className="sb-group">
        <div className="sb-label">Тип площадки</div>
        {typeOptions.filter((option) => option.value !== "all").map((option) => (
          <label className="sb-opt" key={option.value}>
            <input
              type="checkbox"
              checked={filters.types.includes(option.value)}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  types: e.target.checked ? [...p.types, option.value] : p.types.filter((v) => v !== option.value),
                }))
              }
            />
            {option.label}
          </label>
        ))}
      </div>

      <div className="sb-group">
        <div className="sb-label">Количество гостей</div>
        {[
          ["up20", "до 20"],
          ["20-50", "20–50"],
          ["50-100", "50–100"],
          ["100-200", "100–200"],
          ["200plus", "200+"],
        ].map(([value, label]) => (
          <label className="sb-opt" key={value}>
            <input type="radio" name="guests" checked={filters.guestsRange === value} onChange={() => setFilters((p) => ({ ...p, guestsRange: value }))} />
            {label}
          </label>
        ))}
      </div>

      <div className="sb-group">
        <div className="sb-label">Бюджет (BYN)</div>
        <div className="range-row">
          <input className="range-inp" placeholder="от" value={filters.budgetFrom} onChange={(e) => setFilters((p) => ({ ...p, budgetFrom: e.target.value }))} />
          <input className="range-inp" placeholder="до" value={filters.budgetTo} onChange={(e) => setFilters((p) => ({ ...p, budgetTo: e.target.value }))} />
        </div>
      </div>

      <div className="sb-group">
        <div className="sb-label">Город</div>
        {cityOptions.map((city) => (
          <label className="sb-opt" key={city}>
            <input
              type="checkbox"
              checked={filters.cities.includes(city)}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  cities: e.target.checked ? [...p.cities, city] : p.cities.filter((v) => v !== city),
                }))
              }
            />
            {city}
          </label>
        ))}
      </div>

      <div className="sb-group">
        <div className="sb-label">Рейтинг</div>
        {ratingOptions.map((rating) => (
          <label className="sb-opt" key={rating}>
            <input
              type="checkbox"
              checked={filters.ratings.includes(rating)}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  ratings: e.target.checked ? [...p.ratings, rating] : p.ratings.filter((v) => v !== rating),
                }))
              }
            />
            {rating} и выше
          </label>
        ))}
      </div>
      <button type="button" className="sb-apply">Применить фильтры</button>
    </aside>
  );

  return (
    <div className="venuesCatalog">
      <div className="page-layout">
        <div className="desktopOnly">{sidebar}</div>

        <main className="content">
          <div className="topRow">
              <div className="count">Найдено <strong>{count}</strong></div>
            <div className="controls">
              <select className="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as "rating" | "price")}>
                <option value="rating">По рейтингу</option>
                <option value="price">По цене</option>
              </select>
              <div className="viewBtns">
                <button type="button" className={`vBtn ${view === "grid" ? "on" : ""}`} onClick={() => setView("grid")}>⊞</button>
                <button type="button" className={`vBtn ${view === "list" ? "on" : ""}`} onClick={() => setView("list")}>≡</button>
              </div>
            </div>
          </div>

          <div className="active-chips">
            {chips.map((chip) => (
              <button key={chip.label} type="button" className="act-chip" onClick={() => resetOne(chip.key)}>
                {chip.label} <span>×</span>
              </button>
            ))}
          </div>

          {loading ? <div className="empty">Загрузка...</div> : null}
          {!loading && items.length === 0 ? <div className="empty">По выбранным фильтрам площадок не найдено.</div> : null}

          {!loading && items.length > 0 && view === "grid" ? (
            <div className="grid">
              {items.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.slug}`} className="card">
                  <div className="thumb">
                    <Image src={imageByType[venue.type] ?? imageByType.outdoor} alt={venue.name} fill unoptimized style={{ objectFit: "cover" }} sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="badge">от {Math.round(venue.price_from ?? 0)} BYN</div>
                  </div>
                  <div className="body">
                    <div className="title">{venue.name}</div>
                    <div className="meta">📍 {venue.city}</div>
                    <div className="meta">
                      {venue.is_featured ? "🔥 Featured" : ""}
                      {venue.is_featured && venue.is_verified ? " · " : ""}
                      {venue.is_verified ? "✅ Проверено" : ""}
                    </div>
                    <div className="meta">⭐ {venue.rating ?? 0} · 👥 {venue.capacity_banquet ?? 0}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {!loading && items.length > 0 && view === "list" ? (
            <div className="list">
              {items.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.slug}`} className="listCard">
                  <div className="listThumb">
                    <Image src={imageByType[venue.type] ?? imageByType.outdoor} alt={venue.name} fill unoptimized style={{ objectFit: "cover" }} />
                  </div>
                  <div className="listBody">
                    <div className="title">{venue.name}</div>
                    <div className="meta">📍 {venue.city}</div>
                    <div className="meta">
                      {venue.is_featured ? "🔥 Featured" : ""}
                      {venue.is_featured && venue.is_verified ? " · " : ""}
                      {venue.is_verified ? "✅ Проверено" : ""}
                    </div>
                    <div className="meta">⭐ {venue.rating ?? 0} · Банкет: {venue.capacity_banquet ?? 0} · Фуршет: {venue.capacity_buffet ?? 0}</div>
                    <div className="price">от {Math.round(venue.price_from ?? 0)} BYN</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {!loading && items.length > 0 && pageCount > 1 ? (
            <div className="pagination">
              <div className="pagesInfo">
                Страница <strong>{page}</strong> из <strong>{pageCount}</strong>
              </div>
              <div className="pageBtns">
                <button type="button" className="pBtn" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  ‹
                </button>
                {visiblePages.map((p) => (
                  <button key={p} type="button" className={`pBtn ${p === page ? "on" : ""}`} disabled={p === page} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
                <button type="button" className="pBtn" disabled={!canNext} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                  ›
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      <button type="button" className="mobile-filters-fixed" onClick={() => setMobileFiltersOpen(true)}>
        Фильтры
      </button>

      {mobileFiltersOpen ? (
        <div className="drawerBack" onClick={() => setMobileFiltersOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawerHandle" />
            <button
              type="button"
              className="drawerClose"
              aria-label="Закрыть фильтры"
              onClick={() => setMobileFiltersOpen(false)}
            >
              ✕
            </button>
            {sidebar}
            <button type="button" className="applyBtn" onClick={() => setMobileFiltersOpen(false)}>Применить</button>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .venuesCatalog .page-layout { display: grid; grid-template-columns: 280px 1fr; gap: 28px; margin-top: 28px; align-items: start; }
        .venuesCatalog .content{min-width:0}
        .venuesCatalog .sidebar { background: white; border-radius: 20px; border: 1.5px solid rgba(0,0,0,0.08); padding: 24px; position: sticky; top: 80px; }
        .venuesCatalog .sbTitleRow{display:flex;align-items:center;justify-content:space-between}
        .venuesCatalog .sb-title { font-family: 'Unbounded', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
        .venuesCatalog .sb-reset { font-size: 12px; font-weight: 500; color: #888; cursor: pointer; background: none; border: none; }
        .venuesCatalog .sb-group { margin-bottom: 22px; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 22px; }
        .venuesCatalog .sb-group:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .venuesCatalog .sb-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #888; margin-bottom: 12px; }
        .venuesCatalog .sb-opt { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer; font-size: 13px; }
        .venuesCatalog .sb-opt input { width: 16px; height: 16px; accent-color: #181818; cursor: pointer; }
        .venuesCatalog .range-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .venuesCatalog .range-inp { flex: 1; height: 38px; border-radius: 9px; border: 1.5px solid rgba(0,0,0,0.08); font-size: 12px; padding: 0 10px; text-align: center; }
        .venuesCatalog .sb-apply { width: 100%; height: 42px; border-radius: 12px; border: none; background: #181818; color: white; font-size: 13px; font-weight: 700; margin-top: 18px; cursor: pointer; }
        .venuesCatalog .topRow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
        .venuesCatalog .count{font-size:14px;color:#666}
        .venuesCatalog .controls{display:flex;align-items:center;gap:8px}
        .venuesCatalog .sort{height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.1);padding:0 10px;background:#fff}
        .venuesCatalog .viewBtns{display:flex;gap:4px}
        .venuesCatalog .vBtn{width:32px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,.1);background:#fff}
        .venuesCatalog .vBtn.on{background:#181818;color:#fff}
        .venuesCatalog .active-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 16px; }
        .venuesCatalog .act-chip { display: flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 99px; background: rgba(0,0,0,0.07); font-size: 12px; border: none; cursor: pointer; }
        .venuesCatalog .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .venuesCatalog .pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px}
        .venuesCatalog .pagesInfo{font-size:13px;color:#666}
        .venuesCatalog .pageBtns{display:flex;gap:8px;align-items:center}
        .venuesCatalog .pBtn{min-width:34px;height:34px;border-radius:10px;border:1px solid rgba(0,0,0,.1);background:#fff;color:#181818;font-weight:700;cursor:pointer;padding:0 12px}
        .venuesCatalog .pBtn.on{background:#181818;color:#fff}
        .venuesCatalog .pBtn:disabled{opacity:.55;cursor:not-allowed}
        .venuesCatalog .card{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .venuesCatalog .thumb{height:180px;position:relative}
        .venuesCatalog .badge{position:absolute;left:10px;bottom:10px;background:#D2F882;border-radius:99px;padding:5px 10px;font-size:11px;font-weight:700}
        .venuesCatalog .body{padding:16px}
        .venuesCatalog .title{font-family:"Unbounded",sans-serif;font-size:13px;line-height:1.3}
        .venuesCatalog .meta{margin-top:6px;color:#666;font-size:12px}
        .venuesCatalog .price{margin-top:8px;font-weight:700}
        .venuesCatalog .list{display:flex;flex-direction:column;gap:14px}
        .venuesCatalog .listCard{display:grid;grid-template-columns:240px 1fr;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:20px;overflow:hidden;text-decoration:none;color:inherit}
        .venuesCatalog .listThumb{height:180px;position:relative}
        .venuesCatalog .listBody{padding:16px}
        .venuesCatalog .empty{padding:24px;border-radius:16px;background:#fff;border:1px dashed rgba(0,0,0,.15);color:#666}
        .venuesCatalog .mobile-filters-fixed{display:none}
        .venuesCatalog .drawerBack{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1200;display:flex;align-items:flex-end}
        .venuesCatalog .drawer{position:relative;width:100%;max-height:85vh;background:#F7F6F2;border-radius:18px 18px 0 0;padding:10px 16px 18px;overflow:auto}
        .venuesCatalog .drawerHandle{width:52px;height:5px;border-radius:99px;background:rgba(0,0,0,.22);margin:0 auto 10px}
        .venuesCatalog .drawerClose{position:absolute;right:16px;top:12px;width:34px;height:34px;border:none;border-radius:10px;background:#fff;font-size:18px;line-height:1;cursor:pointer}
        .venuesCatalog .applyBtn{width:100%;height:44px;border:none;border-radius:12px;background:#181818;color:#fff;margin-top:10px}
        @media (max-width:1024px){.venuesCatalog .grid{grid-template-columns:repeat(2,1fr)}}
        @media (max-width:767px){
          .venuesCatalog .page-layout{grid-template-columns:1fr;margin-top:0}
          .venuesCatalog .desktopOnly{display:none}
          .venuesCatalog .mobile-filters-fixed{display:block;position:fixed;left:16px;right:16px;bottom:16px;height:44px;border:none;border-radius:12px;background:#181818;color:#fff;font-weight:700;z-index:1100}
          .venuesCatalog .grid,.venuesCatalog .listCard{grid-template-columns:1fr}
          .venuesCatalog .listThumb{height:200px}
        }
      `}</style>
    </div>
  );
}
